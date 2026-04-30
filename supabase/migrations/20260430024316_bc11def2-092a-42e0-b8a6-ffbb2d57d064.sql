-- Fix search_path nas funções
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
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

-- Revoke execute das funções internas
REVOKE EXECUTE ON FUNCTION public.generate_affiliate_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user_affiliate() FROM PUBLIC, anon, authenticated;

-- Política de leitura para affiliate_clicks (afiliado vê seus próprios cliques)
CREATE POLICY "Affiliates view own clicks" ON public.affiliate_clicks
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.affiliates a
      WHERE a.id = affiliate_clicks.affiliate_id
        AND a.user_id = auth.uid()
    )
  );