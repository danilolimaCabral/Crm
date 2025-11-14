import { pgTable, serial, text, varchar, timestamp, integer, pgEnum } from "drizzle-orm/pg-core";

// Enums para PostgreSQL
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const subscriptionPlanEnum = pgEnum("subscription_plan", ["none", "free", "pro", "premium"]);
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "inactive", "cancelled"]);

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(), // bcrypt hash
  image: text("image"),
  role: roleEnum("role").default("user").notNull(),
  
  // Assinatura e planos
  subscriptionPlan: subscriptionPlanEnum("subscription_plan").default("none").notNull(),
  subscriptionStatus: subscriptionStatusEnum("subscription_status").default("inactive").notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  analysesCount: integer("analyses_count").default(0).notNull(), // Contador de análises do mês
  analysesResetDate: timestamp("analyses_reset_date").defaultNow().notNull(), // Data para resetar contador
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela para armazenar análises de produtos realizadas pelos usuários
 */
export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  searchTerm: varchar("search_term", { length: 255 }).notNull(),
  
  // Dados do produto na China
  productTitle: text("product_title").notNull(),
  productPlatform: varchar("product_platform", { length: 50 }).notNull(),
  priceUsd: integer("price_usd").notNull(), // Preço em centavos de dólar
  productRating: integer("product_rating").notNull(), // Rating * 10 (ex: 4.8 = 48)
  productImage: text("product_image"),
  
  // Custos de importação
  exchangeRate: integer("exchange_rate").notNull(), // Taxa de câmbio * 100
  priceBrl: integer("price_brl").notNull(), // Preço em centavos de real
  importTax: integer("import_tax").notNull(), // Imposto em centavos
  iof: integer("iof").notNull(), // IOF em centavos
  shippingCost: integer("shipping_cost").notNull(), // Frete em centavos
  totalCost: integer("total_cost").notNull(), // Custo total em centavos
  
  // Análise do mercado brasileiro
  avgPriceBr: integer("avg_price_br").notNull(), // Preço médio BR em centavos
  minPriceBr: integer("min_price_br").notNull(),
  maxPriceBr: integer("max_price_br").notNull(),
  totalSellers: integer("total_sellers").notNull(),
  competitionLevel: varchar("competition_level", { length: 20 }).notNull(),
  avgRatingBr: integer("avg_rating_br").notNull(), // Rating * 10
  
  // Dados da Amazon BR (opcional)
  amazonAvgPrice: integer("amazon_avg_price"), // Preço médio Amazon em centavos
  amazonProductCount: integer("amazon_product_count"), // Quantidade de produtos
  amazonSearchUrl: text("amazon_search_url"), // URL de busca
  amazonMinPrice: integer("amazon_min_price"), // Preço mínimo
  amazonMaxPrice: integer("amazon_max_price"), // Preço máximo
  
  // Resultado da análise
  profitMargin: integer("profit_margin").notNull(), // Margem * 10 (ex: 35.5% = 355)
  opportunityScore: integer("opportunity_score").notNull(), // Score * 10
  isViable: integer("is_viable").notNull(), // 0 = não, 1 = sim (boolean)
  recommendation: varchar("recommendation", { length: 100 }).notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = typeof analyses.$inferInsert;

/**
 * Tabela para armazenar leads capturados antes do login
 */
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  phone: varchar("phone", { length: 20 }),
  searchCount: integer("search_count").default(0).notNull(),
  
  // Dados de rastreamento
  source: varchar("source", { length: 50 }), // De onde veio (google, facebook, direto)
  utmSource: varchar("utm_source", { length: 100 }),
  utmMedium: varchar("utm_medium", { length: 100 }),
  utmCampaign: varchar("utm_campaign", { length: 100 }),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Tabela para armazenar cotações profissionais
 */
export const quotations = pgTable("quotations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  
  // Dados gerais
  quotationName: varchar("quotation_name", { length: 255 }).notNull(),
  incoterm: varchar("incoterm", { length: 10 }).notNull(), // FOB, CIF, EXW, etc
  transportMode: varchar("transport_mode", { length: 20 }).notNull(), // Aéreo, Marítimo
  currency: varchar("currency", { length: 3 }).notNull(), // USD, CNY, EUR
  exchangeRate: integer("exchange_rate").notNull(), // Taxa * 100
  
  // Custos adicionais (em centavos)
  internationalShipping: integer("international_shipping").default(0).notNull(),
  insurance: integer("insurance").default(0).notNull(),
  portFees: integer("port_fees").default(0).notNull(),
  customsBroker: integer("customs_broker").default(0).notNull(),
  storage: integer("storage").default(0).notNull(),
  inlandShipping: integer("inland_shipping").default(0).notNull(),
  otherFees: integer("other_fees").default(0).notNull(),
  
  // Resultados calculados (em centavos)
  totalProductValue: integer("total_product_value").notNull(),
  totalWeight: integer("total_weight").notNull(), // em gramas
  totalVolume: integer("total_volume").notNull(), // em cm³
  customsValue: integer("customs_value").notNull(), // Valor aduaneiro
  totalTaxes: integer("total_taxes").notNull(),
  totalCost: integer("total_cost").notNull(), // Landed cost
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Quotation = typeof quotations.$inferSelect;
export type InsertQuotation = typeof quotations.$inferInsert;

/**
 * Tabela para itens de uma cotação
 */
export const quotationItems = pgTable("quotation_items", {
  id: serial("id").primaryKey(),
  quotationId: integer("quotation_id").notNull(),
  
  // Dados do produto
  description: text("description").notNull(),
  ncm: varchar("ncm", { length: 10 }).notNull(), // Código NCM
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(), // em centavos
  totalPrice: integer("total_price").notNull(), // em centavos
  
  // Dimensões e peso
  weight: integer("weight"), // em gramas
  length: integer("length"), // em cm
  width: integer("width"), // em cm
  height: integer("height"), // em cm
  
  // Impostos calculados (em centavos)
  ii: integer("ii").notNull(), // Imposto de Importação
  ipi: integer("ipi").notNull(),
  pis: integer("pis").notNull(),
  cofins: integer("cofins").notNull(),
  icms: integer("icms").notNull(),
  
  // Alíquotas aplicadas (em porcentagem * 10)
  iiRate: integer("ii_rate").notNull(),
  ipiRate: integer("ipi_rate").notNull(),
  pisRate: integer("pis_rate").notNull(),
  cofinsRate: integer("cofins_rate").notNull(),
  icmsRate: integer("icms_rate").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type QuotationItem = typeof quotationItems.$inferSelect;
export type InsertQuotationItem = typeof quotationItems.$inferInsert;
