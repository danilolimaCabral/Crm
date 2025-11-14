import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Gift } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface LeadCaptureModalProps {
  open: boolean;
  onSuccess: (leadId: string) => void;
}

export default function LeadCaptureModal({ open, onSuccess }: LeadCaptureModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const createLeadMutation = trpc.leads.create.useMutation({
    onSuccess: (data: { leadId: string; existing: boolean }) => {
      toast.success("Bem-vindo! Você ganhou 5 análises gratuitas! 🎉");
      onSuccess(data.leadId);
    },
    onError: (error: { message: string }) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Digite seu nome");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      toast.error("Digite um email válido");
      return;
    }

    createLeadMutation.mutate({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <DialogTitle className="text-2xl text-center">
            Ganhe 5 Análises Gratuitas! 🎁
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Descubra produtos lucrativos da China com nossa IA. Sem cartão de crédito, sem compromisso.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome completo *</Label>
            <Input
              id="name"
              placeholder="João Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={createLeadMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="joao@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={createLeadMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">WhatsApp (opcional)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={createLeadMutation.isPending}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            size="lg"
            disabled={createLeadMutation.isPending}
          >
            {createLeadMutation.isPending ? (
              "Processando..."
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Começar Grátis Agora
              </>
            )}
          </Button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Ao continuar, você concorda em receber emails com dicas de importação
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
