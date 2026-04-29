import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const DISCORD_BOT_TOKEN = Deno.env.get("DISCORD_BOT_TOKEN")!;

function hexToInt(hex: string): number {
  return parseInt(hex.replace("#", ""), 16) || 0x5865f2;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = await req.json();
    const { title, message, image_url, embed_color, button_label, button_url } = body;

    if (!message?.trim()) {
      return new Response(JSON.stringify({ error: "Mensagem obrigatória" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: profile } = await admin
      .from("profiles")
      .select("discord_id, discord_username")
      .eq("id", userId)
      .single();

    if (!profile?.discord_id) {
      return new Response(
        JSON.stringify({ error: "Conecte sua conta Discord primeiro" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Abrir DM channel
    const dmRes = await fetch("https://discord.com/api/v10/users/@me/channels", {
      method: "POST",
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recipient_id: profile.discord_id }),
    });

    if (!dmRes.ok) {
      const txt = await dmRes.text();
      console.error("DM open failed", txt);
      return new Response(
        JSON.stringify({
          error: "Não consegui abrir DM com você. Verifique se permite DMs do servidor onde o bot está.",
          detail: txt.slice(0, 200),
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const dm = await dmRes.json();

    // Montar embed igual ao envio real
    const embed: any = {
      color: hexToInt(embed_color || "#5865F2"),
      footer: { text: "🧪 Modo de teste — só você está vendo" },
    };
    if (title) embed.title = title;
    if (message) embed.description = message;
    if (image_url) embed.image = { url: image_url };

    const components: any[] = [];
    if (button_url && button_label) {
      components.push({
        type: 1,
        components: [{ type: 2, style: 5, label: button_label.slice(0, 80), url: button_url }],
      });
    }

    const sendRes = await fetch(`https://discord.com/api/v10/channels/${dm.id}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ embeds: [embed], components }),
    });

    if (!sendRes.ok) {
      const txt = await sendRes.text();
      return new Response(
        JSON.stringify({
          error: "Falha ao enviar DM de teste",
          detail: txt.slice(0, 200),
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ success: true, sent_to: profile.discord_username }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown";
    console.error("test-campaign error", err);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
