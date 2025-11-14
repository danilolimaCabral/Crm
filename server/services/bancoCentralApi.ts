/**
 * Serviço de integração com a API do Banco Central do Brasil (PTAX)
 * Documentação: https://dadosabertos.bcb.gov.br/
 */

interface PTAXResponse {
  value: Array<{
    cotacaoCompra: number;
    cotacaoVenda: number;
    dataHoraCotacao: string;
  }>;
}

/**
 * Obtém a cotação do dólar (PTAX) para uma data específica
 * @param date Data no formato YYYY-MM-DD (opcional, padrão: hoje)
 * @returns Cotação de venda do dólar
 */
export async function getCotacaoDolar(date?: string): Promise<number> {
  try {
    // Se não informar data, usa a data atual
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    // Converter YYYY-MM-DD para MM-DD-YYYY (formato da API)
    const [year, month, day] = targetDate.split('-');
    const formattedDate = `${month}-${day}-${year}`;
    
    const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='${formattedDate}'&$format=json`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API Banco Central retornou status ${response.status}`);
    }
    
    const data: PTAXResponse = await response.json();
    
    if (!data.value || data.value.length === 0) {
      // Se não houver cotação para a data (ex: final de semana), retorna valor padrão
      console.warn(`[BCB API] Sem cotação para ${formattedDate}, usando fallback`);
      return 5.25; // Valor padrão de fallback
    }
    
    // Retorna a cotação de venda (mais conservadora para importação)
    const cotacao = data.value[0].cotacaoVenda;
    
    console.log(`[BCB API] Cotação do dólar em ${formattedDate}: R$ ${cotacao.toFixed(4)}`);
    
    return cotacao;
    
  } catch (error) {
    console.error('[BCB API] Erro ao buscar cotação:', error);
    // Retorna valor padrão em caso de erro
    return 5.25;
  }
}

/**
 * Obtém a última cotação disponível do dólar
 * Útil para evitar problemas com finais de semana e feriados
 */
export async function getUltimaCotacaoDolar(): Promise<{
  cotacao: number;
  data: string;
}> {
  try {
    // Tenta os últimos 7 dias para garantir que encontre uma cotação
    const hoje = new Date();
    
    for (let i = 0; i < 7; i++) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      const dataStr = data.toISOString().split('T')[0];
      
      const [year, month, day] = dataStr.split('-');
      const formattedDate = `${month}-${day}-${year}`;
      
      const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarDia(dataCotacao=@dataCotacao)?@dataCotacao='${formattedDate}'&$format=json`;
      
      const response = await fetch(url);
      
      if (response.ok) {
        const result: PTAXResponse = await response.json();
        
        if (result.value && result.value.length > 0) {
          const cotacao = result.value[0].cotacaoVenda;
          console.log(`[BCB API] Última cotação disponível: R$ ${cotacao.toFixed(4)} (${dataStr})`);
          
          return {
            cotacao,
            data: dataStr,
          };
        }
      }
    }
    
    // Se não encontrou cotação nos últimos 7 dias, usa fallback
    console.warn('[BCB API] Não encontrou cotação nos últimos 7 dias, usando fallback');
    return {
      cotacao: 5.25,
      data: new Date().toISOString().split('T')[0],
    };
    
  } catch (error) {
    console.error('[BCB API] Erro ao buscar última cotação:', error);
    return {
      cotacao: 5.25,
      data: new Date().toISOString().split('T')[0],
    };
  }
}
