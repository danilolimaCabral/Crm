/**
 * Módulo de Análise de Importação
 * Contém toda a lógica de busca, cálculo e análise de viabilidade
 */

// Configurações
const CONFIG = {
  TAXA_IMPORTACAO: 0.60,
  IOF_CARTAO: 0.0538,
  FRETE_INTERNACIONAL: 50.00,
  MARGEM_MINIMA_LUCRO: 30.0,
  LIMITE_VENDEDORES_SATURADO: 500,
};

// Tipos
export interface ProductChina {
  plataforma: string;
  titulo: string;
  preco_usd: number;
  avaliacao: number;
  imagem?: string;
}

export interface ProductBrazil {
  plataforma: string;
  preco_brl: number;
  vendedores: number;
  avaliacao: number;
}

export interface AnalysisResult {
  searchTerm: string;
  productChina: ProductChina;
  custos: {
    preco_produto_brl: number;
    imposto_importacao: number;
    iof: number;
    frete_internacional: number;
    custo_total: number;
  };
  analise_mercado: {
    preco_medio_ponderado: number;
    preco_minimo: number;
    preco_maximo: number;
    total_vendedores: number;
    concorrencia: string;
    nivel_concorrencia: string;
    avaliacao_media: number;
    detalhes_plataformas: ProductBrazil[];
  };
  lucro_bruto: number;
  margem_lucro_percentual: number;
  score_oportunidade: number;
  viavel: boolean;
  recomendacao: string;
}

// Banco de dados de produtos simulados
const PRODUTOS_CHINA: Record<string, ProductChina[]> = {
  "fone bluetooth": [
    { plataforma: "Taobao", titulo: "耳机 TWS Pro (Fone TWS Pro)", preco_usd: 17.00, avaliacao: 4.9, imagem: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400" },
    { plataforma: "AliExpress", titulo: "Fone TWS Pro Max 5.3", preco_usd: 18.50, avaliacao: 4.8, imagem: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400" },
    { plataforma: "Temu", titulo: "Fone Bluetooth TWS Pro", preco_usd: 19.90, avaliacao: 4.5, imagem: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400" },
  ],
  "smartwatch": [
    { plataforma: "Taobao", titulo: "智能手表 (Smartwatch Premium)", preco_usd: 30.00, avaliacao: 4.8, imagem: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400" },
    { plataforma: "AliExpress", titulo: "Smartwatch Ultra 2 Pro", preco_usd: 35.00, avaliacao: 4.6, imagem: "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=400" },
    { plataforma: "Temu", titulo: "Relógio Inteligente Fitness", preco_usd: 32.00, avaliacao: 4.4, imagem: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400" },
  ],
  "caixa de som": [
    { plataforma: "AliExpress", titulo: "Caixa Som BT 5.1 Prova D'água 20W", preco_usd: 22.00, avaliacao: 4.7, imagem: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400" },
    { plataforma: "Temu", titulo: "Caixa Som Portátil BT", preco_usd: 24.50, avaliacao: 4.6, imagem: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=400" },
  ],
  "câmera": [
    { plataforma: "AliExpress", titulo: "Câmera IP WiFi 1080p Visão Noturna", preco_usd: 25.00, avaliacao: 4.7, imagem: "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=400" },
  ],
  "mouse gamer": [
    { plataforma: "AliExpress", titulo: "Mouse Gamer RGB 16000 DPI", preco_usd: 15.00, avaliacao: 4.6, imagem: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400" },
    { plataforma: "Temu", titulo: "Mouse Gaming Pro RGB", preco_usd: 13.50, avaliacao: 4.5, imagem: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400" },
  ],
  "teclado mecânico": [
    { plataforma: "AliExpress", titulo: "Teclado Mecânico RGB Switch Blue", preco_usd: 45.00, avaliacao: 4.7, imagem: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400" },
    { plataforma: "Taobao", titulo: "机械键盘 (Teclado Mecânico Pro)", preco_usd: 42.00, avaliacao: 4.8, imagem: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=400" },
  ],
};

const PRODUTOS_BRASIL: Record<string, ProductBrazil[]> = {
  "fone bluetooth": [
    { plataforma: "Mercado Livre", preco_brl: 189.90, vendedores: 320, avaliacao: 4.3 },
    { plataforma: "Amazon BR", preco_brl: 219.00, vendedores: 85, avaliacao: 4.5 },
    { plataforma: "Magazine Luiza", preco_brl: 249.90, vendedores: 45, avaliacao: 4.2 },
  ],
  "smartwatch": [
    { plataforma: "Mercado Livre", preco_brl: 299.00, vendedores: 450, avaliacao: 4.2 },
    { plataforma: "Amazon BR", preco_brl: 349.00, vendedores: 120, avaliacao: 4.4 },
    { plataforma: "Magazine Luiza", preco_brl: 379.00, vendedores: 60, avaliacao: 4.1 },
  ],
  "caixa de som": [
    { plataforma: "Mercado Livre", preco_brl: 199.90, vendedores: 250, avaliacao: 4.4 },
    { plataforma: "Amazon BR", preco_brl: 219.00, vendedores: 80, avaliacao: 4.6 },
    { plataforma: "Magazine Luiza", preco_brl: 249.90, vendedores: 35, avaliacao: 4.3 },
  ],
  "câmera": [
    { plataforma: "Mercado Livre", preco_brl: 289.90, vendedores: 180, avaliacao: 4.5 },
    { plataforma: "Amazon BR", preco_brl: 319.00, vendedores: 65, avaliacao: 4.7 },
    { plataforma: "Magazine Luiza", preco_brl: 349.90, vendedores: 30, avaliacao: 4.4 },
  ],
  "mouse gamer": [
    { plataforma: "Mercado Livre", preco_brl: 149.90, vendedores: 380, avaliacao: 4.3 },
    { plataforma: "Amazon BR", preco_brl: 169.00, vendedores: 95, avaliacao: 4.5 },
    { plataforma: "Magazine Luiza", preco_brl: 189.90, vendedores: 50, avaliacao: 4.2 },
  ],
  "teclado mecânico": [
    { plataforma: "Mercado Livre", preco_brl: 399.00, vendedores: 280, avaliacao: 4.4 },
    { plataforma: "Amazon BR", preco_brl: 449.00, vendedores: 110, avaliacao: 4.6 },
    { plataforma: "Magazine Luiza", preco_brl: 479.90, vendedores: 45, avaliacao: 4.3 },
  ],
};

// Funções de busca
export function buscarMelhorOpcaoChina(termo: string): ProductChina | null {
  const termoLower = termo.toLowerCase();
  
  for (const [chave, produtos] of Object.entries(PRODUTOS_CHINA)) {
    if (termoLower.includes(chave)) {
      // Retorna o produto com melhor custo-benefício (menor preço com boa avaliação)
      const melhor = produtos.reduce((prev, curr) => {
        const scorePrev = prev.preco_usd / prev.avaliacao;
        const scoreCurr = curr.preco_usd / curr.avaliacao;
        return scoreCurr < scorePrev ? curr : prev;
      });
      return melhor;
    }
  }
  
  return null;
}

export function buscarPrecosBrasil(termo: string): ProductBrazil[] {
  const termoLower = termo.toLowerCase();
  
  for (const [chave, produtos] of Object.entries(PRODUTOS_BRASIL)) {
    if (termoLower.includes(chave)) {
      return produtos;
    }
  }
  
  return [];
}

// Funções de cálculo
export function calcularCustoImportacao(preco_usd: number, cambio: number) {
  const preco_brl = preco_usd * cambio;
  const imposto_importacao = preco_brl * CONFIG.TAXA_IMPORTACAO;
  const iof = preco_brl * CONFIG.IOF_CARTAO;
  const frete = CONFIG.FRETE_INTERNACIONAL;
  
  const custo_total = preco_brl + imposto_importacao + iof + frete;
  
  return {
    preco_produto_brl: preco_brl,
    imposto_importacao,
    iof,
    frete_internacional: frete,
    custo_total,
  };
}

export function analisarMercadoBrasileiro(resultados_br: ProductBrazil[]) {
  if (resultados_br.length === 0) {
    return {
      preco_medio_ponderado: 0,
      preco_minimo: 0,
      preco_maximo: 0,
      concorrencia: "Inexistente",
      nivel_concorrencia: "verde",
      total_vendedores: 0,
      avaliacao_media: 0,
      detalhes_plataformas: [],
    };
  }
  
  const total_vendedores = resultados_br.reduce((sum, p) => sum + p.vendedores, 0);
  const soma_ponderada = resultados_br.reduce((sum, p) => sum + (p.preco_brl * p.vendedores), 0);
  const preco_medio_ponderado = soma_ponderada / total_vendedores;
  
  const precos = resultados_br.map(p => p.preco_brl);
  const avaliacoes = resultados_br.map(p => p.avaliacao);
  
  let concorrencia: string;
  let nivel: string;
  
  if (total_vendedores < 100) {
    concorrencia = "Baixa (Excelente Potencial! 💚)";
    nivel = "verde";
  } else if (total_vendedores < 300) {
    concorrencia = "Média-Baixa (Bom Potencial 🟢)";
    nivel = "amarelo";
  } else if (total_vendedores < 500) {
    concorrencia = "Média (Viável, mas competitivo 🟡)";
    nivel = "amarelo";
  } else {
    concorrencia = "Alta (Mercado Saturado 🔴)";
    nivel = "vermelho";
  }
  
  return {
    preco_medio_ponderado,
    preco_minimo: Math.min(...precos),
    preco_maximo: Math.max(...precos),
    concorrencia,
    nivel_concorrencia: nivel,
    total_vendedores,
    avaliacao_media: avaliacoes.reduce((sum, a) => sum + a, 0) / avaliacoes.length,
    detalhes_plataformas: resultados_br,
  };
}

export function gerarRelatorioViabilidade(
  searchTerm: string,
  produto_china: ProductChina | null,
  analise_mercado: ReturnType<typeof analisarMercadoBrasileiro>,
  cambio: number
): AnalysisResult | null {
  if (!produto_china || analise_mercado.preco_medio_ponderado === 0) {
    return null;
  }
  
  const custos = calcularCustoImportacao(produto_china.preco_usd, cambio);
  
  const preco_venda_sugerido = analise_mercado.preco_medio_ponderado;
  const lucro_bruto = preco_venda_sugerido - custos.custo_total;
  const margem_lucro_percentual = (lucro_bruto / preco_venda_sugerido) * 100;
  
  // Cálculo do Score de Oportunidade
  const score_margem = Math.min((margem_lucro_percentual / 50) * 60, 60);
  
  let score_concorrencia = 5;
  if (analise_mercado.nivel_concorrencia === "verde") {
    score_concorrencia = 30;
  } else if (analise_mercado.nivel_concorrencia === "amarelo") {
    score_concorrencia = 15;
  }
  
  const score_avaliacao = (produto_china.avaliacao / 5.0) * 10;
  const score_oportunidade = score_margem + score_concorrencia + score_avaliacao;
  
  const viavel = 
    margem_lucro_percentual >= CONFIG.MARGEM_MINIMA_LUCRO &&
    analise_mercado.total_vendedores < CONFIG.LIMITE_VENDEDORES_SATURADO;
  
  let recomendacao: string;
  if (score_oportunidade >= 80) {
    recomendacao = "EXCELENTE OPORTUNIDADE! 🌟";
  } else if (score_oportunidade >= 60) {
    recomendacao = "BOA OPORTUNIDADE 💚";
  } else if (score_oportunidade >= 40) {
    recomendacao = "OPORTUNIDADE MODERADA 🟡";
  } else {
    recomendacao = "OPORTUNIDADE FRACA 🔴";
  }
  
  return {
    searchTerm,
    productChina: produto_china,
    custos,
    analise_mercado,
    lucro_bruto,
    margem_lucro_percentual,
    score_oportunidade,
    viavel,
    recomendacao,
  };
}

// Função principal de análise
export function analisarProduto(searchTerm: string, exchangeRate: number): AnalysisResult | null {
  const produto_china = buscarMelhorOpcaoChina(searchTerm);
  const produtos_brasil = buscarPrecosBrasil(searchTerm);
  const analise_mercado = analisarMercadoBrasileiro(produtos_brasil);
  
  return gerarRelatorioViabilidade(searchTerm, produto_china, analise_mercado, exchangeRate);
}
