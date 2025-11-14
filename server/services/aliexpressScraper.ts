/**
 * AliExpress Scraper usando RapidAPI
 * Busca produtos reais com imagens, preços e avaliações
 */

import { ENV } from "../_core/env";
import { cache, CacheService } from "./cache";

export interface AliExpressProduct {
  id: string;
  title: string;
  price: number;
  currency: string;
  image: string;
  url: string;
  rating: number;
  orders: number;
  shipping: string;
}

/**
 * Busca produtos no AliExpress via RapidAPI
 * Com cache de 1 hora para otimizar requisições
 */
export async function searchAliExpress(query: string, page: number = 1): Promise<AliExpressProduct[]> {
  // Gerar chave de cache
  const cacheKey = CacheService.generateKey("aliexpress:search", query, page);
  
  // Tentar recuperar do cache
  const cachedData = await cache.get<AliExpressProduct[]>(cacheKey);
  if (cachedData) {
    console.log(`[AliExpress] Retornando ${cachedData.length} produtos do cache`);
    return cachedData;
  }
  
  const rapidApiKey = ENV.rapidApiKey;

  if (!rapidApiKey) {
    console.warn("[AliExpress] RapidAPI key não configurada, retornando array vazio");
    return [];
  }

  try {
    const url = `https://ali-express1.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=${page}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-host": "ali-express1.p.rapidapi.com",
        "x-rapidapi-key": rapidApiKey,
      },
    });

    if (!response.ok) {
      console.error(`[AliExpress] Erro HTTP ${response.status}: ${response.statusText}`);
      return [];
    }

    const data = await response.json();

    // Mapear resposta da API para formato padronizado
    const products: AliExpressProduct[] = (data.results || []).map((item: any) => ({
      id: item.product_id || item.id || String(Math.random()),
      title: item.product_title || item.title || "Produto sem título",
      price: parseFloat(item.product_price || item.price || "0"),
      currency: item.product_currency || "USD",
      image: item.product_main_image_url || item.image || "",
      url: item.product_detail_url || item.url || "",
      rating: parseFloat(item.product_star_rating || item.rating || "0"),
      orders: parseInt(item.product_num_reviews || item.orders || "0"),
      shipping: item.shipping || "Free Shipping",
    }));

    console.log(`[AliExpress] ${products.length} produtos encontrados para "${query}"`);
    
    // Salvar no cache por 1 hora (3600 segundos)
    if (products.length > 0) {
      await cache.set(cacheKey, products, 3600);
    }
    
    return products;
  } catch (error) {
    console.error("[AliExpress] Erro ao buscar produtos:", error);
    return [];
  }
}
