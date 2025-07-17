const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Configurações do email (configure com seus dados)
const EMAIL_CONFIG = {
  service: 'gmail', // ou outro provedor
  user: process.env.EMAIL_USER || 'seu-email@empresa.com', // Configure no Firebase Functions
  pass: process.env.EMAIL_PASSWORD || 'sua-senha-app', // Senha de app do Gmail
  to: (process.env.EMAIL_RECIPIENTS || 'destinatario1@empresa.com,destinatario2@empresa.com').split(',') // Lista de destinatários
};

// Função utilitária para calcular dias entre datas
function daysBetween(date1, date2) {
  const diff = date1.getTime() - date2.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// Função para determinar status do EPI
function getStatus(validUntil, today) {
  const days = daysBetween(validUntil, today);
  if (days < 0) return "CRITICO";
  if (days <= 10) return "INICIAR TROCA"; // Alterado de 5 para 10 dias
  return "OK";
}

// Função para calcular validade baseada no tipo de EPI
function calculateValidUntil(ultimaRequisicao, tipoEPI) {
  const ultima = new Date(ultimaRequisicao);
  const validoAte = new Date(ultima);
  
  if (tipoEPI === 'creme') {
    validoAte.setDate(ultima.getDate() + 31); // 31 dias
  } else if (tipoEPI === 'cartucho') {
    validoAte.setDate(ultima.getDate() + 45); // 45 dias
  } else if (tipoEPI === 'protetor') {
    validoAte.setMonth(ultima.getMonth() + 6); // 6 meses
  }
  
  return validoAte;
}

// Função principal que roda todo dia às 8h da manhã
exports.dailyEPIReport = onSchedule({
  schedule: "0 8 * * *", // Todo dia às 8:00 (horário UTC)
  timeZone: "America/Sao_Paulo", // Fuso horário de São Paulo
}, async (event) => {
  console.log("Iniciando relatório diário de EPI...");
  
  try {
    const db = admin.firestore();
    const today = new Date();
    
    // Dados para o relatório
    const reportData = {
      creme: { critical: [], warning: [], ok: 0, total: 0 },
      cartucho: { critical: [], warning: [], ok: 0, total: 0 },
      protetor: { critical: [], warning: [], ok: 0, total: 0 }
    };
    
    // Buscar dados de todas as coleções
    const collections = [
      { name: 'colaboradores', type: 'creme' },
      { name: 'colaboradores_cartucho', type: 'cartucho' },
      { name: 'colaboradores_protetor_auditivo', type: 'protetor' }
    ];
    
    for (const col of collections) {
      const snapshot = await db.collection(col.name).get();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (!data.ultimaRequisicao) return;
        
        const validoAte = calculateValidUntil(data.ultimaRequisicao, col.type);
        const diasRestantes = daysBetween(validoAte, today);
        const status = getStatus(validoAte, today);
        
        reportData[col.type].total++;
        
        const colaborador = {
          nome: data.nome,
          setor: data.setor,
          ultimaRequisicao: data.ultimaRequisicao,
          validoAte: validoAte.toLocaleDateString('pt-BR'),
          diasRestantes: diasRestantes,
          statusColaborador: data.statusColaborador || 'Não informado'
        };
        
        if (status === 'CRITICO') {
          reportData[col.type].critical.push(colaborador);
        } else if (status === 'INICIAR TROCA') {
          reportData[col.type].warning.push(colaborador);
        } else {
          reportData[col.type].ok++;
        }
      });
    }
    
    // Verificar se há algo para reportar - agora sempre envia o relatório
    const totalCritical = reportData.creme.critical.length + 
                         reportData.cartucho.critical.length + 
                         reportData.protetor.critical.length;
    
    const totalWarning = reportData.creme.warning.length + 
                        reportData.cartucho.warning.length + 
                        reportData.protetor.warning.length;
    
    // Sempre gera e envia o relatório, mesmo se tudo estiver OK
    console.log(`Relatório: ${totalCritical} críticos, ${totalWarning} atenção`);
    
    // Gerar HTML do email
    const emailHTML = generateEmailHTML(reportData, today);
    
    // Enviar email
    const emailSubject = totalCritical > 0 || totalWarning > 0 
      ? `🚨 Relatório EPI - ${totalCritical} Críticos, ${totalWarning} Atenção`
      : `✅ Relatório EPI - Todos os EPIs em dia`;
      
    await sendEmail(emailHTML, totalCritical, totalWarning, emailSubject);
    
    console.log("Relatório enviado com sucesso!");
    
  } catch (error) {
    console.error("Erro ao gerar relatório:", error);
  }
});

// Função para gerar HTML do email
function generateEmailHTML(data, today) {
  // Converter para horário de Brasília
  const brasiliaTime = new Date(today.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
  
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <h1 style="color: #2563eb; text-align: center;">📊 Relatório Diário - Controle de EPI</h1>
      <p style="text-align: center; color: #666; margin-bottom: 30px;">
        Data: ${brasiliaTime.toLocaleDateString('pt-BR')} às ${brasiliaTime.toLocaleTimeString('pt-BR')}
      </p>
  `;
  
  // Função para gerar seção de cada tipo de EPI
  function generateSection(title, epiData, validityText) {
    let section = `
      <div style="margin-bottom: 30px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
        <h2 style="color: #1f2937; margin-top: 0;">${title} (${validityText})</h2>
        <p style="color: #666;">Total: ${epiData.total} colaboradores</p>
    `;
    
    if (epiData.critical.length > 0) {
      section += `
        <h3 style="color: #dc2626; margin-bottom: 10px;">🚨 CRÍTICO - EPI Vencido (${epiData.critical.length})</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="background-color: #fef2f2;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Nome</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Setor</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Dias em Atraso</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Status</th>
          </tr>
      `;
      
      epiData.critical.forEach(colab => {
        section += `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${colab.nome}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${colab.setor}</td>
            <td style="border: 1px solid #ddd; padding: 8px; color: #dc2626; font-weight: bold;">${Math.abs(colab.diasRestantes)}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${colab.statusColaborador}</td>
          </tr>
        `;
      });
      
      section += '</table>';
    } else {
      section += `
        <h3 style="color: #dc2626; margin-bottom: 10px;">🚨 CRÍTICO - EPI Vencido (0)</h3>
        <p style="color: #10b981; font-style: italic; margin-bottom: 20px;">✅ Nenhum colaborador com EPI vencido</p>
      `;
    }
    
    if (epiData.warning.length > 0) {
      section += `
        <h3 style="color: #f59e0b; margin-bottom: 10px;">⚠️ ATENÇÃO - Renovar em Breve (10 dias ou menos) (${epiData.warning.length})</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #fffbeb;">
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Nome</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Setor</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Dias Restantes</th>
            <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Status</th>
          </tr>
      `;
      
      epiData.warning.forEach(colab => {
        section += `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px;">${colab.nome}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${colab.setor}</td>
            <td style="border: 1px solid #ddd; padding: 8px; color: #f59e0b; font-weight: bold;">${colab.diasRestantes}</td>
            <td style="border: 1px solid #ddd; padding: 8px;">${colab.statusColaborador}</td>
          </tr>
        `;
      });
      
      section += '</table>';
    } else {
      section += `
        <h3 style="color: #f59e0b; margin-bottom: 10px;">⚠️ ATENÇÃO - Renovar em Breve (10 dias ou menos) (0)</h3>
        <p style="color: #10b981; font-style: italic;">✅ Nenhum colaborador precisa iniciar troca nos próximos 10 dias</p>
      `;
    }
    
    section += '</div>';
    return section;
  }
  
  // Adicionar seções para cada tipo de EPI
  html += generateSection('Creme de Proteção', data.creme, 'Validade: 31 dias');
  html += generateSection('Cartucho para Máscara', data.cartucho, 'Validade: 45 dias');
  html += generateSection('Protetor Auditivo', data.protetor, 'Validade: 6 meses');
  
  html += `
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-top: 30px;">
        <h3 style="margin-top: 0; color: #374151;">📋 Resumo Geral</h3>
        <ul style="color: #6b7280;">
          <li><strong>Creme de Proteção:</strong> ${data.creme.total} total | ${data.creme.critical.length} críticos | ${data.creme.warning.length} atenção</li>
          <li><strong>Cartucho:</strong> ${data.cartucho.total} total | ${data.cartucho.critical.length} críticos | ${data.cartucho.warning.length} atenção</li>
          <li><strong>Protetor Auditivo:</strong> ${data.protetor.total} total | ${data.protetor.critical.length} críticos | ${data.protetor.warning.length} atenção</li>
        </ul>
      </div>
      
      <p style="text-align: center; color: #6b7280; margin-top: 30px; font-size: 12px;">
        Este é um relatório automático gerado pelo Sistema de Controle de EPI da Maxiplast.
      </p>
    </div>
  `;
  
  return html;
}

// Função para enviar email
async function sendEmail(htmlContent, criticalCount, warningCount, customSubject = null) {
  const transporter = nodemailer.createTransport({
    service: EMAIL_CONFIG.service,
    auth: {
      user: EMAIL_CONFIG.user,
      pass: EMAIL_CONFIG.pass
    }
  });
  
  const subject = customSubject || `🚨 Relatório EPI - ${criticalCount} Críticos, ${warningCount} Atenção`;
  
  await transporter.sendMail({
    from: EMAIL_CONFIG.user,
    to: EMAIL_CONFIG.to,
    subject: subject,
    html: htmlContent
  });
}
