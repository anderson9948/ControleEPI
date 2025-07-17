# Configuração de Variáveis de Ambiente para Firebase Functions

## Para configurar o email automático, execute os seguintes comandos:

```bash
# Configurar email do remetente
firebase functions:config:set email.user="seu-email@gmail.com"

# Configurar senha de app do Gmail
firebase functions:config:set email.password="sua-senha-app-do-gmail"

# Configurar lista de destinatários (separados por vírgula)
firebase functions:config:set email.recipients="email1@empresa.com,email2@empresa.com"
```

## Para visualizar as configurações atuais:
```bash
firebase functions:config:get
```

## Para limpar uma configuração:
```bash
firebase functions:config:unset email
```

## Como obter uma senha de app do Gmail:
1. Acesse https://myaccount.google.com/security
2. Ative a verificação em 2 etapas
3. Clique em "Senhas de app"
4. Selecione "Email" e "Outro (nome personalizado)"
5. Digite "Sistema EPI" como nome
6. Use a senha gerada de 16 caracteres
