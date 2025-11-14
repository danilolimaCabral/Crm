import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileText, Package, Calculator, BarChart3, Download, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import UpgradeModal from "@/components/UpgradeModal";

export default function Cotacao() {
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const calculateMutation = trpc.quotation.calculate.useMutation();
  const dolarRateQuery = trpc.exchange.getDolarRate.useQuery();
  const classifyNCMMutation = trpc.quotation.classifyNCM.useMutation();
  
  const [classifyingIndex, setClassifyingIndex] = useState<number | null>(null);
  
  // Dados gerais da cotação
  const [quotationName, setQuotationName] = useState("");
  const [incoterm, setIncoterm] = useState("FOB");
  const [transportType, setTransportType] = useState("maritimo");
  const [currency, setCurrency] = useState("USD");
  const [exchangeRate, setExchangeRate] = useState("5.25");
  
  // Custos adicionais
  const [internationalFreight, setInternationalFreight] = useState("");
  const [insurance, setInsurance] = useState("");
  const [storage, setStorage] = useState("");
  const [portFees, setPortFees] = useState("");
  const [customsBrokerFees, setCustomsBrokerFees] = useState("");
  const [certifications, setCertifications] = useState("");
  
  // Itens da cotação
  const [items, setItems] = useState<Array<{
    description: string;
    ncm: string;
    quantity: string;
    unitPrice: string;
    weight: string;
  }>>([{
    description: "",
    ncm: "",
    quantity: "",
    unitPrice: "",
    weight: "",
  }]);

  const addItem = () => {
    setItems([...items, {
      description: "",
      ncm: "",
      quantity: "",
      unitPrice: "",
      weight: "",
    }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleCalculate = async () => {
    try {
      // Validar campos obrigatórios
      if (!quotationName) {
        toast.error("Preencha o nome da cotação");
        return;
      }

      if (items.some(item => !item.description || !item.ncm || !item.quantity || !item.unitPrice)) {
        toast.error("Preencha todos os campos dos itens");
        return;
      }

      // Preparar dados para envio
      const data = {
        quotationName,
        incoterm,
        transportType,
        currency,
        exchangeRate: parseFloat(exchangeRate),
        internationalFreight: parseFloat(internationalFreight) || 0,
        insurance: parseFloat(insurance) || 0,
        storage: parseFloat(storage) || 0,
        portFees: parseFloat(portFees) || 0,
        customsBrokerFees: parseFloat(customsBrokerFees) || 0,
        certifications: parseFloat(certifications) || 0,
        items: items.map(item => ({
          description: item.description,
          ncm: item.ncm,
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice),
          weight: parseFloat(item.weight) || 0,
        })),
      };

      // Ir para step 4 e iniciar cálculo
      setStep(4);
      setCalculationResult(null);

      // Chamar API
      const result = await calculateMutation.mutateAsync(data);
      setCalculationResult(result);
      toast.success("Cálculo concluído com sucesso!");
    } catch (error) {
      toast.error("Erro ao calcular impostos");
      console.error(error);
      setStep(3);
    }
  };

  // Verificar plano ao carregar
  useEffect(() => {
    if (isAuthenticated && user) {
      const plan = user.subscriptionPlan || "free";
      if (plan === "free" || plan === "none") {
        setShowUpgradeModal(true);
      }
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>
              Você precisa estar logado para acessar o módulo de cotação profissional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = "/"} className="w-full">
              Voltar para Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Bloquear acesso para usuários Free
  const userPlan = user?.subscriptionPlan || "free";
  const isPremiumUser = userPlan === "pro" || userPlan === "premium";

  if (!isPremiumUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <UpgradeModal 
          open={true} 
          onClose={() => window.location.href = "/"} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Cotação Profissional de Importação
          </h1>
          <p className="text-gray-600">
            Calcule todos os custos e impostos em minutos - substitua o despachante
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {[
              { num: 1, label: "Dados Gerais", icon: FileText },
              { num: 2, label: "Itens & NCM", icon: Package },
              { num: 3, label: "Custos", icon: Calculator },
              { num: 4, label: "Resultado", icon: BarChart3 },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className={`flex flex-col items-center ${step >= s.num ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                    step >= s.num ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}>
                    <s.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium">{s.label}</span>
                </div>
                {i < 3 && (
                  <div className={`h-1 w-24 mx-4 ${step > s.num ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Dados Gerais */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Dados Gerais da Cotação</CardTitle>
              <CardDescription>
                Informações básicas sobre a importação
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Nome da Cotação *</Label>
                <Input
                  placeholder="Ex: Importação Eletrônicos - Janeiro 2025"
                  value={quotationName}
                  onChange={(e) => setQuotationName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Incoterm *</Label>
                  <Select value={incoterm} onValueChange={setIncoterm}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FOB">FOB - Free on Board</SelectItem>
                      <SelectItem value="CIF">CIF - Cost, Insurance and Freight</SelectItem>
                      <SelectItem value="EXW">EXW - Ex Works</SelectItem>
                      <SelectItem value="DDP">DDP - Delivered Duty Paid</SelectItem>
                      <SelectItem value="FCA">FCA - Free Carrier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tipo de Transporte *</Label>
                  <Select value={transportType} onValueChange={setTransportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maritimo">Marítimo</SelectItem>
                      <SelectItem value="aereo">Aéreo</SelectItem>
                      <SelectItem value="rodoviario">Rodoviário</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Moeda *</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="CNY">CNY - Yuan Chinês</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Taxa de Câmbio (R$) *</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="5.25"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        if (dolarRateQuery.data) {
                          setExchangeRate(dolarRateQuery.data.cotacao.toFixed(4));
                          toast.success(`Cotação atualizada: R$ ${dolarRateQuery.data.cotacao.toFixed(4)} (${new Date(dolarRateQuery.data.data).toLocaleDateString('pt-BR')})`);
                        }
                      }}
                      disabled={dolarRateQuery.isLoading}
                    >
                      {dolarRateQuery.isLoading ? "..." : "🔄"}
                    </Button>
                  </div>
                  {dolarRateQuery.data && (
                    <p className="text-xs text-muted-foreground mt-1">
                      🏦 BCB: R$ {dolarRateQuery.data.cotacao.toFixed(4)} ({new Date(dolarRateQuery.data.data).toLocaleDateString('pt-BR')})
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button onClick={() => setStep(2)} size="lg">
                  Próximo: Itens & NCM
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Itens e NCM */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Itens da Importação</CardTitle>
              <CardDescription>
                Adicione os produtos e suas classificações NCM
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {items.map((item, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4 relative">
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}

                  <div>
                    <Label>Descrição do Produto *</Label>
                    <Input
                      placeholder="Ex: Smartphone Samsung Galaxy S24"
                      value={item.description}
                      onChange={(e) => updateItem(index, 'description', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Código NCM *</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="8517.12.31"
                          value={item.ncm}
                          onChange={(e) => updateItem(index, 'ncm', e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={async () => {
                            if (!item.description) {
                              toast.error("Preencha a descrição do produto primeiro");
                              return;
                            }
                            
                            setClassifyingIndex(index);
                            try {
                              const result = await classifyNCMMutation.mutateAsync({
                                productDescription: item.description,
                              });
                              
                              updateItem(index, 'ncm', result.ncm);
                              
                              toast.success(
                                `NCM sugerido: ${result.ncm} - ${result.description}`,
                                {
                                  description: `Confiança: ${result.confidence}% | ${result.reasoning}`,
                                  duration: 8000,
                                }
                              );
                            } catch (error) {
                              toast.error("Erro ao classificar NCM");
                            } finally {
                              setClassifyingIndex(null);
                            }
                          }}
                          disabled={classifyingIndex === index || !item.description}
                          title="Classificar automaticamente com IA"
                        >
                          {classifyingIndex === index ? "..." : "🤖"}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>Quantidade *</Label>
                      <Input
                        type="number"
                        placeholder="100"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label>Preço Unitário ({currency}) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="250.00"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Peso por Unidade (kg)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.5"
                      value={item.weight}
                      onChange={(e) => updateItem(index, 'weight', e.target.value)}
                    />
                  </div>
                </div>
              ))}

              <Button onClick={addItem} variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Outro Item
              </Button>

              <div className="flex justify-between gap-4 pt-4">
                <Button onClick={() => setStep(1)} variant="outline" size="lg">
                  Voltar
                </Button>
                <Button onClick={() => setStep(3)} size="lg">
                  Próximo: Custos Adicionais
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Custos Adicionais */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Custos Adicionais</CardTitle>
              <CardDescription>
                Despesas de frete, seguro, taxas e outros custos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Frete Internacional (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="5000.00"
                    value={internationalFreight}
                    onChange={(e) => setInternationalFreight(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Seguro (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="500.00"
                    value={insurance}
                    onChange={(e) => setInsurance(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Armazenagem (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="300.00"
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Taxas Portuárias (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="800.00"
                    value={portFees}
                    onChange={(e) => setPortFees(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Honorários Despachante (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="1200.00"
                    value={customsBrokerFees}
                    onChange={(e) => setCustomsBrokerFees(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Certificações (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="200.00"
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-between gap-4 pt-4">
                <Button onClick={() => setStep(2)} variant="outline" size="lg">
                  Voltar
                </Button>
                <Button onClick={handleCalculate} size="lg" disabled={calculateMutation.isPending}>
                  {calculateMutation.isPending ? "Calculando..." : "Calcular Impostos"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Resultado */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Resultado da Cotação</CardTitle>
              <CardDescription>
                Cálculo completo de impostos e landed cost
              </CardDescription>
            </CardHeader>
            <CardContent>
              {calculationResult ? (
                <div className="space-y-6">
                  {/* Resumo Geral */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Valor FOB Total</div>
                      <div className="text-2xl font-bold text-blue-600">
                        R$ {(calculationResult.totals.fobValue).toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Total de Impostos</div>
                      <div className="text-2xl font-bold text-red-600">
                        R$ {(calculationResult.totals.totalTaxes).toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">Landed Cost Total</div>
                      <div className="text-2xl font-bold text-green-600">
                        R$ {(calculationResult.totals.landedCost).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Detalhamento de Impostos */}
                  <div>
                    <h3 className="font-semibold mb-3">Detalhamento de Impostos</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span>II (Imposto de Importação)</span>
                        <span className="font-semibold">R$ {calculationResult.totals.totalII.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span>IPI</span>
                        <span className="font-semibold">R$ {calculationResult.totals.totalIPI.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span>PIS</span>
                        <span className="font-semibold">R$ {calculationResult.totals.totalPIS.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span>Cofins</span>
                        <span className="font-semibold">R$ {calculationResult.totals.totalCofins.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded col-span-2">
                        <span>ICMS</span>
                        <span className="font-semibold">R$ {calculationResult.totals.totalICMS.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tabela de Itens */}
                  <div>
                    <h3 className="font-semibold mb-3">Detalhamento por Item</h3>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="text-left p-3">Produto</th>
                            <th className="text-right p-3">NCM</th>
                            <th className="text-right p-3">Qtd</th>
                            <th className="text-right p-3">FOB Unitário</th>
                            <th className="text-right p-3">Impostos</th>
                            <th className="text-right p-3">Landed Cost/Un</th>
                          </tr>
                        </thead>
                        <tbody>
                          {calculationResult.items.map((item: any, index: number) => (
                            <tr key={index} className="border-t">
                              <td className="p-3">{item.description}</td>
                              <td className="text-right p-3">{item.ncmCode}</td>
                              <td className="text-right p-3">{item.quantity}</td>
                              <td className="text-right p-3">R$ {(item.unitPriceFob).toFixed(2)}</td>
                              <td className="text-right p-3">R$ {(item.totalTaxes).toFixed(2)}</td>
                              <td className="text-right p-3 font-semibold">R$ {(item.landedCostPerUnit).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex justify-between gap-4 pt-4">
                    <Button onClick={() => setStep(1)} variant="outline" size="lg">
                      Nova Cotação
                    </Button>
                    <Button size="lg">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar PDF
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calculator className="w-16 h-16 mx-auto text-gray-400 mb-4 animate-pulse" />
                  <p className="text-gray-600 mb-4">
                    Calculando impostos e custos...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal de Upgrade para usuários Free */}
      <UpgradeModal 
        open={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)} 
      />
    </div>
  );
}
