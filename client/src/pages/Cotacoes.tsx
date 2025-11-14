import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, ArrowLeft, Copy, Eye, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function Cotacoes() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { data: quotations, isLoading, refetch } = trpc.quotation.list.useQuery(
    { limit: 100 },
    { enabled: isAuthenticated }
  );

  const duplicateMutation = trpc.quotation.duplicate.useMutation({
    onSuccess: () => {
      toast.success("Cotação duplicada com sucesso!");
      refetch();
    },
    onError: () => {
      toast.error("Erro ao duplicar cotação");
    },
  });

  const [selectedId, setSelectedId] = useState<number | null>(null);

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
              Você precisa estar logado para ver suas cotações.
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

  const handleDuplicate = (id: number) => {
    duplicateMutation.mutate({ id });
  };

  const handleView = (id: number) => {
    setSelectedId(id);
    // Redirecionar para página de cotação com ID
    window.location.href = `/cotacao?id=${id}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Histórico de Cotações
            </h1>
            <p className="text-gray-600">Todas as suas cotações de importação salvas</p>
          </div>
          <div className="flex gap-2">
            <Link href="/cotacao">
              <Button>
                <FileText className="h-4 w-4 mr-2" />
                Nova Cotação
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>

        {/* Lista de Cotações */}
        {!quotations || quotations.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma cotação ainda</h3>
              <p className="text-gray-500 text-center mb-6">
                Crie sua primeira cotação profissional de importação
              </p>
              <Link href="/cotacao">
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  Criar Cotação
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quotations.map((quotation) => (
              <Card key={quotation.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-2 mb-2">{quotation.quotationName}</CardTitle>
                      <CardDescription>
                        {quotation.incoterm} • {quotation.transportType}
                      </CardDescription>
                    </div>
                    <Badge variant={quotation.status === "completed" ? "default" : "outline"}>
                      {quotation.status === "completed" ? "Concluída" : quotation.status === "draft" ? "Rascunho" : "Arquivada"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <div className="text-sm text-gray-600">Custo Total</div>
                    <div className="text-2xl font-bold text-blue-600">
                      R$ {quotation.totalLandedCost.toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mb-4">
                    Criada em {new Date(quotation.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleView(quotation.id)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(quotation.id)}
                      disabled={duplicateMutation.isPending}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
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
