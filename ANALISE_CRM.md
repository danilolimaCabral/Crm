# 📊 Análise do Sistema CRM/Leads no Banco de Dados

## 📋 Resumo Executivo

Este documento apresenta uma análise completa do sistema de gestão de leads (CRM) implementado no banco de dados do projeto. O sistema permite capturar leads antes do login, rastrear uso de análises gratuitas e gerenciar conversões.

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `leads`

**Localização:** `drizzle/schema.ts` (linhas 90-103)

#### Campos da Tabela:

| Campo | Tipo | Descrição | Observações |
|-------|------|-----------|-------------|
| `id` | `int` (PK, auto-increment) | Identificador único | Chave primária |
| `name` | `varchar(255)` NOT NULL | Nome completo do lead | Obrigatório |
| `email` | `varchar(320)` NOT NULL | Email do lead | Obrigatório, único |
| `phone` | `varchar(20)` NULL | Telefone/WhatsApp | Opcional |
| `source` | `varchar(100)` DEFAULT 'website' | Origem do lead | Padrão: "website" |
| `freeSearchesUsed` | `int` DEFAULT 0 | Contador de análises usadas | Limite: 5 análises |
| `convertedToUser` | `int` DEFAULT 0 | Flag de conversão | 0 = não convertido, 1 = convertido |
| `createdAt` | `timestamp` | Data de criação | Auto-preenchido |
| `updatedAt` | `timestamp` | Data de atualização | Auto-atualizado |

#### Características:
- ✅ Validação de email único (evita duplicatas)
- ✅ Rastreamento de origem do lead
- ✅ Contador de análises gratuitas (limite de 5)
- ✅ Flag de conversão para usuário registrado
- ✅ Timestamps automáticos

---

## 🔌 API Endpoints (tRPC)

### Localização: `server/routers.ts` (linhas 377-496)

### 1. `leads.create` (Public)
**Função:** Criar novo lead ou retornar existente

**Input:**
```typescript
{
  name: string (min 2 caracteres)
  email: string (email válido)
  phone?: string (opcional)
}
```

**Comportamento:**
- Verifica se email já existe
- Se existir: retorna lead existente (`existing: true`)
- Se não existir: cria novo lead (`existing: false`)
- Retorna `leadId` para armazenamento no localStorage

**Validações:**
- ✅ Nome mínimo de 2 caracteres
- ✅ Email válido
- ✅ Prevenção de duplicatas por email

---

### 2. `leads.incrementSearchCount` (Public)
**Função:** Incrementar contador de análises usadas

**Input:**
```typescript
{
  leadId: string
}
```

**Comportamento:**
- Busca lead por ID
- Incrementa `freeSearchesUsed`
- Retorna novo valor de pesquisas usadas

**Validações:**
- ✅ Verifica se lead existe
- ✅ Tratamento de erro se lead não encontrado

---

### 3. `leads.getSearchCount` (Public)
**Função:** Obter contador de análises restantes

**Input:**
```typescript
{
  leadId: string
}
```

**Retorno:**
```typescript
{
  searchesUsed: number
  searchesRemaining: number (máx 5)
}
```

**Comportamento:**
- Calcula análises restantes (5 - usadas)
- Retorna 0 se lead não encontrado

---

### 4. `leads.getAll` (Protected - Admin Only)
**Função:** Listar todos os leads (apenas admin)

**Validação:**
- ✅ Verifica se usuário é admin (`role === "admin"`)
- ❌ Retorna erro se não for admin

**Retorno:**
```typescript
Array<{
  id: number
  name: string
  email: string
  phone: string | null
  searchCount: number
  createdAt: Date
}>
```

**Ordenação:** Por data de criação (mais recentes primeiro)

---

## 🎨 Interface do Usuário

### 1. Modal de Captura de Lead
**Arquivo:** `client/src/components/LeadCaptureModal.tsx`

**Funcionalidades:**
- ✅ Formulário com validação client-side
- ✅ Campos: Nome (obrigatório), Email (obrigatório), WhatsApp (opcional)
- ✅ Feedback visual com toast notifications
- ✅ Loading state durante criação
- ✅ Modal não pode ser fechado clicando fora (`onInteractOutside` bloqueado)

**Fluxo:**
1. Usuário preenche formulário
2. Validação client-side
3. Chamada API `leads.create`
4. Sucesso: salva `leadId` no localStorage
5. Fecha modal automaticamente

---

### 2. Página Admin de Leads
**Arquivo:** `client/src/pages/AdminLeads.tsx`

**Funcionalidades:**

#### Estatísticas:
- 📊 Total de leads capturados
- 📊 Total de análises realizadas
- 📊 Média de análises por lead

#### Tabela de Leads:
- ✅ Lista completa de leads
- ✅ Colunas: Nome, Email, WhatsApp, Pesquisas, Status, Data
- ✅ Badge de status (Ativo / Limite Atingido)
- ✅ Badge de contador (X/5 análises)
- ✅ Formatação de data em pt-BR

#### Exportação:
- ✅ Exportação para CSV
- ✅ Nome do arquivo: `leads_YYYY-MM-DD.csv`
- ✅ Headers: Nome, Email, WhatsApp, Pesquisas Feitas, Data de Cadastro

#### Segurança:
- ✅ Verificação de autenticação
- ✅ Verificação de role admin
- ✅ Página de acesso negado para não-admins

---

## 🔄 Fluxo de Funcionamento

### Fluxo de Captura de Lead:

```
1. Usuário não autenticado acessa Home
   ↓
2. Sistema verifica localStorage por "leadId"
   ↓
3. Se não existe leadId:
   → Abre modal de captura
   → Usuário preenche dados
   → Cria lead via API
   → Salva leadId no localStorage
   ↓
4. Se existe leadId:
   → Carrega contador de análises
   → Verifica se ainda tem análises disponíveis
   ↓
5. Usuário realiza análise
   → Incrementa contador via API
   → Atualiza UI
   ↓
6. Se atingir 5 análises:
   → Bloqueia novas análises
   → Mostra mensagem de limite atingido
```

---

## 📈 Métricas e Analytics

### Dados Rastreados:
1. **Total de Leads:** Contagem total de leads capturados
2. **Taxa de Conversão:** `convertedToUser === 1`
3. **Uso de Análises:** `freeSearchesUsed` por lead
4. **Origem dos Leads:** Campo `source` (atualmente só "website")
5. **Tempo de Conversão:** Diferença entre `createdAt` e data de conversão

### Métricas Calculadas na UI:
- ✅ Total de leads
- ✅ Total de análises realizadas
- ✅ Média de análises por lead

---

## ⚠️ Problemas Identificados

### 1. **Falta de Relação com Tabela `users`**
- ❌ Não há foreign key entre `leads` e `users`
- ❌ Campo `convertedToUser` é apenas flag booleana (0/1)
- ⚠️ Não é possível rastrear qual usuário veio de qual lead
- ❌ **Campo `convertedToUser` nunca é atualizado** - não há lógica de conversão no OAuth

**Recomendação:**
```sql
ALTER TABLE leads ADD COLUMN userId INT NULL;
ALTER TABLE leads ADD FOREIGN KEY (userId) REFERENCES users(id);
```

**Implementação necessária:**
- No callback OAuth (`server/_core/oauth.ts`), verificar se email do usuário existe em `leads`
- Se existir, atualizar `convertedToUser = 1` e `userId = <user.id>`

---

### 2. **Limite Hardcoded**
- ⚠️ Limite de 5 análises está hardcoded no código
- ⚠️ Não é configurável via banco de dados

**Recomendação:**
- Adicionar campo `maxFreeSearches` na tabela `leads` ou em configuração

---

### 3. **Falta de Histórico de Análises**
- ❌ Não há relação entre `leads` e `analyses`
- ❌ Não é possível ver quais análises um lead realizou

**Recomendação:**
- Adicionar campo `leadId` opcional na tabela `analyses`
- Permitir análises sem userId quando for lead

---

### 4. **Campo `source` Limitado**
- ⚠️ Campo `source` sempre é "website"
- ⚠️ Não há tracking de origem real (Google Ads, Facebook, etc.)

**Recomendação:**
- Implementar UTM tracking
- Salvar parâmetros de URL na criação do lead

---

### 5. **Falta de Soft Delete**
- ❌ Não há campo `deletedAt` para exclusão lógica
- ⚠️ Leads deletados são perdidos permanentemente

---

### 6. **Sem Validação de Telefone**
- ⚠️ Campo `phone` aceita qualquer string
- ⚠️ Não há validação de formato brasileiro

**Recomendação:**
- Adicionar validação de formato (11) 99999-9999
- Normalizar antes de salvar

---

## ✅ Pontos Fortes

1. ✅ **Sistema funcional e completo**
   - Captura, rastreamento e visualização funcionando

2. ✅ **Segurança adequada**
   - Validação de admin para visualização
   - Validação de dados de entrada

3. ✅ **UX bem pensada**
   - Modal não intrusivo
   - Feedback visual claro
   - Exportação de dados

4. ✅ **Prevenção de duplicatas**
   - Verificação por email antes de criar

5. ✅ **Rastreamento de uso**
   - Contador preciso de análises
   - Limite claro e visível

---

## 🚀 Melhorias Sugeridas

### Prioridade Alta:

1. **Adicionar relação com `users`**
   ```typescript
   // No schema.ts
   userId: int("userId").references(() => users.id),
   ```

2. **Rastrear análises por lead**
   ```typescript
   // Na tabela analyses
   leadId: int("leadId").references(() => leads.id),
   ```

3. **Implementar UTM tracking**
   - Capturar parâmetros de URL
   - Salvar em `source` ou novo campo `utmSource`

### Prioridade Média:

4. **Adicionar soft delete**
   ```typescript
   deletedAt: timestamp("deletedAt"),
   ```

5. **Validação de telefone**
   - Regex para formato brasileiro
   - Normalização automática

6. **Configuração de limite**
   - Tabela de configurações ou campo na tabela

### Prioridade Baixa:

7. **Dashboard de métricas**
   - Gráficos de conversão
   - Timeline de leads
   - Heatmap de origem

8. **Notificações**
   - Email quando lead atinge limite
   - Notificação para admin de novo lead

9. **Segmentação**
   - Tags/categorias para leads
   - Filtros avançados na página admin

---

## 📊 Estatísticas do Código

- **Tabelas relacionadas:** 1 (`leads`)
- **Endpoints API:** 4 rotas tRPC
- **Componentes UI:** 2 (Modal + Admin Page)
- **Linhas de código:** ~500 linhas
- **Validações:** 5 validações principais

---

## 🔍 Queries Úteis

### Total de leads não convertidos:
```sql
SELECT COUNT(*) FROM leads WHERE convertedToUser = 0;
```

### Leads que atingiram limite:
```sql
SELECT * FROM leads WHERE freeSearchesUsed >= 5;
```

### Taxa de conversão:
```sql
SELECT 
  COUNT(*) as total,
  SUM(convertedToUser) as convertidos,
  (SUM(convertedToUser) / COUNT(*)) * 100 as taxa_conversao
FROM leads;
```

### Leads por origem:
```sql
SELECT source, COUNT(*) as total 
FROM leads 
GROUP BY source;
```

---

## 📝 Conclusão

O sistema CRM/Leads está **funcional e bem implementado** para o escopo atual. As principais funcionalidades estão operacionais:

✅ Captura de leads antes do login  
✅ Rastreamento de análises gratuitas  
✅ Limite de 5 análises por lead  
✅ Dashboard admin para visualização  
✅ Exportação de dados  

**Principais oportunidades de melhoria:**
- Integração mais profunda com tabela `users`
- Rastreamento de análises por lead
- Sistema de tracking de origem (UTM)
- Validações adicionais

O sistema está pronto para uso em produção, mas se beneficiaria das melhorias sugeridas para escalabilidade e analytics mais robustos.

---

**Data da Análise:** 2024  
**Versão do Schema:** Baseado em `drizzle/schema.ts`  
**Status:** ✅ Funcional | ⚠️ Melhorias Recomendadas

---

## 📊 Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    SISTEMA CRM/LEADS                        │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │         │   Backend    │         │   Database   │
│              │         │              │         │              │
│ LeadCapture  │────────▶│ leads.create │────────▶│   leads      │
│    Modal     │         │              │         │   table      │
└──────────────┘         └──────────────┘         └──────────────┘
       │                         │                         │
       │                         │                         │
       ▼                         ▼                         ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Home Page   │         │incrementSearch│        │freeSearchesUsed│
│              │────────▶│    Count      │────────▶│   counter    │
└──────────────┘         └──────────────┘         └──────────────┘
       │                         │                         │
       │                         │                         │
       ▼                         ▼                         ▼
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│ AdminLeads   │         │  leads.getAll │        │  All Leads   │
│    Page      │────────▶│  (admin only)│────────▶│   Data      │
└──────────────┘         └──────────────┘         └──────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    FLUXO DE DADOS                           │
│                                                              │
│  1. Lead criado → localStorage (leadId)                     │
│  2. Análise realizada → incrementSearchCount                 │
│  3. Limite atingido (5) → Bloqueio de novas análises        │
│  4. Login realizado → ❌ NÃO atualiza convertedToUser        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Checklist de Funcionalidades

### ✅ Implementado:
- [x] Tabela `leads` no banco de dados
- [x] API para criar lead
- [x] API para incrementar contador
- [x] API para consultar contador
- [x] API para listar leads (admin)
- [x] Modal de captura de lead
- [x] Página admin de leads
- [x] Exportação CSV
- [x] Validação de email único
- [x] Limite de 5 análises
- [x] Rastreamento de origem

### ❌ Não Implementado:
- [ ] Conversão automática de lead para usuário
- [ ] Relação foreign key com `users`
- [ ] Rastreamento de análises por lead
- [ ] UTM tracking
- [ ] Soft delete
- [ ] Validação de telefone
- [ ] Notificações de conversão
- [ ] Dashboard de métricas avançado
