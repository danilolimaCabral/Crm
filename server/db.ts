import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { InsertUser, users } from "../drizzle/schema";
import bcrypt from "bcryptjs";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL);
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

/**
 * Criar novo usuário com senha hash
 */
export async function createUser(data: {
  email: string;
  password: string;
  name?: string;
}): Promise<{ id: number; email: string; name: string | null }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Hash da senha
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const result = await db.insert(users).values({
    email: data.email,
    password: hashedPassword,
    name: data.name || null,
    subscriptionPlan: "none",
    subscriptionStatus: "inactive",
  }).returning({ id: users.id, email: users.email, name: users.name });

  if (result.length === 0) {
    throw new Error("Failed to create user");
  }

  return result[0];
}

/**
 * Verificar credenciais de login
 */
export async function verifyUserCredentials(
  email: string,
  password: string
): Promise<{ id: number; email: string; name: string | null; role: string } | null> {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const user = result[0];
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

/**
 * Buscar usuário por ID
 */
export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Buscar usuário por email
 */
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Atualizar último login
 */
export async function updateLastSignIn(userId: number) {
  const db = await getDb();
  if (!db) {
    return;
  }

  await db
    .update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, userId));
}

/**
 * Salvar análise de produto
 */
export async function saveAnalysis(data: any) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { analyses } = await import("../drizzle/schema");
  await db.insert(analyses).values(data);
}

/**
 * Buscar análises do usuário
 */
export async function getUserAnalyses(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const { analyses } = await import("../drizzle/schema");
  
  return await db
    .select()
    .from(analyses)
    .where(eq(analyses.userId, userId))
    .orderBy(desc(analyses.createdAt))
    .limit(limit);
}

/**
 * Buscar análise por ID
 */
export async function getAnalysisById(id: number) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const { analyses } = await import("../drizzle/schema");
  const result = await db.select().from(analyses).where(eq(analyses.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}
