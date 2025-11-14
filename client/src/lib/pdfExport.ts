import jsPDF from "jspdf";

interface AnalysisData {
  productTitle: string;
  productPlatform: string;
  priceUsd: number;
  productRating: number;
  productImage?: string;
  priceBrl: number;
  importTax: number;
  iof: number;
  shippingCost: number;
  totalCost: number;
  avgPriceBr: number;
  minPriceBr: number;
  maxPriceBr: number;
  totalSellers: number;
  competitionLevel: string;
  profitMargin: number;
  opportunityScore: number;
  isViable: boolean;
  recommendation: string;
  searchTerm: string;
  createdAt: Date;
}

export function exportAnalysisToPDF(analysis: AnalysisData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235); // Blue-600
  doc.text("Relatório de Análise de Importação", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  // Produto
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("📦 Produto Analisado", 20, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.text(`Produto: ${analysis.productTitle}`, 20, yPos);
  yPos += 7;
  doc.text(`Plataforma: ${analysis.productPlatform}`, 20, yPos);
  yPos += 7;
  doc.text(`Preço USD: $${analysis.priceUsd.toFixed(2)}`, 20, yPos);
  yPos += 7;
  doc.text(`Avaliação: ⭐ ${(analysis.productRating / 10).toFixed(1)}`, 20, yPos);
  yPos += 10;

  // Custos
  doc.setFontSize(16);
  doc.text("💰 Custos de Importação", 20, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.text(`Preço do Produto (BRL): R$ ${analysis.priceBrl.toFixed(2)}`, 20, yPos);
  yPos += 7;
  doc.text(`Imposto de Importação: R$ ${analysis.importTax.toFixed(2)}`, 20, yPos);
  yPos += 7;
  doc.text(`IOF: R$ ${analysis.iof.toFixed(2)}`, 20, yPos);
  yPos += 7;
  doc.text(`Frete Internacional: R$ ${analysis.shippingCost.toFixed(2)}`, 20, yPos);
  yPos += 7;
  doc.setFontSize(14);
  doc.setTextColor(34, 197, 94); // Green-600
  doc.text(`Custo Total: R$ ${analysis.totalCost.toFixed(2)}`, 20, yPos);
  yPos += 10;

  // Análise de Mercado
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("📊 Análise de Mercado Brasileiro", 20, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.text(`Preço Médio: R$ ${analysis.avgPriceBr.toFixed(2)}`, 20, yPos);
  yPos += 7;
  doc.text(`Preço Mínimo: R$ ${analysis.minPriceBr.toFixed(2)}`, 20, yPos);
  yPos += 7;
  doc.text(`Preço Máximo: R$ ${analysis.maxPriceBr.toFixed(2)}`, 20, yPos);
  yPos += 7;
  doc.text(`Total de Vendedores: ${analysis.totalSellers}`, 20, yPos);
  yPos += 7;
  doc.text(`Nível de Concorrência: ${analysis.competitionLevel}`, 20, yPos);
  yPos += 10;

  // Resultado
  doc.setFontSize(16);
  doc.text("🎯 Resultado da Análise", 20, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.text(`Margem de Lucro: ${analysis.profitMargin.toFixed(1)}%`, 20, yPos);
  yPos += 7;
  doc.text(`Score de Oportunidade: ${analysis.opportunityScore.toFixed(0)}/100`, 20, yPos);
  yPos += 7;
  doc.setTextColor(analysis.isViable ? 34 : 239, analysis.isViable ? 197 : 68, analysis.isViable ? 94 : 68);
  doc.text(`Viabilidade: ${analysis.isViable ? "✅ VIÁVEL" : "❌ NÃO VIÁVEL"}`, 20, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text("Recomendação:", 20, yPos);
  yPos += 7;
  doc.setFontSize(11);
  const splitRecommendation = doc.splitTextToSize(analysis.recommendation, pageWidth - 40);
  doc.text(splitRecommendation, 20, yPos);
  yPos += splitRecommendation.length * 7;

  // Footer
  if (yPos > pageHeight - 30) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text("Importador Inteligente - Relatório gerado automaticamente", pageWidth / 2, pageHeight - 10, { align: "center" });

  // Salvar
  doc.save(`analise-${analysis.searchTerm.replace(/\s+/g, "-")}-${Date.now()}.pdf`);
}

interface QuotationData {
  quotationName: string;
  incoterm: string;
  transportType: string;
  currency: string;
  exchangeRate: number;
  totalFob: number;
  totalCustomsValue: number;
  totalII: number;
  totalIPI: number;
  totalPIS: number;
  totalCofins: number;
  totalICMS: number;
  totalLandedCost: number;
  items: Array<{
    description: string;
    ncmCode: string;
    quantity: number;
    unitPriceFob: number;
    totalPriceFob: number;
    landedCostPerUnit: number;
    landedCostTotal: number;
  }>;
  createdAt: Date;
}

export function exportQuotationToPDF(quotation: QuotationData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(37, 99, 235);
  doc.text("Cotação Profissional de Importação", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Cotação: ${quotation.quotationName}`, pageWidth / 2, yPos, { align: "center" });
  yPos += 7;
  doc.text(`Gerado em: ${new Date(quotation.createdAt).toLocaleString("pt-BR")}`, pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  // Informações Gerais
  doc.setFontSize(16);
  doc.text("📋 Informações Gerais", 20, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.text(`Incoterm: ${quotation.incoterm}`, 20, yPos);
  yPos += 7;
  doc.text(`Tipo de Transporte: ${quotation.transportType}`, 20, yPos);
  yPos += 7;
  doc.text(`Moeda: ${quotation.currency}`, 20, yPos);
  yPos += 7;
  doc.text(`Taxa de Câmbio: ${quotation.exchangeRate.toFixed(4)}`, 20, yPos);
  yPos += 15;

  // Itens
  doc.setFontSize(16);
  doc.text("📦 Itens da Cotação", 20, yPos);
  yPos += 10;

  quotation.items.forEach((item, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.text(`Item ${index + 1}: ${item.description}`, 20, yPos);
    yPos += 7;
    doc.setFontSize(11);
    doc.text(`NCM: ${item.ncmCode} | Quantidade: ${item.quantity}`, 20, yPos);
    yPos += 6;
    doc.text(`Preço FOB Unitário: ${quotation.currency} ${item.unitPriceFob.toFixed(2)}`, 20, yPos);
    yPos += 6;
    doc.text(`Preço FOB Total: ${quotation.currency} ${item.totalPriceFob.toFixed(2)}`, 20, yPos);
    yPos += 6;
    doc.text(`Custo por Unidade: R$ ${item.landedCostPerUnit.toFixed(2)}`, 20, yPos);
    yPos += 6;
    doc.text(`Custo Total: R$ ${item.landedCostTotal.toFixed(2)}`, 20, yPos);
    yPos += 10;
  });

  // Totais
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(16);
  doc.text("💰 Resumo Financeiro", 20, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.text(`Total FOB: R$ ${quotation.totalFob.toFixed(2)}`, 20, yPos);
  yPos += 7;
  doc.text(`Valor Aduaneiro: R$ ${quotation.totalCustomsValue.toFixed(2)}`, 20, yPos);
  yPos += 7;
  doc.text(`Imposto de Importação (II): R$ ${quotation.totalII.toFixed(2)}`, 20, yPos);
  yPos += 7;
  doc.text(`IPI: R$ ${quotation.totalIPI.toFixed(2)}`, 20, yPos);
  yPos += 7;
  doc.text(`PIS: R$ ${quotation.totalPIS.toFixed(2)}`, 20, yPos);
  yPos += 7;
  doc.text(`Cofins: R$ ${quotation.totalCofins.toFixed(2)}`, 20, yPos);
  yPos += 7;
  doc.text(`ICMS: R$ ${quotation.totalICMS.toFixed(2)}`, 20, yPos);
  yPos += 10;

  doc.setFontSize(14);
  doc.setTextColor(34, 197, 94);
  doc.text(`Custo Total (Landed Cost): R$ ${quotation.totalLandedCost.toFixed(2)}`, 20, yPos);

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text("Importador Inteligente - Cotação Profissional", pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });

  doc.save(`cotacao-${quotation.quotationName.replace(/\s+/g, "-")}-${Date.now()}.pdf`);
}
