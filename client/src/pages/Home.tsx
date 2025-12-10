import { type ReactNode, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarRange,
  Compass,
  Download,
  MapPin,
  Music3,
  Navigation,
  Phone,
  Rss,
  Search,
  Share2,
  Sparkles,
  Star,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Ticket,
  Trees,
  UtensilsCrossed,
  Wind,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const announcements = [
  "Menu Turístico agora também em Porto Rico",
  "Empresas locais com destaque premium em dezembro",
  "Novos mapas temáticos de ecoturismo disponíveis",
];

const currencyCards = [
  { label: "Dólar Turismo", value: "R$ 5,50", variation: "+0,62%" },
  { label: "Euro Turismo", value: "R$ 6,39", variation: "+0,57%" },
  { label: "Peso Argentino", value: "R$ 0,027", variation: "-0,10%" },
];

const cities = [
  {
    name: "Maringá",
    state: "PR",
    badge: "Capital Verde",
    mapPreview:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    stats: {
      spots: 326,
      experiences: "12 roteiros guiados",
      weather: "26°C"
    },
  },
  {
    name: "Porto Rico",
    state: "PR",
    badge: "Paraíso no Rio Paraná",
    mapPreview:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    stats: {
      spots: 58,
      experiences: "Passeios náuticos",
      weather: "32°C"
    },
  },
];

const heroStats = [
  { label: "+320 lugares verificados", description: "Restaurantes, passeios e hotéis" },
  { label: "12 mapas temáticos", description: "Com rotas exclusivas pelo time local" },
  { label: "Eventos atualizados", description: "Agenda cultural e gastronômica diária" },
];

const categories = [
  {
    title: "Comer Bem",
    description: "Do café da manhã ao jantar com curadoria local",
    items: [
      "Pizzarias",
      "Churrascarias",
      "Hamburguerias",
      "Docerias",
      "Padarias",
      "Saudável",
    ],
    accent: "text-orange-600",
    background: "bg-gradient-to-br from-orange-50 via-white to-orange-100/40",
  },
  {
    title: "Turismo & Natureza",
    description: "Bosques, parques, cachoeiras e experiências guiadas",
    items: ["Parques", "Ecoturismo", "Turismo Regional", "Religioso", "Passeios"],
    accent: "text-emerald-600",
    background: "bg-gradient-to-br from-emerald-50 via-white to-emerald-100/40",
  },
  {
    title: "Bares & Entretenimento",
    description: "Baladas, bares autorais e programas noturnos",
    items: ["Bares", "Baladas", "Shows", "Agenda cultural", "Festivais"],
    accent: "text-purple-600",
    background: "bg-gradient-to-br from-purple-50 via-white to-purple-100/40",
  },
];

const featuredSpots = [
  {
    title: "Parque do Ingá",
    type: "Natureza",
    rating: 4.9,
    distance: "1,2 km do centro",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80",
    tags: ["Trilhas", "Família", "Gratuito"],
  },
  {
    title: "Mercadão de Maringá",
    type: "Gastronomia",
    rating: 4.8,
    distance: "Centro histórico",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    tags: ["Comer bem", "Compras", "Regional"],
  },
  {
    title: "Catedral Basílica",
    type: "Arquitetura",
    rating: 4.9,
    distance: "Marco da cidade",
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
    tags: ["Cartão-postal", "Mirante"],
  },
  {
    title: "Praia de Porto Rico",
    type: "Rotas Náuticas",
    rating: 4.7,
    distance: "2h de Maringá",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    tags: ["Passeios de barco", "Pôr do sol"],
  },
];

const promotionalEvents = [
  {
    title: "Rota Comer Bem - Sabores do Ingá",
    date: "12 Dez",
    hour: "19h",
    place: "Mercadão de Maringá",
    highlight: "Menu degustação com 8 casas convidadas",
    tags: ["Gastronomia", "Hoje"],
  },
  {
    title: "Festival Brasa & Chopp",
    date: "13 Dez",
    hour: "18h",
    place: "Vila Olímpica",
    highlight: "Chefs convidados + cervejarias artesanais",
    tags: ["Fim de semana", "Família"],
  },
  {
    title: "Tour de Cafeterias",
    date: "14 Dez",
    hour: "10h",
    place: "Zona 01",
    highlight: "Roteiro guiado por 5 casas especiais",
    tags: ["Manhã", "Gastronomia"],
  },
];

const culturalEvents = [
  {
    title: "Concerto ao pôr do sol",
    date: "14 Dez",
    hour: "17h",
    place: "Parque do Japão",
    highlight: "Filarmônica de Maringá em concerto gratuito",
    tags: ["Família", "Ao ar livre"],
  },
  {
    title: "Rota dos Murais",
    date: "15 Dez",
    hour: "09h",
    place: "Centro histórico",
    highlight: "Tour fotográfico pelos novos grafites",
    tags: ["Arte urbana", "Hoje"],
  },
  {
    title: "Feira Criativa",
    date: "15 Dez",
    hour: "10h",
    place: "Praça Renato Celidônio",
    highlight: "Artistas independentes, música e gastronomia",
    tags: ["Fim de semana", "Família"],
  },
];

const discoveryList = [
  {
    title: "Bosco Rooftop",
    category: "Bares e Baladas",
    rating: 4.9,
    neighborhood: "Zona 03",
    highlight: "Drinks autorais + vista panorâmica",
    tags: ["Sunset", "Pet friendly"],
  },
  {
    title: "Arautos do Evangelho",
    category: "Turismo Religioso",
    rating: 4.8,
    neighborhood: "Distrito de Floriano",
    highlight: "Arquitetura europeia e visitas guiadas",
    tags: ["História", "Cultural"],
  },
  {
    title: "Parque Alfredo Nyffeler",
    category: "Natureza",
    rating: 4.7,
    neighborhood: "Zona Norte",
    highlight: "Trilhas suspensas e lago para esportes",
    tags: ["Ao ar livre", "Família"],
  },
  {
    title: "Mercadinho do Centro",
    category: "Comer Bem",
    rating: 4.8,
    neighborhood: "Zona 01",
    highlight: "Produtores locais e café autoral",
    tags: ["Local", "Gastronomia"],
  },
];

const blogPosts = [
  {
    title: "48 horas em Maringá: roteiro completo",
    category: "Guia rápido",
    readingTime: "7 min",
    excerpt: "Do café da manhã no Novo Centro ao pôr do sol no Parque do Japão.",
    image:
      "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Onde comer bem depois da meia-noite",
    category: "Comer Bem",
    readingTime: "5 min",
    excerpt: "Selecionamos casas que funcionam até tarde com cozinha completa.",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "As 6 experiências para quem visita Porto Rico",
    category: "Turismo",
    readingTime: "6 min",
    excerpt: "Passeios de barco, gastronomia ribeirinha e pôr do sol na orla.",
    image:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=900&q=80",
  },
];

const partnerLogos = [
  "Prefeitura",
  "ABRASEL",
  "Turismo PR",
  "SEBRAE",
  "Parque do Japão",
];

const filters = ["Todos", "Hoje", "Fim de semana", "Família", "Ao ar livre", "Gastronomia"] as const;

type Filter = (typeof filters)[number];

const applyFilter = (list: typeof promotionalEvents, filter: Filter) => {
  if (filter === "Todos") return list;
  return list.filter((event) => event.tags.includes(filter));
};

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState(cities[0]);
  const [activeFilter, setActiveFilter] = useState<Filter>(filters[0]);

  const promotional = useMemo(
    () => applyFilter(promotionalEvents, activeFilter),
    [activeFilter]
  );

  const cultural = useMemo(
    () => applyFilter(culturalEvents, activeFilter),
    [activeFilter]
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopInfoBar />
      <PrimaryNavigation />

      <main>
        <HeroSection
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
        />

        <CityHighlights selectedCity={selectedCity} />

        <SectionIntro
          title="Explorar por categorias"
          subtitle="Curadoria feita por quem vive a cidade todos os dias"
        />
        <div className="container grid gap-6 pb-16 lg:grid-cols-3">
          {categories.map((category) => (
            <Card
              key={category.title}
              className={`${category.background} border-0 shadow-sm`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl font-semibold">
                    {category.title}
                  </CardTitle>
                  <Badge variant="secondary" className="bg-white/40">
                    ver rotas
                  </Badge>
                </div>
                <CardDescription>{category.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {category.items.map((item) => (
                  <Badge
                    key={item}
                    variant="outline"
                    className={`rounded-full border-none bg-white/70 ${category.accent}`}
                  >
                    {item}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <SectionIntro
          title="Locais em destaque nesta semana"
          subtitle="Conteúdo atualizado com fotos e avaliações reais"
          action="ver todos"
        />
        <FeaturedSpots />

        <SectionIntro
          title="Agenda oficial"
          subtitle="Promoções gastronômicas e cultura para planejar seu dia"
        />
        <EventsSection
          activeFilter={activeFilter}
          onChangeFilter={setActiveFilter}
          promotional={promotional}
          cultural={cultural}
        />

        <SectionIntro
          title="Descobertas da comunidade"
          subtitle="Locais salvos pelos moradores e viajantes que usam o Menu"
        />
        <DiscoveryList />

        <SectionIntro title="Blog & notícias" subtitle="Roteiros, novidades e bastidores" />
        <BlogGrid />

        <Partners />
        <AppCallToAction />
      </main>

      <Footer />
    </div>
  );
}

function TopInfoBar() {
  return (
    <div className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="container flex flex-wrap items-center gap-6 py-3 text-sm">
        <div className="flex flex-col gap-1 text-slate-500">
          <div className="flex items-center gap-2 text-orange-600">
            <Sun className="h-4 w-4" />
            <span className="text-xs uppercase tracking-wide">Atualização diária</span>
          </div>
          <div className="flex flex-wrap gap-3 text-slate-600">
            {announcements.map((announcement) => (
              <span key={announcement} className="flex items-center gap-2">
                <span className="text-orange-400">•</span>
                {announcement}
              </span>
            ))}
          </div>
        </div>

        <Separator orientation="vertical" className="hidden h-8 md:block" />

        <div className="flex flex-wrap gap-4 text-slate-600">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-sky-500" />
            26°C / sensação 28°
          </div>
          <div className="flex items-center gap-2">
            <Wind className="h-4 w-4 text-emerald-500" />
            Ventos 14 km/h
          </div>
          <div className="flex items-center gap-2">
            <Sunrise className="h-4 w-4 text-yellow-500" /> 05:35
          </div>
          <div className="flex items-center gap-2">
            <Sunset className="h-4 w-4 text-purple-500" /> 18:47
          </div>
        </div>
      </div>
    </div>
  );
}

function PrimaryNavigation() {
  return (
    <div className="border-b border-slate-200 bg-white/95">
      <div className="container flex flex-wrap items-center gap-4 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500 text-white font-semibold">
            MT
          </div>
          <div>
            <p className="text-base font-semibold text-slate-900">Menu Turístico</p>
            <p className="text-xs uppercase tracking-wide text-orange-500">
              login aberto
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-2 text-sm">
          <Button variant="ghost" className="text-slate-600">
            Comer Bem
          </Button>
          <Button variant="ghost" className="text-slate-600">
            Turismo
          </Button>
          <Button variant="ghost" className="text-slate-600">
            Agenda
          </Button>
          <Button variant="ghost" className="text-slate-600">
            Blog
          </Button>
          <Button variant="ghost" className="text-slate-600">
            Planos
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-full">
            Divulgue seu negócio
          </Button>
          <Button className="rounded-full bg-orange-500 px-6 text-white hover:bg-orange-600">
            Acessar painel
          </Button>
        </div>
      </div>
    </div>
  );
}

type HeroProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCity: (typeof cities)[0];
  onSelectCity: (city: (typeof cities)[0]) => void;
};

function HeroSection({ searchTerm, onSearchChange, selectedCity, onSelectCity }: HeroProps) {
  return (
    <section className="relative isolate overflow-hidden bg-gradient-to-br from-orange-50 via-white to-slate-50">
      <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[radial-gradient(circle_at_top,_#fed7aa,_transparent_55%)] lg:block" />
      <div className="container grid items-center gap-12 pt-16 pb-20 lg:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-8">
          <Badge variant="outline" className="border-orange-200 text-orange-600">
            Turismo inteligente • Curadoria local
          </Badge>
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-tight text-slate-900 lg:text-5xl">
              Descubra onde comer, passear e se divertir em {selectedCity.name}
            </h1>
            <p className="text-lg text-slate-600 lg:text-xl">
              Agenda em tempo real, roteiros guiados e os melhores lugares para curtir a cidade.
              Tudo em um só lugar, atualizado diariamente pelo time Menu Turístico.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <p className="text-sm font-medium text-slate-500">Planeje sua próxima saída</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {cities.map((city) => (
                <Button
                  key={city.name}
                  variant={city.name === selectedCity.name ? "default" : "secondary"}
                  className={`rounded-full ${city.name === selectedCity.name ? "bg-orange-500 hover:bg-orange-600" : "bg-slate-100 text-slate-700"}`}
                  onClick={() => onSelectCity(city)}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {city.name}
                </Button>
              ))}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  O que você procura?
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <Search className="h-5 w-5 text-orange-500" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder="Ex: brunch, parque, hotel pet friendly"
                    className="border-0 bg-transparent text-base text-slate-800 focus-visible:ring-0"
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
                  <p className="text-xs text-slate-500">Data</p>
                  <p className="font-semibold text-slate-800">10 Dez - 15 Dez</p>
                  <span className="text-xs text-slate-500">Atualize para ver agenda personalizada</span>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
                  <p className="text-xs text-slate-500">Perfil</p>
                  <p className="font-semibold text-slate-800">Família + Gastronomia</p>
                  <span className="text-xs text-orange-500">Novo filtro "cidade com crianças"</span>
                </div>
              </div>
            </div>

            <Button className="mt-4 w-full rounded-2xl bg-slate-900 py-6 text-lg text-white hover:bg-slate-800">
              Explorar agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {heroStats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm shadow-sm">
                <p className="text-base font-semibold text-slate-900">{stat.label}</p>
                <p className="text-slate-500">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-[32px] border border-orange-100 bg-white shadow-2xl">
            <img
              src={selectedCity.mapPreview}
              alt={selectedCity.name}
              className="h-80 w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 w-full space-y-3 px-6 pb-6 text-white">
              <div className="flex items-center gap-2 text-sm uppercase tracking-wide">
                <Navigation className="h-4 w-4" />
                {selectedCity.badge}
              </div>
              <div>
                <h3 className="text-2xl font-semibold">{selectedCity.name}</h3>
                <p className="text-sm text-white/80">{selectedCity.stats.experiences}</p>
              </div>
              <div className="flex gap-4 text-sm">
                <span>{selectedCity.stats.spots} lugares</span>
                <span>Clima {selectedCity.stats.weather}</span>
              </div>
            </div>
          </div>

          <div className="absolute -left-6 top-6 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl">
            <p className="text-xs uppercase tracking-wide text-slate-500">Cotação turismo</p>
            <div className="mt-3 space-y-3 text-sm">
              {currencyCards.map((currency) => (
                <div key={currency.label} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-800">{currency.label}</p>
                    <p className="text-xs text-slate-500">Atualizado agora</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{currency.value}</p>
                    <p className="text-xs text-emerald-500">{currency.variation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute -right-6 bottom-8 w-48 rounded-2xl border border-slate-200 bg-white/95 p-4 text-sm shadow-xl">
            <p className="flex items-center gap-2 text-slate-500">
              <Sparkles className="h-4 w-4 text-orange-500" />
              Highlights do dia
            </p>
            <ul className="mt-3 space-y-2 text-slate-700">
              <li>• 3 lugares novos cadastrados</li>
              <li>• 2 mapas atualizados</li>
              <li>• 1 evento exclusivo para assinantes</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function CityHighlights({ selectedCity }: { selectedCity: (typeof cities)[0] }) {
  return (
    <section className="container -mt-8 space-y-6 pb-12 lg:-mt-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Cidade atual</p>
            <h3 className="text-2xl font-semibold text-slate-900">
              {selectedCity.name}, {selectedCity.state}
            </h3>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <Trees className="h-4 w-4 text-emerald-500" /> {selectedCity.stats.spots} pontos verdes
            </span>
            <span className="flex items-center gap-2">
              <CalendarRange className="h-4 w-4 text-slate-500" /> Agenda atualizada
            </span>
            <span className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-orange-500" /> Rotas guiadas
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturedSpots() {
  return (
    <div className="container pb-16">
      <div className="flex gap-4 overflow-x-auto pb-4">
        {featuredSpots.map((spot) => (
          <Card key={spot.title} className="min-w-[280px] flex-1 border-0 shadow-lg">
            <div className="relative">
              <img
                src={spot.image}
                alt={spot.title}
                className="h-48 w-full rounded-3xl object-cover"
                loading="lazy"
              />
              <Badge className="absolute left-4 top-4 rounded-full bg-white/90 text-slate-900">
                {spot.type}
              </Badge>
            </div>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{spot.title}</CardTitle>
                  <CardDescription>{spot.distance}</CardDescription>
                </div>
                <div className="flex items-center gap-1 text-orange-500">
                  <Star className="h-4 w-4 fill-orange-500" />
                  <span className="font-semibold text-slate-900">{spot.rating}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {spot.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="rounded-full">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

type EventsProps = {
  activeFilter: Filter;
  onChangeFilter: (filter: Filter) => void;
  promotional: typeof promotionalEvents;
  cultural: typeof culturalEvents;
};

function EventsSection({ activeFilter, onChangeFilter, promotional, cultural }: EventsProps) {
  const renderCard = (title: string, events: typeof promotionalEvents, accent: string, icon: ReactNode) => (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-3 border-b border-slate-100">
        <div className="flex items-center gap-3 text-slate-500">
          {icon}
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Agenda</p>
            <CardTitle className="text-2xl text-slate-900">{title}</CardTitle>
          </div>
        </div>
        <p className="text-sm text-slate-500">
          Atualizado diariamente com os eventos oficiais e parceiros
        </p>
      </CardHeader>
      <CardContent className="divide-y divide-slate-100 p-0">
        {events.map((event) => (
          <div key={event.title} className="flex flex-col gap-2 p-5 hover:bg-slate-50/70">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {event.date} • {event.hour}
                </p>
                <p className="text-lg font-semibold text-slate-900">{event.title}</p>
              </div>
              <Badge className={`rounded-full ${accent}`}>{event.place}</Badge>
            </div>
            <p className="text-sm text-slate-600">{event.highlight}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {event.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-full">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <section className="container space-y-6 pb-16">
      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => (
          <Button
            key={filter}
            variant={filter === activeFilter ? "default" : "secondary"}
            className={`rounded-full ${filter === activeFilter ? "bg-slate-900 hover:bg-slate-800" : "bg-slate-100 text-slate-700"}`}
            onClick={() => onChangeFilter(filter)}
          >
            {filter}
          </Button>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {renderCard(
          "Promoções & Gastronomia",
          promotional,
          "bg-orange-100 text-orange-600",
          <UtensilsCrossed className="h-10 w-10 rounded-2xl bg-orange-50 p-2 text-orange-500" />
        )}
        {renderCard(
          "Cultura & Turismo",
          cultural,
          "bg-purple-100 text-purple-600",
          <Music3 className="h-10 w-10 rounded-2xl bg-purple-50 p-2 text-purple-500" />
        )}
      </div>
    </section>
  );
}

function DiscoveryList() {
  return (
    <section className="container pb-16">
      <div className="grid gap-4">
        {discoveryList.map((item) => (
          <Card key={item.title} className="border border-slate-100 shadow-sm">
            <CardContent className="flex flex-col gap-4 p-5 text-sm md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">{item.category}</p>
                <h4 className="text-xl font-semibold text-slate-900">{item.title}</h4>
                <p className="text-slate-600">{item.highlight}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-orange-500">
                  <Star className="h-4 w-4 fill-orange-500" />
                  {item.rating}
                </div>
                <Badge variant="outline" className="rounded-full">
                  {item.neighborhood}
                </Badge>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="rounded-full">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function BlogGrid() {
  return (
    <section className="container grid gap-6 pb-16 lg:grid-cols-3">
      {blogPosts.map((post) => (
        <Card key={post.title} className="overflow-hidden border-0 shadow-lg">
          <img src={post.image} alt={post.title} className="h-48 w-full object-cover" loading="lazy" />
          <CardContent className="space-y-3 p-6">
            <Badge variant="outline" className="rounded-full">
              {post.category}
            </Badge>
            <CardTitle className="text-2xl">{post.title}</CardTitle>
            <CardDescription>{post.excerpt}</CardDescription>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Rss className="h-4 w-4" />
              {post.readingTime}
            </div>
            <Button variant="link" className="px-0 text-orange-600">
              Ler matéria
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

function Partners() {
  return (
    <section className="border-y border-slate-200 bg-white/60">
      <div className="container flex flex-wrap items-center justify-between gap-4 py-10">
        {partnerLogos.map((partner) => (
          <span key={partner} className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            {partner}
          </span>
        ))}
      </div>
    </section>
  );
}

function AppCallToAction() {
  return (
    <section className="container py-16">
      <div className="grid gap-10 overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 text-white lg:grid-cols-2">
        <div className="space-y-6">
          <Badge variant="outline" className="border-white/30 text-white">
            App Menu Turístico
          </Badge>
          <h3 className="text-3xl font-semibold">Leve os mapas offline e roteiros na palma da mão</h3>
          <p className="text-slate-200">
            Favoritos sincronizados, notificações de eventos exclusivos e suporte direto com o time local.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button className="rounded-full bg-white px-6 text-slate-900 hover:bg-slate-100">
              <Download className="mr-2 h-4 w-4" /> Baixar app
            </Button>
            <Button variant="outline" className="rounded-full border-white/40 text-white">
              <Share2 className="mr-2 h-4 w-4" /> Enviar para WhatsApp
            </Button>
          </div>
          <div className="flex gap-6 text-sm text-white/70">
            <div>
              <p className="text-2xl font-semibold text-white">4.9</p>
              <p>nota média</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">25k+</p>
              <p>downloads</p>
            </div>
          </div>
        </div>
        <div className="grid gap-4 text-sm text-white/80">
          <Card className="border-white/20 bg-white/5">
            <CardContent className="flex items-center gap-3 p-5">
              <Phone className="h-10 w-10 rounded-2xl bg-white/10 p-2" />
              <div>
                <p className="text-base font-semibold text-white">Central de concierge</p>
                <p>Envie uma mensagem e receba recomendações personalizadas.</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-white/20 bg-white/5">
            <CardContent className="flex items-center gap-3 p-5">
              <Ticket className="h-10 w-10 rounded-2xl bg-white/10 p-2" />
              <div>
                <p className="text-base font-semibold text-white">Vantagens exclusivas</p>
                <p>Ingressos com desconto e reservas prioritárias em parceiros.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="container grid gap-8 py-10 md:grid-cols-4">
        <div className="space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white text-lg font-semibold">
            MT
          </div>
          <p className="text-sm text-slate-600">
            Guia oficial para viver experiências em Maringá e região noroeste.
          </p>
          <p className="text-xs text-slate-500">Atualizado em 10 dez 2025</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Explorar</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>Comer Bem</li>
            <li>Turismo</li>
            <li>Eventos</li>
            <li>Blog</li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Institucional</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>Sobre</li>
            <li>Planos para negócios</li>
            <li>Imprensa</li>
            <li>Contato</li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Baixe o app</p>
          <div className="mt-3 space-y-3">
            <Button className="w-full rounded-2xl bg-slate-900 text-white">App Store</Button>
            <Button variant="outline" className="w-full rounded-2xl">
              Google Play
            </Button>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        Menu Turístico • 2025 • Feito em Maringá, PR
      </div>
    </footer>
  );
}

function SectionIntro({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: string;
}) {
  return (
    <div className="container flex flex-wrap items-center justify-between gap-4 py-10">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">Menu Turístico</p>
        <h2 className="text-3xl font-semibold text-slate-900">{title}</h2>
        <p className="text-slate-600">{subtitle}</p>
      </div>
      {action && (
        <Button variant="link" className="text-orange-600">
          {action}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
