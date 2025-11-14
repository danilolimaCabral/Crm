/**
 * Calculadora de Frete Internacional
 * Compara frete aéreo vs marítimo baseado em peso, volume e valor
 * 
 * Referência: air_vs_sea_summary.pdf
 * - Marítimo: 4-6x mais barato que aéreo
 * - Aéreo: poucos dias | Marítimo: várias semanas
 * - Recomendação: aéreo se frete < 15-20% do valor da mercadoria
 */

export interface ShippingOption {
  type: "air" | "sea" | "lcl_express";
  costUsd: number;
  costBrl: number;
  daysMin: number;
  daysMax: number;
  recommended: boolean;
  reason: string;
}

export interface ShippingCalculation {
  productValueUsd: number;
  weightKg: number;
  options: ShippingOption[];
  bestOption: ShippingOption;
}

/**
 * Calcula opções de frete internacional
 */
export function calculateShipping(
  productValueUsd: number,
  weightKg: number,
  exchangeRate: number
): ShippingCalculation {
  
  // Frete marítimo (base: US$ 195 para embarque padrão)
  // Custo aumenta com peso, mas proporcionalmente menos que aéreo
  const seaBaseUsd = 195;
  const seaCostPerKg = 2; // US$ 2 por kg adicional após 50kg
  const seaCostUsd = weightKg <= 50 
    ? seaBaseUsd 
    : seaBaseUsd + (weightKg - 50) * seaCostPerKg;
  
  // Frete aéreo (base: US$ 400 para 85kg via LCL)
  // Custo sobe rapidamente com peso
  const airCostPerKg = 7; // US$ 7 por kg (mais caro)
  const airCostUsd = weightKg * airCostPerKg;
  
  // LCL Expresso (meio termo)
  const lclExpressCostUsd = seaCostUsd * 1.5; // 50% mais caro que marítimo normal
  
  // Converter para BRL
  const seaCostBrl = seaCostUsd * exchangeRate;
  const airCostBrl = airCostUsd * exchangeRate;
  const lclExpressCostBrl = lclExpressCostUsd * exchangeRate;
  
  // Calcular percentual do frete em relação ao valor da mercadoria
  const seaPercentage = (seaCostUsd / productValueUsd) * 100;
  const airPercentage = (airCostUsd / productValueUsd) * 100;
  const lclExpressPercentage = (lclExpressCostUsd / productValueUsd) * 100;
  
  // Criar opções
  const options: ShippingOption[] = [
    {
      type: "sea",
      costUsd: seaCostUsd,
      costBrl: seaCostBrl,
      daysMin: 25,
      daysMax: 40,
      recommended: seaPercentage < 15 || weightKg > 100,
      reason: seaPercentage < 15 
        ? `Mais econômico (${seaPercentage.toFixed(1)}% do valor)` 
        : weightKg > 100
        ? `Ideal para volumes grandes (${weightKg}kg)`
        : `Frete representa ${seaPercentage.toFixed(1)}% do valor`,
    },
    {
      type: "lcl_express",
      costUsd: lclExpressCostUsd,
      costBrl: lclExpressCostBrl,
      daysMin: 15,
      daysMax: 25,
      recommended: lclExpressPercentage >= 15 && lclExpressPercentage < 20,
      reason: `Equilíbrio entre custo e prazo (${lclExpressPercentage.toFixed(1)}% do valor)`,
    },
    {
      type: "air",
      costUsd: airCostUsd,
      costBrl: airCostBrl,
      daysMin: 3,
      daysMax: 7,
      recommended: airPercentage < 15 && weightKg < 50,
      reason: airPercentage < 15 
        ? `Rápido e viável (${airPercentage.toFixed(1)}% do valor)` 
        : `Frete alto (${airPercentage.toFixed(1)}% do valor) - considere marítimo`,
    },
  ];
  
  // Determinar melhor opção
  // Regra: se aéreo < 15-20% do valor E peso < 50kg → aéreo
  // Caso contrário → marítimo
  let bestOption: ShippingOption;
  
  if (airPercentage < 15 && weightKg < 50) {
    bestOption = options.find(o => o.type === "air")!;
  } else if (lclExpressPercentage < 20 && weightKg < 100) {
    bestOption = options.find(o => o.type === "lcl_express")!;
  } else {
    bestOption = options.find(o => o.type === "sea")!;
  }
  
  bestOption.recommended = true;
  
  return {
    productValueUsd,
    weightKg,
    options,
    bestOption,
  };
}

/**
 * Formata opção de frete para exibição
 */
export function formatShippingOption(option: ShippingOption): string {
  const typeNames = {
    air: "Aéreo",
    sea: "Marítimo",
    lcl_express: "LCL Expresso",
  };
  
  return `${typeNames[option.type]}: R$ ${option.costBrl.toFixed(2)} (${option.daysMin}-${option.daysMax} dias) - ${option.reason}`;
}
