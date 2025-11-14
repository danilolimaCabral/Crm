import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, TrendingUp, DollarSign, BarChart3, Sparkles, ArrowRight, CheckCircle2, LogOut, Calculator } from "lucide-react";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import AIChat from "@/components/AIChat";
import PlanSelectionModal from "@/components/PlanSelectionModal";
import LeadCaptureModal from "@/components/LeadCaptureModal";
import ImportCalculator from "@/components/ImportCalculator";

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  // Buscar informações de uso
  const { data: usageInfo } = trpc.user.getUsage.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 10000, // Atualizar a cada 10s
  });
  
  // Redirecionar para onboarding se usuário não tiver plano escolhido
  useEffect(() => {
    if (isAuthenticated && user) {
      const plan = user.subscriptionPlan;
      // Redirecionar se não tiver plano ou plano for "none"
      if (!plan || plan === "none") {
        setLocation("/onboarding");
      }
    }
  }, [isAuthenticated, user, setLocation]);
  const [searchTerm, setSearchTerm] = useState("");
  const [exchangeRate, setExchangeRate] = useState("5.25");
  const [showResults, setShowResults] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [searchesRemaining, setSearchesRemaining] = useState(5);
  const [loadingMessage, setLoadingMessage] = useState<string>("");

  // Verificar se é um lead (não logado) e carregar contador
  useEffect(() => {
    if (!isAuthenticated) {
      const storedLeadId = localStorage.getItem("leadId");
      if (storedLeadId) {
        setLeadId(storedLeadId);
      } else {
        // Mostrar modal de captura de lead
        setShowLeadModal(true);
      }
    }
  }, [isAuthenticated]);

  // Carregar contador de pesquisas para leads
  const searchCountQuery = trpc.leads.getSearchCount.useQuery(
    { leadId: leadId || "" },
    { enabled: !!leadId && !isAuthenticated }
  );

  useEffect(() => {
    if (searchCountQuery.data) {
      setSearchesRemaining(searchCountQuery.data.searchesRemaining);
    }
  }, [searchCountQuery.data]);

  const analyzeMutation = trpc.import.analyze.useMutation({
    onSuccess: () => {
      setShowResults(true);
      setLoadingMessage("");
      toast.success("Análise concluída com sucesso!");
      // Limpar histórico anterior
      historyQuery.refetch();
    },
    onError: (error) => {
      setLoadingMessage("");
      toast.error(error.message);
    },
  });

  // Simular progresso da análise
  useEffect(() => {
    if (analyzeMutation.isPending) {
      setLoadingMessage("🔍 Analisando sites chineses...");
      
      const timer1 = setTimeout(() => {
        setLoadingMessage("🇧🇷 Analisando sites brasileiros...");
      }, 2000);
      
      const timer2 = setTimeout(() => {
        setLoadingMessage("🤖 IA calculando viabilidade...");
      }, 4000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [analyzeMutation.isPending]);

  const historyQuery = trpc.import.history.useQuery(
    { limit: 6 },
    { enabled: isAuthenticated }
  );

  const incrementSearchMutation = trpc.leads.incrementSearchCount.useMutation();
  
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  const handleAnalyzeClick = () => {
    if (!searchTerm.trim()) {
      toast.error("Digite o nome de um produto");
      return;
    }

    const rate = parseFloat(exchangeRate);
    if (isNaN(rate) || rate <= 0) {
      toast.error("Digite uma cotação válida do dólar");
      return;
    }

    // Se for lead (não logado)
    if (!isAuthenticated && leadId) {
      // Verificar limite de pesquisas
      if (searchesRemaining <= 0) {
        toast.error("Você atingiu o limite de 5 análises gratuitas! Faça login para continuar.");
        setTimeout(() => {
          window.location.href = getLoginUrl();
        }, 2000);
        return;
      }

      // Incrementar contador e executar análise
      incrementSearchMutation.mutate(
        { leadId },
        {
          onSuccess: () => {
            setSearchesRemaining(prev => prev - 1);
            analyzeMutation.mutate({
              searchTerm: searchTerm.trim(),
              exchangeRate: rate,
            });
          },
        }
      );
      return;
    }

    // Se for usuário logado
    if (isAuthenticated) {
      // Verificar se já tem plano ativo
      if (user?.subscriptionPlan && user.subscriptionPlan !== 'none') {
        // Já tem plano, executar análise direto
        analyzeMutation.mutate({
          searchTerm: searchTerm.trim(),
          exchangeRate: rate,
        });
      } else {
        // Não tem plano, mostrar modal
        setShowPlanModal(true);
      }
    }
  };

  const handlePlanSelected = (plan: 'free' | 'pro' | 'premium') => {
    // Executar análise após selecionar plano
    const rate = parseFloat(exchangeRate);
    analyzeMutation.mutate({
      searchTerm: searchTerm.trim(),
      exchangeRate: rate,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Logo e Título */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                Powered by AI
              </div>
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Importador Inteligente
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Sua IA aliada para encontrar produtos lucrativos na China e ganhar dinheiro importando para o Brasil
              </p>
              {leadId && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  🎁 {searchesRemaining}/5 análises gratuitas restantes
                </div>
              )}
            </div>

            {/* CTA Principal */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={() => window.location.href = getLoginUrl()}
                >
                  Começar Agora - É Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Link href="/pricing">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6"
                  >
                    Ver Planos e Preços
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-gray-500">
                Sem cartão de crédito • 5 análises grátis • Cancele quando quiser
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mt-16">
              <Card className="border-2 hover:border-blue-300 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Search className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Busca Inteligente</CardTitle>
                  <CardDescription>
                    Pesquisa simultânea em AliExpress, Alibaba, Temu e Taobao
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-purple-300 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Cálculo Automático</CardTitle>
                  <CardDescription>
                    Impostos, IOF, frete e margem de lucro calculados automaticamente
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-green-300 transition-colors">
                <CardHeader>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Score de Oportunidade</CardTitle>
                  <CardDescription>
                    IA analisa viabilidade e sugere os melhores produtos para importar
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Benefícios */}
            <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-2xl font-bold mb-6">Por que usar o Importador Inteligente?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {[
                  "Economize 90% do tempo de pesquisa",
                  "Elimine erros de cálculo de impostos",
                  "Identifique nichos lucrativos rapidamente",
                  "Compare preços China vs Brasil automaticamente",
                  "Análise de concorrência em tempo real",
                  "Histórico completo de todas as análises",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Usuário autenticado
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Importador Inteligente
            </h1>
            <p className="text-gray-600">Olá, {user?.name || "Importador"}! Pronto para encontrar oportunidades?</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
            {usageInfo && (
              <Badge variant="secondary" className="text-sm">
                {usageInfo.remaining}/{usageInfo.limit} análises restantes
              </Badge>
            )}
            <Link href="/cotacao">
              <Button variant="outline" className="relative">
                <Calculator className="h-4 w-4 mr-2" />
                Cotação Profissional
                <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-1.5 py-0.5">
                  PRO
                </Badge>
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Dashboard
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => {
                logoutMutation.mutate();
                toast.success("Logout realizado com sucesso!");
              }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mb-8 border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Analisar Produto
            </CardTitle>
            <CardDescription>
              Digite o nome do produto e veja se vale a pena importar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">Produto</label>
                <Input
                  placeholder="Ex: fone bluetooth, smartwatch, câmera..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyzeClick()}
                  className="h-12"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Cotação do Dólar (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="5.25"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>
            <Button
              onClick={handleAnalyzeClick}
              disabled={analyzeMutation.isPending}
              size="lg"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {analyzeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {loadingMessage || "Analisando..."}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Analisar com IA
                </>
              )}
            </Button>
            <p className="text-xs text-gray-500 text-center">
              Produtos disponíveis: fone bluetooth, smartwatch, câmera, mouse gamer, teclado mecânico, caixa de som
            </p>
          </CardContent>
        </Card>

        {/* Results */}
        {analyzeMutation.data && showResults && (
          <Card className="mb-8 border-2 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Resultado da Análise</CardTitle>
                <Badge
                  variant={analyzeMutation.data.viavel ? "default" : "destructive"}
                  className="text-sm px-3 py-1"
                >
                  {analyzeMutation.data.viavel ? "✅ VIÁVEL" : "❌ NÃO VIÁVEL"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Produto */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">📦 Produto na China</h3>
                    {analyzeMutation.data.productChina.imagem && (
                      <img
                        src={analyzeMutation.data.productChina.imagem}
                        alt={analyzeMutation.data.productChina.titulo}
                        className="w-full h-48 object-cover rounded-lg mb-3"
                      />
                    )}
                    <p className="text-sm text-gray-700">{analyzeMutation.data.productChina.titulo}</p>
                    <p className="text-xs text-gray-500">Plataforma: {analyzeMutation.data.productChina.plataforma}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-lg font-bold text-green-600">
                        ${analyzeMutation.data.productChina.preco_usd.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-600">
                        ⭐ {analyzeMutation.data.productChina.avaliacao.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Análise */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">💰 Análise Financeira</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Custo Total Importado:</span>
                        <span className="font-semibold">R$ {analyzeMutation.data.custos.custo_total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Preço Médio no Brasil:</span>
                        <span className="font-semibold">R$ {analyzeMutation.data.analise_mercado.preco_medio_ponderado.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">Lucro por Unidade:</span>
                        <span className="font-bold text-green-600">R$ {((analyzeMutation.data.analise_mercado.preco_medio_ponderado - analyzeMutation.data.custos.custo_total)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Margem de Lucro:</span>
                        <span className="font-bold text-blue-600">{analyzeMutation.data.margem_lucro_percentual.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">📊 Concorrência</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total de Vendedores:</span>
                        <span className="font-semibold">{analyzeMutation.data.analise_mercado.total_vendedores}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nível:</span>
                        <span className="font-semibold">{analyzeMutation.data.analise_mercado.nivel_concorrencia}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">Score de Oportunidade</span>
                      <span className="text-2xl font-bold text-purple-600">
                        {analyzeMutation.data.score_oportunidade.toFixed(0)}/100
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{analyzeMutation.data.recomendacao}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calculadora de Importação */}
        {analyzeMutation.data && (
          <ImportCalculator
            productPriceUsd={analyzeMutation.data.productChina.preco_usd}
            exchangeRate={parseFloat(exchangeRate)}
            productTitle={analyzeMutation.data.productChina.titulo}
          />
        )}

        {/* Histórico */}
        {historyQuery.data && historyQuery.data.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Análises Recentes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {historyQuery.data.map((analysis) => (
                <Card key={analysis.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    {analysis.productImage && (
                      <img
                        src={analysis.productImage}
                        alt={analysis.productTitle}
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                    )}
                    <CardTitle className="text-base line-clamp-2">{analysis.productTitle}</CardTitle>
                    <CardDescription className="text-xs">{analysis.productPlatform}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Margem:</span>
                      <span className="font-semibold text-green-600">{analysis.profitMargin.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Score:</span>
                      <span className="font-semibold text-purple-600">{analysis.opportunityScore.toFixed(0)}/100</span>
                    </div>
                    
                    {/* Seção Amazon BR */}
                    {(analysis as any).amazonAvgPrice && (analysis as any).amazonProductCount && (
                      <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-orange-800 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726-1.53.406-3.045.61-4.516.61-2.265 0-4.463-.407-6.59-1.22-2.13-.814-3.89-1.92-5.28-3.31-.14-.14-.127-.25.046-.39zm2.7-3.36c.13-.14.28-.14.45 0 .11.09 2.09 1.73 5.93 4.92.18.15.33.27.45.36.12.09.18.15.18.18 0 .03-.06.09-.18.18-.12.09-.27.21-.45.36-3.84 3.19-5.82 4.83-5.93 4.92-.17.14-.32.14-.45 0-.13-.14-.13-.28 0-.42l5.4-4.5-5.4-4.5c-.13-.14-.13-.28 0-.42z"/>
                            </svg>
                            Amazon BR
                          </span>
                          <a 
                            href={(analysis as any).amazonSearchUrl || `https://www.amazon.com.br/s?k=${encodeURIComponent(analysis.searchTerm)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-orange-600 hover:text-orange-800 underline"
                          >
                            Ver →
                          </a>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Preço Médio:</span>
                            <span className="font-semibold text-gray-900">
                              R$ {((analysis as any).amazonAvgPrice / 100).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Diferença:</span>
                            <span className={`font-semibold ${
                              analysis.profitMargin > 30 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {analysis.profitMargin > 0 ? '+' : ''}{analysis.profitMargin.toFixed(1)}%
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {(analysis as any).amazonProductCount} produtos encontrados
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <Badge variant={analysis.isViable ? "default" : "destructive"} className="w-full justify-center">
                      {analysis.isViable ? "✅ Viável" : "❌ Não Viável"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat de IA */}
      <AIChat
        context={{
          lastAnalysis: analyzeMutation.data
            ? {
                produto: analyzeMutation.data.searchTerm,
                margemLucro: analyzeMutation.data.margem_lucro_percentual,
                scoreOportunidade: analyzeMutation.data.score_oportunidade,
                viavel: analyzeMutation.data.viavel,
              }
            : undefined,
        }}
      />

      {/* Modal de Seleção de Plano */}
      <PlanSelectionModal
        open={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        onPlanSelected={handlePlanSelected}
      />

      {/* Modal de Captura de Lead */}
      <LeadCaptureModal
        open={showLeadModal}
        onSuccess={(id) => {
          setLeadId(id);
          localStorage.setItem("leadId", id);
          setShowLeadModal(false);
          setSearchesRemaining(5);
        }}
      />
    </div>
  );
}
