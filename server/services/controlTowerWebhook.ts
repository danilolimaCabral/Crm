/**
 * Serviço de integração com Control Tower via Webhooks
 * 
 * Este serviço envia dados automaticamente para o Control Tower quando:
 * - Um lead é criado
 * - Uma análise de importação é realizada
 */

// Configuração do webhook - pode ser movida para variáveis de ambiente
const CONTROL_TOWER_BASE_URL = process.env.CONTROL_TOWER_URL || "https://3000-ijy0cdhvl813djoj9jip0-c55633e9.manusvm.computer";
const CONTROL_TOWER_API_KEY = process.env.CONTROL_TOWER_API_KEY || "";

interface WebhookPayload {
  externalId: number | string;
  source: string;
  [key: string]: any;
}

/**
 * Envia dados para o Control Tower via webhook
 */
async function sendWebhook(endpoint: string, payload: WebhookPayload): Promise<boolean> {
  if (!CONTROL_TOWER_API_KEY) {
    console.warn("[ControlTower Webhook] API Key não configurada. Webhook não enviado.");
    return false;
  }

  try {
    const response = await fetch(`${CONTROL_TOWER_BASE_URL}/api/markthub/webhook/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": CONTROL_TOWER_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ControlTower Webhook] Erro ao enviar ${endpoint}:`, response.status, errorText);
      return false;
    }

    console.log(`[ControlTower Webhook] ${endpoint} enviado com sucesso:`, payload.externalId);
    return true;
  } catch (error) {
    console.error(`[ControlTower Webhook] Erro de conexão ao enviar ${endpoint}:`, error);
    return false;
  }
}

/**
 * Envia dados de um lead para o Control Tower
 */
export async function sendLeadWebhook(leadData: {
  id: number | string;
  name: string;
  email: string;
  phone?: string | null;
  source?: string;
}): Promise<boolean> {
  const payload: WebhookPayload = {
    externalId: leadData.id,
    source: "markthub_crm",
    name: leadData.name,
    email: leadData.email,
    phone: leadData.phone,
    leadSource: leadData.source || "website",
    createdAt: new Date().toISOString(),
  };

  return sendWebhook("lead", payload);
}

/**
 * Envia dados de uma análise de importação para o Control Tower
 */
export async function sendAnalysisWebhook(analysisData: {
  id: number | string;
  userId: number;
  searchTerm: string;
  productTitle?: string;
  totalCost?: number;
  profitMargin?: number;
  isViable?: boolean;
  opportunityScore?: number;
}): Promise<boolean> {
  const payload: WebhookPayload = {
    externalId: analysisData.id,
    source: "markthub_crm",
    userId: analysisData.userId,
    searchTerm: analysisData.searchTerm,
    productTitle: analysisData.productTitle,
    totalCost: analysisData.totalCost,
    profitMargin: analysisData.profitMargin,
    isViable: analysisData.isViable,
    opportunityScore: analysisData.opportunityScore,
    createdAt: new Date().toISOString(),
  };

  return sendWebhook("analysis", payload);
}
