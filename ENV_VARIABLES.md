# Variáveis de Ambiente - Vercel

Configure estas variáveis no painel do Vercel em **Settings → Environment Variables**:

## 🔐 Obrigatórias

### Database
```
DATABASE_URL=mysql://user:password@host:port/database
```
**Onde obter:** Use PlanetScale (gratuito) ou TiDB Cloud
- PlanetScale: https://planetscale.com
- TiDB Cloud: https://tidbcloud.com

### Authentication
```
JWT_SECRET=sua-chave-secreta-minimo-32-caracteres-aleatorios
```
**Onde obter:** Gere com: `openssl rand -base64 32`

### OpenAI API
```
OPENAI_API_KEY=sk-...
```
**Onde obter:** https://platform.openai.com/api-keys

## 💳 Stripe (Pagamentos)

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Onde obter:**
1. Criar conta: https://dashboard.stripe.com/register
2. API Keys: https://dashboard.stripe.com/test/apikeys
3. Webhook: https://dashboard.stripe.com/test/webhooks
   - Endpoint: `https://seu-dominio.vercel.app/api/stripe/webhook`
   - Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## 🔍 RapidAPI (Scraping - Opcional)

```
RAPIDAPI_KEY=sua-chave-rapidapi
```

**Onde obter:** https://rapidapi.com/hub
- Busque por "AliExpress API" e "Amazon Product Data"
- Plano gratuito disponível

## ⚙️ Configurações Adicionais

```
NODE_ENV=production
VITE_APP_TITLE=Importador Inteligente
LIVE_STREAM_URL=https://sua-live.com/sala
VITE_LIVE_STREAM_URL=https://sua-live.com/sala
```

`LIVE_STREAM_URL` é usado pelo backend para montar o link final enviado junto com o código de autenticação; já `VITE_LIVE_STREAM_URL` garante um fallback seguro na camada de frontend.

## 📋 Checklist de Deploy

- [ ] Criar banco de dados MySQL
- [ ] Configurar todas as variáveis no Vercel
- [ ] Fazer primeiro deploy
- [ ] Configurar webhook do Stripe com URL do Vercel
- [ ] Testar login/registro
- [ ] Testar análise de produtos
- [ ] Testar fluxo de pagamento

## 🔄 Após Deploy

1. Copie a URL do seu projeto Vercel (ex: `https://seu-app.vercel.app`)
2. Configure o webhook do Stripe com: `https://seu-app.vercel.app/api/stripe/webhook`
3. Teste o fluxo completo de pagamento
