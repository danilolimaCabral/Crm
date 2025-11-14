import { Request, Response, Express } from "express";
import jwt from "jsonwebtoken";
import { createUser, verifyUserCredentials, updateLastSignIn, getUserById } from "../db";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const COOKIE_NAME = "auth_token";

export interface AuthUser {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

/**
 * Gerar JWT token
 */
export function generateToken(user: AuthUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verificar JWT token
 */
export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Extrair usuário do cookie/header
 */
export function getUserFromRequest(req: Request): AuthUser | null {
  // Tentar cookie primeiro
  const cookieToken = req.cookies?.[COOKIE_NAME];
  if (cookieToken) {
    const user = verifyToken(cookieToken);
    if (user) return user;
  }

  // Tentar Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const user = verifyToken(token);
    if (user) return user;
  }

  return null;
}

/**
 * Registrar rotas de autenticação
 */
export function registerAuthRoutes(app: Express) {
  // Registro
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios" });
      }

      // Criar usuário
      const user = await createUser({ email, password, name });

      // Gerar token
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: "user",
      };
      const token = generateToken(authUser);

      // Setar cookie
      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      });

      return res.json({ success: true, user: authUser });
    } catch (error: any) {
      console.error("[Auth] Registration error:", error);
      if (error.message?.includes("Duplicate entry")) {
        return res.status(400).json({ error: "Email já cadastrado" });
      }
      return res.status(500).json({ error: "Erro ao criar conta" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios" });
      }

      // Verificar credenciais
      const user = await verifyUserCredentials(email, password);

      if (!user) {
        return res.status(401).json({ error: "Email ou senha incorretos" });
      }

      // Atualizar último login
      await updateLastSignIn(user.id);

      // Gerar token
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
      const token = generateToken(authUser);

      // Setar cookie
      res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
      });

      return res.json({ success: true, user: authUser });
    } catch (error) {
      console.error("[Auth] Login error:", error);
      return res.status(500).json({ error: "Erro ao fazer login" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME);
    return res.json({ success: true });
  });

  // Me (usuário atual)
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    const user = getUserFromRequest(req);
    
    if (!user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    // Buscar dados atualizados do banco
    const dbUser = await getUserById(user.id);
    
    if (!dbUser) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    return res.json({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      subscriptionPlan: dbUser.subscriptionPlan,
      subscriptionStatus: dbUser.subscriptionStatus,
      analysesCount: dbUser.analysesCount,
    });
  });
}
