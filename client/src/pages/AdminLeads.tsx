import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Download, Users, TrendingUp, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";

export default function AdminLeads() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { data: leads, isLoading } = trpc.leads.getAll.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const exportToCSV = () => {
    if (!leads || leads.length === 0) return;

    const headers = ["Nome", "Email", "WhatsApp", "Pesquisas Feitas", "Data de Cadastro"];
    const rows = leads.map((lead) => [
      lead.name,
      lead.email,
      lead.phone || "-",
      lead.searchCount.toString(),
      new Date(lead.createdAt).toLocaleString("pt-BR"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell: string) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Negado</CardTitle>
            <CardDescription>
              Você precisa ser administrador para acessar esta página.
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

  const totalLeads = leads?.length || 0;
  const totalSearches = leads?.reduce((sum: number, lead: { searchCount: number }) => sum + lead.searchCount, 0) || 0;
  const avgSearchesPerLead = totalLeads > 0 ? (totalSearches / totalLeads).toFixed(1) : "0";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Gerenciamento de Leads
            </h1>
            <p className="text-gray-600">Visualize e exporte todos os leads capturados</p>
          </div>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLeads}</div>
              <p className="text-xs text-muted-foreground">Leads capturados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pesquisas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSearches}</div>
              <p className="text-xs text-muted-foreground">Análises realizadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Média por Lead</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgSearchesPerLead}</div>
              <p className="text-xs text-muted-foreground">Análises por lead</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Leads */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Todos os Leads</CardTitle>
                <CardDescription>Lista completa de leads capturados pelo sistema</CardDescription>
              </div>
              <Button onClick={exportToCSV} disabled={!leads || leads.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {!leads || leads.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum lead capturado ainda
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>WhatsApp</TableHead>
                      <TableHead className="text-center">Pesquisas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data de Cadastro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead: { id: number; name: string; email: string; phone: string | null; searchCount: number; createdAt: Date }) => (
                      <TableRow key={lead.id}>
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.phone || "-"}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={lead.searchCount >= 5 ? "destructive" : "default"}>
                            {lead.searchCount}/5
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {lead.searchCount >= 5 ? (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              Limite Atingido
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              Ativo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(lead.createdAt).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
