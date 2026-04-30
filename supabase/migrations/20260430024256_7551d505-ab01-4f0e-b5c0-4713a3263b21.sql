-- =========================================================
-- AFFILIATE SYSTEM
-- =========================================================

-- 1) affiliates: 1 row por usuário com código único
CREATE TABLE public.affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  commission_rate numeric(5,4) NOT NULL DEFAULT 0.20, -- 20%
  total_clicks integer NOT NULL DEFAULT 0,
  total_referrals integer NOT NULL DEFAULT 0,
  total_earned_cents integer NOT NULL DEFAULT 0,
  total_paid_cents integer NOT NULL DEFAULT 0,
  available_cents integer NOT NULL DEFAULT 0,
  pix_key text,
  pix_key_type text, -- cpf, email, phone, random
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own affiliate" ON public.affiliates
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users update own affiliate" ON public.affiliates
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 2) affiliate_referrals: vínculo permanente referrer→referred
CREATE TABLE public.affiliate_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  affiliate_user_id uuid NOT NULL,
  referred_user_id uuid NOT NULL UNIQUE, -- 1 indicado pertence a 1 só afiliado (vitalício)
  source text, -- ex: 'signup_link'
  total_spent_cents integer NOT NULL DEFAULT 0,
  total_commission_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates view own referrals" ON public.affiliate_referrals
  FOR SELECT TO authenticated USING (auth.uid() = affiliate_user_id);

CREATE INDEX idx_affiliate_referrals_affiliate ON public.affiliate_referrals(affiliate_id);
CREATE INDEX idx_affiliate_referrals_referred ON public.affiliate_referrals(referred_user_id);

-- 3) affiliate_clicks: tracking simples
CREATE TABLE public.affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  ip_hash text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- 4) affiliate_commissions: cada comissão gerada por depósito do indicado
CREATE TABLE public.affiliate_commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  affiliate_user_id uuid NOT NULL,
  referred_user_id uuid NOT NULL,
  deposit_id uuid, -- pending_deposits.id
  deposit_amount_cents integer NOT NULL,
  commission_cents integer NOT NULL,
  rate numeric(5,4) NOT NULL,
  status text NOT NULL DEFAULT 'available', -- available, paid, pending
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_commissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates view own commissions" ON public.affiliate_commissions
  FOR SELECT TO authenticated USING (auth.uid() = affiliate_user_id);

CREATE INDEX idx_aff_commissions_affiliate ON public.affiliate_commissions(affiliate_id);

-- 5) affiliate_withdrawals: pedidos de saque
CREATE TABLE public.affiliate_withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
  affiliate_user_id uuid NOT NULL,
  amount_cents integer NOT NULL,
  pix_key text NOT NULL,
  pix_key_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending, processing, paid, rejected
  notes text,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_withdrawals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Affiliates view own withdrawals" ON public.affiliate_withdrawals
  FOR SELECT TO authenticated USING (auth.uid() = affiliate_user_id);

CREATE POLICY "Affiliates request own withdrawals" ON public.affiliate_withdrawals
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = affiliate_user_id
    AND amount_cents >= 5000 -- mínimo R$ 50
    AND EXISTS (
      SELECT 1 FROM public.affiliates a
      WHERE a.id = affiliate_id
        AND a.user_id = auth.uid()
        AND a.available_cents >= amount_cents
    )
  );

-- 6) trigger: gerar código único de afiliado
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS text LANGUAGE plpgsql AS $$
DECLARE
  new_code text;
  attempts integer := 0;
BEGIN
  LOOP
    new_code := lower(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.affiliates WHERE code = new_code);
    attempts := attempts + 1;
    IF attempts > 10 THEN
      new_code := lower(substr(md5(random()::text || clock_timestamp()::text || gen_random_uuid()::text), 1, 12));
      EXIT;
    END IF;
  END LOOP;
  RETURN new_code;
END;
$$;

-- 7) auto-criar affiliate row para todo novo usuário
CREATE OR REPLACE FUNCTION public.handle_new_user_affiliate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.affiliates (user_id, code)
  VALUES (NEW.id, public.generate_affiliate_code())
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_affiliate
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_affiliate();

-- 8) backfill: criar affiliates para usuários existentes
INSERT INTO public.affiliates (user_id, code)
SELECT p.id, public.generate_affiliate_code()
FROM public.profiles p
LEFT JOIN public.affiliates a ON a.user_id = p.id
WHERE a.id IS NULL;

-- 9) updated_at trigger
CREATE TRIGGER set_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_affiliate_withdrawals_updated_at
  BEFORE UPDATE ON public.affiliate_withdrawals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();