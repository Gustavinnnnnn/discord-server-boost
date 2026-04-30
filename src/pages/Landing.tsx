import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { DiscordIcon } from "@/components/DiscordIcon";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowUpRight } from "lucide-react";

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
      } catch { /* ignore */ }
    }
  }, [params]);

  useEffect(() => {
    supabase.functions.invoke("discord-config").then(({ data }) => {
      if (data?.client_id) setClientId(data.client_id);
    }).catch(() => {});
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
    <div className="min-h-screen bg-[#F5F1EA] text-[#0A0A0A] font-sans selection:bg-[#FF4D2E] selection:text-white">
      {/* Marquee top bar */}
      <div className="bg-[#0A0A0A] text-[#F5F1EA] py-2 overflow-hidden border-b border-[#0A0A0A]">
        <div className="flex gap-12 animate-[marquee_30s_linear_infinite] whitespace-nowrap text-xs uppercase tracking-[0.25em] font-mono">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="flex items-center gap-12">
              <span>★ Pessoas reais</span>
              <span>★ R$ 0,05 por DM</span>
              <span>★ Sem bot</span>
              <span>★ Sem fake</span>
              <span>★ PIX instantâneo</span>
            </span>
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#F5F1EA]/90 backdrop-blur border-b border-[#0A0A0A]/15">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 h-[68px] flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-[#0A0A0A] grid place-items-center">
              <DiscordIcon className="h-4 w-4 text-[#F5F1EA]" />
            </div>
            <span className="font-bold text-xl tracking-tight">ServerBoost</span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <button onClick={() => scrollTo("dor")} className="hover:text-[#FF4D2E] transition-colors">A dor</button>
            <button onClick={() => scrollTo("como")} className="hover:text-[#FF4D2E] transition-colors">A solução</button>
            <button onClick={() => scrollTo("preco")} className="hover:text-[#FF4D2E] transition-colors">Preço</button>
            <button onClick={() => scrollTo("afiliado")} className="hover:text-[#FF4D2E] transition-colors">Afiliados</button>
          </nav>

          <button
            onClick={loginWithDiscord}
            disabled={busy}
            className="inline-flex items-center gap-2 bg-[#0A0A0A] text-[#F5F1EA] px-4 md:px-5 h-10 rounded-full text-sm font-semibold hover:bg-[#FF4D2E] transition-colors disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <><DiscordIcon className="h-4 w-4" /> {user ? "Painel" : "Entrar"}</>}
          </button>
        </div>
      </header>

      {/* HERO — editorial */}
      <section className="relative border-b border-[#0A0A0A]/15 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 pt-14 md:pt-24 pb-16 md:pb-24">
          {/* tags */}
          <div className="flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-[#0A0A0A]/60 mb-8">
            <span>№ 001</span>
            <span className="h-px flex-1 bg-[#0A0A0A]/20 max-w-[80px]" />
            <span>Edição 2026</span>
          </div>

          <h1 className="font-display font-bold leading-[0.88] tracking-[-0.04em] text-[clamp(3rem,9vw,8.5rem)]">
            Você posta.
            <br />
            <span className="italic font-serif font-normal text-[#FF4D2E]">Ninguém vê.</span>
            <br />
            Ninguém entra.
          </h1>

          <div className="mt-10 md:mt-14 grid md:grid-cols-12 gap-8 md:gap-12 items-end">
            <div className="md:col-span-7">
              <p className="text-lg md:text-2xl leading-snug font-medium max-w-[560px]">
                Você abriu um servidor, montou uma loja, lançou um projeto.
                Postou no story, mandou pros amigos, gritou em todo grupo.
                <span className="block mt-3 text-[#FF4D2E]">E mesmo assim — o servidor continua morto.</span>
              </p>
            </div>

            <div className="md:col-span-5 md:justify-self-end w-full md:max-w-sm">
              <div className="border-t border-[#0A0A0A] pt-4">
                <div className="text-xs font-mono uppercase tracking-widest text-[#0A0A0A]/60 mb-3">Como resolvemos</div>
                <p className="text-base leading-snug">
                  A gente coloca seu link <span className="font-semibold underline decoration-[#FF4D2E] decoration-2 underline-offset-4">na DM de gente real</span>, dentro do nicho certo, no Discord. Você só paga pelas DMs entregues.
                </p>
                <button
                  onClick={loginWithDiscord}
                  disabled={busy}
                  className="mt-6 group w-full inline-flex items-center justify-between bg-[#0A0A0A] text-[#F5F1EA] pl-5 pr-2 h-14 rounded-full text-base font-semibold hover:bg-[#FF4D2E] transition-colors disabled:opacity-60"
                >
                  <span className="flex items-center gap-2">
                    {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <DiscordIcon className="h-5 w-5" />}
                    Começar com Discord
                  </span>
                  <span className="h-10 w-10 rounded-full bg-[#F5F1EA] text-[#0A0A0A] grid place-items-center group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight className="h-5 w-5" />
                  </span>
                </button>
                <p className="text-xs font-mono uppercase tracking-widest text-[#0A0A0A]/50 mt-3 text-center">
                  Login em 5s · Sem cartão
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* big strip number */}
        <div className="border-t border-[#0A0A0A]/15 bg-[#0A0A0A] text-[#F5F1EA] overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-6 flex items-center justify-between gap-4">
            <span className="text-xs md:text-sm font-mono uppercase tracking-widest text-[#F5F1EA]/60">DMs entregues até hoje</span>
            <span className="font-display font-bold text-3xl md:text-6xl tracking-tight tabular-nums">2.184.337</span>
          </div>
        </div>
      </section>

      {/* DOR — quem é você */}
      <section id="dor" className="border-b border-[#0A0A0A]/15">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-12 gap-8 mb-14">
            <div className="md:col-span-4">
              <div className="text-xs font-mono uppercase tracking-widest text-[#0A0A0A]/60 mb-4">Capítulo 01</div>
              <h2 className="font-display font-bold text-4xl md:text-6xl leading-[0.95] tracking-tight">
                Talvez seja <em className="font-serif italic font-normal text-[#FF4D2E]">você</em>.
              </h2>
            </div>
            <div className="md:col-span-7 md:col-start-6 self-end">
              <p className="text-lg md:text-xl leading-snug">
                Não importa o que você vende, faz ou cria. Se ninguém te vê, nada disso existe. A gente listou abaixo. Marca quantas você sente.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 border-t border-[#0A0A0A]">
            {[
              {
                n: "01",
                tag: "Dono de servidor",
                pain: "Você abriu um servidor da sua comunidade, gastou semana montando canais — e tá só você e dois bots dentro.",
              },
              {
                n: "02",
                tag: "Vende algo online",
                pain: "Loja aberta, infoproduto pronto, mentoria nova. Mas o link no story não vira venda. Ninguém clica, ninguém compra.",
              },
              {
                n: "03",
                tag: "Criador de conteúdo",
                pain: "Vídeo bom, edição caprichada, post no Insta. Engajamento zero. Você faz pra quem? Sentindo que tá empurrando água morro acima.",
              },
              {
                n: "04",
                tag: "Streamer / Live",
                pain: "Live no ar, 0 viewer, 0 chat. Desliga, posta clip, ninguém vê. Aí desanima. Aí volta. Aí desanima de novo.",
              },
              {
                n: "05",
                tag: "Trader / Sinais",
                pain: "Grupo VIP montado, planilha redondinha. Mas você só consegue trazer parente e amigo — e nenhum vira cliente pagante.",
              },
              {
                n: "06",
                tag: "Qualquer projeto",
                pain: "Tem ideia boa, produto bom, conteúdo bom. Falta gente entrando, gente vendo, gente comprando. Falta tração.",
              },
            ].map((p, i) => (
              <div
                key={p.n}
                className={`p-6 md:p-8 border-b border-[#0A0A0A] ${i % 3 !== 2 ? "md:border-r" : ""} hover:bg-[#0A0A0A] hover:text-[#F5F1EA] transition-colors group cursor-default`}
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#0A0A0A]/60 group-hover:text-[#F5F1EA]/60">{p.n} · {p.tag}</span>
                  <span className="h-6 w-6 rounded-full border border-current grid place-items-center text-xs">✕</span>
                </div>
                <p className="text-lg leading-snug font-medium">{p.pain}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIVIDER QUOTE */}
      <section className="bg-[#FF4D2E] text-[#0A0A0A] border-b border-[#0A0A0A]">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-16 md:py-24">
          <p className="font-serif italic text-3xl md:text-6xl leading-[1.05] tracking-tight">
            “Não adianta ter o melhor produto do mundo se ninguém sabe que ele existe.”
          </p>
          <div className="mt-8 flex items-center gap-3 text-xs font-mono uppercase tracking-widest">
            <span className="h-px w-10 bg-[#0A0A0A]" /> A real do jogo
          </div>
        </div>
      </section>

      {/* COMO FUNCIONA — passo a passo enumerado */}
      <section id="como" className="border-b border-[#0A0A0A]/15">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-12 gap-8 mb-16">
            <div className="md:col-span-5">
              <div className="text-xs font-mono uppercase tracking-widest text-[#0A0A0A]/60 mb-4">Capítulo 02</div>
              <h2 className="font-display font-bold text-4xl md:text-6xl leading-[0.95] tracking-tight">
                A gente leva <em className="font-serif italic font-normal text-[#FF4D2E]">gente</em><br />
                até você.
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7 self-end">
              <p className="text-lg leading-snug">
                Funciona simples: você diz pra quem quer falar, escreve a mensagem, manda o link. A gente entrega na DM de quem se encaixa. Você só paga pelo que sai.
              </p>
            </div>
          </div>

          <div className="space-y-0 border-t border-b border-[#0A0A0A]">
            {[
              { n: "01", t: "Conecta o Discord", d: "Login com tua conta. Sem formulário, sem senha, sem cadastro chato. Em 5 segundos tá dentro." },
              { n: "02", t: "Define quem vai receber", d: "Escolhe o nicho — gaming, trade, NSFW, anime, marketing, o que for. A gente já tem mapeado." },
              { n: "03", t: "Escreve a mensagem e cola o link", d: "Sua copy, suas palavras, seu link (servidor, loja, vídeo, qualquer coisa). Você manda. A gente entrega." },
              { n: "04", t: "Paga via PIX e relaxa", d: "R$ 0,05 por DM. Compra a quantidade que quiser. PIX cai, créditos entram, campanha começa em minutos." },
              { n: "05", t: "Acompanha em tempo real", d: "Dashboard mostrando entregas, cliques, conversões. Sem caixa preta. Você vê tudo que tá acontecendo." },
            ].map((s) => (
              <a
                key={s.n}
                href="#preco"
                onClick={(e) => { e.preventDefault(); scrollTo("preco"); }}
                className="grid grid-cols-12 items-baseline gap-4 md:gap-8 py-7 md:py-9 border-t border-[#0A0A0A]/10 hover:bg-[#0A0A0A] hover:text-[#F5F1EA] transition-colors group px-2 -mx-2"
              >
                <div className="col-span-2 md:col-span-1 font-mono text-sm md:text-base text-[#0A0A0A]/50 group-hover:text-[#F5F1EA]/60">{s.n}</div>
                <div className="col-span-10 md:col-span-5">
                  <h3 className="font-display font-semibold text-2xl md:text-4xl leading-tight tracking-tight">{s.t}</h3>
                </div>
                <div className="col-span-12 md:col-span-5 md:col-start-7 text-base md:text-lg leading-snug">
                  {s.d}
                </div>
                <div className="hidden md:flex md:col-span-1 justify-end">
                  <ArrowUpRight className="h-6 w-6 opacity-30 group-hover:opacity-100 group-hover:rotate-12 transition" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ANTES / DEPOIS */}
      <section className="border-b border-[#0A0A0A]/15 bg-[#EFE9DD]">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-0 border border-[#0A0A0A]">
            <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-[#0A0A0A] bg-[#F5F1EA]">
              <div className="font-mono text-xs uppercase tracking-widest text-[#0A0A0A]/60 mb-4">Antes</div>
              <h3 className="font-display font-bold text-3xl md:text-5xl leading-[0.95] tracking-tight mb-6">
                Você no <em className="font-serif italic font-normal">grito</em>.
              </h3>
              <ul className="space-y-3 text-base md:text-lg">
                {[
                  "Postando no story pra 200 pessoas que não ligam",
                  "Implorando RT pros amigos",
                  "Pagando ads e queimando dinheiro sem retorno",
                  "Entrando em servidor pra divulgar e levando ban",
                  "Esperando o famoso “boca a boca” acontecer",
                ].map((x) => (
                  <li key={x} className="flex gap-3">
                    <span className="text-[#0A0A0A]/40 font-mono">—</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 md:p-12 bg-[#0A0A0A] text-[#F5F1EA]">
              <div className="font-mono text-xs uppercase tracking-widest text-[#FF4D2E] mb-4">Depois</div>
              <h3 className="font-display font-bold text-3xl md:text-5xl leading-[0.95] tracking-tight mb-6">
                Gente <em className="font-serif italic font-normal text-[#FF4D2E]">batendo</em> na sua porta.
              </h3>
              <ul className="space-y-3 text-base md:text-lg">
                {[
                  "Centenas de pessoas reais recebendo seu link",
                  "Tráfego entrando no servidor / loja todo dia",
                  "Você define quanto investir e quanto receber",
                  "Custo claro: R$ 0,05 por DM, sem mensalidade",
                  "Métrica de verdade, sem achismo",
                ].map((x) => (
                  <li key={x} className="flex gap-3">
                    <span className="text-[#FF4D2E] font-mono">+</span>
                    <span>{x}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PREÇO */}
      <section id="preco" className="border-b border-[#0A0A0A]/15">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-12 gap-8 mb-14">
            <div className="md:col-span-6">
              <div className="text-xs font-mono uppercase tracking-widest text-[#0A0A0A]/60 mb-4">Capítulo 03 · Preço</div>
              <h2 className="font-display font-bold text-4xl md:text-6xl leading-[0.95] tracking-tight">
                <em className="font-serif italic font-normal text-[#FF4D2E]">R$ 0,05</em> por DM.
                <br />Sem mensalidade.
              </h2>
            </div>
            <div className="md:col-span-5 md:col-start-8 self-end">
              <p className="text-lg leading-snug">
                Compra o que precisa, usa quando quiser. Mínimo de R$ 50 (1.000 DMs). Pode escolher o valor que quiser acima disso.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 border border-[#0A0A0A]">
            {[
              { n: "01", name: "Starter", price: 50, dms: 1000, bonus: null, sub: "Pra quem quer testar" },
              { n: "02", name: "Pro", price: 100, dms: 2200, bonus: "+200 grátis", sub: "Mais escolhido", highlight: true },
              { n: "03", name: "Business", price: 200, dms: 4500, bonus: "+500 grátis", sub: "Pra escalar de verdade" },
            ].map((p, i) => (
              <div
                key={p.name}
                className={`relative p-8 md:p-10 ${i !== 2 ? "md:border-r border-[#0A0A0A]" : ""} ${i !== 0 ? "border-t md:border-t-0" : ""} border-[#0A0A0A] ${p.highlight ? "bg-[#FF4D2E] text-[#0A0A0A]" : "bg-[#F5F1EA]"}`}
              >
                <div className="flex items-center justify-between mb-8">
                  <span className="font-mono text-xs uppercase tracking-widest opacity-60">{p.n} · {p.sub}</span>
                  {p.highlight && (
                    <span className="bg-[#0A0A0A] text-[#F5F1EA] px-2 py-1 text-[10px] font-mono uppercase tracking-widest">Hot</span>
                  )}
                </div>

                <h3 className="font-display font-bold text-3xl tracking-tight">{p.name}</h3>

                <div className="mt-6 flex items-baseline gap-2">
                  <span className="font-display font-bold text-6xl md:text-7xl tracking-tighter">R${p.price}</span>
                </div>

                <div className="mt-3 font-mono text-sm">
                  = <span className="font-bold text-lg">{p.dms.toLocaleString("pt-BR")} DMs</span>
                  {p.bonus && <span className="ml-2 px-2 py-0.5 bg-[#0A0A0A] text-[#F5F1EA] text-xs">{p.bonus}</span>}
                </div>

                <div className="mt-8 h-px bg-current opacity-20" />

                <ul className="mt-6 space-y-2 text-sm font-medium">
                  {["Pessoas reais", "Início em minutos", "Dashboard completo", "Suporte direto"].map((b) => (
                    <li key={b} className="flex items-center gap-2">
                      <span className="font-mono opacity-50">→</span> {b}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={loginWithDiscord}
                  disabled={busy}
                  className={`mt-8 w-full h-12 rounded-full font-semibold text-sm transition-colors inline-flex items-center justify-center gap-2 ${
                    p.highlight
                      ? "bg-[#0A0A0A] text-[#F5F1EA] hover:bg-[#F5F1EA] hover:text-[#0A0A0A]"
                      : "bg-[#0A0A0A] text-[#F5F1EA] hover:bg-[#FF4D2E] hover:text-[#0A0A0A]"
                  }`}
                >
                  <DiscordIcon className="h-4 w-4" /> Quero esse
                </button>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-sm font-mono text-[#0A0A0A]/60">
            Ou compra o valor que quiser — desde que seja a partir de R$ 50.
          </p>
        </div>
      </section>

      {/* AFILIADOS */}
      <section id="afiliado" className="border-b border-[#0A0A0A]/15 bg-[#0A0A0A] text-[#F5F1EA]">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-12 gap-8 items-end mb-14">
            <div className="md:col-span-7">
              <div className="text-xs font-mono uppercase tracking-widest text-[#FF4D2E] mb-4">Capítulo 04 · Bônus</div>
              <h2 className="font-display font-bold text-4xl md:text-7xl leading-[0.92] tracking-tight">
                Indica e ganha
                <br />
                <em className="font-serif italic font-normal text-[#FF4D2E]">20% pra sempre.</em>
              </h2>
            </div>
            <div className="md:col-span-4 md:col-start-9">
              <p className="text-lg leading-snug text-[#F5F1EA]/80">
                Compartilha teu link. Cada pessoa que entrar e comprar, você fica com 20% da grana — em todas as compras dela, pelo resto da vida. Saca via PIX a partir de R$ 50.
              </p>
              <button
                onClick={loginWithDiscord}
                className="mt-6 inline-flex items-center gap-2 bg-[#FF4D2E] text-[#0A0A0A] px-5 h-12 rounded-full text-sm font-semibold hover:bg-[#F5F1EA] transition-colors"
              >
                <DiscordIcon className="h-4 w-4" /> Virar afiliado <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 border border-[#F5F1EA]/20">
            {[
              { v: "20%", l: "Comissão" },
              { v: "Vitalício", l: "Pra sempre" },
              { v: "R$ 50", l: "Saque mínimo" },
              { v: "PIX", l: "Pagamento" },
            ].map((s, i) => (
              <div key={s.l} className={`p-6 md:p-8 ${i !== 3 ? "border-r" : ""} ${i < 2 ? "border-b md:border-b-0" : ""} border-[#F5F1EA]/20`}>
                <div className="font-display font-bold text-3xl md:text-5xl tracking-tight text-[#FF4D2E]">{s.v}</div>
                <div className="text-xs font-mono uppercase tracking-widest text-[#F5F1EA]/60 mt-2">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="border-b border-[#0A0A0A]/15">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-12 gap-8 mb-12">
            <div className="md:col-span-5">
              <div className="text-xs font-mono uppercase tracking-widest text-[#0A0A0A]/60 mb-4">Capítulo 05</div>
              <h2 className="font-display font-bold text-4xl md:text-6xl leading-[0.95] tracking-tight">
                Perguntas que <em className="font-serif italic font-normal text-[#FF4D2E]">todo mundo</em> faz.
              </h2>
            </div>
          </div>

          <div className="border-t border-[#0A0A0A]">
            {[
              { q: "Isso aqui não é spam?", a: "Não. As DMs vão pra contas reais, em volume controlado, com mensagem que você escreve. Nada de bot fake mandando mensagem em massa. Por isso a entrega tem qualidade." },
              { q: "Quanto custa cada DM?", a: "R$ 0,05 por DM. R$ 50 = 1.000 DMs. R$ 100 = 2.200 DMs (com bônus). R$ 200 = 4.500 DMs. Pode escolher qualquer valor a partir de R$ 50." },
              { q: "Em quanto tempo começa?", a: "Assim que o PIX for confirmado, sua campanha entra na fila. Geralmente começa a entregar em poucos minutos." },
              { q: "Posso usar pra divulgar loja, vídeo, qualquer link?", a: "Pode. Discord, loja, infoproduto, vídeo do YouTube, lançamento, grupo de trade. Qualquer link válido. Você escreve a copy do jeito que quiser." },
              { q: "Tem mensalidade ou plano fixo?", a: "Não. Você compra créditos quando quer e usa quando quer. Sem assinatura, sem renovação automática." },
              { q: "E se eu não gostar do resultado?", a: "Créditos não usados ficam na conta. Pra qualquer questão, fala com o suporte direto pelo Discord." },
            ].map((f, i) => (
              <details key={i} className="group border-b border-[#0A0A0A]/15 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer list-none py-7 hover:text-[#FF4D2E] transition-colors">
                  <span className="font-display font-semibold text-xl md:text-3xl tracking-tight pr-4">
                    <span className="font-mono text-sm text-[#0A0A0A]/40 mr-4">{String(i + 1).padStart(2, "0")}</span>
                    {f.q}
                  </span>
                  <span className="h-10 w-10 rounded-full border border-current grid place-items-center text-xl group-open:rotate-45 transition-transform shrink-0">+</span>
                </summary>
                <p className="pb-7 pl-0 md:pl-14 text-base md:text-lg max-w-3xl leading-snug text-[#0A0A0A]/75">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-[#FF4D2E] text-[#0A0A0A] border-b border-[#0A0A0A]">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-24 md:py-40 text-center">
          <h2 className="font-display font-bold text-5xl md:text-9xl leading-[0.85] tracking-[-0.04em]">
            Para de gritar
            <br />
            <em className="font-serif italic font-normal">pro vazio.</em>
          </h2>
          <p className="mt-8 text-lg md:text-xl max-w-xl mx-auto">
            Coloca teu link na frente de quem realmente importa. Em 5 minutos tua primeira campanha tá no ar.
          </p>
          <button
            onClick={loginWithDiscord}
            disabled={busy}
            className="mt-10 group inline-flex items-center gap-3 bg-[#0A0A0A] text-[#F5F1EA] pl-7 pr-2 h-16 rounded-full text-lg font-semibold hover:bg-[#F5F1EA] hover:text-[#0A0A0A] transition-colors disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <DiscordIcon className="h-5 w-5" />}
            Começar agora com Discord
            <span className="h-12 w-12 rounded-full bg-[#FF4D2E] text-[#0A0A0A] grid place-items-center group-hover:translate-x-0.5 transition-transform border border-[#0A0A0A]">
              <ArrowRight className="h-5 w-5" />
            </span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] text-[#F5F1EA]">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-[#F5F1EA] grid place-items-center">
              <DiscordIcon className="h-4 w-4 text-[#0A0A0A]" />
            </div>
            <span className="font-bold">ServerBoost</span>
            <span className="text-[#F5F1EA]/50 font-mono text-xs">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 text-[#F5F1EA]/70 font-mono text-xs uppercase tracking-widest">
            <button onClick={() => scrollTo("dor")} className="hover:text-[#FF4D2E]">Dor</button>
            <button onClick={() => scrollTo("preco")} className="hover:text-[#FF4D2E]">Preço</button>
            <button onClick={() => scrollTo("afiliado")} className="hover:text-[#FF4D2E]">Afiliados</button>
            <button onClick={() => scrollTo("faq")} className="hover:text-[#FF4D2E]">FAQ</button>
          </div>
        </div>
      </footer>

      {/* keyframes for marquee */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default Landing;
