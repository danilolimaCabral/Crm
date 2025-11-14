/**
 * Serviço de Cálculo de Impostos de Importação
 * 
 * Implementa as fórmulas oficiais da Receita Federal para cálculo de:
 * - II (Imposto de Importação)
 * - IPI (Imposto sobre Produtos Industrializados)
 * - PIS/Pasep e Cofins
 * - ICMS (Imposto sobre Circulação de Mercadorias e Serviços)
 * 
 * Referências:
 * - Instrução Normativa RFB nº 1.861/2018
 * - Decreto nº 6.759/2009 (Regulamento Aduaneiro)
 */

export interface TaxRates {
  ii: number;      // Imposto de Importação (%)
  ipi: number;     // IPI (%)
  pis: number;     // PIS (%)
  cofins: number;  // Cofins (%)
  icms: number;    // ICMS (%)
}

export interface ImportCosts {
  fobValue: number;              // Valor FOB em BRL
  internationalFreight: number;  // Frete internacional em BRL
  insurance: number;             // Seguro em BRL
  siscomex: number;              // Taxa Siscomex (fixo R$ 214,50)
  storage: number;               // Armazenagem em BRL
  portFees: number;              // Taxas portuárias em BRL
  customsBrokerFees: number;     // Honorários despachante em BRL
  certifications: number;        // Certificações em BRL
}

export interface TaxCalculationResult {
  // Valores base
  fobValue: number;
  customsValue: number;  // Valor Aduaneiro (FOB + frete + seguro)
  
  // Impostos calculados
  ii: number;
  ipi: number;
  pis: number;
  cofins: number;
  icms: number;
  
  // Outros custos
  siscomex: number;
  storage: number;
  portFees: number;
  customsBrokerFees: number;
  certifications: number;
  
  // Totais
  totalTaxes: number;
  totalCosts: number;
  landedCost: number;
  
  // Breakdown percentual
  breakdown: {
    product: number;      // % do valor FOB
    taxes: number;        // % dos impostos
    logistics: number;    // % dos custos logísticos
  };
}

/**
 * Calcula o Valor Aduaneiro (base de cálculo dos impostos)
 * Fórmula: VA = FOB + Frete Internacional + Seguro
 */
export function calculateCustomsValue(costs: ImportCosts): number {
  return costs.fobValue + costs.internationalFreight + costs.insurance;
}

/**
 * Calcula o Imposto de Importação (II)
 * Fórmula: II = Valor Aduaneiro × Alíquota II
 */
export function calculateII(customsValue: number, iiRate: number): number {
  return customsValue * (iiRate / 100);
}

/**
 * Calcula o IPI
 * Fórmula: IPI = (Valor Aduaneiro + II) × Alíquota IPI
 */
export function calculateIPI(customsValue: number, ii: number, ipiRate: number): number {
  return (customsValue + ii) * (ipiRate / 100);
}

/**
 * Calcula PIS/Pasep
 * Fórmula: PIS = Valor Aduaneiro × Alíquota PIS
 */
export function calculatePIS(customsValue: number, pisRate: number): number {
  return customsValue * (pisRate / 100);
}

/**
 * Calcula Cofins
 * Fórmula: Cofins = Valor Aduaneiro × Alíquota Cofins
 */
export function calculateCofins(customsValue: number, cofinsRate: number): number {
  return customsValue * (cofinsRate / 100);
}

/**
 * Calcula ICMS (fórmula "por dentro")
 * Fórmula complexa: ICMS = [(VA + II + IPI + PIS + Cofins + Siscomex + Outras Despesas) ÷ (1 – Alíquota ICMS)] × Alíquota ICMS
 * 
 * Explicação: O ICMS é calculado "por dentro", ou seja, ele próprio faz parte da base de cálculo.
 * Por isso é necessário dividir por (1 - alíquota) antes de multiplicar pela alíquota.
 */
export function calculateICMS(
  customsValue: number,
  ii: number,
  ipi: number,
  pis: number,
  cofins: number,
  otherCosts: number,
  icmsRate: number
): number {
  const baseICMS = customsValue + ii + ipi + pis + cofins + otherCosts;
  return (baseICMS / (1 - icmsRate / 100)) * (icmsRate / 100);
}

/**
 * Calcula todos os impostos e custos de importação
 */
export function calculateImportTaxes(
  costs: ImportCosts,
  rates: TaxRates
): TaxCalculationResult {
  // 1. Calcular Valor Aduaneiro
  const customsValue = calculateCustomsValue(costs);
  
  // 2. Calcular II
  const ii = calculateII(customsValue, rates.ii);
  
  // 3. Calcular IPI
  const ipi = calculateIPI(customsValue, ii, rates.ipi);
  
  // 4. Calcular PIS
  const pis = calculatePIS(customsValue, rates.pis);
  
  // 5. Calcular Cofins
  const cofins = calculateCofins(customsValue, rates.cofins);
  
  // 6. Somar outras despesas para base do ICMS
  const otherCosts = costs.siscomex + costs.storage + costs.portFees + 
                     costs.customsBrokerFees + costs.certifications;
  
  // 7. Calcular ICMS
  const icms = calculateICMS(customsValue, ii, ipi, pis, cofins, otherCosts, rates.icms);
  
  // 8. Calcular totais
  const totalTaxes = ii + ipi + pis + cofins + icms;
  const totalCosts = otherCosts;
  const landedCost = costs.fobValue + totalTaxes + totalCosts + 
                     costs.internationalFreight + costs.insurance;
  
  // 9. Calcular breakdown percentual
  const breakdown = {
    product: (costs.fobValue / landedCost) * 100,
    taxes: (totalTaxes / landedCost) * 100,
    logistics: ((costs.internationalFreight + costs.insurance + totalCosts) / landedCost) * 100,
  };
  
  return {
    fobValue: costs.fobValue,
    customsValue,
    ii,
    ipi,
    pis,
    cofins,
    icms,
    siscomex: costs.siscomex,
    storage: costs.storage,
    portFees: costs.portFees,
    customsBrokerFees: costs.customsBrokerFees,
    certifications: costs.certifications,
    totalTaxes,
    totalCosts,
    landedCost,
    breakdown,
  };
}

/**
 * Calcula impostos para múltiplos itens
 */
export interface QuotationItem {
  description: string;
  ncmCode: string;
  quantity: number;
  unitPriceFob: number;  // Em BRL
  weight?: number;       // Em kg
}

export interface QuotationCalculation {
  items: Array<QuotationItem & TaxCalculationResult & { rates: TaxRates }>;
  totals: {
    fobValue: number;
    customsValue: number;
    totalII: number;
    totalIPI: number;
    totalPIS: number;
    totalCofins: number;
    totalICMS: number;
    totalTaxes: number;
    totalCosts: number;
    landedCost: number;
  };
}

export function calculateQuotation(
  items: QuotationItem[],
  costs: Omit<ImportCosts, 'fobValue'>,
  getRatesForNCM: (ncm: string) => TaxRates
): QuotationCalculation {
  // Calcular FOB total
  const totalFob = items.reduce((sum, item) => sum + (item.unitPriceFob * item.quantity), 0);
  
  // Distribuir custos proporcionalmente pelo valor FOB de cada item
  const itemsWithTaxes = items.map(item => {
    const itemFob = item.unitPriceFob * item.quantity;
    const proportion = itemFob / totalFob;
    
    const itemCosts: ImportCosts = {
      fobValue: itemFob,
      internationalFreight: costs.internationalFreight * proportion,
      insurance: costs.insurance * proportion,
      siscomex: costs.siscomex * proportion,
      storage: costs.storage * proportion,
      portFees: costs.portFees * proportion,
      customsBrokerFees: costs.customsBrokerFees * proportion,
      certifications: costs.certifications * proportion,
    };
    
    const rates = getRatesForNCM(item.ncmCode);
    const result = calculateImportTaxes(itemCosts, rates);
    
    return {
      ...item,
      ...result,
      rates,
      landedCostPerUnit: result.landedCost / item.quantity,
    };
  });
  
  // Calcular totais
  const totals = itemsWithTaxes.reduce((acc, item) => ({
    fobValue: acc.fobValue + item.fobValue,
    customsValue: acc.customsValue + item.customsValue,
    totalII: acc.totalII + item.ii,
    totalIPI: acc.totalIPI + item.ipi,
    totalPIS: acc.totalPIS + item.pis,
    totalCofins: acc.totalCofins + item.cofins,
    totalICMS: acc.totalICMS + item.icms,
    totalTaxes: acc.totalTaxes + item.totalTaxes,
    totalCosts: acc.totalCosts + item.totalCosts,
    landedCost: acc.landedCost + item.landedCost,
  }), {
    fobValue: 0,
    customsValue: 0,
    totalII: 0,
    totalIPI: 0,
    totalPIS: 0,
    totalCofins: 0,
    totalICMS: 0,
    totalTaxes: 0,
    totalCosts: 0,
    landedCost: 0,
  });
  
  return {
    items: itemsWithTaxes,
    totals,
  };
}
