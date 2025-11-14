import { invokeLLM } from "./_core/llm";
import { searchAliExpress, type AliExpressProduct } from "./services/aliexpressScraper";
import { searchAmazonBR, calculateAveragePrice, type AmazonProduct } from "./services/amazonScraper";

/**
 * Serviço que usa IA para gerar sugestões inteligentes de produtos para importação
 * Compara preços em MÚLTIPLAS plataformas chinesas e brasileiras
 * ATUALIZADO: Agora busca produtos REAIS do AliExpress via API
 */

export interface PlatformPrice {
  platform: string;
  priceUsd: number; // em centavos
  priceBrl: number; // em centavos
  rating: number; // 0-50 (5.0 = 50)
  sellers: number;
  shippingDays: number;
  isBestPrice: boolean;
}

export interface ProductSuggestion {
  title: string;
  category: string;
  
  // Preços em múltiplas plataformas chinesas
  chinaPrices: PlatformPrice[];
  bestChinaPrice: PlatformPrice;
  
  // Preços em múltiplas plataformas brasileiras
  brazilPrices: PlatformPrice[];
  avgPriceBr: number; // em centavos
  
  // Dados da Amazon BR (NOVO)
  amazonData?: {
    avgPrice: number; // preço médio em centavos BRL
    productCount: number; // quantidade de produtos encontrados
    searchUrl: string; // URL de busca na Amazon
    priceRange: { min: number; max: number }; // faixa de preço
  };
  
  // Análise
  profitMargin: number;
  opportunityScore: number; // 0-100
  isViable: boolean;
  recommendation: string;
  competitionLevel: string;
  
  // Metadados
  imageUrl: string;
  totalImportCost: number; // custo total de importação em centavos BRL
}

export async function generateProductSuggestions(
  searchTerm: string,
  exchangeRate: number = 5.25
): Promise<ProductSuggestion[]> {
  
  // ETAPA 1: Tentar buscar produtos REAIS do AliExpress via API
  console.log(`[Product Suggestions] Buscando produtos reais para "${searchTerm}"...`);
  const aliexpressProducts = await searchAliExpress(searchTerm, 1);
  
  if (aliexpressProducts && aliexpressProducts.length > 0) {
    console.log(`[Product Suggestions] ${aliexpressProducts.length} produtos reais encontrados!`);
    return await convertAliExpressToSuggestions(aliexpressProducts, exchangeRate, searchTerm);
  }
  
  // ETAPA 2: Fallback para IA se scraping falhar
  console.log("[Product Suggestions] Scraping falhou, usando IA como fallback...");
  
  const prompt = `Você é um especialista em importação. Analise "${searchTerm}" e retorne 3 produtos REAIS.

Para CADA produto, retorne este JSON EXATO:

{
  "title": "Nome específico do produto",
  "category": "Categoria",
  "chinaPrices": [
    {
      "platform": "AliExpress",
      "priceUsd": 1500,
      "priceBrl": 7875,
      "rating": 45,
      "sellers": 80,
      "shippingDays": 20,
      "isBestPrice": false
    },
    {
      "platform": "1688.com",
      "priceUsd": 1200,
      "priceBrl": 6300,
      "rating": 46,
      "sellers": 150,
      "shippingDays": 25,
      "isBestPrice": true
    },
    {
      "platform": "Temu",
      "priceUsd": 1350,
      "priceBrl": 7087,
      "rating": 42,
      "sellers": 45,
      "shippingDays": 18,
      "isBestPrice": false
    }
  ],
  "bestChinaPrice": {
    "platform": "1688.com",
    "priceUsd": 1200,
    "priceBrl": 6300,
    "rating": 46,
    "sellers": 150,
    "shippingDays": 25,
    "isBestPrice": true
  },
  "brazilPrices": [
    {
      "platform": "Mercado Livre",
      "priceUsd": 0,
      "priceBrl": 25000,
      "rating": 42,
      "sellers": 120,
      "shippingDays": 0,
      "isBestPrice": false
    },
    {
      "platform": "Shopee BR",
      "priceUsd": 0,
      "priceBrl": 22000,
      "rating": 40,
      "sellers": 85,
      "shippingDays": 0,
      "isBestPrice": false
    },
    {
      "platform": "Amazon BR",
      "priceUsd": 0,
      "priceBrl": 28000,
      "rating": 44,
      "sellers": 45,
      "shippingDays": 0,
      "isBestPrice": false
    }
  ],
  "avgPriceBr": 25000,
  "totalImportCost": 12500,
  "profitMargin": 100.0,
  "opportunityScore": 88,
  "isViable": true,
  "competitionLevel": "Média",
  "recommendation": "Excelente! Margem 100%",
  "imageUrl": "https://via.placeholder.com/300x300?text=Produto"
}

REGRAS:
- chinaPrices: 3-4 sites (AliExpress, 1688.com, Temu, Taobao, DHgate)
- brazilPrices: 3-4 sites (Mercado Livre, Shopee BR, Amazon BR, Americanas)
- Preços em CENTAVOS (1500 = $15 ou R$15)
- Rating 0-50 (45 = 4.5 estrelas)
- bestChinaPrice = o mais barato de chinaPrices
- avgPriceBr = média de brazilPrices
- Cámbio: ${exchangeRate}
- Margem: ((avgPriceBr - totalImportCost) / totalImportCost) * 100
- Gere margens VARIADAS: 1 alta (60%+), 1 média (30-50%), 1 baixa (0-20%)

Retorne APENAS array JSON válido sem texto adicional.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um assistente especializado em análise de produtos para importação. Sempre responda com JSON válido e dados realistas de mercado."
        },
        {
          role: "user",
          content: prompt
        }
      ],
    });

    const content = response.choices[0].message.content;
    
    // Extrair JSON do conteúdo
    let jsonStr = typeof content === 'string' ? content.trim() : JSON.stringify(content);
    
    // Remover markdown code blocks se existirem
    if (jsonStr.startsWith("```json")) {
      jsonStr = jsonStr.replace(/```json\n?/g, "").replace(/```\n?/g, "");
    } else if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```\n?/g, "");
    }
    
    const suggestions: ProductSuggestion[] = JSON.parse(jsonStr);
    
    // Validar e garantir que temos dados válidos
    return suggestions.filter(s => 
      s.title && 
      s.chinaPrices && 
      s.chinaPrices.length > 0 &&
      s.brazilPrices && 
      s.brazilPrices.length > 0 &&
      s.bestChinaPrice &&
      typeof s.profitMargin === 'number'
    ).slice(0, 3); // Limitar a 3 sugestões
    
  } catch (error) {
    console.error("[AI Product Suggestions] Erro ao gerar sugestões:", error);
    
    // Fallback: retornar sugestões básicas
    return generateFallbackSuggestions(searchTerm, exchangeRate);
  }
}

/**
 * Converte produtos do AliExpress para o formato ProductSuggestion
 * Agora busca preços REAIS da Amazon BR para comparação
 */
async function convertAliExpressToSuggestions(
  products: AliExpressProduct[],
  exchangeRate: number,
  searchTerm: string
): Promise<ProductSuggestion[]> {
  // Buscar preços reais na Amazon BR
  console.log(`[Product Suggestions] Buscando preços na Amazon BR para "${searchTerm}"...`);
  const amazonProducts = await searchAmazonBR(searchTerm);
  const avgPriceAmazonBr = amazonProducts.length > 0 
    ? calculateAveragePrice(amazonProducts) 
    : 0;
  
  return products.slice(0, 3).map(product => {
    const priceUsdCents = Math.round(product.price * 100); // converter para centavos
    const priceBrlCents = Math.round(priceUsdCents * exchangeRate / 100);
    
    // Usar preço REAL da Amazon BR se disponível, senão estimar
    const avgPriceBrCents = avgPriceAmazonBr > 0 
      ? Math.round(avgPriceAmazonBr * 100) // preço real da Amazon
      : Math.round(priceBrlCents * 2.5); // estimativa (2.5x o preço da China)
    
    // Calcular custo total de importação (preço + 60% imposto + 5.38% IOF + frete)
    const importTax = Math.round(priceBrlCents * 0.60);
    const iof = Math.round(priceBrlCents * 0.0538);
    const shipping = Math.round(5 * exchangeRate * 100); // $5 de frete
    const totalImportCostCents = priceBrlCents + importTax + iof + shipping;
    
    // Calcular margem
    const profitMargin = ((avgPriceBrCents - totalImportCostCents) / totalImportCostCents) * 100;
    
    // Calcular score de oportunidade
    const opportunityScore = Math.min(100, Math.max(0, Math.round(
      (profitMargin * 0.6) + // 60% peso na margem
      (product.rating * 10) + // 20% peso no rating (rating 0-5 * 10 = 0-50)
      (Math.min(product.orders / 100, 30)) // 20% peso em pedidos (máx 30 pontos)
    )));
    
    const isViable = profitMargin > 30 && product.rating >= 4.0;
    
    let recommendation = "";
    if (profitMargin > 60) {
      recommendation = `Excelente! Margem de ${profitMargin.toFixed(1)}% - Alta lucratividade`;
    } else if (profitMargin > 30) {
      recommendation = `Bom! Margem de ${profitMargin.toFixed(1)}% - Lucratividade moderada`;
    } else {
      recommendation = `Margem baixa (${profitMargin.toFixed(1)}%). Considere outros produtos.`;
    }
    
    let competitionLevel = "Média";
    if (product.orders > 1000) competitionLevel = "Alta";
    else if (product.orders < 100) competitionLevel = "Baixa";
    
    const bestChinaPrice: PlatformPrice = {
      platform: "AliExpress",
      priceUsd: priceUsdCents,
      priceBrl: priceBrlCents,
      rating: Math.round(product.rating * 10), // 4.5 -> 45
      sellers: product.orders,
      shippingDays: 20,
      isBestPrice: true,
    };
    
    return {
      title: product.title,
      category: "Importação",
      chinaPrices: [bestChinaPrice],
      bestChinaPrice,
      brazilPrices: [
        {
          platform: "Mercado Livre",
          priceUsd: 0,
          priceBrl: avgPriceBrCents,
          rating: 40,
          sellers: 50,
          shippingDays: 0,
          isBestPrice: false,
        }
      ],
      avgPriceBr: avgPriceBrCents,
      amazonData: amazonProducts.length > 0 ? {
        avgPrice: Math.round(avgPriceAmazonBr * 100),
        productCount: amazonProducts.length,
        searchUrl: `https://www.amazon.com.br/s?k=${encodeURIComponent(searchTerm)}`,
        priceRange: {
          min: Math.round(Math.min(...amazonProducts.map(p => p.price)) * 100),
          max: Math.round(Math.max(...amazonProducts.map(p => p.price)) * 100),
        },
      } : undefined,
      totalImportCost: totalImportCostCents,
      profitMargin,
      opportunityScore,
      isViable,
      competitionLevel,
      recommendation,
      imageUrl: product.image || `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.title)}`,
    };
  });
}

/**
 * Gera sugestões básicas caso a IA falhe
 */
function generateFallbackSuggestions(
  searchTerm: string,
  exchangeRate: number
): ProductSuggestion[] {
  const basePrice = 1000; // $10 USD
  const basePriceBrl = Math.round(basePrice * exchangeRate / 100);
  
  return [
    {
      title: `${searchTerm} - Modelo Básico`,
      category: "Geral",
      chinaPrices: [
        {
          platform: "AliExpress",
          priceUsd: basePrice,
          priceBrl: basePriceBrl * 100,
          rating: 42,
          sellers: 50,
          shippingDays: 20,
          isBestPrice: true
        }
      ],
      bestChinaPrice: {
        platform: "AliExpress",
        priceUsd: basePrice,
        priceBrl: basePriceBrl * 100,
        rating: 42,
        sellers: 50,
        shippingDays: 20,
        isBestPrice: true
      },
      brazilPrices: [
        {
          platform: "Mercado Livre",
          priceUsd: 0,
          priceBrl: Math.round(basePriceBrl * 100 * 1.7),
          rating: 40,
          sellers: 25,
          shippingDays: 0,
          isBestPrice: false
        }
      ],
      avgPriceBr: Math.round(basePriceBrl * 100 * 1.7),
      totalImportCost: Math.round(basePriceBrl * 100 * 1.7),
      profitMargin: 15.5,
      opportunityScore: 55,
      isViable: false,
      competitionLevel: "Média",
      recommendation: "Margem baixa. Considere produtos com maior diferencial.",
      imageUrl: "https://via.placeholder.com/300x300?text=" + encodeURIComponent(searchTerm)
    }
  ];
}
