import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star, ArrowLeft, Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Favoritos() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { data: favorites, isLoading, refetch } = trpc.favorites.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const removeMutation = trpc.favorites.remove.useMutation({
    onSuccess: () => {
      toast.success("Removido dos favoritos");
      refetch();
    },
    onError: () => {
      toast.error("Erro ao remover favorito");
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você precisa estar logado para ver seus favoritos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Meus Favoritos
            </h1>
            <p className="text-gray-600">Produtos que você salvou para análise posterior</p>
          </div>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        {/* Lista de Favoritos */}
        {!favorites || favorites.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Heart className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum favorito ainda</h3>
              <p className="text-gray-500 text-center mb-6">
                Comece a salvar análises de produtos que interessam você
              </p>
              <Link href="/">
                <Button>
                  <Star className="h-4 w-4 mr-2" />
                  Explorar Produtos
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="hover:shadow-lg transition-shadow">
                {favorite.analysis.productImage && (
                  <div className="relative">
                    <img
                      src={favorite.analysis.productImage}
                      alt={favorite.analysis.productTitle}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                      onClick={() => removeMutation.mutate({ analysisId: favorite.analysisId })}
                    >
                      <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                    </Button>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="line-clamp-2">{favorite.analysis.productTitle}</CardTitle>
                  <CardDescription>{favorite.analysis.productPlatform}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Margem de Lucro</div>
                      <div className="text-lg font-semibold text-green-600">
                        {favorite.analysis.profitMargin.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Score</div>
                      <div className="text-lg font-semibold text-purple-600">
                        {favorite.analysis.opportunityScore.toFixed(0)}/100
                      </div>
                    </div>
                  </div>
                  <Badge variant={favorite.analysis.isViable ? "default" : "destructive"} className="w-full justify-center">
                    {favorite.analysis.isViable ? "✅ Viável" : "❌ Não Viável"}
                  </Badge>
                  <div className="mt-4 text-xs text-gray-500">
                    Salvo em {new Date(favorite.createdAt).toLocaleDateString("pt-BR")}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
