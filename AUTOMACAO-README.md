# 📧 Automação de Relatórios EPI - Firebase Functions

Este sistema envia automaticamente um relatório por email todos os dias às 8h da manhã com informações sobre EPIs vencidos ou prestes a vencer.

## 🔧 Configuração Necessária

### 1. Configurar Email no Gmail

1. **Ativar verificação em 2 etapas** no seu Gmail
2. **Gerar senha de app:**
   - Acesse: https://myaccount.google.com/security
   - Clique em "Senhas de app"
   - Selecione "Email" e "Computador Windows"
   - Copie a senha gerada (16 caracteres)

### 2. Editar Configurações no Código

**OPÇÃO 1 - Usando variáveis de ambiente (RECOMENDADO):**

Configure as variáveis no Firebase Functions:
```bash
firebase functions:config:set email.user="seu-email@gmail.com"
firebase functions:config:set email.password="sua-senha-app-gmail"
firebase functions:config:set email.recipients="email1@empresa.com,email2@empresa.com"
```

**OPÇÃO 2 - Editando diretamente no código:**

No arquivo `functions/index.js`, altere estas linhas (linhas 8-12):

```javascript
const EMAIL_CONFIG = {
  service: 'gmail',
  user: 'seu-email@gmail.com',        // ✏️ SEU EMAIL AQUI
  pass: 'sua-senha-app',              // ✏️ SENHA DE APP AQUI
  to: ['email1@empresa.com', 'email2@empresa.com']   // ✏️ LISTA DE DESTINATÁRIOS
};
```

**Exemplo:**
```javascript
const EMAIL_CONFIG = {
  service: 'gmail',
  user: 'empresa.epi@gmail.com',
  pass: 'abcd efgh ijkl mnop',
  to: ['gestor1@empresa.com.br', 'gestor2@empresa.com.br']
};
```

## 🚀 Como Publicar

### 1. Voltar para a pasta principal
```bash
cd..
```

### 2. Fazer login no Firebase
```bash
firebase login
```

### 3. Publicar as funções
```bash
firebase deploy --only functions
```

## ⏰ Horário de Envio

- **Horário configurado:** 8:00 da manhã (Brasil)
- **Frequência:** Todos os dias
- **Destinatários:** Configurados via variáveis de ambiente
- **Condição:** Sempre envia (mesmo quando tudo está OK)

## 📊 O que o Relatório Contém

### ✅ **Dados Incluídos:**
- **Creme de Proteção** (validade: 31 dias)
- **Cartucho para Máscara** (validade: 45 dias)  
- **Protetor Auditivo** (validade: 6 meses)

### 📋 **Informações por Colaborador:**
- Nome do colaborador
- Setor de trabalho
- Dias em atraso (críticos)
- Dias restantes (atenção)
- Status do colaborador (trabalhando, afastado, etc.)

### 🚨 **Categorias de Alerta:**
- **CRÍTICO** (vermelho): EPI vencido
- **ATENÇÃO** (laranja): EPI vence em 10 dias ou menos

## 📧 Exemplo de Email

```
Assunto: 🚨 Relatório EPI - 3 Críticos, 2 Atenção

📊 Relatório Diário - Controle de EPI
Data: 16/07/2025 às 08:00:00

CREME DE PROTEÇÃO (Validade: 31 dias)
🚨 CRÍTICO - EPI Vencido (2)
• João Silva - Limpeza Peças - 3 dias em atraso
• Maria Santos - Clicheria - 1 dia em atraso

⚠️ ATENÇÃO - Renovar em Breve (1)
• Pedro Costa - Limpeza Peças - 2 dias restantes

📋 Resumo Geral
• Creme de Proteção: 15 total | 2 críticos | 1 atenção
• Cartucho: 8 total | 1 crítico | 1 atenção  
• Protetor Auditivo: 12 total | 0 críticos | 0 atenção
```

## ✅ Vantagens do Sistema

- ✅ **Automático:** Não precisa lembrar de verificar
- ✅ **Inteligente:** Só envia quando há problemas
- ✅ **Completo:** Inclui todos os tipos de EPI
- ✅ **Visual:** Email bonito e fácil de ler
- ✅ **Detalhado:** Mostra exatamente quem precisa de atenção

## 🔧 Comandos Úteis

```bash
# Ver logs da função
firebase functions:log

# Testar localmente (opcional)
firebase emulators:start --only functions

# Verificar status do projeto
firebase projects:list
```

## ⚠️ Importante

- O sistema usa as mesmas coleções do Firestore que sua aplicação web
- Não interfere no funcionamento atual do sistema
- Totalmente independente da interface web
- Funciona 24/7 no servidor do Google
