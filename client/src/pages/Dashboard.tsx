import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Home, TrendingUp, DollarSign, Package, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const historyQuery = trpc.import.history.useQuery({ limit: 50 });

  if (authLoading || historyQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const analyses = historyQuery.data || [];
  const viableCount = analyses.filter(a => a.isViable).length;
  const totalAnalyses = analyses.length;
  const avgScore = totalAnalyses > 0
    ? analyses.reduce((sum, a) => sum + a.opportunityScore, 0) / totalAnalyses
    : 0;
  const avgMargin = totalAnalyses > 0
    ? analyses.reduce((sum, a) => sum + a.profitMargin, 0) / totalAnalyses
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

        {/* Histórico Completo */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Análises</CardTitle>
            <CardDescription>Todas as suas análises de produtos</CardDescription>
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
