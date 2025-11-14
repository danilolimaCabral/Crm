import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, TrendingUp, Zap } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    description: "Para começar a explorar",
    icon: Sparkles,
    features: [
      "5 análises por mês",
      "Acesso ao chat de IA",
      "Histórico de 30 dias",
      "Cálculo de impostos e custos",
      "Score de oportunidade",
    ],
    limitations: [
      "Sem alertas automáticos",
      "Sem exportação de relatórios",
      "Sem suporte prioritário",
    ],
    cta: "Começar Grátis",
    popular: false,
  },
  {
    name: "Pro",
    price: "R$ 49",
    period: "/mês",
    description: "Para importadores sérios",
    icon: TrendingUp,
    features: [
      "50 análises por mês",
      "Chat de IA ilimitado",
      "Histórico ilimitado",
      "Alertas automáticos de oportunidades",
      "Exportação de relatórios em PDF",
      "Calculadora avançada de ROI",
      "Monitoramento de produtos favoritos",
      "Análise de tendências",
    ],
    limitations: [],
    cta: "Assinar Pro",
    popular: true,
  },
  {
    name: "Premium",
    price: "R$ 149",
    period: "/mês",
    description: "Para profissionais e empresas",
    icon: Zap,
    features: [
      "Análises ILIMITADAS",
      "Chat de IA com prioridade",
      "Histórico ilimitado",
      "Alertas automáticos personalizados",
      "Relatórios avançados em PDF",
      "API de integração",
      "Suporte prioritário via WhatsApp",
      "Análise de sazonalidade",
      "Consultoria mensal (1h)",
      "Acesso antecipado a novos recursos",
    ],
    limitations: [],
    cta: "Assinar Premium",
    popular: false,
  },
];

export default function Pricing() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const checkoutMutation = trpc.stripe.createCheckout.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.success("Redirecionando para o checkout...");
        window.open(data.url, "_blank");
      }
      setLoadingPlan(null);
    },
    onError: (error) => {
      toast.error("Erro ao criar checkout: " + error.message);
      setLoadingPlan(null);
    },
  });

  const handleSubscribe = (plan: "pro" | "premium") => {
    setLoadingPlan(plan);
    checkoutMutation.mutate({ plan });
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4">Planos e Preços</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Escolha o plano ideal para você
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comece grátis e escale conforme seu negócio cresce. Cancele quando quiser.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.popular
                    ? "border-2 border-blue-500 shadow-xl scale-105"
                    : "border-2 hover:border-gray-300"
                } transition-all`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <div className="mx-auto mb-4 h-12 w-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {plan.name === "Free" ? (
                    <Link href="/">
                      <Button
                        className="w-full"
                        variant="outline"
                        size="lg"
                      >
                        {plan.cta}
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          : ""
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                      onClick={() => handleSubscribe(plan.name.toLowerCase() as "pro" | "premium")}
                      disabled={loadingPlan !== null}
                    >
                      {loadingPlan === plan.name.toLowerCase() ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        plan.cta
                      )}
                    </Button>
                  )}

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-900">Inclui:</p>
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Perguntas Frequentes</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Posso mudar de plano a qualquer momento?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças entram em vigor imediatamente.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Como funciona o limite de análises?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Cada busca de produto conta como 1 análise. O contador é resetado todo dia 1º do mês. Se você atingir o limite, pode fazer upgrade para continuar usando.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Os dados são realmente reais?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sim! Utilizamos APIs oficiais e web scraping ético para coletar dados reais de preços, avaliações e concorrência dos marketplaces.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Posso cancelar a qualquer momento?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Sim, sem multas ou taxas. Você pode cancelar sua assinatura a qualquer momento e continuará tendo acesso até o fim do período pago.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardHeader>
              <CardTitle className="text-2xl">Pronto para começar?</CardTitle>
              <CardDescription className="text-white/80">
                Junte-se a centenas de importadores que já estão lucrando com o Importador Inteligente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button size="lg" variant="secondary" className="text-blue-600">
                  Começar Agora - É Grátis
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
