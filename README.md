# 🛡️ Sistema de Controle de EPI - MAXIPLAST

## 📋 Sobre o Projeto

Este é um sistema de controle e gestão de **Equipamentos de Proteção Individual (EPIs)** desenvolvido especificamente para a **MAXIPLAST**. O sistema permite o controle automatizado da validade dos EPIs distribuídos aos colaboradores, com envio automático de relatórios por email sobre itens vencidos ou prestes a vencer.

### 🎯 Funcionalidades Principais

- ✅ **Controle de Validade**: Monitoramento automático da validade dos EPIs por colaborador
- 📧 **Relatórios Automáticos**: Envio diário de relatórios por email às 8h da manhã
- 🔄 **Gestão de Colaboradores**: Cadastro, edição e exclusão de colaboradores
- ⚠️ **Alertas Inteligentes**: Sistema de cores para identificar EPIs críticos e em atenção
- 📊 **Dashboard Visual**: Interface intuitiva para visualização dos dados
- 🏭 **Multi-setores**: Controle por setor da empresa

### 🛡️ Tipos de EPI Controlados

1. **Creme de Proteção** - Validade: 31 dias
2. **Cartucho para Máscara** - Validade: 45 dias  
3. **Protetor Auditivo** - Validade: 6 meses

## 🚀 Tecnologias Utilizadas

### Frontend
- **Next.js 15** - Framework React para produção
- **React 19** - Biblioteca para interfaces de usuário
- **TypeScript** - Superset tipado do JavaScript
- **Tailwind CSS** - Framework CSS utilitário
- **React Icons** - Biblioteca de ícones

### Backend e Banco de Dados
- **Firebase Firestore** - Banco de dados NoSQL em tempo real
- **Firebase Functions** - Funções serverless para automação
- **Node.js** - Runtime JavaScript

### Automação
- **Nodemailer** - Envio de emails automatizado
- **Cron Jobs** - Agendamento de tarefas automáticas

## 🏗️ Estrutura do Projeto

```
ControleEPI/
├── controle/                    # Aplicação Next.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Página principal (Creme)
│   │   │   ├── cartucho/       # Página dos Cartuchos
│   │   │   └── protetor-auditivo/ # Página dos Protetores
│   │   └── firebase.ts         # Configuração Firebase
│   ├── package.json
│   └── next.config.ts
├── functions/                   # Firebase Functions
│   ├── index.js                # Função de relatório automático
│   └── package.json
└── firebase.json               # Configuração do Firebase
```

## ⚙️ Configuração e Instalação

### 1. Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta Firebase
- Conta Gmail (para envio de emails)

### 2. Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative o Firestore Database
3. Ative o Firebase Functions
4. Copie as credenciais do projeto

### 3. Configuração do Ambiente

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/ControleEPI.git
cd ControleEPI
```

2. Configure as variáveis de ambiente:
```bash
cd controle
cp .env.example .env.local
```

3. Edite o arquivo `.env.local` com suas credenciais Firebase:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=sua_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seu_projeto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seu_projeto.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=seu_app_id
```

### 4. Instalação das Dependências

Para o frontend:
```bash
cd controle
npm install
```

Para as funções Firebase:
```bash
cd ../functions
npm install
```

### 5. Configuração do Email Automático

Configure as variáveis de ambiente no Firebase Functions:

```bash
firebase functions:config:set email.user="seu-email@gmail.com"
firebase functions:config:set email.password="sua-senha-app-gmail"
firebase functions:config:set email.recipients="email1@empresa.com,email2@empresa.com"
```

**Importante**: Use uma "Senha de App" do Gmail, não sua senha normal.

## 🚀 Execução

### Desenvolvimento Local

1. Frontend:
```bash
cd controle
npm run dev
```

2. Emulador Firebase (opcional):
```bash
cd ..
firebase emulators:start
```

### Deploy para Produção

1. Build do frontend:
```bash
cd controle
npm run build
```

2. Deploy das Functions:
```bash
cd ..
firebase deploy --only functions
```

3. Deploy do Hosting (se configurado):
```bash
firebase deploy --only hosting
```

## 📊 Como Usar

### 1. Cadastro de Colaboradores
- Acesse a página do tipo de EPI desejado
- Clique em "Adicionar Novo Colaborador"
- Preencha nome e setor
- Clique em "Adicionar"

### 2. Registro de Entrega de EPI
- Localize o colaborador na lista
- Clique em "Entregar EPI"
- A data será registrada automaticamente
- O sistema calculará a nova data de validade

### 3. Monitoramento
- **Verde**: EPI em dia
- **Laranja**: EPI precisa ser trocado em até 10 dias
- **Vermelho**: EPI vencido (crítico)

### 4. Relatórios Automáticos
O sistema envia automaticamente por email:
- Todos os dias às 8h da manhã
- Lista de EPIs vencidos (críticos)
- Lista de EPIs para renovar (atenção)
- Resumo geral por tipo de EPI

## 🔧 Personalização

### Alterando Prazos de Validade

Edite o arquivo `functions/index.js`:
```javascript
function calculateValidUntil(ultimaRequisicao, tipoEPI) {
  const ultima = new Date(ultimaRequisicao);
  const validoAte = new Date(ultima);
  
  if (tipoEPI === 'creme') {
    validoAte.setDate(ultima.getDate() + 31); // Altere aqui
  } else if (tipoEPI === 'cartucho') {
    validoAte.setDate(ultima.getDate() + 45); // Altere aqui
  } else if (tipoEPI === 'protetor') {
    validoAte.setMonth(ultima.getMonth() + 6); // Altere aqui
  }
  
  return validoAte;
}
```

### Alterando Horário do Relatório

Edite a linha do agendamento em `functions/index.js`:
```javascript
exports.dailyEPIReport = onSchedule({
  schedule: "0 8 * * *", // Formato cron: minuto hora dia mês dia_da_semana
  timeZone: "America/Sao_Paulo",
}, async (event) => {
  // ...
});
```

## 🚨 Status e Alertas

### Códigos de Status
- **OK**: EPI válido (mais de 10 dias para vencer)
- **INICIAR TROCA**: EPI próximo do vencimento (10 dias ou menos)
- **CRÍTICO**: EPI vencido

### Sistema de Cores
- 🟢 **Verde**: Situação normal
- 🟡 **Amarelo**: Atenção necessária
- 🔴 **Vermelho**: Ação urgente necessária

**⚠️ Importante**: Este sistema gerencia informações críticas de segurança do trabalho. Sempre mantenha os dados atualizados e monitore regularmente os relatórios para garantir a segurança dos colaboradores.
