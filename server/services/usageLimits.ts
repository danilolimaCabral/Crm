import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Limites de análises por plano
 */
const PLAN_LIMITS = {
  none: 0,
  free: 5,
  pro: 50,
  premium: 999999, // Ilimitado
} as const;

/**
 * Verifica se o usuário atingiu o limite de análises do mês
 */
export async function checkUsageLimit(userId: number): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  plan: string;
  message?: string;
}> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  
  if (!user) {
    throw new Error("User not found");
  }

  // Verificar se precisa resetar o contador (novo mês)
  const now = new Date();
  const resetDate = new Date(user.analysesResetDate);
  
  if (now > resetDate) {
    // Resetar contador para o próximo mês
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(0, 0, 0, 0);
    
    await db.update(users)
      .set({
        analysesCount: 0,
        analysesResetDate: nextMonth,
      })
      .where(eq(users.id, userId));
    
    user.analysesCount = 0;
  }

  const plan = user.subscriptionPlan || "none";
  const limit = PLAN_LIMITS[plan];
  const current = user.analysesCount || 0;
  const allowed = current < limit;

  return {
    allowed,
    current,
    limit,
    plan,
    message: allowed 
      ? undefined 
      : `Você atingiu o limite de ${limit} análises do plano ${plan.toUpperCase()}. Faça upgrade para continuar!`,
  };
}

/**
 * Incrementa o contador de análises do usuário
 */
export async function incrementUsageCount(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  
  if (!user) {
    throw new Error("User not found");
  }

  await db.update(users)
    .set({
      analysesCount: (user.analysesCount || 0) + 1,
    })
    .where(eq(users.id, userId));
}

/**
 * Retorna informações de uso do usuário
 */
export async function getUsageInfo(userId: number): Promise<{
  current: number;
  limit: number;
  plan: string;
  remaining: number;
  resetDate: Date;
}> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  
  if (!user) {
    throw new Error("User not found");
  }

  const plan = user.subscriptionPlan || "none";
  const limit = PLAN_LIMITS[plan];
  const current = user.analysesCount || 0;
  const remaining = Math.max(0, limit - current);

  return {
    current,
    limit,
    plan,
    remaining,
    resetDate: user.analysesResetDate,
  };
}
