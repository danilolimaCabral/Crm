import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Home, TrendingUp, DollarSign, Package, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import FavoriteButton from "@/components/FavoriteButton";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { exportAnalysisToPDF } from "@/lib/pdfExport";
import { Download, Filter, ArrowUpDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const historyQuery = trpc.import.history.useQuery({ limit: 50 });
  const [sortBy, setSortBy] = useState<"date" | "margin" | "score">("date");
  const [filterViable, setFilterViable] = useState<"all" | "viable" | "not-viable">("all");

  if (authLoading || historyQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const allAnalyses = historyQuery.data || [];
  
  // Filtros
  const filteredAnalyses = useMemo(() => {
    let filtered = [...allAnalyses];
    
    if (filterViable === "viable") {
      filtered = filtered.filter(a => a.isViable);
    } else if (filterViable === "not-viable") {
      filtered = filtered.filter(a => !a.isViable);
    }
    
    // Ordenação
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "margin") {
        return b.profitMargin - a.profitMargin;
      } else if (sortBy === "score") {
        return b.opportunityScore - a.opportunityScore;
      }
      return 0;
    });
    
    return filtered;
  }, [allAnalyses, sortBy, filterViable]);
  
  const analyses = filteredAnalyses;
  const viableCount = allAnalyses.filter(a => a.isViable).length;
  const totalAnalyses = allAnalyses.length;
  const avgScore = totalAnalyses > 0
    ? allAnalyses.reduce((sum, a) => sum + a.opportunityScore, 0) / totalAnalyses
    : 0;
  const avgMargin = totalAnalyses > 0
    ? allAnalyses.reduce((sum, a) => sum + a.profitMargin, 0) / totalAnalyses
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">Acompanhe suas análises e oportunidades</p>
          </div>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total de Análises</CardDescription>
              <CardTitle className="text-3xl">{totalAnalyses}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-600">
                <Package className="h-4 w-4 mr-1" />
                Produtos analisados
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Oportunidades Viáveis</CardDescription>
              <CardTitle className="text-3xl text-green-600">{viableCount}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                {totalAnalyses > 0 ? ((viableCount / totalAnalyses) * 100).toFixed(0) : 0}% do total
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Score Médio</CardDescription>
              <CardTitle className="text-3xl text-purple-600">{avgScore.toFixed(0)}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                De 100 pontos
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Margem Média</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{avgMargin.toFixed(1)}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-1" />
                Lucro potencial
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        {totalAnalyses > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Gráfico Pizza - Viabilidade */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Viabilidade</CardTitle>
                <CardDescription>Análises viáveis vs não viáveis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Viáveis", value: viableCount, color: "#10b981" },
                        { name: "Não Viáveis", value: totalAnalyses - viableCount, color: "#ef4444" },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: "Viáveis", value: viableCount, color: "#10b981" },
                        { name: "Não Viáveis", value: totalAnalyses - viableCount, color: "#ef4444" },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico Barras - Top 5 Margens */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Produtos por Margem</CardTitle>
                <CardDescription>Maiores margens de lucro identificadas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={analyses
                      .slice()
                      .sort((a, b) => b.profitMargin - a.profitMargin)
                      .slice(0, 5)
                      .map(a => ({
                        name: a.productTitle.length > 20 
                          ? a.productTitle.substring(0, 20) + "..." 
                          : a.productTitle,
                        margem: a.profitMargin,
                      }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                    <Bar dataKey="margem" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Histórico Completo */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle>Histórico de Análises</CardTitle>
                <CardDescription>Todas as suas análises de produtos</CardDescription>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Select value={filterViable} onValueChange={(value: any) => setFilterViable(value)}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filtrar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="viable">Apenas Viáveis</SelectItem>
                    <SelectItem value="not-viable">Não Viáveis</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Data (Recente)</SelectItem>
                    <SelectItem value="margin">Margem (Maior)</SelectItem>
                    <SelectItem value="score">Score (Maior)</SelectItem>
                  </SelectContent>
                </Select>
                {allAnalyses.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    analyses.forEach(analysis => {
                      exportAnalysisToPDF({
                        productTitle: analysis.productTitle,
                        productPlatform: analysis.productPlatform,
                        priceUsd: analysis.priceUsd,
                        productRating: analysis.productRating * 10,
                        productImage: analysis.productImage || undefined,
                        priceBrl: analysis.priceUsd * 5.25, // Aproximação
                        importTax: 0,
                        iof: 0,
                        shippingCost: 0,
                        totalCost: analysis.totalCost,
                        avgPriceBr: analysis.avgPriceBr,
                        minPriceBr: analysis.minPriceBr,
                        maxPriceBr: analysis.maxPriceBr,
                        totalSellers: analysis.totalSellers,
                        competitionLevel: analysis.competitionLevel,
                        profitMargin: analysis.profitMargin,
                        opportunityScore: analysis.opportunityScore,
                        isViable: analysis.isViable,
                        recommendation: analysis.recommendation,
                        searchTerm: analysis.searchTerm,
                        createdAt: analysis.createdAt,
                      });
                    });
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Todas (PDF)
                </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {analyses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma análise realizada ainda</p>
                <Link href="/">
                  <Button className="mt-4">Fazer primeira análise</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {analyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {analysis.productImage && (
                      <img
                        src={analysis.productImage}
                        alt={analysis.productTitle}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{analysis.productTitle}</h3>
                      <p className="text-sm text-gray-600">{analysis.productPlatform}</p>
                      {analysis.amazonAvgPrice && (
                        <div className="mt-1 text-xs text-orange-600 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726-1.53.406-3.045.61-4.516.61-2.265 0-4.463-.407-6.59-1.22-2.13-.814-3.89-1.92-5.28-3.31-.14-.14-.127-.25.046-.39zm2.7-3.36c.13-.14.28-.14.45 0 .11.09 2.09 1.73 5.93 4.92.18.15.33.27.45.36.12.09.18.15.18.18 0 .03-.06.09-.18.18-.12.09-.27.21-.45.36-3.84 3.19-5.82 4.83-5.93 4.92-.17.14-.32.14-.45 0-.13-.14-.13-.28 0-.42l5.4-4.5-5.4-4.5c-.13-.14-.13-.28 0-.42z"/>
                          </svg>
                          Amazon: R$ {(analysis.amazonAvgPrice / 100).toFixed(2)}
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(analysis.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Margem</div>
                        <div className="font-semibold text-green-600">{analysis.profitMargin.toFixed(1)}%</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Score</div>
                        <div className="font-semibold text-purple-600">{analysis.opportunityScore.toFixed(0)}/100</div>
                      </div>
                      <Badge variant={analysis.isViable ? "default" : "destructive"}>
                        {analysis.isViable ? "✅ Viável" : "❌ Não Viável"}
                      </Badge>
                      <FavoriteButton analysisId={analysis.id} />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          exportAnalysisToPDF({
                            productTitle: analysis.productTitle,
                            productPlatform: analysis.productPlatform,
                            priceUsd: analysis.priceUsd,
                            productRating: analysis.productRating * 10,
                            productImage: analysis.productImage || undefined,
                            priceBrl: analysis.priceUsd * 5.25,
                            importTax: 0,
                            iof: 0,
                            shippingCost: 0,
                            totalCost: analysis.totalCost,
                            avgPriceBr: analysis.avgPriceBr,
                            minPriceBr: analysis.minPriceBr,
                            maxPriceBr: analysis.maxPriceBr,
                            totalSellers: analysis.totalSellers,
                            competitionLevel: analysis.competitionLevel,
                            profitMargin: analysis.profitMargin,
                            opportunityScore: analysis.opportunityScore,
                            isViable: analysis.isViable,
                            recommendation: analysis.recommendation,
                            searchTerm: analysis.searchTerm,
                            createdAt: analysis.createdAt,
                          });
                        }}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
