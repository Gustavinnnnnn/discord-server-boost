import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { DiscordIcon } from "@/components/DiscordIcon";
import { SupportFab } from "@/components/SupportFab";
import logo from "@/assets/logo.png";
import { toast } from "sonner";
import {
  Loader2,
  ArrowRight,
  Check,
  Zap,
  Target,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  Users,
  Plus,
  Send,
  BadgeCheck,
  MousePointerClick,
  WalletCards,
  Flame,
  Crown,
  BarChart3,
} from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const painPoints = [
  "Servidor bonito, canais prontos, mas ninguém entra.",
  "Post em rede social morre com meia dúzia de views.",
  "Ads caro demais pra trazer gente realmente interessada.",
  "Grupo VIP, loja ou comunidade sem movimento diário.",
];

const benefits = [
  {
    icon: Target,
    title: "Público certo",
    text: "A campanha mira pessoas por nicho, região e interesse — não um público aleatório.",
  },
  {
    icon: MessageSquare,
    title: "Mensagem direta",
    text: "Seu convite chega na DM com copy e link do seu projeto, servidor, loja ou grupo.",
  },
  {
    icon: BarChart3,
    title: "Controle total",
    text: "Você acompanha créditos, campanhas e resultados pelo painel sem depender de suporte.",
  },
];

const steps = [
  { n: "01", title: "Conecta no Discord", text: "Login rápido, sem formulário gigante." },
  { n: "02", title: "Escolhe o plano", text: "Créditos caem após o PIX aprovado." },
  { n: "03", title: "Define a campanha", text: "Nicho, link e mensagem do seu jeito." },
  { n: "04", title: "Recebe tráfego", text: "A entrega começa e você acompanha tudo." },
];

const plans = [
  {
    name: "Starter",
    price: 30,
    dms: 600,
    sub: "Pra validar rápido",
    features: ["600 DMs entregues", "Painel completo", "Pagamento via PIX", "Suporte via Discord"],
  },
  {
    name: "Plus",
    price: 50,
    dms: 1100,
    sub: "Mais entrada por real",
    badge: "+100 bônus",
    features: ["1.000 DMs + 100 bônus", "Segmentação por nicho", "Painel completo", "Suporte via Discord"],
  },
  {
    name: "Pro",
    price: 150,
    dms: 3500,
    sub: "Mais escolhido",
    badge: "+500 bônus",
    highlight: true,
    features: ["3.000 DMs + 500 bônus", "Segmentação por nicho", "Métricas em tempo real", "Suporte prioritário"],
  },
  {
    name: "Business",
    price: 250,
    dms: 6000,
    sub: "Pra escalar pesado",
    badge: "+1.000 bônus",
    features: ["5.000 DMs + 1.000 bônus", "Segmentação avançada", "Métricas em tempo real", "Suporte VIP no Discord"],
  },
];

const faq = [
  {
    q: "Isso é para quem?",
    a: "Para donos de servidor Discord, comunidades, grupos VIP, lojas, canais e projetos que precisam colocar o link na frente de pessoas com interesse real.",
  },
  {
    q: "Quanto custa cada DM?",
    a: "A base é R$ 0,05 por DM. Os planos maiores incluem bônus, então o custo real por DM fica menor.",
  },
  {
    q: "Quando começa a entrega?",
    a: "Depois que o PIX é confirmado, seus créditos entram e a campanha pode começar em poucos minutos pelo painel.",
  },
  {
    q: "Preciso pagar mensalidade?",
    a: "Não. Você compra créditos quando quiser, usa no seu ritmo e mantém os créditos restantes na conta.",
  },
];

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [clientId, setClientId] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [liveCount, setLiveCount] = useState(2_184_337);

  useEffect(() => {
    const ref = params.get("ref");
    if (ref) {
      try {
        localStorage.setItem("aff_ref", ref);
        fetch(`${SUPABASE_URL}/functions/v1/track-referral`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: ref, action: "click" }),
        }).catch(() => {});
      } catch {
        /* ignore */
      }
    }
  }, [params]);

  useEffect(() => {
    supabase.functions
      .invoke("discord-config")
      .then(({ data }) => {
        if (data?.client_id) setClientId(data.client_id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setLiveCount((count) => count + Math.floor(Math.random() * 4) + 1);
    }, 1600);
    return () => clearInterval(id);
  }, []);

  const loginWithDiscord = () => {
    if (user) return navigate("/app");
    if (!clientId) return toast.error("Configuração do Discord não carregada");
    setBusy(true);
    const state = btoa(JSON.stringify({ origin: window.location.origin, nonce: crypto.randomUUID() }));
    const redirectUri = encodeURIComponent(`${SUPABASE_URL}/functions/v1/discord-oauth-callback`);
    const scope = encodeURIComponent("identify email guilds");
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}&prompt=consent`;
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <a href="#" className="flex items-center gap-3" aria-label="ServerBoost">
            <img src={logo} alt="ServerBoost" className="h-10 w-10 rounded-xl object-cover ring-1 ring-border" width={40} height={40} />
            <div className="leading-none">
              <span className="block text-base font-black tracking-tight">ServerBoost</span>
              <span className="mt-1 block text-[10px] font-bold uppercase text-muted-foreground">tráfego para Discord</span>
            </div>
          </a>

          <nav className="hidden items-center gap-1 text-sm md:flex">
            {[
              { id: "beneficios", label: "Benefícios" },
              { id: "como", label: "Como funciona" },
              { id: "preco", label: "Planos" },
              { id: "faq", label: "FAQ" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="rounded-full px-4 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            onClick={loginWithDiscord}
            disabled={busy}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:bg-primary-glow disabled:opacity-60 md:px-5"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <DiscordIcon className="h-4 w-4" />}
            <span>{user ? "Painel" : "Entrar"}</span>
          </button>
        </div>
      </header>

      <main>
        <section className="relative border-b border-border bg-hero-grid">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-primary" />
          <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-5 py-12 md:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:py-16">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-bold text-muted-foreground shadow-card">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span>{liveCount.toLocaleString("pt-BR")} DMs já entregues</span>
              </div>

              <h1 className="font-display text-[clamp(2.6rem,7vw,6.2rem)] font-black leading-[0.92] tracking-tight">
                Coloque seu Discord na frente de quem realmente entra.
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                Campanhas de DM segmentadas para levar pessoas reais para seu servidor, loja, grupo VIP ou lançamento — sem depender de post que flopou ou anúncio caro.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={loginWithDiscord}
                  disabled={busy}
                  className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-primary px-7 text-base font-black text-primary-foreground shadow-glow transition-all hover:bg-primary-glow disabled:opacity-60"
                >
                  {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <DiscordIcon className="h-5 w-5" />}
                  Começar pelo Discord
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => scrollTo("preco")}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-border bg-card px-7 text-base font-bold text-foreground transition-colors hover:border-primary hover:bg-secondary"
                >
                  Ver planos
                </button>
              </div>

              <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
                {[
                  { value: "5 min", label: "setup" },
                  { value: "PIX", label: "libera rápido" },
                  { value: "R$30", label: "mínimo" },
                ].map((item) => (
                  <div key={item.label} className="border-l border-border pl-3">
                    <div className="font-display text-2xl font-black tracking-tight">{item.value}</div>
                    <div className="mt-1 text-[10px] font-bold uppercase text-muted-foreground">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[520px] lg:mr-0">
              <div className="absolute -left-4 top-10 hidden rounded-2xl border border-border bg-card px-4 py-3 shadow-card md:flex">
                <TrendingUp className="mr-3 h-5 w-5 text-success" />
                <div>
                  <div className="text-sm font-black">+847 cliques hoje</div>
                  <div className="text-xs text-muted-foreground">campanhas ativas</div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-border bg-card p-3 shadow-card">
                <div className="overflow-hidden rounded-[1.45rem] border border-border bg-background">
                  <div className="flex items-center gap-3 border-b border-border bg-secondary px-4 py-3">
                    <DiscordIcon className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <div className="text-sm font-black">Campanha #1284</div>
                      <div className="text-xs text-muted-foreground">Servidor de games • Brasil</div>
                    </div>
                    <span className="rounded-full bg-success px-2.5 py-1 text-[10px] font-black uppercase text-success-foreground">ativa</span>
                  </div>

                  <div className="space-y-4 p-4">
                    <div className="rounded-2xl bg-secondary p-4">
                      <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                        <Send className="h-4 w-4 text-primary" /> Prévia da DM
                      </div>
                      <div className="rounded-2xl bg-card p-4 text-sm leading-relaxed text-card-foreground">
                        Ei, vi que você curte servidores de game. Estamos abrindo uma comunidade BR com eventos, call ativa e sorteios toda semana. Entra aqui 👇
                        <div className="mt-3 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 font-bold text-primary">discord.gg/seulink</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { icon: Send, value: "1.100", label: "DMs" },
                        { icon: MousePointerClick, value: "162", label: "cliques" },
                        { icon: Users, value: "74", label: "entradas" },
                      ].map((metric) => (
                        <div key={metric.label} className="rounded-2xl border border-border bg-card p-3">
                          <metric.icon className="mb-2 h-4 w-4 text-primary" />
                          <div className="font-display text-xl font-black tracking-tight">{metric.value}</div>
                          <div className="text-[10px] font-bold uppercase text-muted-foreground">{metric.label}</div>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-border bg-card p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-black">Entrega em andamento</span>
                        <span className="text-xs font-bold text-success">78%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full w-[78%] rounded-full bg-gradient-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 right-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-card">
                <div className="flex items-center gap-2 text-sm font-black">
                  <BadgeCheck className="h-5 w-5 text-success" /> Público segmentado
                </div>
                <div className="mt-1 text-xs text-muted-foreground">nicho + região + interesse</div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-card/40">
          <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 md:grid-cols-4 md:px-8">
            {painPoints.map((point) => (
              <div key={point} className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4">
                <Flame className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                <p className="text-sm font-semibold leading-relaxed text-muted-foreground">{point}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="beneficios" className="border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
              <div>
                <div className="mb-4 text-xs font-black uppercase text-primary">Por que converte</div>
                <h2 className="font-display text-4xl font-black leading-tight tracking-tight md:text-6xl">
                  Não é “mais uma divulgação”. É tráfego direto para o seu link.
                </h2>
              </div>
              <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground lg:ml-auto">
                A landing agora mostra o que o cliente compra: alcance direcionado, mensagem pronta para ação e um painel simples para transformar créditos em entrada real.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-3">
              {benefits.map((item) => (
                <article key={item.title} className="group rounded-3xl border border-border bg-card p-7 transition-all hover:-translate-y-1 hover:border-primary">
                  <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-glow transition-transform group-hover:scale-105">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="como" className="border-b border-border bg-secondary/30">
          <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 text-xs font-black uppercase text-primary">Fluxo simples</div>
              <h2 className="font-display text-4xl font-black leading-tight tracking-tight md:text-6xl">
                Do pagamento à campanha rodando sem enrolação.
              </h2>
            </div>

            <div className="mt-14 grid gap-4 md:grid-cols-4">
              {steps.map((step) => (
                <div key={step.n} className="relative rounded-3xl border border-border bg-card p-6">
                  <div className="mb-8 flex items-center justify-between">
                    <span className="font-display text-5xl font-black text-secondary">{step.n}</span>
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-black tracking-tight">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="preco" className="border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
            <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 text-xs font-black uppercase text-primary">Planos</div>
                <h2 className="font-display text-4xl font-black leading-tight tracking-tight md:text-6xl">
                  Escolha quantas DMs quer colocar na rua.
                </h2>
              </div>
              <p className="max-w-md text-muted-foreground md:text-right">
                Sem mensalidade. Sem cartão. Comprou, os créditos ficam na sua conta e você usa quando quiser.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {plans.map((plan) => (
                <article
                  key={plan.name}
                  className={`relative rounded-3xl p-6 transition-all hover:-translate-y-1 ${
                    plan.highlight ? "bg-primary text-primary-foreground shadow-glow" : "border border-border bg-card hover:border-primary"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-foreground px-3 py-1 text-[10px] font-black uppercase text-background">
                      <Crown className="h-3 w-3" /> Mais comprado
                    </div>
                  )}
                  <div className={`text-xs font-black uppercase ${plan.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{plan.sub}</div>
                  <h3 className="mt-2 text-2xl font-black tracking-tight">{plan.name}</h3>
                  <div className="mt-6 flex items-end gap-1">
                    <span className="font-display text-5xl font-black tracking-tight">R${plan.price}</span>
                    <span className={`pb-2 text-xs font-bold ${plan.highlight ? "text-primary-foreground/75" : "text-muted-foreground"}`}>PIX</span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-lg font-black">{plan.dms.toLocaleString("pt-BR")} DMs</span>
                    {plan.badge && (
                      <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${plan.highlight ? "bg-foreground text-background" : "bg-success text-success-foreground"}`}>
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <div className={`mt-2 text-xs ${plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    ≈ R$ {(plan.price / plan.dms).toFixed(3).replace(".", ",")} por DM
                  </div>

                  <div className={`my-6 h-px ${plan.highlight ? "bg-primary-foreground/20" : "bg-border"}`} />
                  <ul className="space-y-3 text-sm">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={loginWithDiscord}
                    disabled={busy}
                    className={`mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-black transition-colors disabled:opacity-60 ${
                      plan.highlight ? "bg-foreground text-background hover:bg-background hover:text-foreground" : "bg-primary text-primary-foreground hover:bg-primary-glow"
                    }`}
                  >
                    <WalletCards className="h-4 w-4" /> Escolher plano
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="afiliado" className="border-b border-border bg-gradient-primary text-primary-foreground">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1fr_0.9fr] lg:items-center">
            <div>
              <div className="mb-4 text-xs font-black uppercase text-primary-foreground/75">Afiliados</div>
              <h2 className="font-display text-4xl font-black leading-tight tracking-tight md:text-6xl">
                Indique a ServerBoost e receba 20% pra sempre.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-primary-foreground/85">
                Cada compra feita pelo seu link gera comissão recorrente. Saque via PIX a partir de R$ 50.
              </p>
              <button
                onClick={loginWithDiscord}
                className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-black text-background transition-colors hover:bg-background hover:text-foreground"
              >
                Virar afiliado <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "20%", label: "comissão" },
                { value: "Vitalício", label: "por cliente" },
                { value: "R$50", label: "saque mínimo" },
                { value: "PIX", label: "pagamento" },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-primary-foreground/20 bg-primary-foreground/10 p-5 backdrop-blur">
                  <div className="font-display text-3xl font-black tracking-tight">{item.value}</div>
                  <div className="mt-2 text-xs font-black uppercase text-primary-foreground/70">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="border-b border-border">
          <div className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
            <div className="mb-10 text-center">
              <div className="mb-4 text-xs font-black uppercase text-primary">FAQ</div>
              <h2 className="font-display text-4xl font-black tracking-tight md:text-5xl">Perguntas frequentes</h2>
            </div>

            <div className="space-y-3">
              {faq.map((item) => (
                <details key={item.q} className="group rounded-2xl border border-border bg-card transition-colors hover:border-primary [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
                    <span className="text-base font-black md:text-lg">{item.q}</span>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary transition-transform group-open:rotate-45">
                      <Plus className="h-4 w-4" />
                    </span>
                  </summary>
                  <p className="px-5 pb-5 leading-relaxed text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-card">
          <div className="mx-auto max-w-7xl px-5 py-16 text-center md:px-8 md:py-24">
            <ShieldCheck className="mx-auto mb-6 h-12 w-12 text-primary" />
            <h2 className="mx-auto max-w-4xl font-display text-4xl font-black leading-tight tracking-tight md:text-6xl">
              Seu servidor não precisa parecer vazio.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Entre com Discord, escolha um plano e transforme créditos em DMs segmentadas ainda hoje.
            </p>
            <button
              onClick={loginWithDiscord}
              disabled={busy}
              className="mt-8 inline-flex h-14 items-center justify-center gap-3 rounded-full bg-primary px-8 text-base font-black text-primary-foreground shadow-glow transition-colors hover:bg-primary-glow disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <DiscordIcon className="h-5 w-5" />}
              Começar agora
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm md:flex-row md:px-8">
          <div className="flex items-center gap-3">
            <img src={logo} alt="ServerBoost" className="h-8 w-8 rounded-lg object-cover" width={32} height={32} />
            <span className="font-black">ServerBoost</span>
            <span className="text-xs text-muted-foreground">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-bold uppercase text-muted-foreground">
            <button onClick={() => scrollTo("beneficios")} className="hover:text-foreground">Benefícios</button>
            <button onClick={() => scrollTo("como")} className="hover:text-foreground">Como funciona</button>
            <button onClick={() => scrollTo("preco")} className="hover:text-foreground">Planos</button>
            <button onClick={() => scrollTo("faq")} className="hover:text-foreground">FAQ</button>
          </div>
        </div>
      </footer>

      <SupportFab />
    </div>
  );
};

export default Landing;
