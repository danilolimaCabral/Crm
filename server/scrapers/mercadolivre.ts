/**
 * Web Scraper para Mercado Livre
 * Extrai informações de produtos de forma ética e respeitando robots.txt
 */

import axios from "axios";
import * as cheerio from "cheerio";

export interface MercadoLivreProduct {
  titulo: string;
  preco: number;
  link: string;
  imagem?: string;
  vendedor?: string;
  avaliacao?: number;
}

/**
 * Busca produtos no Mercado Livre
 * @param searchTerm Termo de busca
 * @param limit Número máximo de resultados
 */
export async function buscarMercadoLivre(
  searchTerm: string,
  limit: number = 10
): Promise<MercadoLivreProduct[]> {
  try {
    // Usar a API pública do Mercado Livre (mais confiável que scraping)
    const searchUrl = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(searchTerm)}&limit=${limit}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        "User-Agent": "ImportadorInteligente/1.0 (Educational Purpose)",
      },
      timeout: 10000,
    });

    if (!response.data || !response.data.results) {
      return [];
    }

    const produtos: MercadoLivreProduct[] = response.data.results.map((item: any) => ({
      titulo: item.title || "Produto sem título",
      preco: item.price || 0,
      link: item.permalink || "",
      imagem: item.thumbnail || undefined,
      vendedor: item.seller?.nickname || undefined,
      avaliacao: item.seller?.seller_reputation?.level_id 
        ? parseSellerReputation(item.seller.seller_reputation.level_id)
        : undefined,
    }));

    return produtos;
  } catch (error) {
    console.error("[Scraper ML] Erro ao buscar produtos:", error);
    return [];
  }
}

/**
 * Converte o nível de reputação do vendedor em nota de 1-5
 */
function parseSellerReputation(levelId: string): number {
  const reputationMap: Record<string, number> = {
    "5_green": 5.0,
    "4_light_green": 4.5,
    "3_yellow": 3.5,
    "2_orange": 2.5,
    "1_red": 1.5,
  };
  return reputationMap[levelId] || 3.0;
}

/**
 * Obtém estatísticas de um produto específico
 */
export async function obterEstatisticasProduto(productId: string) {
  try {
    const url = `https://api.mercadolibre.com/items/${productId}`;
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "ImportadorInteligente/1.0 (Educational Purpose)",
      },
      timeout: 10000,
    });

    return {
      vendidos: response.data.sold_quantity || 0,
      disponivel: response.data.available_quantity || 0,
      condicao: response.data.condition || "new",
    };
  } catch (error) {
    console.error("[Scraper ML] Erro ao obter estatísticas:", error);
    return null;
  }
}

/**
 * Calcula estatísticas agregadas de uma busca
 */
export async function calcularEstatisticasBusca(searchTerm: string) {
  const produtos = await buscarMercadoLivre(searchTerm, 50);
  
  if (produtos.length === 0) {
    return {
      precoMedio: 0,
      precoMinimo: 0,
      precoMaximo: 0,
      totalProdutos: 0,
      avaliacaoMedia: 0,
    };
  }

  const precos = produtos.map(p => p.preco).filter(p => p > 0);
  const avaliacoes = produtos.map(p => p.avaliacao).filter(a => a !== undefined) as number[];

  return {
    precoMedio: precos.reduce((sum, p) => sum + p, 0) / precos.length,
    precoMinimo: Math.min(...precos),
    precoMaximo: Math.max(...precos),
    totalProdutos: produtos.length,
    avaliacaoMedia: avaliacoes.length > 0 
      ? avaliacoes.reduce((sum, a) => sum + a, 0) / avaliacoes.length 
      : 0,
  };
}
