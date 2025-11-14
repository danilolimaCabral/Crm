/**
 * Base de Dados de Alíquotas NCM
 * 
 * Contém alíquotas realistas baseadas na Tarifa Externa Comum (TEC) do Mercosul
 * e legislação tributária brasileira vigente.
 * 
 * Fontes:
 * - Receita Federal do Brasil
 * - Resolução GECEX/CAMEX
 * - Tabela TIPI (IPI)
 */

import { TaxRates } from "./taxCalculation";

export interface NCMData extends TaxRates {
  ncm: string;
  description: string;
  category: string;
}

/**
 * Base de dados de NCMs com alíquotas atualizadas
 * 
 * Nota: Esta é uma base simplificada para demonstração.
 * Em produção, deve-se integrar com a API oficial da Receita Federal
 * ou manter uma base completa atualizada periodicamente.
 */
export const NCM_DATABASE: Record<string, NCMData> = {
  // Eletrônicos - Smartphones e Tablets
  "8517.12.31": {
    ncm: "8517.12.31",
    description: "Telefones móveis (smartphones)",
    category: "Eletrônicos",
    ii: 16,      // II: 16%
    ipi: 15,     // IPI: 15%
    pis: 2.1,    // PIS: 2.1%
    cofins: 9.65, // Cofins: 9.65%
    icms: 18,    // ICMS: 18% (varia por estado, usando SP)
  },
  
  "8471.30.12": {
    ncm: "8471.30.12",
    description: "Computadores portáteis (notebooks)",
    category: "Eletrônicos",
    ii: 16,
    ipi: 0,      // Notebooks têm IPI zero
    pis: 2.1,
    cofins: 9.65,
    icms: 18,
  },
  
  "8528.72.00": {
    ncm: "8528.72.00",
    description: "Monitores e televisores LCD/LED",
    category: "Eletrônicos",
    ii: 18,
    ipi: 10,
    pis: 2.1,
    cofins: 9.65,
    icms: 18,
  },
  
  // Relógios e Acessórios
  "9102.11.00": {
    ncm: "9102.11.00",
    description: "Relógios de pulso (smartwatches)",
    category: "Acessórios",
    ii: 18,
    ipi: 15,
    pis: 2.1,
    cofins: 9.65,
    icms: 18,
  },
  
  // Fones de Ouvido
  "8518.30.00": {
    ncm: "8518.30.00",
    description: "Fones de ouvido e auriculares",
    category: "Áudio",
    ii: 16,
    ipi: 12,
    pis: 2.1,
    cofins: 9.65,
    icms: 18,
  },
  
  // Câmeras
  "8525.80.29": {
    ncm: "8525.80.29",
    description: "Câmeras digitais e filmadoras",
    category: "Fotografia",
    ii: 18,
    ipi: 15,
    pis: 2.1,
    cofins: 9.65,
    icms: 18,
  },
  
  // Brinquedos
  "9503.00.10": {
    ncm: "9503.00.10",
    description: "Brinquedos eletrônicos",
    category: "Brinquedos",
    ii: 20,
    ipi: 30,
    pis: 2.1,
    cofins: 9.65,
    icms: 18,
  },
  
  // Roupas
  "6109.10.00": {
    ncm: "6109.10.00",
    description: "Camisetas de malha de algodão",
    category: "Vestuário",
    ii: 35,      // Têxteis têm II alto para proteção da indústria nacional
    ipi: 0,
    pis: 2.1,
    cofins: 9.65,
    icms: 18,
  },
  
  // Calçados
  "6403.99.00": {
    ncm: "6403.99.00",
    description: "Calçados esportivos",
    category: "Calçados",
    ii: 35,
    ipi: 5,
    pis: 2.1,
    cofins: 9.65,
    icms: 18,
  },
  
  // Cosméticos
  "3304.99.10": {
    ncm: "3304.99.10",
    description: "Produtos de beleza e cosméticos",
    category: "Cosméticos",
    ii: 18,
    ipi: 13,
    pis: 2.1,
    cofins: 9.65,
    icms: 25,    // Cosméticos têm ICMS mais alto em alguns estados
  },
  
  // Baterias e Pilhas
  "8506.50.00": {
    ncm: "8506.50.00",
    description: "Baterias de lítio",
    category: "Energia",
    ii: 14,
    ipi: 10,
    pis: 2.1,
    cofins: 9.65,
    icms: 18,
  },
  
  // Ferramentas Elétricas
  "8467.21.00": {
    ncm: "8467.21.00",
    description: "Furadeiras elétricas",
    category: "Ferramentas",
    ii: 14,
    ipi: 10,
    pis: 2.1,
    cofins: 9.65,
    icms: 18,
  },
  
  // Utensílios Domésticos
  "8516.60.00": {
    ncm: "8516.60.00",
    description: "Fornos e micro-ondas elétricos",
    category: "Eletrodomésticos",
    ii: 20,
    ipi: 10,
    pis: 2.1,
    cofins: 9.65,
    icms: 18,
  },
  
  // Livros (Exemplo de produto com alíquotas reduzidas)
  "4901.99.00": {
    ncm: "4901.99.00",
    description: "Livros impressos",
    category: "Livros",
    ii: 0,       // Livros têm II zero
    ipi: 0,      // IPI zero
    pis: 0,      // PIS zero
    cofins: 0,   // Cofins zero
    icms: 0,     // ICMS zero (imunidade constitucional)
  },
};

/**
 * Busca alíquotas por código NCM
 */
export function getTaxRatesByNCM(ncm: string): TaxRates {
  const data = NCM_DATABASE[ncm];
  
  if (data) {
    return {
      ii: data.ii,
      ipi: data.ipi,
      pis: data.pis,
      cofins: data.cofins,
      icms: data.icms,
    };
  }
  
  // Alíquotas padrão caso NCM não seja encontrado
  // (valores médios conservadores)
  return {
    ii: 16,
    ipi: 10,
    pis: 2.1,
    cofins: 9.65,
    icms: 18,
  };
}

/**
 * Busca informações completas por NCM
 */
export function getNCMData(ncm: string): NCMData | null {
  return NCM_DATABASE[ncm] || null;
}

/**
 * Busca NCMs por categoria
 */
export function getNCMsByCategory(category: string): NCMData[] {
  return Object.values(NCM_DATABASE).filter(data => data.category === category);
}

/**
 * Lista todas as categorias disponíveis
 */
export function getAllCategories(): string[] {
  const categories = new Set(Object.values(NCM_DATABASE).map(data => data.category));
  return Array.from(categories).sort();
}

/**
 * Busca NCM por descrição (busca parcial, case-insensitive)
 */
export function searchNCMByDescription(query: string): NCMData[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(NCM_DATABASE).filter(data => 
    data.description.toLowerCase().includes(lowerQuery)
  );
}
