/**
 * Módulo de Checkout do Stripe
 * Gerencia criação de sessões de pagamento
 */

import Stripe from "stripe";
import { STRIPE_PRODUCTS } from "./products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export interface CreateCheckoutSessionParams {
  userId: number;
  userEmail: string;
  userName: string;
  plan: "pro" | "premium";
  origin: string;
}

/**
 * Cria uma sessão de checkout do Stripe
 */
export async function createCheckoutSession(params: CreateCheckoutSessionParams) {
  const { userId, userEmail, userName, plan, origin } = params;

  const product = STRIPE_PRODUCTS[plan.toUpperCase() as keyof typeof STRIPE_PRODUCTS];

  if (!product) {
    throw new Error(`Plano inválido: ${plan}`);
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: product.currency,
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.amount,
            recurring: {
              interval: product.interval,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: userEmail,
      client_reference_id: userId.toString(),
      metadata: {
        user_id: userId.toString(),
        customer_email: userEmail,
        customer_name: userName,
        plan: plan,
      },
      allow_promotion_codes: true,
      success_url: `${origin}/dashboard?payment=success`,
      cancel_url: `${origin}/pricing?payment=cancelled`,
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error("[Stripe] Erro ao criar sessão de checkout:", error);
    throw new Error("Falha ao criar sessão de pagamento");
  }
}

/**
 * Cria ou retorna um Customer ID do Stripe
 */
export async function getOrCreateStripeCustomer(
  userId: number,
  email: string,
  name: string,
  existingCustomerId?: string | null
): Promise<string> {
  // Se já tem customer ID, retorna
  if (existingCustomerId) {
    return existingCustomerId;
  }

  try {
    // Cria novo customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        user_id: userId.toString(),
      },
    });

    return customer.id;
  } catch (error) {
    console.error("[Stripe] Erro ao criar customer:", error);
    throw new Error("Falha ao criar cliente no Stripe");
  }
}

/**
 * Cria portal do cliente para gerenciar assinatura
 */
export async function createCustomerPortalSession(
  customerId: string,
  origin: string
): Promise<string> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard`,
    });

    return session.url;
  } catch (error) {
    console.error("[Stripe] Erro ao criar portal do cliente:", error);
    throw new Error("Falha ao criar portal de gerenciamento");
  }
}

/**
 * Obtém informações da assinatura
 */
export async function getSubscriptionInfo(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const sub = subscription as any;
    return {
      status: sub.status,
      currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : new Date(),
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      plan: sub.metadata?.plan || "unknown",
    };
  } catch (error) {
    console.error("[Stripe] Erro ao obter informações da assinatura:", error);
    return null;
  }
}
