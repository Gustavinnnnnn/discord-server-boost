// Helper compartilhado para creditar comissão de afiliado quando um depósito é aprovado.
// Importar via: import { creditAffiliateCommission } from "../_shared/affiliate-commission.ts";
// deno-lint-ignore-file no-explicit-any
export async function creditAffiliateCommission(admin: any, params: {
  depositId: string;
  referredUserId: string;
  depositAmountCents: number;
}) {
  const { depositId, referredUserId, depositAmountCents } = params;

  // Já comissionado?
  const { data: existing } = await admin
    .from("affiliate_commissions")
    .select("id")
    .eq("deposit_id", depositId)
    .maybeSingle();
  if (existing) return { credited: false, reason: "already" };

  // Vínculo de afiliação
  const { data: ref } = await admin
    .from("affiliate_referrals")
    .select("*, affiliate:affiliates(*)")
    .eq("referred_user_id", referredUserId)
    .maybeSingle();
  if (!ref || !ref.affiliate) return { credited: false, reason: "no_referral" };

  const rate = Number(ref.affiliate.commission_rate ?? 0.20);
  const commissionCents = Math.floor(depositAmountCents * rate);
  if (commissionCents <= 0) return { credited: false, reason: "zero" };

  await admin.from("affiliate_commissions").insert({
    affiliate_id: ref.affiliate.id,
    affiliate_user_id: ref.affiliate_user_id,
    referred_user_id: referredUserId,
    deposit_id: depositId,
    deposit_amount_cents: depositAmountCents,
    commission_cents: commissionCents,
    rate,
    status: "available",
  });

  await admin.from("affiliates").update({
    total_earned_cents: (ref.affiliate.total_earned_cents ?? 0) + commissionCents,
    available_cents: (ref.affiliate.available_cents ?? 0) + commissionCents,
  }).eq("id", ref.affiliate.id);

  await admin.from("affiliate_referrals").update({
    total_spent_cents: (ref.total_spent_cents ?? 0) + depositAmountCents,
    total_commission_cents: (ref.total_commission_cents ?? 0) + commissionCents,
  }).eq("id", ref.id);

  return { credited: true, commissionCents };
}
