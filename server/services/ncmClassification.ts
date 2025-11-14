/**
 * Serviço de Classificação Automática de NCM usando IA
 * Analisa descrição do produto e sugere código NCM correto
 */

import { invokeLLM } from "../_core/llm";

interface NCMSuggestion {
  ncm: string;
  description: string;
  confidence: number;
  aliquotas: {
    ii: number;
    ipi: number;
    pis: number;
    cofins: number;
    icms: number;
  };
  reasoning: string;
}

/**
 * Classifica automaticamente o NCM baseado na descrição do produto
 * @param productDescription Descrição detalhada do produto
 * @returns Sugestão de NCM com alíquotas e justificativa
 */
export async function classifyNCM(productDescription: string): Promise<NCMSuggestion> {
  try {
    const prompt = `Você é um especialista em classificação fiscal de mercadorias (NCM - Nomenclatura Comum do Mercosul).

Analise a descrição do produto abaixo e sugira o código NCM mais adequado (8 dígitos).

**Descrição do Produto:**
${productDescription}

**Instruções:**
1. Identifique a categoria principal do produto (eletrônicos, têxteis, alimentos, etc)
2. Determine o código NCM de 8 dígitos mais específico
3. Forneça a descrição oficial do NCM
4. Estime as alíquotas típicas para este NCM:
   - II (Imposto de Importação): geralmente 10-35%
   - IPI (Imposto sobre Produtos Industrializados): 0-30%
   - PIS: 2,1% (padrão)
   - Cofins: 9,65% (padrão)
   - ICMS: 18% (padrão)
5. Explique brevemente por que este NCM é o mais adequado

**Retorne APENAS um JSON válido neste formato:**
{
  "ncm": "8517.12.31",
  "description": "Telefones celulares",
  "confidence": 95,
  "aliquotas": {
    "ii": 16,
    "ipi": 15,
    "pis": 2.1,
    "cofins": 9.65,
    "icms": 18
  },
  "reasoning": "Este NCM é adequado porque..."
}`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um especialista em classificação fiscal NCM. Retorne APENAS JSON válido, sem markdown ou explicações adicionais.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "ncm_classification",
          strict: true,
          schema: {
            type: "object",
            properties: {
              ncm: {
                type: "string",
                description: "Código NCM de 8 dígitos (ex: 8517.12.31)",
              },
              description: {
                type: "string",
                description: "Descrição oficial do NCM",
              },
              confidence: {
                type: "number",
                description: "Nível de confiança da classificação (0-100)",
              },
              aliquotas: {
                type: "object",
                properties: {
                  ii: { type: "number" },
                  ipi: { type: "number" },
                  pis: { type: "number" },
                  cofins: { type: "number" },
                  icms: { type: "number" },
                },
                required: ["ii", "ipi", "pis", "cofins", "icms"],
                additionalProperties: false,
              },
              reasoning: {
                type: "string",
                description: "Justificativa da classificação",
              },
            },
            required: ["ncm", "description", "confidence", "aliquotas", "reasoning"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    if (!content || typeof content !== 'string') {
      throw new Error("IA não retornou conteúdo válido");
    }

    const suggestion: NCMSuggestion = JSON.parse(content);

    console.log(`[NCM Classification] Sugestão para "${productDescription}": ${suggestion.ncm} (${suggestion.confidence}% confiança)`);

    return suggestion;

  } catch (error) {
    console.error("[NCM Classification] Erro ao classificar:", error);
    
    // Fallback: retorna sugestão genérica
    return {
      ncm: "0000.00.00",
      description: "Classificação não disponível - consulte um despachante",
      confidence: 0,
      aliquotas: {
        ii: 16,
        ipi: 15,
        pis: 2.1,
        cofins: 9.65,
        icms: 18,
      },
      reasoning: "Não foi possível classificar automaticamente. Recomendamos consultar um despachante aduaneiro.",
    };
  }
}
