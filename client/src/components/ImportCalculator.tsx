import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ImportCalculatorProps {
  productPriceUsd: number;
  exchangeRate: number;
  productTitle: string;
}

interface CalculationResult {
  quantity: number;
  totalProductCost: number;
  totalTaxes: number;
  totalShipping: number;
  totalCost: number;
  costPerUnit: number;
  suggestedPrice30: number;
  suggestedPrice50: number;
  suggestedPrice100: number;
  profit30: number;
  profit50: number;
  profit100: number;
}

export default function ImportCalculator({ productPriceUsd, exchangeRate, productTitle }: ImportCalculatorProps) {
  const [quantity, setQuantity] = useState<number>(100);
  const [showResults, setShowResults] = useState(false);

  const calculateImport = (qty: number): CalculationResult => {
    const productPriceBrl = productPriceUsd * exchangeRate;
    const totalProductCost = productPriceBrl * qty;
    
    // Impostos: 60% + IOF 5.38%
    const importTax = totalProductCost * 0.60;
    const iof = totalProductCost * 0.0538;
    const totalTaxes = importTax + iof;
    
    // Frete: R$ 5/unidade base, com desconto por volume
    let shippingPerUnit = 5 * exchangeRate;
    if (qty >= 500) shippingPerUnit *= 0.6; // 40% desconto
    else if (qty >= 100) shippingPerUnit *= 0.75; // 25% desconto
    else if (qty >= 50) shippingPerUnit *= 0.85; // 15% desconto
    
    const totalShipping = shippingPerUnit * qty;
    const totalCost = totalProductCost + totalTaxes + totalShipping;
    const costPerUnit = totalCost / qty;
    
    // Preços sugeridos com diferentes margens
    const suggestedPrice30 = costPerUnit * 1.30;
    const suggestedPrice50 = costPerUnit * 1.50;
    const suggestedPrice100 = costPerUnit * 2.00;
    
    // Lucros totais
    const profit30 = (suggestedPrice30 - costPerUnit) * qty;
    const profit50 = (suggestedPrice50 - costPerUnit) * qty;
    const profit100 = (suggestedPrice100 - costPerUnit) * qty;
    
    return {
      quantity: qty,
      totalProductCost,
      totalTaxes,
      totalShipping,
      totalCost,
      costPerUnit,
      suggestedPrice30,
      suggestedPrice50,
      suggestedPrice100,
      profit30,
      profit50,
      profit100,
    };
  };

  const handleCalculate = () => {
    setShowResults(true);
  };

  const scenarios = [50, 100, 500, 1000];
  const results = scenarios.map(qty => calculateImport(qty));
  const currentResult = calculateImport(quantity);

  return (
    <Card className="mt-6 border-2 border-blue-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="w-6 h-6 text-blue-600" />
          <CardTitle>Calculadora de Importação</CardTitle>
        </div>
        <CardDescription>
          Calcule custos e lucros para diferentes quantidades de {productTitle}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input de Quantidade */}
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantidade de Unidades</Label>
          <div className="flex gap-2">
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="max-w-xs"
            />
            <Button onClick={handleCalculate}>
              <Calculator className="w-4 h-4 mr-2" />
              Calcular
            </Button>
          </div>
        </div>

        {showResults && (
          <>
            {/* Resultado Principal */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg space-y-4">
              <h3 className="font-bold text-lg">Análise para {quantity} unidades</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Custo dos Produtos:</span>
                    <span className="font-semibold">R$ {currentResult.totalProductCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Impostos (60% + IOF):</span>
                    <span className="font-semibold">R$ {currentResult.totalTaxes.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Frete Total:</span>
                    <span className="font-semibold">R$ {currentResult.totalShipping.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="font-bold">Custo Total:</span>
                    <span className="font-bold text-red-600">R$ {currentResult.totalCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bold">Custo por Unidade:</span>
                    <span className="font-bold">R$ {currentResult.costPerUnit.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold mb-2">💰 Cenários de Venda:</p>
                  
                  <div className="bg-white p-3 rounded">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Margem 30%:</span>
                      <span className="font-semibold">R$ {currentResult.suggestedPrice30.toFixed(2)}/un</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Lucro Total:</span>
                      <span className="text-green-600 font-bold">R$ {currentResult.profit30.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded border-2 border-blue-400">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Margem 50%:</span>
                      <span className="font-semibold">R$ {currentResult.suggestedPrice50.toFixed(2)}/un</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Lucro Total:</span>
                      <span className="text-green-600 font-bold">R$ {currentResult.profit50.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Margem 100%:</span>
                      <span className="font-semibold">R$ {currentResult.suggestedPrice100.toFixed(2)}/un</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Lucro Total:</span>
                      <span className="text-green-600 font-bold">R$ {currentResult.profit100.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabela Comparativa */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold">Comparação por Quantidade</h3>
              </div>
              
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Custo/Un</TableHead>
                      <TableHead>Custo Total</TableHead>
                      <TableHead>Preço Venda (50%)</TableHead>
                      <TableHead className="text-right">Lucro Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow 
                        key={index}
                        className={result.quantity === quantity ? "bg-blue-50 font-semibold" : ""}
                      >
                        <TableCell>{result.quantity} un</TableCell>
                        <TableCell>R$ {result.costPerUnit.toFixed(2)}</TableCell>
                        <TableCell>R$ {result.totalCost.toFixed(2)}</TableCell>
                        <TableCell>R$ {result.suggestedPrice50.toFixed(2)}</TableCell>
                        <TableCell className="text-right text-green-600 font-bold">
                          R$ {result.profit50.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                💡 Dica: Quanto maior a quantidade, menor o custo por unidade devido ao desconto no frete
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
