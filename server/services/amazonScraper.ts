/**
 * Amazon Brasil Scraper
 * Busca produtos reais na Amazon BR para comparação de preços
 */

import { cache, CacheService } from "./cache";

export interface AmazonProduct {
  id: string;
  title: string;
  price: number; // em BRL
  image: string;
  url: string;
  rating: number; // 0-5
  reviewCount: number;
  prime: boolean;
}

/**
 * Busca produtos na Amazon BR
 * Com cache de 1 hora para otimizar requisições
 * 
 * NOTA: Por enquanto usa dados simulados realistas
 * TODO: Integrar com API real quando disponível
 */
export async function searchAmazonBR(query: string, page: number = 1): Promise<AmazonProduct[]> {
  // Gerar chave de cache
  const cacheKey = CacheService.generateKey("amazon-br:search", query, page);
  
  // Tentar recuperar do cache
  const cachedData = await cache.get<AmazonProduct[]>(cacheKey);
  if (cachedData) {
    console.log(`[Amazon BR] Retornando ${cachedData.length} produtos do cache`);
    return cachedData;
  }
  
  console.log(`[Amazon BR] Buscando produtos para "${query}"...`);
  
  try {
    // TODO: Integrar com API real da Amazon
    // Por enquanto, gerar dados simulados realistas
    const products = generateSimulatedAmazonProducts(query);
    
    console.log(`[Amazon BR] ${products.length} produtos encontrados para "${query}"`);
    
    // Salvar no cache por 1 hora (3600 segundos)
    if (products.length > 0) {
      await cache.set(cacheKey, products, 3600);
    }
    
    return products;
  } catch (error) {
    console.error("[Amazon BR] Erro ao buscar produtos:", error);
    return [];
  }
}

/**
 * Gera produtos simulados realistas da Amazon BR
 * TODO: Substituir por scraping/API real
 */
function generateSimulatedAmazonProducts(query: string): AmazonProduct[] {
  const basePrice = 50 + Math.random() * 200; // R$ 50-250
  
  const products: AmazonProduct[] = [];
  
  for (let i = 0; i < 5; i++) {
    const priceVariation = 1 + (Math.random() * 0.5 - 0.25); // ±25%
    const price = basePrice * priceVariation;
    
    products.push({
      id: `amazon-br-${Date.now()}-${i}`,
      title: `${query} - Modelo ${i + 1}`,
      price: Math.round(price * 100) / 100, // 2 casas decimais
      image: `https://via.placeholder.com/300x300?text=${encodeURIComponent(query)}+${i + 1}`,
      url: `https://www.amazon.com.br/s?k=${encodeURIComponent(query)}`,
      rating: 3.5 + Math.random() * 1.5, // 3.5-5.0
      reviewCount: Math.floor(50 + Math.random() * 500), // 50-550 avaliações
      prime: Math.random() > 0.3, // 70% tem Prime
    });
  }
  
  return products;
}

/**
 * Busca produto específico por ID/ASIN
 */
export async function getAmazonProduct(asin: string): Promise<AmazonProduct | null> {
  const cacheKey = CacheService.generateKey("amazon-br:product", asin);
  
  const cachedData = await cache.get<AmazonProduct>(cacheKey);
  if (cachedData) {
    console.log(`[Amazon BR] Produto ${asin} recuperado do cache`);
    return cachedData;
  }
  
  try {
    // TODO: Implementar busca por ASIN
    console.log(`[Amazon BR] Buscando produto ${asin}...`);
    return null;
  } catch (error) {
    console.error(`[Amazon BR] Erro ao buscar produto ${asin}:`, error);
    return null;
  }
}

/**
 * Calcula preço médio dos produtos
 */
export function calculateAveragePrice(products: AmazonProduct[]): number {
  if (products.length === 0) return 0;
  
  const total = products.reduce((sum, p) => sum + p.price, 0);
  return total / products.length;
}

/**
 * Filtra produtos por faixa de preço
 */
export function filterByPriceRange(
  products: AmazonProduct[],
  minPrice: number,
  maxPrice: number
): AmazonProduct[] {
  return products.filter(p => p.price >= minPrice && p.price <= maxPrice);
}

/**
 * Ordena produtos por preço
 */
export function sortByPrice(products: AmazonProduct[], ascending: boolean = true): AmazonProduct[] {
  return [...products].sort((a, b) => {
    return ascending ? a.price - b.price : b.price - a.price;
  });
}

/**
 * Ordena produtos por avaliação
 */
export function sortByRating(products: AmazonProduct[], descending: boolean = true): AmazonProduct[] {
  return [...products].sort((a, b) => {
    return descending ? b.rating - a.rating : a.rating - b.rating;
  });
}
