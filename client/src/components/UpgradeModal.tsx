import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap } from "lucide-react";
import { useLocation } from "wouter";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const [, setLocation] = useLocation();

  const handleUpgrade = (plan: "pro" | "premium") => {
    setLocation(`/pricing?plan=${plan}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            Módulo de Cotação Profissional
          </DialogTitle>
          <DialogDescription className="text-base">
            Este é um recurso exclusivo para assinantes Pro e Premium
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Benefícios do Módulo */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-6 rounded-lg">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              O que você ganha com este módulo:
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Classificação automática de NCM</strong> - IA identifica o código correto em segundos</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Cálculo preciso de impostos</strong> - II, IPI, PIS/Cofins, ICMS com fórmulas oficiais</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Cotação cambial em tempo real</strong> - API do Banco Central do Brasil</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Landed Cost completo</strong> - Custo final por item incluindo todos os gastos</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span><strong>Substitui despachante</strong> - Reduza de 3-4 dias para minutos</span>
              </li>
            </ul>
          </div>

          {/* Comparação de Planos */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Plano Pro */}
            <div className="border-2 border-blue-500 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-center mb-4">
                <h4 className="text-xl font-bold text-blue-600">Pro</h4>
                <div className="mt-2">
                  <span className="text-3xl font-bold">R$ 49</span>
                  <span className="text-gray-600 dark:text-gray-400">/mês</span>
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>50 análises/mês</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Módulo de Cotação</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Classificação NCM com IA</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Cálculo de impostos</span>
                </li>
              </ul>
              <Button 
                onClick={() => handleUpgrade("pro")}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Assinar Pro
              </Button>
            </div>

            {/* Plano Premium */}
            <div className="border-2 border-purple-500 rounded-lg p-6 hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <div className="text-center mb-4">
                <div className="inline-block bg-purple-500 text-white text-xs px-2 py-1 rounded-full mb-2">
                  MAIS POPULAR
                </div>
                <h4 className="text-xl font-bold text-purple-600">Premium</h4>
                <div className="mt-2">
                  <span className="text-3xl font-bold">R$ 149</span>
                  <span className="text-gray-600 dark:text-gray-400">/mês</span>
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span><strong>Análises ilimitadas</strong></span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Módulo de Cotação</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Classificação NCM com IA</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Suporte prioritário</span>
                </li>
              </ul>
              <Button 
                onClick={() => handleUpgrade("premium")}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Assinar Premium
              </Button>
            </div>
          </div>

          {/* Botão Cancelar */}
          <div className="text-center">
            <Button variant="ghost" onClick={onClose}>
              Voltar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
