import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Users, Copy, Link2, TrendingUp, Wallet, Gift, ArrowDownToLine,
  CheckCircle2, Clock, XCircle, MousePointerClick, DollarSign,
  Sparkles, Share2, Loader2, Info,
} from "lucide-react";
import { toast } from "sonner";

type Affiliate = {
  id: string;
  user_id: string;
  code: string;
  commission_rate: number;
  total_clicks: number;
  total_referrals: number;
  total_earned_cents: number;
  total_paid_cents: number;
  available_cents: number;
  pix_key: string | null;
  pix_key_type: string | null;
};

type Commission = {
  id: string;
  deposit_amount_cents: number;
  commission_cents: number;
  status: string;
  created_at: string;
};

type Withdrawal = {
  id: string;
  amount_cents: number;
  status: string;
  pix_key: string;
  pix_key_type: string;
  created_at: string;
  paid_at: string | null;
};

type Referral = {
  id: string;
  total_spent_cents: number;
  total_commission_cents: number;
  created_at: string;
};

const MIN_WITHDRAWAL_CENTS = 5000; // R$ 50

const formatBRL = (cents: number) =>
  (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Affiliate = () => {
  const { user } = useAuth();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  // Withdraw modal
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [pixKey, setPixKey] = useState("");
  const [pixKeyType, setPixKeyType] = useState("cpf");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [aff, comm, wd, ref] = await Promise.all([
      supabase.from("affiliates").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("affiliate_commissions").select("*").eq("affiliate_user_id", user.id)
        .order("created_at", { ascending: false }).limit(50),
      supabase.from("affiliate_withdrawals").select("*").eq("affiliate_user_id", user.id)
        .order("created_at", { ascending: false }).limit(20),
      supabase.from("affiliate_referrals").select("*").eq("affiliate_user_id", user.id)
        .order("created_at", { ascending: false }).limit(50),
    ]);
    setAffiliate((aff.data as Affiliate) ?? null);
    setCommissions((comm.data as Commission[]) ?? []);
    setWithdrawals((wd.data as Withdrawal[]) ?? []);
    setReferrals((ref.data as Referral[]) ?? []);
    if (aff.data?.pix_key) setPixKey(aff.data.pix_key);
    if (aff.data?.pix_key_type) setPixKeyType(aff.data.pix_key_type);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const link = useMemo(() => {
    if (!affiliate) return "";
    return `${window.location.origin}/?ref=${affiliate.code}`;
  }, [affiliate]);

  const copyLink = () => {
    if (!link) return;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  const share = async () => {
    if (!link) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Use minha indicação",
          text: "Bombe seu servidor Discord com DMs em massa:",
          url: link,
        });
      } catch { /* canceled */ }
    } else {
      copyLink();
    }
  };

  const submitWithdraw = async () => {
    if (!affiliate) return;
    const brl = parseFloat(withdrawAmount.replace(",", "."));
    const cents = Math.round(brl * 100);
    if (!cents || cents < MIN_WITHDRAWAL_CENTS) {
      return toast.error(`Mínimo: ${formatBRL(MIN_WITHDRAWAL_CENTS)}`);
    }
    if (cents > affiliate.available_cents) {
      return toast.error("Saldo insuficiente");
    }
    if (!pixKey.trim()) return toast.error("Informe a chave PIX");

    setSubmitting(true);

    // Salva chave PIX no perfil de afiliado
    await supabase.from("affiliates").update({
      pix_key: pixKey.trim(),
      pix_key_type: pixKeyType,
    }).eq("id", affiliate.id);

    // Solicita saque
    const { error } = await supabase.from("affiliate_withdrawals").insert({
      affiliate_id: affiliate.id,
      affiliate_user_id: affiliate.user_id,
      amount_cents: cents,
      pix_key: pixKey.trim(),
      pix_key_type: pixKeyType,
    });

    setSubmitting(false);

    if (error) {
      console.error(error);
      return toast.error("Falha ao solicitar saque");
    }

    toast.success("Saque solicitado! Pagamos em até 48h úteis.");
    setWithdrawOpen(false);
    setWithdrawAmount("");
    load();
  };

  if (loading) {
    return (
      <div className="grid place-items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground">Programa de afiliados não disponível.</p>
      </div>
    );
  }

  const ratePct = Math.round(affiliate.commission_rate * 100);

  const stats = [
    { icon: MousePointerClick, label: "Cliques", value: affiliate.total_clicks.toLocaleString("pt-BR"), color: "from-sky-500 to-cyan-400" },
    { icon: Users, label: "Indicados", value: affiliate.total_referrals.toLocaleString("pt-BR"), color: "from-violet-500 to-fuchsia-500" },
    { icon: TrendingUp, label: "Total ganho", value: formatBRL(affiliate.total_earned_cents), color: "from-emerald-500 to-green-400" },
    { icon: Wallet, label: "Disponível", value: formatBRL(affiliate.available_cents), color: "from-amber-400 to-orange-500" },
  ];

  return (
    <div className="max-w-[1280px] mx-auto pb-12 space-y-6">
      {/* HERO */}
      <div className="relative rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-card via-card to-primary/10 p-6">
        <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary-glow grid place-items-center shadow-glow">
              <Gift className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Programa de Afiliados</h1>
              <p className="text-sm text-muted-foreground">
                Ganhe <b className="text-primary">{ratePct}% vitalício</b> de tudo que seus indicados depositarem
              </p>
            </div>
          </div>
          <Button
            onClick={() => setWithdrawOpen(true)}
            disabled={affiliate.available_cents < MIN_WITHDRAWAL_CENTS}
            variant="discord"
            className="font-black"
          >
            <ArrowDownToLine className="h-4 w-4" /> Sacar {formatBRL(affiliate.available_cents)}
          </Button>
        </div>
      </div>

      {/* LINK */}
      <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-primary-glow/5 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="h-4 w-4 text-primary" />
          <span className="text-xs font-black uppercase tracking-widest">Seu link de afiliado</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input value={link} readOnly className="font-mono text-sm flex-1 min-w-[260px]" />
          <Button onClick={copyLink} variant="outline" className="font-bold">
            <Copy className="h-4 w-4" /> Copiar
          </Button>
          <Button onClick={share} variant="discord" className="font-bold">
            <Share2 className="h-4 w-4" /> Compartilhar
          </Button>
        </div>
        <div className="text-[11px] text-muted-foreground mt-2">
          Código: <b className="text-foreground font-mono">{affiliate.code}</b> · Comissão {ratePct}% vitalícia em todas as compras
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => {
          const I = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
              <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${s.color} grid place-items-center mb-3`}>
                <I className="h-4.5 w-4.5 text-white" />
              </div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">{s.label}</div>
              <div className="text-2xl font-black tabular-nums mt-0.5">{s.value}</div>
            </div>
          );
        })}
      </div>

      {/* COMO FUNCIONA */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-black uppercase tracking-widest">Como funciona</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { n: 1, title: "Compartilhe seu link", desc: "Mande pra amigos, divulgue em servidores, redes sociais" },
            { n: 2, title: "Pessoa se cadastra", desc: "Quando alguém entrar pelo seu link, fica vinculada a você pra sempre" },
            { n: 3, title: `Ganhe ${ratePct}% vitalício`, desc: `Toda vez que ela depositar, você recebe ${ratePct}% — para sempre` },
          ].map((s) => (
            <div key={s.n} className="rounded-xl bg-secondary/30 border border-border p-4">
              <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-black grid place-items-center mb-2">
                {s.n}
              </div>
              <div className="text-sm font-black mb-1">{s.title}</div>
              <div className="text-xs text-muted-foreground">{s.desc}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-start gap-2 text-[11px] text-muted-foreground bg-secondary/30 rounded-lg p-3">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>Saque mínimo de {formatBRL(MIN_WITHDRAWAL_CENTS)} via PIX. Pagamentos processados em até 48h úteis.</span>
        </div>
      </div>

      {/* INDICADOS */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-black uppercase tracking-widest">Seus indicados</h2>
          <span className="ml-auto text-xs text-muted-foreground">{referrals.length}</span>
        </div>
        {referrals.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Nenhum indicado ainda. Compartilhe seu link!
          </div>
        ) : (
          <div className="divide-y divide-border">
            {referrals.map((r, i) => (
              <div key={r.id} className="flex items-center gap-3 p-4 hover:bg-secondary/20 transition">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary-glow/20 grid place-items-center text-xs font-black">
                  #{i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold">Indicado vinculado</div>
                  <div className="text-[11px] text-muted-foreground">
                    Desde {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black tabular-nums">{formatBRL(r.total_spent_cents)}</div>
                  <div className="text-[10px] text-muted-foreground">depositado</div>
                </div>
                <div className="text-right pl-3 border-l border-border">
                  <div className="text-sm font-black tabular-nums text-success">+{formatBRL(r.total_commission_cents)}</div>
                  <div className="text-[10px] text-muted-foreground">sua comissão</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMISSÕES */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-black uppercase tracking-widest">Histórico de comissões</h2>
        </div>
        {commissions.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Nenhuma comissão ainda
          </div>
        ) : (
          <div className="divide-y divide-border">
            {commissions.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-4 hover:bg-secondary/20 transition">
                <div className="h-9 w-9 rounded-lg bg-success/15 text-success grid place-items-center">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold">Comissão sobre depósito de {formatBRL(c.deposit_amount_cents)}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(c.created_at).toLocaleString("pt-BR")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black tabular-nums text-success">+{formatBRL(c.commission_cents)}</div>
                  <div className="text-[10px] text-muted-foreground capitalize">{c.status}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SAQUES */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center gap-2">
          <ArrowDownToLine className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-black uppercase tracking-widest">Histórico de saques</h2>
        </div>
        {withdrawals.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Nenhum saque solicitado
          </div>
        ) : (
          <div className="divide-y divide-border">
            {withdrawals.map((w) => {
              const Icon = w.status === "paid" ? CheckCircle2 : w.status === "rejected" ? XCircle : Clock;
              const color = w.status === "paid" ? "text-success" : w.status === "rejected" ? "text-destructive" : "text-warning";
              return (
                <div key={w.id} className="flex items-center gap-3 p-4">
                  <div className={`h-9 w-9 rounded-lg bg-secondary grid place-items-center ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold">PIX para {w.pix_key_type.toUpperCase()}: <span className="font-mono">{w.pix_key}</span></div>
                    <div className="text-[11px] text-muted-foreground">
                      Solicitado {new Date(w.created_at).toLocaleString("pt-BR")}
                      {w.paid_at && ` · Pago ${new Date(w.paid_at).toLocaleString("pt-BR")}`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black tabular-nums">{formatBRL(w.amount_cents)}</div>
                    <div className={`text-[10px] font-bold uppercase ${color}`}>{w.status}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL SAQUE */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-black">
              <ArrowDownToLine className="h-5 w-5" /> Solicitar saque
            </DialogTitle>
            <DialogDescription>
              Disponível: <b className="text-foreground">{formatBRL(affiliate.available_cents)}</b> · Mínimo {formatBRL(MIN_WITHDRAWAL_CENTS)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Valor (R$)</label>
              <Input
                type="number" min={50} step="1"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="50"
                className="mt-1 text-lg font-black"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Tipo de chave PIX</label>
              <select
                value={pixKeyType}
                onChange={(e) => setPixKeyType(e.target.value)}
                className="mt-1 w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="cpf">CPF</option>
                <option value="email">E-mail</option>
                <option value="phone">Telefone</option>
                <option value="random">Chave aleatória</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Chave PIX</label>
              <Input
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="Sua chave PIX"
                className="mt-1 font-mono"
              />
            </div>

            <div className="text-[11px] text-muted-foreground bg-secondary/30 rounded-lg p-3">
              Pagamentos processados em até <b>48h úteis</b>.
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawOpen(false)}>Cancelar</Button>
            <Button variant="discord" onClick={submitWithdraw} disabled={submitting} className="font-black">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Solicitar saque"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Affiliate;
