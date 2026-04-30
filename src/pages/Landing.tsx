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
} from "lucide-react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [clientId, setClientId] = useState<string>("");
  const [busy, setBusy] = useState(false);

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

  const loginWithDiscord = () => {
    if (user) return navigate("/app");
    if (!clientId) return toast.error("Configuração do Discord não carregada");
    setBusy(true);
    const state = btoa(
      JSON.stringify({ origin: window.location.origin, nonce: crypto.randomUUID() }),
    );
    const redirectUri = encodeURIComponent(`${SUPABASE_URL}/functions/v1/discord-oauth-callback`);
    const scope = encodeURIComponent("identify email guilds");
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}&prompt=consent`;
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5">
            <img src={logo} alt="ServerBoost" className="h-10 w-10 rounded-xl object-cover" width={40} height={40} />
            <span className="font-bold text-lg tracking-tight">ServerBoost</span>
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <button onClick={() => scrollTo("como")} className="hover:text-foreground transition-colors">
              Como funciona
            </button>
            <button onClick={() => scrollTo("preco")} className="hover:text-foreground transition-colors">
              Preço
            </button>
            <button onClick={() => scrollTo("afiliado")} className="hover:text-foreground transition-colors">
              Afiliados
            </button>
            <button onClick={() => scrollTo("faq")} className="hover:text-foreground transition-colors">
              FAQ
            </button>
          </nav>

          <button
            onClick={loginWithDiscord}
            disabled={busy}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-glow text-primary-foreground px-4 md:px-5 h-10 rounded-full text-sm font-semibold transition-colors disabled:opacity-60 shadow-glow"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <DiscordIcon className="h-4 w-4" />
                <span>{user ? "Entrar no painel" : "Entrar"}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* glow background */}
        <div className="absolute inset-0 -z-10 bg-background" />
        <div className="absolute -z-10 top-[-15%] left-1/2 -translate-x-1/2 h-[700px] w-[1100px] rounded-full bg-primary/25 blur-[140px]" />
        <div className="absolute -z-10 top-[20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#9b6bff]/20 blur-[120px]" />
        <div className="absolute inset-0 -z-10 opacity-[0.05] pointer-events-none [background-image:linear-gradient(to_right,hsl(var(--foreground))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground))_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

        <div className="relative max-w-7xl mx-auto px-5 md:px-8 pt-14 md:pt-24 pb-20 md:pb-28">
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-16 items-center">
            {/* LEFT: copy */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-card/60 backdrop-blur text-xs font-medium text-muted-foreground mb-7">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </span>
                +2.184.337 DMs entregues no Discord
              </div>

              <h1 className="font-display font-bold tracking-tight leading-[1.02] text-[clamp(2.4rem,6vw,4.8rem)]">
                Seu servidor tá vazio porque{" "}
                <span className="relative inline-block">
                  <span className="text-gradient">ninguém sabe</span>
                  <svg className="absolute left-0 -bottom-2 w-full" height="14" viewBox="0 0 300 14" fill="none" preserveAspectRatio="none">
                    <path d="M2 9C60 3 140 3 200 7C240 9.5 270 10 298 6" stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>{" "}
                que ele existe.
              </h1>

              <p className="mt-7 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                A gente coloca o link do seu servidor, loja ou projeto na DM de pessoas reais
                do Discord — dentro do seu nicho. Você só paga{" "}
                <span className="text-foreground font-semibold">R$ 0,05 por DM enviada</span>.
              </p>

              <div className="mt-9 flex flex-col sm:flex-row items-center lg:items-stretch justify-center lg:justify-start gap-3">
                <button
                  onClick={loginWithDiscord}
                  disabled={busy}
                  className="group inline-flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-glow text-primary-foreground h-14 px-7 rounded-full font-semibold text-base transition-all disabled:opacity-60 shadow-glow hover:scale-[1.02] active:scale-[0.98]"
                >
                  {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <DiscordIcon className="h-5 w-5" />}
                  Começar com Discord
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  onClick={() => scrollTo("como")}
                  className="inline-flex items-center justify-center gap-2 h-14 px-6 rounded-full font-semibold text-base text-foreground border border-border hover:bg-card transition-colors"
                >
                  Ver como funciona
                </button>
              </div>

              {/* trust row */}
              <div className="mt-8 flex flex-col sm:flex-row items-center lg:items-start gap-4 lg:gap-6">
                <div className="flex -space-x-2">
                  {[
                    "from-[#5865F2] to-[#8b5cf6]",
                    "from-[#ec4899] to-[#f97316]",
                    "from-[#10b981] to-[#06b6d4]",
                    "from-[#f59e0b] to-[#ef4444]",
                    "from-[#8b5cf6] to-[#5865F2]",
                  ].map((g, i) => (
                    <div
                      key={i}
                      className={`h-9 w-9 rounded-full bg-gradient-to-br ${g} ring-2 ring-background grid place-items-center text-[11px] font-bold text-white`}
                    >
                      {["LV", "MK", "JR", "AN", "PC"][i]}
                    </div>
                  ))}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1 text-warning">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                        <path d="M10 1.5l2.7 5.5 6.05.88-4.38 4.27 1.04 6.05L10 15.4l-5.41 2.84 1.04-6.05L1.25 7.88 7.3 7l2.7-5.5z" />
                      </svg>
                    ))}
                    <span className="text-foreground font-semibold ml-1.5 text-sm">4.9/5</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    +1.200 donos de servidor já usaram
                  </p>
                </div>
              </div>

              <p className="mt-6 text-xs text-muted-foreground font-mono">
                ⚡ login em 5s · sem cartão · mínimo R$ 25
              </p>
            </div>

            {/* RIGHT: Discord DM mockup */}
            <div className="relative max-w-md mx-auto lg:max-w-none w-full">
              {/* floating stat top */}
              <div className="hidden md:flex absolute -top-4 -left-6 z-10 items-center gap-2.5 rounded-2xl border border-border bg-card/95 backdrop-blur px-4 py-3 shadow-card">
                <div className="h-9 w-9 rounded-xl bg-success/15 grid place-items-center">
                  <TrendingUp className="h-4 w-4 text-success" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">novos membros</div>
                  <div className="text-sm font-bold tabular-nums">+847 hoje</div>
                </div>
              </div>

              {/* floating stat bottom */}
              <div className="hidden md:flex absolute -bottom-4 -right-4 z-10 items-center gap-2.5 rounded-2xl border border-border bg-card/95 backdrop-blur px-4 py-3 shadow-card">
                <div className="h-9 w-9 rounded-xl bg-primary/15 grid place-items-center">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">CTR</div>
                  <div className="text-sm font-bold tabular-nums">14,7%</div>
                </div>
              </div>

              {/* Discord-like DM card */}
              <div className="relative rounded-2xl border border-border bg-[#313338] shadow-2xl overflow-hidden">
                {/* header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-black/30 bg-[#2b2d31]">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-[#9b6bff] grid place-items-center text-white font-bold text-sm">
                    S
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white">ServerBoost</div>
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> online
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500">agora</div>
                </div>

                {/* messages */}
                <div className="p-4 space-y-4 bg-[#313338]">
                  <div className="flex gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-[#9b6bff] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-medium text-white">SeuServidor</span>
                        <span className="text-[10px] text-zinc-500">hoje às 14:32</span>
                      </div>
                      <p className="text-sm text-zinc-200 mt-0.5 leading-relaxed">
                        E aí! Vi que você curte trade. Tô abrindo um server BR focado em sinais
                        diários e análise grátis. Quer dar uma olhada?
                      </p>
                      <a
                        href="#"
                        onClick={(e) => e.preventDefault()}
                        className="mt-2 block rounded-lg border-l-4 border-primary bg-[#2b2d31] p-3 hover:bg-[#34363c] transition-colors"
                      >
                        <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                          Discord — Convite
                        </div>
                        <div className="text-sm font-semibold text-white mt-1">
                          Trade BR · Sinais Diários
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> 2.847 online
                          </span>
                          <span>· 12.5k membros</span>
                        </div>
                        <div className="mt-2 text-[11px] text-primary font-medium">
                          discord.gg/tradebr →
                        </div>
                      </a>
                    </div>
                  </div>

                  <div className="flex gap-3 pl-12">
                    <div className="rounded-2xl rounded-tl-sm bg-primary px-4 py-2 max-w-[80%]">
                      <p className="text-sm text-white">Caraca, é exatamente o que eu tava procurando 🔥</p>
                    </div>
                  </div>

                  {/* typing indicator */}
                  <div className="flex items-center gap-2 pl-12 text-xs text-zinc-500">
                    <div className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span>está digitando...</span>
                  </div>
                </div>

                {/* input */}
                <div className="px-4 py-3 bg-[#383a40] border-t border-black/30">
                  <div className="rounded-lg bg-[#2b2d31] px-3 py-2 text-sm text-zinc-500">
                    Mensagem @ServerBoost
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DOR */}
      <section className="border-t border-border">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-mono uppercase tracking-widest text-primary mb-4">
              A real
            </div>
            <h2 className="font-display font-bold text-3xl md:text-5xl leading-tight tracking-tight">
              Você já passou por isso?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                t: "Servidor fantasma",
                d: "Você abriu, montou os canais, configurou tudo. E só você e dois bots aparecem online.",
              },
              {
                t: "Loja sem cliente",
                d: "Produto pronto, link no story, mensagem nos amigos. Mas zero venda no fim do mês.",
              },
              {
                t: "Live com 0 viewer",
                d: "Você abre live, nada de chat. Posta clip, ninguém vê. Aí desanima e some por semanas.",
              },
              {
                t: "Grupo VIP vazio",
                d: "Sinais bons, planilha redondinha. Mas só entra parente — e nenhum vira pagante.",
              },
              {
                t: "Conteúdo sem alcance",
                d: "Edita 4h um vídeo, posta. 12 views, 1 like (seu). Sente que tá empurrando água morro acima.",
              },
              {
                t: "Pagou ads e queimou",
                d: "Gastou R$ 300 em Meta Ads pra trazer 3 cadastros. CAC absurdo, retorno zero.",
              },
            ].map((p) => (
              <div
                key={p.t}
                className="rounded-2xl border border-border bg-card p-6 hover:border-primary/40 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg bg-destructive/10 text-destructive grid place-items-center mb-4">
                  <Plus className="h-5 w-5 rotate-45" />
                </div>
                <h3 className="font-semibold text-lg mb-1.5">{p.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section id="como" className="border-t border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="text-xs font-mono uppercase tracking-widest text-primary mb-4">
              Como funciona
            </div>
            <h2 className="font-display font-bold text-3xl md:text-5xl leading-tight tracking-tight">
              Do zero à primeira campanha em <span className="text-gradient">5 minutos</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                n: "01",
                icon: DiscordIcon,
                t: "Conecta o Discord",
                d: "Login com tua conta Discord. Sem formulário, sem cadastro. Em 5 segundos tá dentro.",
              },
              {
                n: "02",
                icon: Target,
                t: "Escolhe o público",
                d: "Define o nicho — gaming, trade, anime, marketing, NSFW, o que for. A gente já tem mapeado.",
              },
              {
                n: "03",
                icon: MessageSquare,
                t: "Escreve a mensagem",
                d: "Sua copy, suas palavras, seu link. Servidor, loja, vídeo — qualquer coisa válida.",
              },
              {
                n: "04",
                icon: Zap,
                t: "Paga via PIX",
                d: "R$ 0,05 por DM. Compra a partir de R$ 25 (500 DMs). PIX cai, créditos entram na hora.",
              },
              {
                n: "05",
                icon: TrendingUp,
                t: "Acompanha em tempo real",
                d: "Dashboard com entregas, cliques e conversões. Sem caixa preta — você vê tudo acontecendo.",
              },
              {
                n: "06",
                icon: Users,
                t: "Recebe gente real",
                d: "Pessoas reais entram no teu servidor, na tua loja, no teu link. Sem bot, sem fake.",
              },
            ].map((s) => (
              <div
                key={s.n}
                className="relative rounded-2xl border border-border bg-card p-6 hover:border-primary/40 hover:shadow-glow transition-all"
              >
                <div className="absolute top-5 right-5 font-mono text-xs text-muted-foreground">
                  {s.n}
                </div>
                <div className="h-11 w-11 rounded-xl bg-primary/15 text-primary grid place-items-center mb-5">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{s.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREÇO */}
      <section id="preco" className="border-t border-border">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs font-mono uppercase tracking-widest text-primary mb-4">
              Preço
            </div>
            <h2 className="font-display font-bold text-3xl md:text-5xl leading-tight tracking-tight">
              <span className="text-gradient">R$ 0,05</span> por DM. Sem mensalidade.
            </h2>
            <p className="mt-5 text-muted-foreground text-base md:text-lg">
              Compra créditos, usa quando quiser. Mínimo R$ 25 (500 DMs). Pode escolher qualquer valor acima disso.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              {
                name: "Starter",
                price: 25,
                dms: 500,
                bonus: null,
                sub: "Pra testar",
                features: ["500 DMs entregues", "R$ 0,05 por DM", "Dashboard completo", "Suporte via Discord"],
              },
              {
                name: "Pro",
                price: 100,
                dms: 2200,
                bonus: "+200 DMs grátis",
                sub: "Mais escolhido",
                highlight: true,
                features: [
                  "2.200 DMs entregues",
                  "R$ 0,045 por DM (bônus)",
                  "Segmentação por nicho",
                  "Dashboard completo",
                  "Suporte prioritário",
                ],
              },
              {
                name: "Business",
                price: 200,
                dms: 4500,
                bonus: "+500 DMs grátis",
                sub: "Pra escalar",
                features: [
                  "4.500 DMs entregues",
                  "R$ 0,044 por DM (bônus)",
                  "Segmentação avançada",
                  "Métricas em tempo real",
                  "Suporte VIP no Discord",
                ],
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl p-7 md:p-8 transition-all ${
                  p.highlight
                    ? "bg-gradient-primary text-primary-foreground shadow-glow scale-[1.02] md:scale-105"
                    : "bg-card border border-border hover:border-primary/40"
                }`}
              >
                {p.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-foreground text-background text-[11px] font-bold uppercase tracking-widest">
                    Mais escolhido
                  </span>
                )}
                <div className={`text-xs font-mono uppercase tracking-widest mb-2 ${p.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                  {p.sub}
                </div>
                <h3 className="font-display font-bold text-2xl">{p.name}</h3>

                <div className="mt-5 flex items-baseline gap-2">
                  <span className="font-display font-bold text-5xl tracking-tight">R${p.price}</span>
                  <span className={`text-sm ${p.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    à vista no PIX
                  </span>
                </div>

                <div className={`mt-3 text-base font-semibold ${p.highlight ? "" : "text-foreground"}`}>
                  = {p.dms.toLocaleString("pt-BR")} DMs
                  {p.bonus && (
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${p.highlight ? "bg-foreground text-background" : "bg-success/15 text-success"}`}>
                      {p.bonus}
                    </span>
                  )}
                </div>

                <div className={`mt-6 h-px ${p.highlight ? "bg-primary-foreground/20" : "bg-border"}`} />

                <ul className="mt-6 space-y-3 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className={`h-4 w-4 mt-0.5 shrink-0 ${p.highlight ? "" : "text-primary"}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={loginWithDiscord}
                  disabled={busy}
                  className={`mt-7 w-full h-12 rounded-full font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2 ${
                    p.highlight
                      ? "bg-foreground text-background hover:bg-background hover:text-foreground"
                      : "bg-primary text-primary-foreground hover:bg-primary-glow"
                  }`}
                >
                  <DiscordIcon className="h-4 w-4" /> Quero esse plano
                </button>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Ou compra qualquer valor a partir de R$ 25 — sempre R$ 0,05 por DM.
          </p>
        </div>
      </section>

      {/* AFILIADOS */}
      <section
        id="afiliado"
        className="border-t border-border relative overflow-hidden bg-gradient-primary"
      >
        <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(hsl(var(--primary-foreground))_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="relative max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-28 text-primary-foreground">
          <div className="grid md:grid-cols-12 gap-8 items-center mb-14">
            <div className="md:col-span-7">
              <div className="text-xs font-mono uppercase tracking-widest text-primary-foreground/80 mb-4">
                Programa de afiliados
              </div>
              <h2 className="font-display font-bold text-4xl md:text-5xl leading-tight tracking-tight">
                Indica e ganha 20% pra sempre.
              </h2>
              <p className="mt-5 text-lg text-primary-foreground/90 max-w-xl leading-relaxed">
                Compartilha teu link. Cada pessoa que entrar e comprar, você fica com 20% da grana —
                em todas as compras dela, pelo resto da vida. Saca via PIX a partir de R$ 50.
              </p>
              <button
                onClick={loginWithDiscord}
                className="mt-7 inline-flex items-center gap-2 bg-foreground text-background hover:bg-background hover:text-foreground transition-colors px-6 h-12 rounded-full text-sm font-semibold"
              >
                <DiscordIcon className="h-4 w-4" /> Virar afiliado
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="md:col-span-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { v: "20%", l: "Comissão" },
                  { v: "Vitalício", l: "Pra sempre" },
                  { v: "R$ 50", l: "Saque mínimo" },
                  { v: "PIX", l: "Pagamento" },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="rounded-2xl bg-primary-foreground/10 backdrop-blur border border-primary-foreground/20 p-5"
                  >
                    <div className="font-display font-bold text-3xl tracking-tight">{s.v}</div>
                    <div className="text-xs font-mono uppercase tracking-widest text-primary-foreground/70 mt-1.5">
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-t border-border">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-20 md:py-28">
          <div className="text-center mb-12">
            <div className="text-xs font-mono uppercase tracking-widest text-primary mb-4">
              FAQ
            </div>
            <h2 className="font-display font-bold text-3xl md:text-5xl leading-tight tracking-tight">
              Perguntas frequentes
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Isso aqui é spam?",
                a: "Não. As DMs vão pra contas reais, em volume controlado, com a mensagem que você escreve. Nada de bot fake mandando em massa — por isso a entrega tem qualidade.",
              },
              {
                q: "Quanto custa exatamente cada DM?",
                a: "R$ 0,05 por DM. R$ 25 = 500 DMs. R$ 50 = 1.000 DMs. R$ 100 = 2.200 DMs (com bônus). R$ 200 = 4.500 DMs. Pode escolher qualquer valor a partir de R$ 25.",
              },
              {
                q: "Em quanto tempo a campanha começa?",
                a: "Assim que o PIX é confirmado, sua campanha entra na fila. Geralmente começa a entregar em poucos minutos.",
              },
              {
                q: "Posso divulgar loja, vídeo, qualquer link?",
                a: "Pode. Discord, loja, infoproduto, vídeo do YouTube, lançamento, grupo de trade. Qualquer link válido. Você escreve a copy do jeito que quiser.",
              },
              {
                q: "Tem mensalidade ou plano fixo?",
                a: "Não. Você compra créditos quando quer e usa quando quer. Sem assinatura, sem renovação automática.",
              },
              {
                q: "E se sobrar crédito?",
                a: "Créditos não usados ficam na sua conta pra sempre. Pra qualquer dúvida, fala direto com o suporte pelo Discord.",
              },
            ].map((f, i) => (
              <details
                key={i}
                className="group rounded-xl border border-border bg-card hover:border-primary/40 transition-colors [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none p-5">
                  <span className="font-semibold text-base md:text-lg pr-4">{f.q}</span>
                  <span className="h-8 w-8 rounded-full bg-secondary text-foreground grid place-items-center shrink-0 group-open:rotate-45 transition-transform">
                    <Plus className="h-4 w-4" />
                  </span>
                </summary>
                <p className="px-5 pb-5 text-sm md:text-base text-muted-foreground leading-relaxed">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="border-t border-border">
        <div className="max-w-4xl mx-auto px-5 md:px-8 py-20 md:py-28 text-center">
          <div className="rounded-3xl bg-gradient-primary p-10 md:p-16 shadow-glow relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(to_right,hsl(var(--primary-foreground))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary-foreground))_1px,transparent_1px)] [background-size:32px_32px]" />
            <div className="relative">
              <ShieldCheck className="h-12 w-12 text-primary-foreground mx-auto mb-6" />
              <h2 className="font-display font-bold text-3xl md:text-5xl tracking-tight text-primary-foreground leading-tight">
                Para de gritar pro vazio.
              </h2>
              <p className="mt-5 text-base md:text-lg text-primary-foreground/90 max-w-xl mx-auto">
                Em 5 minutos, sua primeira campanha tá no ar e gente real começa a chegar no teu link.
              </p>
              <button
                onClick={loginWithDiscord}
                disabled={busy}
                className="group mt-8 inline-flex items-center gap-3 bg-foreground text-background hover:bg-background hover:text-foreground h-14 px-8 rounded-full font-semibold text-base transition-colors disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <DiscordIcon className="h-5 w-5" />
                )}
                Começar agora com Discord
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <p className="mt-4 text-xs text-primary-foreground/70">
                Login em 5s · Sem cartão · Mínimo R$ 25
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary grid place-items-center">
              <DiscordIcon className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold">ServerBoost</span>
            <span className="text-muted-foreground font-mono text-xs ml-2">
              © {new Date().getFullYear()}
            </span>
          </div>
          <div className="flex items-center gap-6 text-muted-foreground text-xs uppercase tracking-widest font-mono">
            <button onClick={() => scrollTo("como")} className="hover:text-foreground">
              Como funciona
            </button>
            <button onClick={() => scrollTo("preco")} className="hover:text-foreground">
              Preço
            </button>
            <button onClick={() => scrollTo("afiliado")} className="hover:text-foreground">
              Afiliados
            </button>
            <button onClick={() => scrollTo("faq")} className="hover:text-foreground">
              FAQ
            </button>
          </div>
        </div>
      </footer>
      <SupportFab />
    </div>
  );
};

export default Landing;
