/**
 * Serviço de Chat com IA (OpenAI)
 * Assistente especializado em importação e análise de produtos
 */

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.BUILT_IN_FORGE_API_KEY,
  baseURL: process.env.BUILT_IN_FORGE_API_URL,
});

const SYSTEM_PROMPT = `Você é um assistente especializado em importação de produtos da China para o Brasil.

Seu papel é ajudar importadores a:
- Entender os cálculos de impostos e custos de importação
- Identificar oportunidades lucrativas
- Explicar análises de viabilidade
- Sugerir estratégias de importação
- Responder dúvidas sobre o mercado brasileiro e chinês

Você deve ser:
- Direto e objetivo
- Usar linguagem simples e acessível
- Focar em ajudar o usuário a ganhar dinheiro
- Dar exemplos práticos quando possível
- Ser otimista mas realista

Informações importantes:
- Imposto de Importação: 60%
- IOF: 5.38%
- Frete internacional médio: R$ 50
- Margem mínima recomendada: 30%
- Mercado saturado: mais de 500 vendedores

Sempre termine suas respostas com uma dica prática ou sugestão de próximo passo.`;

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatContext {
  lastAnalysis?: {
    produto: string;
    margemLucro: number;
    scoreOportunidade: number;
    viavel: boolean;
  };
}

/**
 * Envia uma mensagem para o chat e recebe resposta da IA
 */
export async function sendChatMessage(
  userMessage: string,
  conversationHistory: ChatMessage[] = [],
  context?: ChatContext
): Promise<string> {
  try {
    // Construir mensagens com contexto
    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Adicionar contexto da última análise se disponível
    if (context?.lastAnalysis) {
      const contextMessage = `Contexto: O usuário acabou de analisar "${context.lastAnalysis.produto}". 
Margem de lucro: ${context.lastAnalysis.margemLucro.toFixed(1)}%, 
Score: ${context.lastAnalysis.scoreOportunidade.toFixed(0)}/100, 
Viável: ${context.lastAnalysis.viavel ? "Sim" : "Não"}.`;
      
      messages.push({ role: "system", content: contextMessage });
    }

    // Adicionar histórico (últimas 10 mensagens para não exceder limite)
    const recentHistory = conversationHistory.slice(-10);
    messages.push(...recentHistory);

    // Adicionar mensagem atual do usuário
    messages.push({ role: "user", content: userMessage });

    // Chamar OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages as any,
      temperature: 0.7,
      max_tokens: 500,
    });

    const assistantMessage = response.choices[0]?.message?.content || 
      "Desculpe, não consegui processar sua mensagem. Tente novamente.";

    return assistantMessage;
  } catch (error) {
    console.error("[AI Chat] Erro ao processar mensagem:", error);
    return "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente em alguns instantes.";
  }
}

/**
 * Gera sugestões de perguntas baseadas no contexto
 */
export function gerarSugestoesPerguntas(context?: ChatContext): string[] {
  const sugestoesBase = [
    "Como calcular o lucro real de um produto?",
    "Quais produtos são mais lucrativos para importar?",
    "Como evitar problemas na alfândega?",
    "Qual a melhor forma de negociar com fornecedores chineses?",
  ];

  if (context?.lastAnalysis) {
    if (context.lastAnalysis.viavel) {
      return [
        `Por que ${context.lastAnalysis.produto} é uma boa oportunidade?`,
        "Quantas unidades devo comprar na primeira importação?",
        "Como posso aumentar ainda mais minha margem de lucro?",
        "Quais os riscos deste produto?",
      ];
    } else {
      return [
        `Por que ${context.lastAnalysis.produto} não é viável?`,
        "Que produto similar seria mais lucrativo?",
        "Como posso melhorar a viabilidade deste produto?",
        "Qual margem de lucro é considerada boa?",
      ];
    }
  }

  return sugestoesBase;
}

/**
 * Gera explicação detalhada de uma análise
 */
export async function explicarAnalise(
  produto: string,
  custoTotal: number,
  precoMedioBrasil: number,
  margemLucro: number,
  concorrencia: string,
  scoreOportunidade: number
): Promise<string> {
  const prompt = `Explique de forma simples e direta por que este produto teve este resultado:

Produto: ${produto}
Custo total importado: R$ ${custoTotal.toFixed(2)}
Preço médio no Brasil: R$ ${precoMedioBrasil.toFixed(2)}
Margem de lucro: ${margemLucro.toFixed(1)}%
Concorrência: ${concorrencia}
Score de oportunidade: ${scoreOportunidade.toFixed(0)}/100

Explique em 3 parágrafos curtos:
1. Por que este score foi calculado
2. Se vale a pena importar ou não
3. Uma dica prática para o importador`;

  return await sendChatMessage(prompt);
}
