import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface PlanSelectionModalProps {
  open: boolean;
  onClose: () => void;
  onPlanSelected: (plan: 'free' | 'pro' | 'premium') => void;
}

export default function PlanSelectionModal({ open, onClose, onPlanSelected }: PlanSelectionModalProps) {
  const createCheckoutMutation = trpc.stripe.createCheckout.useMutation();
  const updatePlanMutation = trpc.user.updatePlan.useMutation();

  const handleSelectFree = async () => {
    try {
      // Atualizar plano do usuário para 'free' no banco de dados
      await updatePlanMutation.mutateAsync({ plan: 'free' });
      toast.success("✅ Plano Free ativado! Você tem 5 análises por mês. Recarregando...");
      
      // Recarregar página para atualizar dados do usuário
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error("Erro ao ativar plano Free");
      console.error(error);
    }
  };

  const handleSelectPro = async () => {
    try {
      const result = await createCheckoutMutation.mutateAsync({ plan: 'pro' });
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      toast.error("Erro ao processar pagamento");
      console.error(error);
    }
  };

  const handleSelectPremium = async () => {
    try {
      const result = await createCheckoutMutation.mutateAsync({ plan: 'premium' });
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      toast.error("Erro ao processar pagamento");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Escolha seu Plano para Começar
          </DialogTitle>
          <p className="text-center text-gray-600 mt-2">
            Selecione o plano ideal para suas necessidades de importação
          </p>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {/* Plano Free */}
          <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-400 transition-all">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-gray-600" />
              <h3 className="text-xl font-bold">Free</h3>
            </div>
            
            <div className="mb-6">
              <div className="text-3xl font-bold">R$ 0</div>
              <div className="text-gray-600">/mês</div>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">5 análises por mês</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Análise de viabilidade básica</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Chat com IA</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Histórico de 30 dias</span>
              </li>
            </ul>

            <Button 
              onClick={handleSelectFree}
              variant="outline" 
              className="w-full"
              disabled={updatePlanMutation.isPending}
            >
              {updatePlanMutation.isPending ? "Ativando..." : "Começar Grátis"}
            </Button>
          </div>

          {/* Plano Pro */}
          <div className="border-2 border-blue-500 rounded-lg p-6 relative shadow-lg">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
              Mais Popular
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold">Pro</h3>
            </div>
            
            <div className="mb-6">
              <div className="text-3xl font-bold">R$ 49</div>
              <div className="text-gray-600">/mês</div>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-semibold">50 análises por mês</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Análise avançada com IA</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Chat ilimitado com IA</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Histórico ilimitado</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Exportar relatórios PDF</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Alertas de oportunidades</span>
              </li>
            </ul>

            <Button 
              onClick={handleSelectPro}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={createCheckoutMutation.isPending}
            >
              {createCheckoutMutation.isPending ? "Processando..." : "Assinar Pro"}
            </Button>
          </div>

          {/* Plano Premium */}
          <div className="border-2 border-purple-500 rounded-lg p-6 bg-gradient-to-br from-purple-50 to-pink-50">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-6 h-6 text-purple-600" />
              <h3 className="text-xl font-bold">Premium</h3>
            </div>
            
            <div className="mb-6">
              <div className="text-3xl font-bold">R$ 149</div>
              <div className="text-gray-600">/mês</div>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-semibold">Análises ilimitadas</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Tudo do plano Pro</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Suporte prioritário</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">API de integração</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Consultoria mensal</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm">Acesso antecipado</span>
              </li>
            </ul>

            <Button 
              onClick={handleSelectPremium}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={createCheckoutMutation.isPending}
            >
              {createCheckoutMutation.isPending ? "Processando..." : "Assinar Premium"}
            </Button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>✨ Todos os planos incluem acesso ao chat de IA especializado em importação</p>
          <p className="mt-2">🔒 Pagamento seguro processado pelo Stripe</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
