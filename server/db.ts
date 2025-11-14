import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Análises de produtos

import { analyses, InsertAnalysis } from "../drizzle/schema";
import { desc } from "drizzle-orm";

export async function saveAnalysis(analysis: InsertAnalysis) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save analysis: database not available");
    return null;
  }

  const result = await db.insert(analyses).values(analysis);
  return result;
}

export async function getUserAnalyses(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get analyses: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(analyses)
    .where(eq(analyses.userId, userId))
    .orderBy(desc(analyses.createdAt))
    .limit(limit);

  return result;
}

export async function getAnalysisById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get analysis: database not available");
    return null;
  }

  const result = await db
    .select()
    .from(analyses)
    .where(eq(analyses.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

// Favoritos
import { favorites, InsertFavorite } from "../drizzle/schema";
import { and } from "drizzle-orm";

export async function addFavorite(userId: number, analysisId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add favorite: database not available");
    return null;
  }

  // Verificar se já existe
  const existing = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.analysisId, analysisId)))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const result = await db.insert(favorites).values({
    userId,
    analysisId,
  });

  return result;
}

export async function removeFavorite(userId: number, analysisId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot remove favorite: database not available");
    return null;
  }

  await db
    .delete(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.analysisId, analysisId)));

  return true;
}

export async function getUserFavorites(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get favorites: database not available");
    return [];
  }

  const favs = await db
    .select()
    .from(favorites)
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt));

  const analysisIds = favs.map(f => f.analysisId);
  if (analysisIds.length === 0) {
    return [];
  }

  const analysesList = await db
    .select()
    .from(analyses)
    .where(eq(analyses.id, analysisIds[0]));

  // Para múltiplos IDs, precisamos fazer uma query diferente
  const allAnalyses = await Promise.all(
    analysisIds.map(id => getAnalysisById(id))
  );

  return favs
    .map(fav => {
      const analysis = allAnalyses.find(a => a?.id === fav.analysisId);
      if (!analysis) return null;
      return {
        id: fav.id,
        analysisId: fav.analysisId,
        createdAt: fav.createdAt,
        analysis: {
          id: analysis.id,
          productTitle: analysis.productTitle,
          productPlatform: analysis.productPlatform,
          productImage: analysis.productImage,
          priceUsd: analysis.priceUsd / 100,
          profitMargin: analysis.profitMargin / 10,
          opportunityScore: analysis.opportunityScore / 10,
          isViable: analysis.isViable === 1,
          createdAt: analysis.createdAt,
        },
      };
    })
    .filter(Boolean) as any[];
}

export async function isFavorite(userId: number, analysisId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    return false;
  }

  const result = await db
    .select()
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.analysisId, analysisId)))
    .limit(1);

  return result.length > 0;
}

// Cotações
import { quotations, quotationItems, InsertQuotation, InsertQuotationItem } from "../drizzle/schema";

export async function saveQuotation(quotation: InsertQuotation, items: InsertQuotationItem[]) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save quotation: database not available");
    return null;
  }

  const result = await db.insert(quotations).values(quotation);
  const quotationId = result[0].insertId;

  if (items.length > 0) {
    await db.insert(quotationItems).values(
      items.map(item => ({ ...item, quotationId }))
    );
  }

  return quotationId;
}

export async function getUserQuotations(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get quotations: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(quotations)
    .where(eq(quotations.userId, userId))
    .orderBy(desc(quotations.createdAt))
    .limit(limit);

  return result;
}

export async function getQuotationById(id: number, userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get quotation: database not available");
    return null;
  }

  const quotation = await db
    .select()
    .from(quotations)
    .where(and(eq(quotations.id, id), eq(quotations.userId, userId)))
    .limit(1);

  if (quotation.length === 0) {
    return null;
  }

  const items = await db
    .select()
    .from(quotationItems)
    .where(eq(quotationItems.quotationId, id));

  return {
    ...quotation[0],
    items,
  };
}

export async function duplicateQuotation(id: number, userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot duplicate quotation: database not available");
    return null;
  }

  const original = await getQuotationById(id, userId);
  if (!original) {
    throw new Error("Cotação não encontrada");
  }

  const { items, ...quotationData } = original;
  const newQuotation: InsertQuotation = {
    ...quotationData,
    quotationName: `${quotationData.quotationName} (Cópia)`,
    status: "draft",
    id: undefined as any,
    createdAt: undefined as any,
    updatedAt: undefined as any,
  };

  const newItems: InsertQuotationItem[] = items.map(item => ({
    ...item,
    id: undefined as any,
    quotationId: undefined as any,
    createdAt: undefined as any,
  }));

  return await saveQuotation(newQuotation, newItems);
}
