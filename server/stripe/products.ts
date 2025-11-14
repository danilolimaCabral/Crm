/**
 * Definição de produtos e preços do Stripe
 * Centralizando configuração para facilitar manutenção
 */

export const STRIPE_PRODUCTS = {
  PRO: {
    name: "Plano Pro",
    description: "Para importadores sérios - 50 análises/mês",
    priceId: process.env.STRIPE_PRICE_PRO || "price_pro_monthly", // Será criado no Stripe
    amount: 4900, // R$ 49,00 em centavos
    currency: "brl",
    interval: "month" as const,
    features: [
      "50 análises por mês",
      "Chat de IA ilimitado",
      "Histórico ilimitado",
      "Alertas automáticos",
      "Exportação PDF",
      "Calculadora ROI",
      "Monitoramento de favoritos",
      "Análise de tendências",
    ],
    analysisLimit: 50,
  },
  PREMIUM: {
    name: "Plano Premium",
    description: "Para profissionais e empresas - Análises ilimitadas",
    priceId: process.env.STRIPE_PRICE_PREMIUM || "price_premium_monthly",
    amount: 14900, // R$ 149,00 em centavos
    currency: "brl",
    interval: "month" as const,
    features: [
      "Análises ILIMITADAS",
      "Chat de IA prioritário",
      "Histórico ilimitado",
      "Alertas personalizados",
      "Relatórios avançados PDF",
      "API de integração",
      "Suporte prioritário WhatsApp",
      "Análise de sazonalidade",
      "Consultoria mensal (1h)",
      "Acesso antecipado",
    ],
    analysisLimit: -1, // Ilimitado
  },
} as const;

export const FREE_PLAN = {
  name: "Plano Free",
  description: "Para começar a explorar",
  amount: 0,
  analysisLimit: 5,
  features: [
    "5 análises por mês",
    "Acesso ao chat de IA",
    "Histórico de 30 dias",
    "Cálculo de impostos",
    "Score de oportunidade",
  ],
} as const;

/**
 * Mapeia o plano do usuário para o limite de análises
 */
export function getAnalysisLimit(plan: string): number {
  switch (plan) {
    case "pro":
      return STRIPE_PRODUCTS.PRO.analysisLimit;
    case "premium":
      return STRIPE_PRODUCTS.PREMIUM.analysisLimit;
    case "free":
    default:
      return FREE_PLAN.analysisLimit;
  }
}

/**
 * Verifica se o plano tem análises ilimitadas
 */
export function hasUnlimitedAnalysis(plan: string): boolean {
  return plan === "premium";
}
