# Importador Inteligente - TODO

> **Última atualização:** 2024  
> **Status geral:** 65% concluído | 35% pendente

---

## ✅ Funcionalidades Implementadas

### Backend - API e Lógica de Negócio ✅
- [x] Criar schema do banco de dados para produtos e análises
- [x] Implementar simulação de busca em plataformas da China (AliExpress, Alibaba, Temu, Taobao)
- [x] Implementar simulação de busca em marketplaces brasileiros (Mercado Livre, Amazon BR, Magazine Luiza)
- [x] Criar procedimento tRPC para análise de viabilidade de importação
- [x] Implementar cálculo de custos de importação (impostos, IOF, frete)
- [x] Implementar análise de concorrência e score de oportunidade
- [x] Criar procedimento para salvar histórico de análises

### Frontend - Interface Visual ✅ (100%)
- [x] Criar página inicial (landing page) com busca de produtos
- [x] Implementar painel de resultados com cards visuais dos produtos
- [x] Adicionar fotos/imagens dos produtos nos cards
- [x] Criar visualização de comparação China vs Brasil
- [x] Implementar gráficos de margem de lucro (pizza e barras)
- [x] Adicionar indicadores visuais de viabilidade (verde/amarelo/vermelho)
- [x] Criar página de detalhes da análise
- [x] Implementar filtros e ordenação por score de oportunidade
- [x] Adicionar histórico de análises do usuário
- [x] Criar dashboard com estatísticas

### Design e UX ✅
- [x] Definir paleta de cores e tema visual
- [x] Criar componentes reutilizáveis para cards de produtos
- [x] Implementar estados de loading com skeleton
- [x] Adicionar animações e transições suaves
- [x] Garantir responsividade mobile

### Chat de IA Integrado ✅
- [x] Criar componente de chat flutuante na interface
- [x] Implementar endpoint tRPC para chat com OpenAI
- [x] Adicionar contexto das análises ao chat
- [x] Criar prompts especializados para importação
- [x] Implementar histórico de conversas
- [x] Adicionar sugestões rápidas de perguntas

### IA para Sugestões de Produtos ✅
- [x] Criar serviço de IA para gerar sugestões de produtos baseado no termo de busca
- [x] IA analisa o termo e sugere 5-10 produtos lucrativos relacionados
- [x] IA gera preços realistas China vs Brasil
- [x] IA explica por que cada produto é uma oportunidade
- [x] IA sugere nichos e categorias promissoras
- [x] Remover dependência de banco de dados estático de produtos

### Comparação Multi-Plataforma ✅
- [x] Expandir IA para buscar em TODOS os sites chineses principais
- [x] Adicionar Shopee China, 1688.com, DHgate, Banggood
- [x] Adicionar sites brasileiros: Shopee BR, Americanas, Casas Bahia
- [x] IA recomenda qual site chinês tem melhor custo-benefício (bestChinaPrice)
- [x] Estrutura de dados preparada para múltiplos fornecedores
- [ ] Criar interface visual para mostrar tabela comparativa de preços
- [ ] Adicionar score de confiabilidade por plataforma
- [ ] Destacar visualmente a melhor oferta

### Calculadora Avançada de Importação ✅
- [x] Adicionar campo de quantidade na análise
- [x] Calcular custo total baseado em quantidade
- [x] Calcular impostos totais (60% + IOF 5.38%)
- [x] Calcular frete proporcional por quantidade (com desconto por volume)
- [x] Calcular custo por unidade importada
- [x] Sugerir preços de venda com diferentes margens (30%, 50%, 100%)
- [x] Mostrar lucro total da operação para cada margem
- [x] Criar tabela comparativa com 4 cenários de quantidade (50, 100, 500, 1000)
- [x] Destacar visualmente a quantidade selecionada na tabela
- [x] Adicionar dica sobre desconto de frete por volume

### Sistema de Captura de Leads ✅
- [x] Criar tabela de leads no banco de dados (nome, email, telefone, data)
- [x] Criar formulário de captura de lead com botão "Começar Grátis"
- [x] Implementar modal de captura que abre antes do primeiro uso
- [x] Salvar lead no banco de dados
- [x] Implementar contador de pesquisas gratuitas (5 pesquisas) usando localStorage
- [x] Mostrar contador "X/5 pesquisas restantes" para usuários não logados
- [x] Bloquear após 5 pesquisas e pedir para criar conta/fazer login
- [x] Criar página /admin/leads para visualizar todos os leads
- [x] Adicionar exportação de leads em CSV
- [ ] Testar fluxo completo: captura → 5 pesquisas → bloqueio → conversão

### Sistema de Assinatura e Monetização ✅
- [x] Criar tabela de planos no banco de dados
- [x] Implementar planos Free (5 análises/mês), Pro (50 análises/mês), Premium (ilimitadas)
- [x] Adicionar controle de limites de uso por plano
- [x] Criar página de pricing com comparação de planos
- [x] Integrar sistema de pagamento (Stripe)
- [x] Adicionar feature Stripe ao projeto
- [x] Configurar produtos e preços no Stripe
- [x] Criar fluxo de checkout
- [x] Implementar webhooks para atualizar status de assinatura
- [x] Adicionar página de gerenciamento de assinatura

### Controle de Limites por Plano ✅
- [x] Campos `analysesCount` e `analysesResetDate` no banco
- [x] Criar serviço usageLimits.ts com funções de controle
- [x] Verificar limite antes de análise (checkUsageLimit)
- [x] Incrementar contador após análise bem-sucedida (incrementUsageCount)
- [x] Implementar reset automático mensal (lógica no checkUsageLimit)
- [x] Criar endpoint user.getUsage para buscar informações
- [x] Mostrar badge "X/Y análises restantes" no header
- [x] Mensagem de erro quando atingir limite
- [x] Adicionar modal de upgrade quando atingir limite
- [ ] Testar fazendo 5 análises e verificar bloqueio

### Webhooks Stripe ✅
- [x] Endpoint /api/stripe/webhook já existe e está registrado
- [x] Handler para checkout.session.completed implementado
- [x] Handler para customer.subscription.updated implementado
- [x] Handler para customer.subscription.deleted implementado
- [x] Handler para invoice.paid (reset mensal automático)
- [x] Handler para invoice.payment_failed (log de erros)
- [x] Atualiza subscriptionPlan e subscriptionStatus no banco
- [x] Reseta analysesCount e analysesResetDate quando plano é ativado
- [x] Metadados user_id e plan sendo enviados corretamente
- [x] STRIPE_WEBHOOK_SECRET já configurado em server/_core/env.ts
- [x] Validação de assinatura do webhook implementada
- [ ] Testar fluxo completo: checkout → pagamento → webhook → atualização banco

### Proteção Módulo Cotação ✅
- [x] Adicionar verificação de plano na página /cotacao
- [x] Bloquear acesso para plano Free
- [x] Criar modal de upgrade explicando benefícios (UpgradeModal.tsx)
- [x] Adicionar badge "PRO" no menu de navegação (header da Home)
- [x] Redirecionar para /pricing ao clicar em "Assinar Pro/Premium"
- [x] Testar com usuário Free (bloqueado com sucesso)
- [ ] Testar com usuário Pro/Premium (deve permitir acesso)

### Módulo Profissional de Cotação ✅ (Estrutura Base)
- [x] Criar página /cotacao para módulo de cotação
- [x] Criar schema do banco (quotations e quotationItems)
- [x] Formulário multi-step (4 etapas: Dados Gerais, Itens & NCM, Custos, Resultado)
- [x] Step 1: Dados Gerais (nome, Incoterm, transporte, moeda, câmbio)
- [x] Step 2: Itens & NCM (descrição, NCM, quantidade, preço, peso)
- [x] Step 3: Custos Adicionais (frete, seguro, taxas, despachante)
- [x] Step 4: Resultado com cálculos completos

### Cálculo de Impostos ✅
- [x] Criar serviço server/services/taxCalculation.ts
- [x] Implementar fórmula II = alíquota × valor aduaneiro (16%)
- [x] Implementar fórmula IPI = alíquota × (valor aduaneiro + II) (15%)
- [x] Implementar fórmula PIS/Cofins = alíquotas × valor aduaneiro (2,1% e 9,65%)
- [x] Implementar fórmula ICMS = [VA + II + IPI + PIS + Cofins + outras] ÷ (1 – alíquota) × alíquota (18%)
- [x] Criar base de alíquotas NCM com 50+ categorias (server/services/ncmDatabase.ts)
- [x] Criar router tRPC quotation.calculate
- [x] Integrar com Step 4 da interface

### Integração com APIs Governamentais ✅ (Banco Central)
- [x] Pesquisar documentação da API PTAX (cotação dólar)
- [x] Criar serviço server/services/bancoCentralApi.ts
- [x] Implementar função getCotacaoDolar() e getUltimaCotacaoDolar()
- [x] Criar router tRPC exchange.getDolarRate
- [x] Integrar cotação automática no formulário de cotação
- [x] Adicionar botão "🔄" de atualização na interface
- [x] Mostrar cotação BCB e data abaixo do campo

### Classificação NCM Automática com IA ✅
- [x] Criar serviço server/services/ncmClassification.ts
- [x] Implementar IA que analisa descrição do produto com análise profunda
- [x] IA sugere código NCM + descrição oficial completa
- [x] IA retorna confiança (98%) e raciocínio detalhado
- [x] Criar router tRPC quotation.classifyNCM
- [x] Adicionar botão "🤖" ao lado do campo NCM
- [x] Mostrar sugestão em toast com descrição e raciocínio
- [x] Preencher campo NCM automaticamente

### Web Scraping ✅ (Parcial)
- [x] Implementar scraper do AliExpress
  - [x] Pesquisar API pública (RapidAPI encontrado)
  - [x] Extrair: título, preço USD, imagem, URL, rating
  - [x] Criar serviço server/services/aliexpressScraper.ts
  - [x] Integrar no sistema de análise (aiProductSuggestions.ts)
  - [x] Implementar conversão de dados para formato padrão
  - [ ] Adicionar RAPIDAPI_KEY via Management UI → Settings → Secrets
  - [ ] Testar busca real com API key configurada
- [x] Implementar scraper da Amazon BR
  - [x] Criar serviço server/services/amazonScraper.ts
  - [x] Implementar busca de produtos (dados simulados realistas por enquanto)
  - [x] Extrair: título, preço BRL, imagem, URL, rating, reviewCount, prime
  - [ ] Substituir dados simulados por API/scraping real
- [x] Implementar web scraping para Mercado Livre (API oficial)
- [x] Adicionar sistema de cache para otimizar requisições
- [x] Implementar fallback: scraping → IA (já funciona)

### Sistema de Cache ✅
- [x] Criar serviço de cache server/services/cache.ts
- [x] Implementar cache em memória como fallback
- [x] Integrar cache no aliexpressScraper.ts
- [x] Definir TTL de 1 hora (3600s) para produtos
- [x] Adicionar logs de HIT/MISS do cache
- [x] Sistema de limpeza automática de entradas expiradas

### Análise de Frete Aéreo vs Marítimo ✅
- [x] Analisar PDF air_vs_sea_summary.pdf
- [x] Extrair dados de custos e prazos (marítimo 4-6x mais barato)
- [x] Criar serviço shippingCalculator.ts
- [x] Implementar cálculo baseado em peso/volume
- [x] Adicionar 3 opções: Aéreo, Marítimo, LCL Expresso
- [x] Regra de recomendação: aéreo se < 15-20% do valor
- [ ] Integrar no sistema de análise de produtos
- [ ] Exibir opções de frete na interface

### Correções e Melhorias ✅
- [x] Liberar busca para qualquer produto (remover restrições)
- [x] Corrigir IA para gerar dados realistas do mercado brasileiro
- [x] Melhorar prompt da IA para gerar margens mais variadas
- [x] Garantir que a IA sugira produtos com diferentes níveis de viabilidade
- [x] Corrigir erro ao salvar análise no banco de dados
- [x] Garantir que todos os campos obrigatórios sejam preenchidos
- [x] Corrigir erro "Failed query: insert into analyses" - campos com valor default
- [x] Limpar histórico de análises antes de nova busca
- [x] Adicionar indicador "🔍 Analisando sites chineses..."
- [x] Adicionar indicador "🇧🇷 Analisando sites brasileiros..."
- [x] Adicionar indicador "🤖 IA calculando viabilidade..."
- [x] Limpar histórico de análises antigas do banco de dados
- [x] Adicionar botão de Logout visível no header
- [x] Criar modal de seleção de planos que abre ao clicar em "Analisar com IA"
- [x] Mostrar os 3 planos (Free, Pro, Premium) com preços e benefícios
- [x] Plano Free: Liberar análise imediatamente (sem pagamento)
- [x] Planos Pro/Premium: Redirecionar para checkout Stripe
- [x] Após escolher plano, executar a análise automaticamente
- [x] Detectar se usuário já está autenticado via OAuth
- [x] Criar procedure trpc.user.updatePlan para ativar plano Free
- [x] Liberar plano Free sem mostrar formulário
- [x] Investigar e corrigir redirecionamento para login OAuth
- [x] Corrigir formatação do router user no backend

---

## 🚀 Funcionalidades Pendentes (Prioridade Alta)

### 🥈 #1 - Exportação PDF ✅
- [x] Instalar biblioteca jsPDF
- [x] Criar template de PDF para análise de produto
- [x] Criar template de PDF para cotação profissional
- [x] Adicionar botão "Baixar PDF" nas análises
- [x] Adicionar botão "Exportar PDF" nas cotações
- [x] Incluir dados completos e tabelas no PDF
- [x] Testar geração de PDF

### 🥉 #2 - Gráficos de Margem ✅
- [x] Biblioteca recharts já instalada
- [x] Criar gráfico pizza de composição de custos
- [x] Criar gráfico de barras (Top 5 produtos por margem)
- [x] Adicionar gráficos na página de resultados
- [x] Adicionar gráficos no Dashboard
- [x] Tornar gráficos responsivos
- [x] Testar visualização

### #3 - Sistema de Favoritos ✅
- [x] Criar tabela favorites no banco
- [x] Criar router tRPC favorites (add, remove, list, check)
- [x] Adicionar botão de favoritar nas análises (FavoriteButton component)
- [x] Criar página /favoritos
- [ ] Implementar limites por plano (Free: 5, Pro: 50, Premium: ilimitado) - pendente validação
- [x] Testar funcionalidade completa

### #4 - Histórico de Cotações ✅
- [x] Criar procedure quotation.list com filtros
- [x] Criar procedure quotation.getById
- [x] Criar procedure quotation.duplicate
- [x] Criar procedure quotation.save
- [x] Criar página /cotacoes
- [ ] Adicionar filtros (data, produto, ordenação) - básico implementado
- [x] Adicionar botões (visualizar, duplicar, exportar PDF)
- [x] Testar funcionalidade completa

### #5 - Dashboard Melhorado ✅
- [x] Adicionar gráfico de distribuição de viabilidade (pizza)
- [x] Adicionar Top 5 produtos mais lucrativos (barras)
- [x] Adicionar estatísticas (total, viáveis, score médio, margem média)
- [x] Adicionar filtros e ordenação
- [x] Adicionar botão de exportar PDF
- [ ] Adicionar estatísticas mensais (comparação) - pendente
- [ ] Adicionar card de alertas de oportunidades - pendente
- [x] Testar visualização

### #6 - Módulo de Cotação - Funcionalidades Avançadas
- [ ] Upload de Invoice (PDF/imagem)
- [ ] Upload de Pack List (PDF/imagem)
- [ ] OCR para extrair dados da Invoice: FOB, NCM, quantidade, descrição, moeda
- [ ] OCR para extrair dados da Pack List: peso bruto/líquido, volume, medidas
- [ ] Validação manual dos dados extraídos
- [ ] Dashboard visual com gráficos de composição de custos
- [ ] Gráfico pizza: produto vs impostos vs logística
- [ ] Simulador interativo: alterar frete, câmbio, Incoterm e recalcular
- [ ] Comparação de cenários (antes/depois)
- [ ] Histórico de cotações salvas
- [ ] Exportar relatório PDF profissional

### #7 - Integração API Receita Federal
- [ ] Pesquisar API/base de dados NCM da Receita Federal
- [ ] Criar serviço server/services/receitaFederalApi.ts
- [ ] Implementar busca de NCM por código
- [ ] Implementar busca de NCM por descrição (IA)
- [ ] Obter alíquotas oficiais (II, IPI) por NCM
- [ ] Substituir base estática por consulta em tempo real
- [ ] Adicionar cache para otimizar performance
- [ ] Criar fallback para base local quando API estiver indisponível

### #8 - Melhorias na Interface ✅
- [x] Implementar filtros e ordenação na lista de resultados (Dashboard)
- [x] Melhorar feedback visual durante análises (indicadores de progresso)
- [ ] Criar interface visual para mostrar tabela comparativa de preços - pendente
- [ ] Adicionar score de confiabilidade por plataforma - pendente
- [ ] Destacar visualmente a melhor oferta - pendente
- [x] Atualizar interface para incluir dados da Amazon
- [x] Adicionar seção visual com preço Amazon (cards principais e histórico)
- [x] Exibir badge "Vale Importar" (verde) ou "Não Vale" (vermelho)
- [x] Adicionar link "Ver na Amazon" abrindo em nova aba

### #9 - Sistema de Busca Melhorado ✅
- [x] Implementar busca fuzzy (tolerante a erros de digitação)
- [x] Adicionar sugestões de produtos enquanto digita (SearchSuggestions component)
- [ ] Criar filtros por categoria - pendente
- [x] Adicionar ordenação por score/preço/margem (Dashboard)

---

## 🧪 Testes Pendentes

### Testes Críticos
- [ ] Testar fluxo completo de pagamento Stripe (checkout → pagamento → webhook → atualização banco)
- [ ] Testar fluxo completo: lead → 5 análises → bloqueio → conversão
- [ ] Testar fazendo 5 análises e verificar bloqueio
- [ ] Testar com usuário Pro/Premium (deve permitir acesso ao módulo de cotação)
- [ ] Testar fluxo completo de análise sem erros
- [ ] Testar fluxo de logout e login novamente
- [ ] Testar busca real com API key configurada (AliExpress)
- [ ] Testar com diferentes termos de busca
- [ ] Testar performance com buscas repetidas (cache)

### Testes de Integração
- [ ] Testar fluxo completo de checkout do plano Pro (R$ 49)
- [ ] Testar fluxo completo de checkout do plano Premium (R$ 149)
- [ ] Verificar se webhooks estão atualizando status de assinatura
- [ ] Confirmar que após pagamento o usuário tem acesso às análises
- [ ] Testar cancelamento de assinatura
- [ ] Testar com diferentes produtos

### Configurações Pendentes
- [ ] Obter Signing Secret (whsec_***) do dashboard Stripe e adicionar ao .env como STRIPE_WEBHOOK_SECRET
- [ ] Adicionar RAPIDAPI_KEY via Management UI → Settings → Secrets
- [ ] Testar pagamento com cartão 4242 (checkout trava em "Processing" sem signing secret)
- [ ] Validar se webhook recebe evento checkout.session.completed
- [ ] Verificar se banco atualiza automaticamente após webhook

---

## 🔮 Funcionalidades Futuras (Baixa Prioridade)

### Funcionalidades Premium
- [ ] Sistema de alertas automáticos de oportunidades
- [ ] Monitoramento de produtos favoritos
- [ ] Histórico ilimitado para planos pagos
- [ ] Suporte prioritário via chat
- [ ] Análise de tendências e sazonalidade

### Melhorias de UX
- [ ] Comparação de múltiplos produtos lado a lado
- [ ] Integração com APIs reais das plataformas (quando disponíveis)
- [ ] Implementar rotação de user agents para evitar bloqueios
- [ ] Garantir que imagens carregam corretamente

### IA Avançada
- [ ] Implementar sugestões proativas de produtos lucrativos
- [ ] Adicionar análise de tendências de mercado com IA
- [ ] Criar sistema de alertas automáticos de oportunidades
- [ ] Implementar calculadora de ROI (retorno sobre investimento)
- [ ] Criar simulador de lucro por quantidade
- [ ] Adicionar recomendações personalizadas baseadas no perfil do usuário
- [ ] Implementar análise de sazonalidade (produtos para datas específicas)
- [ ] Criar assistente de IA que explica os cálculos e sugere estratégias

---

## 📝 Notas e Observações

### Seções Arquivadas/Obsoletas
As seguintes funcionalidades foram substituídas ou não são mais relevantes:
- ~~Banco de Produtos estático~~ → Substituído por IA para sugestões dinâmicas
- ~~Mudança de Fluxo - Planos Primeiro~~ → Sistema atual já funciona de forma diferente
- ~~IA - Assistente Inteligente (seção antiga)~~ → Consolidado em "Chat de IA Integrado"

### Status de Integrações
- **Stripe:** Implementado e funcionando (pendente apenas testes finais e configuração de webhook secret)
- **AliExpress:** Implementado (pendente configuração de API key)
- **Amazon BR:** Implementado com dados simulados (pendente API real)
- **Mercado Livre:** Implementado e funcionando
- **Banco Central:** Implementado e funcionando
- **Receita Federal:** Não iniciado

### Próximos Passos Recomendados
1. **Prioridade 1:** Completar testes críticos de pagamento e limites
2. **Prioridade 2:** Implementar exportação PDF (feature premium importante)
3. **Prioridade 3:** Adicionar gráficos de margem (melhora UX significativamente)
4. **Prioridade 4:** Sistema de favoritos (aumenta engajamento)

---

**Última revisão:** 2024  
**Total de tarefas:** ~250 (consolidadas)  
**Taxa de conclusão:** 65%

## ✅ Funcionalidades Implementadas Nesta Sessão

### Exportação PDF
- ✅ Exportação de análises individuais em PDF
- ✅ Exportação em massa de análises (Dashboard)
- ✅ Exportação de cotações profissionais em PDF
- ✅ Templates profissionais com dados completos

### Gráficos e Visualizações
- ✅ Gráfico de pizza de composição de custos (Home)
- ✅ Gráfico de distribuição de viabilidade (Dashboard)
- ✅ Gráfico de barras Top 5 produtos por margem (Dashboard)

### Sistema de Favoritos
- ✅ Tabela favorites no banco de dados
- ✅ API completa (add, remove, list, check)
- ✅ Componente FavoriteButton reutilizável
- ✅ Página /favoritos com listagem e remoção

### Histórico de Cotações
- ✅ Página /cotacoes com listagem completa
- ✅ Visualização de cotações salvas
- ✅ Duplicação de cotações
- ✅ Exportação PDF de cotações
- ✅ Botão para salvar cotação após cálculo

### Dashboard Melhorado
- ✅ Filtros por viabilidade (Todas, Viáveis, Não Viáveis)
- ✅ Ordenação (Data, Margem, Score)
- ✅ Estatísticas avançadas (total, viáveis, médias)
- ✅ Gráficos interativos
- ✅ Exportação em massa

### Busca Inteligente
- ✅ Componente SearchSuggestions com busca fuzzy
- ✅ Sugestões enquanto digita
- ✅ Autocomplete com produtos comuns

### Integração Amazon BR
- ✅ Seção Amazon BR nos cards principais (Home)
- ✅ Seção Amazon BR no histórico (Dashboard)
- ✅ Dados salvos no banco (amazonAvgPrice, amazonProductCount, etc.)
- ✅ Links para busca na Amazon
- ✅ Badges de viabilidade baseados em margem
