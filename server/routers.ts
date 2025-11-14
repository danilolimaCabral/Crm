import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Rotas de análise de importação
  import: router({
    analyze: protectedProcedure
      .input(z.object({
        searchTerm: z.string().min(1),
        exchangeRate: z.number().positive(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { checkUsageLimit, incrementUsageCount } = await import("./services/usageLimits");
        const { generateProductSuggestions } = await import("./aiProductSuggestions");
        const { saveAnalysis } = await import("./db");
        
        // Verificar limite de uso
        const usageCheck = await checkUsageLimit(ctx.user.id);
        if (!usageCheck.allowed) {
          throw new Error(usageCheck.message || "Limite de análises atingido");
        }
        
        // Gerar sugestões de produtos usando IA
        const suggestions = await generateProductSuggestions(input.searchTerm, input.exchangeRate);
        
        if (!suggestions || suggestions.length === 0) {
          throw new Error("Não foi possível gerar sugestões. Tente novamente.");
        }
        
        // Pegar a primeira sugestão como resultado principal
        const mainProduct = suggestions[0];
        
        // Calcular custos de importação usando o melhor preço da China
        const preco_usd = mainProduct.bestChinaPrice.priceUsd / 100;
        const preco_brl = preco_usd * input.exchangeRate;
        const imposto = preco_brl * 0.60;
        const iof = preco_brl * 0.0538;
        const frete = 5 * input.exchangeRate;
        const custo_total = preco_brl + imposto + iof + frete;
        const margem_lucro = ((mainProduct.avgPriceBr / 100) - custo_total) / custo_total * 100;
        
        const result = {
          searchTerm: input.searchTerm,
          productChina: {
            titulo: mainProduct.title,
            plataforma: mainProduct.bestChinaPrice.platform,
            preco_usd: preco_usd,
            avaliacao: mainProduct.bestChinaPrice.rating / 10,
            imagem: mainProduct.imageUrl,
          },
          custos: {
            preco_produto_brl: preco_brl,
            imposto_importacao: imposto,
            iof: iof,
            frete_internacional: frete,
            custo_total: custo_total,
          },
          analise_mercado: {
            preco_medio_ponderado: mainProduct.avgPriceBr / 100,
            preco_minimo: (mainProduct.brazilPrices?.[0]?.priceBrl || 10000) / 100,
            preco_maximo: (mainProduct.brazilPrices?.[mainProduct.brazilPrices.length - 1]?.priceBrl || 20000) / 100,
            total_vendedores: mainProduct.brazilPrices?.reduce((sum, p) => sum + (p.sellers || 0), 0) || 10,
            nivel_concorrencia: mainProduct.competitionLevel,
            avaliacao_media: (mainProduct.brazilPrices?.[0]?.rating || 45) / 10,
          },
          margem_lucro_percentual: margem_lucro,
          score_oportunidade: mainProduct.opportunityScore,
          viavel: mainProduct.isViable,
          recomendacao: mainProduct.recommendation,
          suggestions: suggestions, // Incluir todas as sugestões
        };
        
        // Salvar análise no banco de dados - garantir que TODOS os campos tenham valores válidos
        const analysisData = {
          userId: ctx.user.id,
          searchTerm: String(result.searchTerm || input.searchTerm || 'Produto'),
          productTitle: String(result.productChina?.titulo || mainProduct?.title || 'Produto'),
          productPlatform: String(result.productChina?.plataforma || mainProduct?.bestChinaPrice?.platform || 'AliExpress'),
          priceUsd: Math.max(0, Math.round((result.productChina?.preco_usd || mainProduct?.bestChinaPrice?.priceUsd || 1000) * 100)),
          productRating: Math.max(0, Math.round((result.productChina?.avaliacao || mainProduct?.bestChinaPrice?.rating / 10 || 4.5) * 10)),
          productImage: String(result.productChina?.imagem || mainProduct?.imageUrl || 'https://via.placeholder.com/300x300?text=Produto'),
          exchangeRate: Math.max(100, Math.round(input.exchangeRate * 100)),
          priceBrl: Math.max(0, Math.round((result.custos?.preco_produto_brl || preco_brl || 50) * 100)),
          importTax: Math.max(0, Math.round((result.custos?.imposto_importacao || imposto || 30) * 100)),
          iof: Math.max(0, Math.round((result.custos?.iof || iof || 2.69) * 100)),
          shippingCost: Math.max(0, Math.round((result.custos?.frete_internacional || frete || 26.25) * 100)),
          totalCost: Math.max(0, Math.round((result.custos?.custo_total || custo_total || 100) * 100)),
          avgPriceBr: Math.max(0, Math.round((result.analise_mercado?.preco_medio_ponderado || mainProduct?.avgPriceBr / 100 || 150) * 100)),
          minPriceBr: Math.max(0, Math.round((result.analise_mercado?.preco_minimo || (mainProduct?.brazilPrices?.[0]?.priceBrl || 10000) / 100 || 100) * 100)),
          maxPriceBr: Math.max(0, Math.round((result.analise_mercado?.preco_maximo || (mainProduct?.brazilPrices?.[mainProduct.brazilPrices.length - 1]?.priceBrl || 20000) / 100 || 200) * 100)),
          totalSellers: Math.max(0, result.analise_mercado?.total_vendedores || mainProduct?.brazilPrices?.reduce((sum, p) => sum + (p.sellers || 0), 0) || 10),
          competitionLevel: String(result.analise_mercado?.nivel_concorrencia || mainProduct?.competitionLevel || 'Média'),
          avgRatingBr: Math.max(0, Math.round((result.analise_mercado?.avaliacao_media || (mainProduct?.brazilPrices?.[0]?.rating || 45) / 10 || 4.5) * 10)),
          profitMargin: Math.round((result.margem_lucro_percentual !== undefined ? result.margem_lucro_percentual : margem_lucro || 0) * 10),
          opportunityScore: Math.max(0, Math.round((result.score_oportunidade || mainProduct?.opportunityScore || 50) * 10)),
          isViable: result.viavel ? 1 : 0,
          recommendation: String(result.recomendacao || mainProduct?.recommendation || 'Análise concluída'),
        };
        
        await saveAnalysis(analysisData);
        
        // Incrementar contador de análises
        await incrementUsageCount(ctx.user.id);
        
        return result;
      }),
    
    history: protectedProcedure
      .input(z.object({
        limit: z.number().positive().optional().default(20),
      }))
      .query(async ({ input, ctx }) => {
        const { getUserAnalyses } = await import("./db");
        const analyses = await getUserAnalyses(ctx.user.id, input.limit);
        
        // Converter de volta para formato legível
        return analyses.map(a => ({
          id: a.id,
          searchTerm: a.searchTerm,
          productTitle: a.productTitle,
          productPlatform: a.productPlatform,
          productImage: a.productImage,
          priceUsd: a.priceUsd / 100,
          productRating: a.productRating / 10,
          totalCost: a.totalCost / 100,
          avgPriceBr: a.avgPriceBr / 100,
          profitMargin: a.profitMargin / 10,
          opportunityScore: a.opportunityScore / 10,
          isViable: a.isViable === 1,
          recommendation: a.recommendation,
          competitionLevel: a.competitionLevel,
          totalSellers: a.totalSellers,
          createdAt: a.createdAt,
        }));
      }),
    
    getById: protectedProcedure
      .input(z.object({
        id: z.number().positive(),
      }))
      .query(async ({ input }) => {
        const { getAnalysisById } = await import("./db");
        const analysis = await getAnalysisById(input.id);
        
        if (!analysis) {
          throw new Error("Análise não encontrada");
        }
        
        // Converter de volta para formato legível
        return {
          id: analysis.id,
          searchTerm: analysis.searchTerm,
          productTitle: analysis.productTitle,
          productPlatform: analysis.productPlatform,
          productImage: analysis.productImage,
          priceUsd: analysis.priceUsd / 100,
          productRating: analysis.productRating / 10,
          exchangeRate: analysis.exchangeRate / 100,
          priceBrl: analysis.priceBrl / 100,
          importTax: analysis.importTax / 100,
          iof: analysis.iof / 100,
          shippingCost: analysis.shippingCost / 100,
          totalCost: analysis.totalCost / 100,
          avgPriceBr: analysis.avgPriceBr / 100,
          minPriceBr: analysis.minPriceBr / 100,
          maxPriceBr: analysis.maxPriceBr / 100,
          totalSellers: analysis.totalSellers,
          competitionLevel: analysis.competitionLevel,
          avgRatingBr: analysis.avgRatingBr / 10,
          profitMargin: analysis.profitMargin / 10,
          opportunityScore: analysis.opportunityScore / 10,
          isViable: analysis.isViable === 1,
          recommendation: analysis.recommendation,
          createdAt: analysis.createdAt,
        };
      }),
    
    updateUserPlan: protectedProcedure
      .input(z.object({
        plan: z.enum(["free", "pro", "premium"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const { getDb } = await import("./db");
        const { users } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        
        const db = await getDb();
        if (!db) {
          throw new Error("Banco de dados indisponível");
        }
        
        await db
          .update(users)
          .set({
            subscriptionPlan: input.plan,
            subscriptionStatus: "active",
            analysesCount: 0,
            analysesResetDate: new Date(),
          })
          .where(eq(users.id, ctx.user.id));
        
        return { success: true, plan: input.plan };
      }),
  }),

  // Rotas de cotação cambial
  exchange: router({
    getDolarRate: publicProcedure.query(async () => {
      const { getUltimaCotacaoDolar } = await import("./services/bancoCentralApi");
      const result = await getUltimaCotacaoDolar();
      return result;
    }),
  }),

  // Rotas de usuário
  user: router({
    getUsage: protectedProcedure.query(async ({ ctx }) => {
      const { getUsageInfo } = await import("./services/usageLimits");
      return await getUsageInfo(ctx.user.id);
    }),
    
    updatePlan: protectedProcedure
      .input(z.object({
        plan: z.enum(["free", "pro", "premium"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const { getDb } = await import("./db");
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const { users } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        
        await db
          .update(users)
          .set({
            subscriptionPlan: input.plan,
            subscriptionStatus: "active",
            analysesCount: 0,
            analysesResetDate: new Date(),
          })
          .where(eq(users.id, ctx.user.id));
        
        return { success: true, plan: input.plan };
      }),
  }),

  // Rotas de chat com IA
  chat: router({
    sendMessage: protectedProcedure
      .input(z.object({
        message: z.string().min(1),
        conversationHistory: z.array(z.object({
          role: z.enum(["user", "assistant", "system"]),
          content: z.string(),
        })).optional(),
        context: z.object({
          lastAnalysis: z.object({
            produto: z.string(),
            margemLucro: z.number(),
            scoreOportunidade: z.number(),
            viavel: z.boolean(),
          }).optional(),
        }).optional(),
      }))
      .mutation(async ({ input }) => {
        const { sendChatMessage } = await import("./aiChat");
        const response = await sendChatMessage(
          input.message,
          input.conversationHistory || [],
          input.context
        );
        return { response };
      }),

    getSuggestions: protectedProcedure
      .input(z.object({
        context: z.object({
          lastAnalysis: z.object({
            produto: z.string(),
            margemLucro: z.number(),
            scoreOportunidade: z.number(),
            viavel: z.boolean(),
          }).optional(),
        }).optional(),
      }))
      .query(async ({ input }) => {
        const { gerarSugestoesPerguntas } = await import("./aiChat");
        const suggestions = gerarSugestoesPerguntas(input.context);
        return { suggestions };
      }),

    explainAnalysis: protectedProcedure
      .input(z.object({
        produto: z.string(),
        custoTotal: z.number(),
        precoMedioBrasil: z.number(),
        margemLucro: z.number(),
        concorrencia: z.string(),
        scoreOportunidade: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { explicarAnalise } = await import("./aiChat");
        const explanation = await explicarAnalise(
          input.produto,
          input.custoTotal,
          input.precoMedioBrasil,
          input.margemLucro,
          input.concorrencia,
          input.scoreOportunidade
        );
        return { explanation };
      }),
  }),

  // Rotas do Stripe
  stripe: router({
    createCheckout: protectedProcedure
      .input(z.object({
        plan: z.enum(["pro", "premium"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const { createCheckoutSession } = await import("./stripe/checkout");
        const origin = ctx.req.headers.origin || "http://localhost:3000";
        
        const session = await createCheckoutSession({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          userName: ctx.user.name || "Usuário",
          plan: input.plan,
          origin,
        });

        return session;
      }),

    createPortalSession: protectedProcedure
      .mutation(async ({ ctx }) => {
        const { createCustomerPortalSession } = await import("./stripe/checkout");
        const origin = ctx.req.headers.origin || "http://localhost:3000";

        if (!ctx.user.stripeCustomerId) {
          throw new Error("Usuário não possui customer ID do Stripe");
        }

        const url = await createCustomerPortalSession(ctx.user.stripeCustomerId, origin);
        return { url };
      }),

    getSubscriptionStatus: protectedProcedure
      .query(async ({ ctx }) => {
        return {
          plan: ctx.user.subscriptionPlan || "free",
          analysisCount: ctx.user.analysesCount || 0,
          analysisResetDate: ctx.user.analysesResetDate,
          hasSubscription: ctx.user.stripeSubscriptionId != null,
        };
      }),
  }),

  // Rotas de Leads (captura antes do login)
  leads: router({
    create: publicProcedure
      .input(z.object({
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
        email: z.string().email("Email inválido"),
        phone: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { getDb } = await import("./db");
        const { leads } = await import("../drizzle/schema");
        const db = await getDb();
        
        if (!db) {
          throw new Error("Banco de dados não disponível");
        }

        // Verificar se email já existe
        const { eq } = await import("drizzle-orm");
        const existing = await db.select().from(leads).where(eq(leads.email, input.email)).limit(1);
        
        if (existing.length > 0) {
          // Retornar o lead existente
          return { leadId: existing[0].id.toString(), existing: true };
        }

        // Criar novo lead
        const result = await db.insert(leads).values({
          name: input.name,
          email: input.email,
          phone: input.phone || null,
          source: "website",
          freeSearchesUsed: 0,
          convertedToUser: 0,
        });

        return { leadId: result[0].insertId.toString(), existing: false };
      }),

    incrementSearchCount: publicProcedure
      .input(z.object({
        leadId: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { getDb } = await import("./db");
        const { leads } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        
        if (!db) {
          throw new Error("Banco de dados não disponível");
        }

        const leadId = parseInt(input.leadId);
        const lead = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
        
        if (lead.length === 0) {
          throw new Error("Lead não encontrado");
        }

        await db.update(leads)
          .set({ freeSearchesUsed: (lead[0].freeSearchesUsed || 0) + 1 })
          .where(eq(leads.id, leadId));

        return { searchesUsed: (lead[0].freeSearchesUsed || 0) + 1 };
      }),

    getSearchCount: publicProcedure
      .input(z.object({
        leadId: z.string(),
      }))
      .query(async ({ input }) => {
        const { getDb } = await import("./db");
        const { leads } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        const db = await getDb();
        
        if (!db) {
          throw new Error("Banco de dados não disponível");
        }

        const leadId = parseInt(input.leadId);
        const lead = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
        
        if (lead.length === 0) {
          return { searchesUsed: 0, searchesRemaining: 5 };
        }

        const used = lead[0].freeSearchesUsed || 0;
        return { searchesUsed: used, searchesRemaining: Math.max(0, 5 - used) };
      }),

    getAll: protectedProcedure
      .query(async ({ ctx }) => {
        // Apenas admin pode ver todos os leads
        if (ctx.user.role !== "admin") {
          throw new Error("Acesso negado");
        }

        const { getDb } = await import("./db");
        const { leads } = await import("../drizzle/schema");
        const { desc } = await import("drizzle-orm");
        const db = await getDb();
        
        if (!db) {
          throw new Error("Banco de dados não disponível");
        }

        const allLeads = await db.select().from(leads).orderBy(desc(leads.createdAt));
        
        return allLeads.map(lead => ({
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          searchCount: lead.freeSearchesUsed || 0,
          createdAt: lead.createdAt,
        }));
      }),
  }),

  // Rotas de cotação profissional
  quotation: router({
    calculate: protectedProcedure
      .input(z.object({
        quotationName: z.string(),
        incoterm: z.string(),
        transportType: z.string(),
        currency: z.string(),
        exchangeRate: z.number(),
        internationalFreight: z.number(),
        insurance: z.number(),
        storage: z.number(),
        portFees: z.number(),
        customsBrokerFees: z.number(),
        certifications: z.number(),
        items: z.array(z.object({
          description: z.string(),
          ncm: z.string(),
          quantity: z.number(),
          unitPrice: z.number(),
          weight: z.number().optional(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const { calculateQuotation } = await import("./services/taxCalculation");
        const { getTaxRatesByNCM } = await import("./services/ncmDatabase");
        
        // Converter preços para BRL
        const itemsInBRL = input.items.map(item => ({
          description: item.description,
          ncmCode: item.ncm,
          quantity: item.quantity,
          unitPriceFob: item.unitPrice * input.exchangeRate,
          weight: item.weight,
        }));
        
        // Custos fixos (já em BRL)
        const costs = {
          internationalFreight: input.internationalFreight,
          insurance: input.insurance,
          siscomex: 214.50, // Taxa fixa do Siscomex
          storage: input.storage,
          portFees: input.portFees,
          customsBrokerFees: input.customsBrokerFees,
          certifications: input.certifications,
        };
        
        // Calcular impostos
        const result = calculateQuotation(itemsInBRL, costs, getTaxRatesByNCM);
        
        return result;
      }),
    
    searchNCM: protectedProcedure
      .input(z.object({
        query: z.string(),
      }))
      .query(async ({ input }) => {
        const { searchNCMByDescription } = await import("./services/ncmDatabase");
        return searchNCMByDescription(input.query);
      }),
    
    classifyNCM: protectedProcedure
      .input(z.object({
        productDescription: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { classifyNCM } = await import("./services/ncmClassification");
        return await classifyNCM(input.productDescription);
      }),

    list: protectedProcedure
      .input(z.object({
        limit: z.number().positive().optional().default(50),
      }))
      .query(async ({ input, ctx }) => {
        const { getUserQuotations } = await import("./db");
        const quotations = await getUserQuotations(ctx.user.id, input.limit);
        
        return quotations.map(q => ({
          id: q.id,
          quotationName: q.quotationName,
          incoterm: q.incoterm,
          transportType: q.transportType,
          totalLandedCost: q.totalLandedCost / 100,
          status: q.status,
          createdAt: q.createdAt,
          updatedAt: q.updatedAt,
        }));
      }),

    getById: protectedProcedure
      .input(z.object({
        id: z.number().positive(),
      }))
      .query(async ({ input, ctx }) => {
        const { getQuotationById } = await import("./db");
        const quotation = await getQuotationById(input.id, ctx.user.id);
        
        if (!quotation) {
          throw new Error("Cotação não encontrada");
        }

        return {
          ...quotation,
          totalFob: quotation.totalFob / 100,
          totalCustomsValue: quotation.totalCustomsValue / 100,
          totalII: quotation.totalII / 100,
          totalIPI: quotation.totalIPI / 100,
          totalPIS: quotation.totalPIS / 100,
          totalCofins: quotation.totalCofins / 100,
          totalICMS: quotation.totalICMS / 100,
          totalLandedCost: quotation.totalLandedCost / 100,
          exchangeRate: quotation.exchangeRate / 100,
          internationalFreight: quotation.internationalFreight / 100,
          insurance: quotation.insurance / 100,
          storage: quotation.storage / 100,
          portFees: quotation.portFees / 100,
          customsBrokerFees: quotation.customsBrokerFees / 100,
          certifications: quotation.certifications / 100,
          items: quotation.items.map(item => ({
            ...item,
            unitPriceFob: item.unitPriceFob / 100,
            totalPriceFob: item.totalPriceFob / 100,
            customsValue: item.customsValue / 100,
            iiAmount: item.iiAmount / 100,
            ipiAmount: item.ipiAmount / 100,
            pisAmount: item.pisAmount / 100,
            cofinsAmount: item.cofinsAmount / 100,
            icmsAmount: item.icmsAmount / 100,
            landedCostPerUnit: item.landedCostPerUnit / 100,
            landedCostTotal: item.landedCostTotal / 100,
            iiRate: item.iiRate / 100,
            ipiRate: item.ipiRate / 100,
            pisRate: item.pisRate / 100,
            cofinsRate: item.cofinsRate / 100,
            icmsRate: item.icmsRate / 100,
          })),
        };
      }),

    duplicate: protectedProcedure
      .input(z.object({
        id: z.number().positive(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { duplicateQuotation } = await import("./db");
        const newId = await duplicateQuotation(input.id, ctx.user.id);
        return { id: newId };
      }),

    save: protectedProcedure
      .input(z.object({
        quotationName: z.string(),
        incoterm: z.string(),
        transportType: z.string(),
        currency: z.string(),
        exchangeRate: z.number(),
        internationalFreight: z.number(),
        insurance: z.number(),
        storage: z.number(),
        portFees: z.number(),
        customsBrokerFees: z.number(),
        certifications: z.number(),
        totalFob: z.number(),
        totalCustomsValue: z.number(),
        totalII: z.number(),
        totalIPI: z.number(),
        totalPIS: z.number(),
        totalCofins: z.number(),
        totalICMS: z.number(),
        totalLandedCost: z.number(),
        items: z.array(z.object({
          description: z.string(),
          ncmCode: z.string(),
          quantity: z.number(),
          unitPriceFob: z.number(),
          totalPriceFob: z.number(),
          grossWeight: z.number().optional(),
          netWeight: z.number().optional(),
          volume: z.number().optional(),
          iiRate: z.number(),
          ipiRate: z.number(),
          pisRate: z.number(),
          cofinsRate: z.number(),
          icmsRate: z.number(),
          customsValue: z.number(),
          iiAmount: z.number(),
          ipiAmount: z.number(),
          pisAmount: z.number(),
          cofinsAmount: z.number(),
          icmsAmount: z.number(),
          landedCostPerUnit: z.number(),
          landedCostTotal: z.number(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const { saveQuotation } = await import("./db");
        const { quotations, quotationItems } = await import("../drizzle/schema");
        
        const quotationData = {
          userId: ctx.user.id,
          quotationName: input.quotationName,
          incoterm: input.incoterm,
          transportType: input.transportType,
          currency: input.currency,
          exchangeRate: Math.round(input.exchangeRate * 100),
          internationalFreight: Math.round(input.internationalFreight * 100),
          insurance: Math.round(input.insurance * 100),
          storage: Math.round(input.storage * 100),
          portFees: Math.round(input.portFees * 100),
          customsBrokerFees: Math.round(input.customsBrokerFees * 100),
          certifications: Math.round(input.certifications * 100),
          totalFob: Math.round(input.totalFob * 100),
          totalCustomsValue: Math.round(input.totalCustomsValue * 100),
          totalII: Math.round(input.totalII * 100),
          totalIPI: Math.round(input.totalIPI * 100),
          totalPIS: Math.round(input.totalPIS * 100),
          totalCofins: Math.round(input.totalCofins * 100),
          totalICMS: Math.round(input.totalICMS * 100),
          totalLandedCost: Math.round(input.totalLandedCost * 100),
          status: "completed" as const,
        };

        const itemsData = input.items.map(item => ({
          quotationId: 0, // Será preenchido após inserção
          description: item.description,
          ncmCode: item.ncmCode,
          quantity: item.quantity,
          unitPriceFob: Math.round(item.unitPriceFob * 100),
          totalPriceFob: Math.round(item.totalPriceFob * 100),
          grossWeight: item.grossWeight,
          netWeight: item.netWeight,
          volume: item.volume,
          iiRate: Math.round(item.iiRate * 100),
          ipiRate: Math.round(item.ipiRate * 100),
          pisRate: Math.round(item.pisRate * 100),
          cofinsRate: Math.round(item.cofinsRate * 100),
          icmsRate: Math.round(item.icmsRate * 100),
          customsValue: Math.round(item.customsValue * 100),
          iiAmount: Math.round(item.iiAmount * 100),
          ipiAmount: Math.round(item.ipiAmount * 100),
          pisAmount: Math.round(item.pisAmount * 100),
          cofinsAmount: Math.round(item.cofinsAmount * 100),
          icmsAmount: Math.round(item.icmsAmount * 100),
          landedCostPerUnit: Math.round(item.landedCostPerUnit * 100),
          landedCostTotal: Math.round(item.landedCostTotal * 100),
        }));

        const quotationId = await saveQuotation(quotationData as any, itemsData as any);
        return { id: quotationId };
      }),
  }),

  // Rotas de Favoritos
  favorites: router({
    add: protectedProcedure
      .input(z.object({
        analysisId: z.number().positive(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { addFavorite, getUserFavorites } = await import("./db");
        await addFavorite(ctx.user.id, input.analysisId);
        const favorites = await getUserFavorites(ctx.user.id);
        return { favorites };
      }),

    remove: protectedProcedure
      .input(z.object({
        analysisId: z.number().positive(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { removeFavorite, getUserFavorites } = await import("./db");
        await removeFavorite(ctx.user.id, input.analysisId);
        const favorites = await getUserFavorites(ctx.user.id);
        return { favorites };
      }),

    list: protectedProcedure
      .query(async ({ ctx }) => {
        const { getUserFavorites } = await import("./db");
        return await getUserFavorites(ctx.user.id);
      }),

    check: protectedProcedure
      .input(z.object({
        analysisId: z.number().positive(),
      }))
      .query(async ({ input, ctx }) => {
        const { isFavorite } = await import("./db");
        return await isFavorite(ctx.user.id, input.analysisId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
