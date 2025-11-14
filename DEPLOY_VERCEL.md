# 🚀 Deploy no Vercel - Guia Completo

## Pré-requisitos

1. Conta no [Vercel](https://vercel.com) (gratuita)
2. Conta no GitHub com repositório `danilolimaCabral/Crm`
3. Banco de dados MySQL/TiDB (recomendado: [PlanetScale](https://planetscale.com) ou [TiDB Cloud](https://tidbcloud.com))

## Passo 1: Preparar Banco de Dados

### Opção A: PlanetScale (Recomendado)
1. Criar conta em https://planetscale.com
2. Criar novo database
3. Copiar connection string (formato: `mysql://user:pass@host/database`)

### Opção B: TiDB Cloud
1. Criar conta em https://tidbcloud.com
2. Criar cluster gratuito
3. Copiar connection string

## Passo 2: Deploy no Vercel

1. Acesse https://vercel.com/new
2. Clique em "Import Git Repository"
3. Selecione `danilolimaCabral/Crm`
4. Configure as variáveis de ambiente (ver seção abaixo)
5. Clique em "Deploy"

## Passo 3: Configurar Variáveis de Ambiente

No painel do Vercel, vá em **Settings → Environment Variables** e adicione:

### Obrigatórias:

```
DATABASE_URL=mysql://user:pass@host/database
JWT_SECRET=seu_secret_aleatorio_aqui_min_32_chars
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### OAuth Manus (se aplicável):
```
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
VITE_APP_ID=seu_app_id
OWNER_OPEN_ID=seu_open_id
OWNER_NAME=Seu Nome
```

### APIs Externas:
```
RAPIDAPI_KEY=sua_chave_rapidapi
```

### Geração de Secrets:

Para gerar `JWT_SECRET` seguro:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Passo 4: Configurar Webhook Stripe

1. Acesse [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Adicione endpoint: `https://seu-app.vercel.app/api/stripe/webhook`
3. Selecione eventos:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
4. Copie o **Signing Secret** (whsec_...)
5. Adicione como `STRIPE_WEBHOOK_SECRET` no Vercel

## Passo 5: Migrar Banco de Dados

Após deploy, execute migrações:

```bash
# Clone o repositório localmente
git clone https://github.com/danilolimaCabral/Crm.git
cd Crm

# Instale dependências
pnpm install

# Configure DATABASE_URL no .env local
echo "DATABASE_URL=sua_connection_string" > .env

# Execute migrações
pnpm db:push
```

## Passo 6: Testar Aplicação

1. Acesse `https://seu-app.vercel.app`
2. Teste login
3. Teste análise de produtos
4. Teste checkout Stripe
5. Verifique webhook no Stripe Dashboard

## Troubleshooting

### Erro: "EMFILE: too many open files"
✅ **Resolvido no Vercel!** Este erro só ocorre no ambiente sandbox Manus.

### Erro: "Cannot connect to database"
- Verifique `DATABASE_URL` nas variáveis de ambiente
- Confirme que o banco permite conexões externas
- Para PlanetScale: habilite "Allow external connections"

### Erro: "Webhook signature verification failed"
- Verifique se `STRIPE_WEBHOOK_SECRET` está correto
- Confirme que o endpoint no Stripe aponta para `https://seu-app.vercel.app/api/stripe/webhook`

### Build falha
- Verifique logs no Vercel Dashboard
- Confirme que todas as dependências estão no `package.json`
- Teste build localmente: `pnpm build`

## Domínio Customizado (Opcional)

1. No Vercel Dashboard, vá em **Settings → Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções do Vercel

## Monitoramento

- **Analytics**: Vercel fornece analytics gratuito
- **Logs**: Acesse em **Deployments → Logs**
- **Errors**: Integre com Sentry (opcional)

## Custos

- **Vercel**: Gratuito para hobby projects
- **PlanetScale**: 5GB gratuito
- **Stripe**: Sem custo até processar pagamentos reais

## Suporte

- Documentação Vercel: https://vercel.com/docs
- Documentação PlanetScale: https://planetscale.com/docs
- Issues GitHub: https://github.com/danilolimaCabral/Crm/issues
