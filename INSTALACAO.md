# 🚀 Guia Rápido de Instalação

## 1. Clone e Prepare o Projeto

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/ControleEPI.git
cd ControleEPI

# Instale todas as dependências
npm run install-all
```

## 2. Configure o Firebase

```bash
# Instale o Firebase CLI
npm install -g firebase-tools

# Faça login no Firebase
firebase login

# Crie um novo projeto ou use um existente
firebase init
```

## 3. Configure as Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cd controle
cp .env.example .env.local

# Edite o .env.local com suas credenciais Firebase
# Copie as credenciais do seu projeto Firebase Console
```

## 4. Configure o Email (Para Relatórios Automáticos)

```bash
# Configure as variáveis de ambiente no Firebase Functions
firebase functions:config:set email.user="seu-email@gmail.com"
firebase functions:config:set email.password="sua-senha-app-gmail"
firebase functions:config:set email.recipients="email1@empresa.com,email2@empresa.com"
```

## 5. Execute o Projeto

```bash
# Desenvolvimento local
npm run dev

# Build para produção
npm run build

# Deploy para Firebase
npm run deploy
```

## 🔧 Comandos Úteis

```bash
# Instalar dependências de todos os módulos
npm run install-all

# Executar apenas o frontend
npm run dev

# Deploy apenas das funções
npm run deploy-functions

# Ver logs das funções
firebase functions:log
```

## 📞 Precisa de Ajuda?

Consulte o arquivo `README.md` para documentação completa ou o arquivo `SEGURANCA.md` para orientações de segurança.
