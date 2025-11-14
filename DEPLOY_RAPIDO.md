# 🚀 DEPLOY RÁPIDO - VERCEL

## ✅ VARIÁVEIS DE AMBIENTE PRONTAS

Copie e cole estas variáveis no Vercel:

### 1. JWT_SECRET (GERADO)
```
JWT_SECRET=8da7eeacb63ce93bd0a6d624fc265f5d67f7ac90dfd2bd9d0c12cbbb3d671fb5
```

### 2. DATABASE_URL (PREENCHA COM SEU BANCO RENDER)
```
DATABASE_URL=postgresql://SEU_USER:SUA_SENHA@dpg-xxxxx.oregon-postgres.render.com/SEU_DB?sslmode=require
```

**Como obter:**
1. Acesse: https://dashboard.render.com/select/postgres
2. Clique no seu banco PostgreSQL
3. Copie "External Database URL"
4. Adicione `?sslmode=require` no final

**Exemplo:**
```
DATABASE_URL=postgresql://crm_user:abc123xyz@dpg-ch9abc.oregon-postgres.render.com/crm_db?sslmode=require
```

### 3. OPENAI_API_KEY (PREENCHA COM SUA KEY)
```
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Como obter:**
1. Acesse: https://platform.openai.com/api-keys
2. Clique em "Create new secret key"
3. Copie a key (começa com `sk-proj-` ou `sk-`)

### 4. NODE_ENV (PRONTO)
```
NODE_ENV=production
```

### 5. VITE_APP_TITLE (PRONTO)
```
VITE_APP_TITLE=Importador Inteligente
```

---

## 📋 PASSO A PASSO DEPLOY

### PASSO 1: Abrir Vercel
👉 https://vercel.com/new

### PASSO 2: Importar Repositório
- Procure: `danilolimaCabral/Crm`
- Clique em **"Import"**

### PASSO 3: Adicionar Variáveis
Clique em **"Environment Variables"** e adicione UMA POR VEZ:

**Variável 1:**
- Name: `JWT_SECRET`
- Value: `8da7eeacb63ce93bd0a6d624fc265f5d67f7ac90dfd2bd9d0c12cbbb3d671fb5`
- Marque: ☑️ Production ☑️ Preview ☑️ Development

**Variável 2:**
- Name: `DATABASE_URL`
- Value: Cole sua External Database URL do Render + `?sslmode=require`
- Marque: ☑️ Production ☑️ Preview ☑️ Development

**Variável 3:**
- Name: `OPENAI_API_KEY`
- Value: Cole sua key da OpenAI (começa com `sk-`)
- Marque: ☑️ Production ☑️ Preview ☑️ Development

**Variável 4:**
- Name: `NODE_ENV`
- Value: `production`
- Marque: ☑️ Production ☑️ Preview ☑️ Development

**Variável 5:**
- Name: `VITE_APP_TITLE`
- Value: `Importador Inteligente`
- Marque: ☑️ Production ☑️ Preview ☑️ Development

### PASSO 4: Deploy
- Clique em **"Deploy"**
- Aguarde 2-3 minutos
- ✅ Pronto!

---

## 🧪 TESTAR O SISTEMA

Quando o deploy terminar:

1. **Clique em "Visit"**
2. **Acesse `/auth`**
3. **Criar conta:**
   - Nome: Seu Nome
   - Email: teste@email.com
   - Senha: teste123
4. **Testar busca:**
   - Digite: "smartwatch"
   - Clique em "Analisar com IA"
   - Aguarde 10-15 segundos
5. ✅ Deve mostrar 5 produtos com análise completa

---

## 🔧 OPCIONAL: STRIPE (Pagamentos)

Se quiser ativar pagamentos depois:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Como obter:**
1. Acesse: https://dashboard.stripe.com/test/apikeys
2. Copie as keys
3. Configure webhook: https://dashboard.stripe.com/test/webhooks

---

## 🆘 TROUBLESHOOTING

### Erro: "Database connection failed"
- Verifique se DATABASE_URL tem `?sslmode=require` no final
- Teste conexão no Render dashboard

### Erro: "OpenAI API error"
- Verifique se tem créditos: https://platform.openai.com/settings/organization/billing
- Mínimo $5 de crédito necessário

### Erro: "Build failed"
- Veja logs completos em: https://vercel.com/seu-projeto/deployments
- Verifique se todas as 5 variáveis foram adicionadas

---

## ✅ CHECKLIST FINAL

- [ ] JWT_SECRET adicionado (gerado automaticamente)
- [ ] DATABASE_URL adicionado (do Render + ?sslmode=require)
- [ ] OPENAI_API_KEY adicionado (da OpenAI)
- [ ] NODE_ENV=production adicionado
- [ ] VITE_APP_TITLE adicionado
- [ ] Deploy concluído com sucesso
- [ ] Site acessível
- [ ] Login funcionando
- [ ] Busca funcionando

---

## 🎉 PRONTO!

Seu sistema está no ar em:
`https://seu-projeto.vercel.app`

Qualquer dúvida, consulte a documentação completa em `DEPLOY_VERCEL.md`
