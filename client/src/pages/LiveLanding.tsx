import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarDays,
  CheckCheck,
  CheckCircle2,
  Clock,
  Headphones,
  Layers3,
  Share2,
  Shield,
  Smartphone,
  Sparkles,
  Video,
} from "lucide-react";

const fallbackLiveUrl = import.meta.env.VITE_LIVE_STREAM_URL || "https://www.youtube.com/live";

const resourceActions = [
  {
    title: "Assistir Live",
    description: "Entrar na sala principal ao vivo",
    icon: Video,
    action: "live",
  },
  {
    title: "Material interativo",
    description: "Baixe os slides e planilhas",
    icon: Layers3,
    action: "materials",
  },
  {
    title: "Comunidade VIP",
    description: "Grupo fechado no WhatsApp",
    icon: Smartphone,
    action: "community",
  },
  {
    title: "Suporte com especialistas",
    description: "Fale com nosso time em tempo real",
    icon: Headphones,
    action: "support",
  },
];

const highlightItems = [
  {
    title: "Autenticação individual",
    description: "Cada participante recebe um código exclusivo para validar seu acesso.",
    icon: Shield,
  },
  {
    title: "Confirmação instantânea",
    description: "Código liberado assim que você envia seus dados. Sem filas ou espera.",
    icon: CheckCircle2,
  },
  {
    title: "Ambiente guiado",
    description: "Após validar, escolha entre assistir a live ou acessar materiais extras.",
    icon: Sparkles,
  },
];

const formatCode = (code: string) => code.replace(/(.{3})/g, "$1 ").trim();

export default function LiveLanding() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [clientType, setClientType] = useState<"macro" | "micro" | "nao_cliente">("macro");
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [liveUrl, setLiveUrl] = useState(fallbackLiveUrl);
  const [showResourceHub, setShowResourceHub] = useState(false);

  const registerLive = trpc.live.register.useMutation({
    onSuccess: (data) => {
      setAccessCode(data.code);
      setLeadId(data.leadId);
      setLiveUrl(data.liveUrl || fallbackLiveUrl);
      setShowResourceHub(false);
      toast.success("Código liberado! Confira suas instruções de acesso.");
    },
    onError: (error) => toast.error(error.message),
  });

  const isFormDisabled = registerLive.isPending;

  const nextActions = useMemo(() => {
    if (!accessCode) return [];
    return [
      {
        title: "1. Guarde seu código",
        description: "Você precisará dele para validar seu acesso durante a live.",
        icon: Shield,
      },
      {
        title: "2. Entre na sala oficial",
        description: "Clique em “Assistir agora” e use o mesmo email informado.",
        icon: Video,
      },
      {
        title: "3. Explore o hub",
        description: "Materiais extras, agenda e grupos exclusivos num só lugar.",
        icon: Share2,
      },
    ];
  }, [accessCode]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !clientType) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    registerLive.mutate({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      clientType,
    });
  };

  const handleCopyCode = async () => {
    if (!accessCode) return;
    await navigator.clipboard.writeText(accessCode);
    toast.success("Código copiado para a área de transferência.");
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.35),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,_rgba(147,51,234,0.25),_transparent_50%)]" />
      </div>

      <div className="relative z-10 px-4 py-16 sm:px-8 lg:px-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <header className="text-center space-y-6">
            <Badge className="mx-auto w-fit bg-emerald-500/20 text-emerald-200 border-emerald-400/40">
              Live exclusiva para clientes Macro e Micro
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-semibold leading-tight">
                Confirme seu acesso à próxima live interativa da Macro Import
              </h1>
              <p className="text-lg text-white/70 max-w-3xl mx-auto">
                Segurança, personalização e materiais premium em um só fluxo. Cadastre-se, receba seu
                código de autenticação e escolha como deseja participar da transmissão ao vivo.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-emerald-300" />
                14 de Dezembro às 19h (BRT)
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-300" />
                Sala abre 15 minutos antes
              </div>
              <div className="flex items-center gap-2">
                <CheckCheck className="w-4 h-4 text-emerald-300" />
                Vagas limitadas e validadas manualmente
              </div>
            </div>
          </header>

          <section className="grid gap-6 md:grid-cols-3">
            {highlightItems.map((item) => (
              <Card key={item.title} className="bg-white/5 border-white/10 text-left">
                <CardHeader className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-300 flex items-center justify-center">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-white text-xl">{item.title}</CardTitle>
                  <CardDescription className="text-white/70 leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </section>

          <section className="grid gap-8 lg:grid-cols-2">
            <Card className="bg-white/5 border-white/10 backdrop-blur">
              <CardHeader className="space-y-2">
                <CardTitle>1. Faça sua autenticação</CardTitle>
                <CardDescription className="text-white/70">
                  Precisamos garantir que apenas convidados confirmados cheguem à sala. Use as mesmas
                  informações que você utiliza com o nosso time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome completo</Label>
                    <Input
                      id="name"
                      placeholder="Ex: Juliana Carvalho"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      disabled={isFormDisabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemplo@macroimport.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      disabled={isFormDisabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">WhatsApp</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(11) 90000-0000"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value)}
                      disabled={isFormDisabled}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Você é cliente Macro ou Micro?</Label>
                    <Select
                      value={clientType}
                      onValueChange={(value: "macro" | "micro" | "nao_cliente") => setClientType(value)}
                      disabled={isFormDisabled}
                    >
                      <SelectTrigger className="bg-slate-900 border-white/15 text-white">
                        <SelectValue placeholder="Selecione seu perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="macro">Sou cliente Macro</SelectItem>
                        <SelectItem value="micro">Sou cliente Micro</SelectItem>
                        <SelectItem value="nao_cliente">Ainda não sou cliente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold"
                    size="lg"
                    disabled={isFormDisabled}
                  >
                    {isFormDisabled ? "Gerando seu código..." : "Gerar código de acesso"}
                  </Button>

                  <p className="text-sm text-white/60 text-center">
                    Usaremos esses dados apenas para autenticar seu ingresso e enviar lembretes da live.
                  </p>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-emerald-500/10 via-slate-900 to-slate-950 border-white/10 h-full">
                <CardHeader>
                  <CardTitle>2. Receba instruções inteligentes</CardTitle>
                  <CardDescription className="text-white/70">
                    Validamos tudo em segundos e liberamos automaticamente o seu código pessoal. Ele
                    também é enviado para seu email como confirmação.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {nextActions.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/20 p-6 text-white/70 text-sm leading-relaxed">
                      Assim que você validar seus dados, mostramos aqui os próximos passos e abrimos o
                      painel com atalhos rápidos para a live.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {nextActions.map((item) => (
                        <div key={item.title} className="flex gap-4 rounded-2xl border border-white/10 p-4">
                          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                            <item.icon className="w-5 h-5 text-emerald-300" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{item.title}</p>
                            <p className="text-sm text-white/70">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {accessCode && (
                <Card className="bg-slate-900/80 border-emerald-500/30 shadow-emerald-500/10 shadow-lg">
                  <CardHeader className="space-y-2">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-emerald-300" />
                      Código liberado
                    </CardTitle>
                    <CardDescription className="text-white/70">
                      Anote o código e escolha se quer entrar direto na live ou navegar pelo hub visual com
                      atalhos.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="rounded-2xl border border-white/15 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <p className="text-sm text-white/60">Seu código de autenticação</p>
                        <p className="text-3xl font-mono tracking-[0.4em] text-emerald-300">
                          {formatCode(accessCode)}
                        </p>
                      </div>
                      <Button variant="secondary" size="sm" onClick={handleCopyCode}>
                        Copiar
                      </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button
                        className="bg-emerald-500 hover:bg-emerald-600 text-slate-950"
                        onClick={() => window.open(liveUrl, "_blank")}
                      >
                        Assistir agora
                      </Button>
                      <Button
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10"
                        onClick={() => setShowResourceHub((prev) => !prev)}
                      >
                        {showResourceHub ? "Ocultar hub" : "Ver hub com ícones"}
                      </Button>
                    </div>

                    <p className="text-xs text-white/60">
                      Código vinculado ao email {email} • Lead #{leadId}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>

          {showResourceHub && accessCode && (
            <section className="bg-white/5 border border-white/10 rounded-3xl p-8">
              <div className="flex flex-col gap-4 mb-6 text-center">
                <p className="text-sm uppercase tracking-widest text-white/60">Central interativa</p>
                <h2 className="text-3xl font-semibold">Escolha como quer continuar sua experiência</h2>
                <p className="text-white/70 max-w-3xl mx-auto">
                  Este quadrado reúne todos os atalhos essenciais para a live: transmissão oficial,
                  materiais, contato e comunidade. Clique no ícone desejado para abrir em uma nova aba.
                </p>
              </div>
              <div className="aspect-square rounded-[32px] border border-dashed border-white/15 p-6">
                <div className="grid grid-cols-2 gap-4 h-full">
                  {resourceActions.map((action) => (
                    <div
                      key={action.action}
                      className="rounded-2xl border border-white/10 bg-slate-900/60 flex flex-col justify-between p-5 hover:border-emerald-500/40 transition-all"
                    >
                      <div className="space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                          <action.icon className="w-6 h-6 text-emerald-300" />
                        </div>
                        <div>
                          <p className="font-semibold">{action.title}</p>
                          <p className="text-sm text-white/70">{action.description}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="justify-start text-emerald-300 hover:text-emerald-200 hover:bg-white/5 px-0"
                        onClick={() => {
                          if (action.action === "live") {
                            window.open(liveUrl, "_blank");
                            return;
                          }
                          toast.message("Ação disponível no dia da live", {
                            description: "Este atalho será liberado automaticamente para sua conta.",
                          });
                        }}
                      >
                        Abrir atalho
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
