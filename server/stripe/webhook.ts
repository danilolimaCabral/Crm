/**
 * Webhook Handler do Stripe
 * Processa eventos de pagamento e atualiza banco de dados
 */

import { Request, Response } from "express";
import Stripe from "stripe";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * Handler principal do webhook
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("[Webhook] Assinatura ausente");
    return res.status(400).send("Webhook signature missing");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`[Webhook] Erro de verificação: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Detectar eventos de teste
  if (event.id.startsWith("evt_test_")) {
    console.log("[Webhook] Evento de teste detectado, retornando verificação");
    return res.json({
      verified: true,
    });
  }

  console.log(`[Webhook] Evento recebido: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`[Webhook] Evento não tratado: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error(`[Webhook] Erro ao processar evento:`, error);
    res.status(500).send("Webhook processing failed");
  }
}

/**
 * Processa checkout completado
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const plan = session.metadata?.plan;

  if (!userId || !plan) {
    console.error("[Webhook] Metadata ausente no checkout");
    return;
  }

  const db = await getDb();
  if (!db) {
    console.error("[Webhook] Banco de dados indisponível");
    return;
  }

  try {
    await db
      .update(users)
      .set({
        subscriptionPlan: plan as "none" | "free" | "pro" | "premium",
        subscriptionStatus: "active",
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
        analysesCount: 0, // Resetar contador
        analysesResetDate: new Date(),
      })
      .where(eq(users.id, parseInt(userId)));

    console.log(`[Webhook] Assinatura ativada para usuário ${userId} - Plano: ${plan}`);
  } catch (error) {
    console.error("[Webhook] Erro ao atualizar usuário:", error);
  }
}

/**
 * Processa atualização de assinatura
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;

  if (!userId) {
    console.error("[Webhook] Metadata ausente na assinatura");
    return;
  }

  const db = await getDb();
  if (!db) return;

  try {
    // Se assinatura foi cancelada mas ainda está ativa até o fim do período
    if (subscription.cancel_at_period_end) {
      console.log(`[Webhook] Assinatura ${subscription.id} será cancelada no fim do período`);
    }

    // Se status mudou (ex: de trialing para active)
    if (subscription.status === "active") {
      console.log(`[Webhook] Assinatura ${subscription.id} está ativa`);
    }
  } catch (error) {
    console.error("[Webhook] Erro ao processar atualização:", error);
  }
}

/**
 * Processa cancelamento de assinatura
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.user_id;

  if (!userId) {
    console.error("[Webhook] Metadata ausente na assinatura");
    return;
  }

  const db = await getDb();
  if (!db) return;

  try {
    await db
      .update(users)
      .set({
        subscriptionPlan: "free",
        subscriptionStatus: "cancelled",
        stripeSubscriptionId: null,
        analysesCount: 0,
        analysesResetDate: new Date(),
      })
      .where(eq(users.id, parseInt(userId)));

    console.log(`[Webhook] Assinatura cancelada para usuário ${userId} - Voltou para Free`);
  } catch (error) {
    console.error("[Webhook] Erro ao cancelar assinatura:", error);
  }
}

/**
 * Processa pagamento de fatura bem-sucedido
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;

  if (!subscriptionId) {
    return;
  }

  console.log(`[Webhook] Fatura paga para assinatura ${subscriptionId}`);

  // Aqui você pode resetar o contador de análises se for renovação mensal
  const db = await getDb();
  if (!db) return;

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata?.user_id;

    if (userId) {
      await db
        .update(users)
        .set({
          analysesCount: 0,
          analysesResetDate: new Date(),
        })
        .where(eq(users.id, parseInt(userId)));

      console.log(`[Webhook] Contador resetado para usuário ${userId}`);
    }
  } catch (error) {
    console.error("[Webhook] Erro ao resetar contador:", error);
  }
}

/**
 * Processa falha de pagamento
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;

  if (!subscriptionId) {
    return;
  }

  console.error(`[Webhook] Falha no pagamento da assinatura ${subscriptionId}`);

  // Aqui você pode enviar email ou notificação para o usuário
  // sobre a falha no pagamento
}
