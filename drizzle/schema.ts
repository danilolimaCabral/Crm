import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  
  // Assinatura e planos
  subscriptionPlan: mysqlEnum("subscriptionPlan", ["none", "free", "pro", "premium"]).default("none").notNull(),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "inactive", "cancelled"]).default("inactive").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  analysesCount: int("analysesCount").default(0).notNull(), // Contador de análises do mês
  analysesResetDate: timestamp("analysesResetDate").defaultNow().notNull(), // Data para resetar contador
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela para armazenar análises de produtos realizadas pelos usuários
 */
export const analyses = mysqlTable("analyses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  searchTerm: varchar("searchTerm", { length: 255 }).notNull(),
  
  // Dados do produto na China
  productTitle: text("productTitle").notNull(),
  productPlatform: varchar("productPlatform", { length: 50 }).notNull(),
  priceUsd: int("priceUsd").notNull(), // Preço em centavos de dólar
  productRating: int("productRating").notNull(), // Rating * 10 (ex: 4.8 = 48)
  productImage: text("productImage"),
  
  // Custos de importação
  exchangeRate: int("exchangeRate").notNull(), // Taxa de câmbio * 100
  priceBrl: int("priceBrl").notNull(), // Preço em centavos de real
  importTax: int("importTax").notNull(), // Imposto em centavos
  iof: int("iof").notNull(), // IOF em centavos
  shippingCost: int("shippingCost").notNull(), // Frete em centavos
  totalCost: int("totalCost").notNull(), // Custo total em centavos
  
  // Análise do mercado brasileiro
  avgPriceBr: int("avgPriceBr").notNull(), // Preço médio BR em centavos
  minPriceBr: int("minPriceBr").notNull(),
  maxPriceBr: int("maxPriceBr").notNull(),
  totalSellers: int("totalSellers").notNull(),
  competitionLevel: varchar("competitionLevel", { length: 20 }).notNull(),
  avgRatingBr: int("avgRatingBr").notNull(), // Rating * 10
  
  // Dados da Amazon BR (opcional)
  amazonAvgPrice: int("amazonAvgPrice"), // Preço médio Amazon em centavos
  amazonProductCount: int("amazonProductCount"), // Quantidade de produtos
  amazonSearchUrl: text("amazonSearchUrl"), // URL de busca
  amazonMinPrice: int("amazonMinPrice"), // Preço mínimo
  amazonMaxPrice: int("amazonMaxPrice"), // Preço máximo
  
  // Resultado da análise
  profitMargin: int("profitMargin").notNull(), // Margem * 10 (ex: 35.5% = 355)
  opportunityScore: int("opportunityScore").notNull(), // Score * 10
  isViable: int("isViable").notNull(), // 0 = não, 1 = sim (boolean)
  recommendation: varchar("recommendation", { length: 100 }).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = typeof analyses.$inferInsert;

/**
 * Tabela de leads para captura de dados antes do login
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  source: varchar("source", { length: 100 }).default("website"),
  freeSearchesUsed: int("freeSearchesUsed").default(0).notNull(),
  convertedToUser: int("convertedToUser").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Tabela para armazenar cotações de importação
 */
export const quotations = mysqlTable("quotations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Informações gerais
  quotationName: varchar("quotationName", { length: 255 }).notNull(),
  incoterm: varchar("incoterm", { length: 10 }).notNull(), // FOB, CIF, EXW, etc
  transportType: varchar("transportType", { length: 20 }).notNull(), // maritimo, aereo, rodoviario
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  exchangeRate: int("exchangeRate").notNull(), // Taxa * 100
  
  // Documentos
  invoiceUrl: text("invoiceUrl"),
  packListUrl: text("packListUrl"),
  
  // Custos adicionais (em centavos de BRL)
  internationalFreight: int("internationalFreight").default(0).notNull(),
  insurance: int("insurance").default(0).notNull(),
  storage: int("storage").default(0).notNull(),
  portFees: int("portFees").default(0).notNull(),
  customsBrokerFees: int("customsBrokerFees").default(0).notNull(),
  certifications: int("certifications").default(0).notNull(),
  
  // Totais calculados (em centavos de BRL)
  totalFob: int("totalFob").notNull(),
  totalCustomsValue: int("totalCustomsValue").notNull(), // Valor Aduaneiro
  totalII: int("totalII").notNull(), // Imposto de Importação
  totalIPI: int("totalIPI").notNull(),
  totalPIS: int("totalPIS").notNull(),
  totalCofins: int("totalCofins").notNull(),
  totalICMS: int("totalICMS").notNull(),
  totalLandedCost: int("totalLandedCost").notNull(),
  
  status: mysqlEnum("status", ["draft", "completed", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Quotation = typeof quotations.$inferSelect;
export type InsertQuotation = typeof quotations.$inferInsert;

/**
 * Tabela para itens individuais de cada cotação
 */
export const quotationItems = mysqlTable("quotationItems", {
  id: int("id").autoincrement().primaryKey(),
  quotationId: int("quotationId").notNull(),
  
  // Dados do produto
  description: text("description").notNull(),
  ncmCode: varchar("ncmCode", { length: 10 }).notNull(),
  quantity: int("quantity").notNull(),
  unitPriceFob: int("unitPriceFob").notNull(), // Em centavos da moeda original
  totalPriceFob: int("totalPriceFob").notNull(),
  
  // Dados físicos (pack list)
  grossWeight: int("grossWeight"), // Peso em gramas
  netWeight: int("netWeight"),
  volume: int("volume"), // Volume em cm³
  
  // Alíquotas (em porcentagem * 100, ex: 15% = 1500)
  iiRate: int("iiRate").notNull(),
  ipiRate: int("ipiRate").notNull(),
  pisRate: int("pisRate").notNull(),
  cofinsRate: int("cofinsRate").notNull(),
  icmsRate: int("icmsRate").notNull(),
  
  // Impostos calculados (em centavos de BRL)
  customsValue: int("customsValue").notNull(), // Valor Aduaneiro
  iiAmount: int("iiAmount").notNull(),
  ipiAmount: int("ipiAmount").notNull(),
  pisAmount: int("pisAmount").notNull(),
  cofinsAmount: int("cofinsAmount").notNull(),
  icmsAmount: int("icmsAmount").notNull(),
  landedCostPerUnit: int("landedCostPerUnit").notNull(),
  landedCostTotal: int("landedCostTotal").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type QuotationItem = typeof quotationItems.$inferSelect;
export type InsertQuotationItem = typeof quotationItems.$inferInsert;

/**
 * Tabela para favoritos de análises
 */
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  analysisId: int("analysisId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;
