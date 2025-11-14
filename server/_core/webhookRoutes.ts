/**
 * Rotas de Webhook (devem ser registradas ANTES do express.json())
 */

import express, { Express } from "express";
import { handleStripeWebhook } from "../stripe/webhook";

export function registerWebhookRoutes(app: Express) {
  // Webhook do Stripe precisa de raw body para verificação de assinatura
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    handleStripeWebhook
  );

  console.log("[Webhooks] Rota /api/stripe/webhook registrada");
}
