import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { APP_TITLE } from "@/const";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    description: "Perfeito para começar",
    icon: Sparkles,
    features: [
      "5 análises por mês",
      "Chat com IA",
      "Histórico de análises",
      "Comparação China vs Brasil",
    ],
    cta: "Começar Grátis",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$ 49",
    period: "/mês",
    description: "Para importadores sérios",
    icon: Zap,
    features: [
      "50 análises por mês",
      "Chat com IA ilimitado",
      "Histórico completo",
      "Comparação avançada",
      "Alertas de oportunidades",
      "Relatórios em PDF",
    ],
    cta: "Assinar Pro",
    highlighted: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: "R$ 149",
    period: "/mês",
    description: "Para profissionais",
    icon: Crown,
    features: [
      "Análises ilimitadas",
      "Chat com IA prioritário",
      "Histórico ilimitado",
      "Comparação em tempo real",
      "Alertas personalizados",
      "Relatórios premium",
      "Suporte prioritário",
      "API access",
    ],
    cta: "Assinar Premium",
    highlighted: false,
  },
];

export default function PlanOnboarding() {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const createCheckoutMutation = trpc.stripe.createCheckout.useMutation();

  const updatePlanMutation = trpc.import.updateUserPlan.useMutation();

  const handleSelectPlan = async (planId: string) => {
    setIsLoading(true);

    if (planId === "free") {
      // Plano Free: salvar no banco e redirecionar para a home
      try {
        await updatePlanMutation.mutateAsync({ plan: "free" });
        setLocation("/");
      } catch (error) {
        console.error("Erro ao atualizar plano:", error);
        setIsLoading(false);
      }
      return;
    }

    // Planos pagos: criar checkout Stripe
    try {
      const result = await createCheckoutMutation.mutateAsync({
        plan: planId as "pro" | "premium",
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Erro ao criar checkout:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="container py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-blue-600 mb-4">{APP_TITLE}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2">
            Bem-vindo! Escolha seu plano para começar
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Encontre produtos lucrativos da China com análise inteligente de IA
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.highlighted
                    ? "border-2 border-blue-500 shadow-xl scale-105"
                    : "border border-gray-200"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Mais Popular
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pb-8 pt-8">
                  <div className="mx-auto mb-4 w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processando..." : plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Footer Info */}
        <div className="text-center mt-12 text-sm text-gray-500 dark:text-gray-400">
          <p>✨ Todos os planos incluem acesso completo à análise de viabilidade com IA</p>
          <p className="mt-2">🔒 Pagamento seguro processado pelo Stripe</p>
        </div>
      </div>
    </div>
  );
}
