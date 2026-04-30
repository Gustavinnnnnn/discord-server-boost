import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// POST { code: string, action: "click" | "signup" }
//  - click: apenas registra (sem auth)
//  - signup: cria vínculo afiliado→usuário (requer auth)
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { code, action } = await req.json();
    if (!code || !action) {
      return new Response(JSON.stringify({ error: "missing_params" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: affiliate } = await admin
      .from("affiliates").select("*").eq("code", String(code).toLowerCase()).maybeSingle();

    if (!affiliate) {
      return new Response(JSON.stringify({ ok: false, reason: "invalid_code" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "click") {
      const ip = req.headers.get("x-forwarded-for") ?? "";
      const ua = req.headers.get("user-agent") ?? "";
      const ipHash = ip ? await sha256(ip) : null;
      await admin.from("affiliate_clicks").insert({
        affiliate_id: affiliate.id,
        ip_hash: ipHash,
        user_agent: ua.slice(0, 200),
      });
      await admin.from("affiliates").update({
        total_clicks: (affiliate.total_clicks ?? 0) + 1,
      }).eq("id", affiliate.id);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "signup") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data: userData } = await sb.auth.getUser(authHeader.replace("Bearer ", ""));
      const user = userData?.user;
      if (!user) {
        return new Response(JSON.stringify({ error: "unauthorized" }), {
          status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Não pode indicar a si mesmo
      if (user.id === affiliate.user_id) {
        return new Response(JSON.stringify({ ok: false, reason: "self_referral" }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Insere vínculo (UNIQUE em referred_user_id garante 1 só)
      const { error: insErr } = await admin.from("affiliate_referrals").insert({
        affiliate_id: affiliate.id,
        affiliate_user_id: affiliate.user_id,
        referred_user_id: user.id,
        source: "signup_link",
      });

      if (insErr) {
        // Já existe — ignora silenciosamente
        return new Response(JSON.stringify({ ok: true, already: true }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await admin.from("affiliates").update({
        total_referrals: (affiliate.total_referrals ?? 0) + 1,
      }).eq("id", affiliate.id);

      return new Response(JSON.stringify({ ok: true }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "invalid_action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function sha256(input: string): Promise<string> {
  const buf = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0")).join("");
}
