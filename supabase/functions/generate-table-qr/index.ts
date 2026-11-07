// Serve.AI - generate-table-qr Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { tableId, restaurantId, hostDomain } = await req.json();

    const { data: table, error: tErr } = await supabaseClient
      .from("tables")
      .select("*, restaurants(slug, name)")
      .eq("id", tableId)
      .single();

    if (tErr || !table) throw new Error("Table not found");

    // Generate cryptographic random token
    const randomBytes = new Uint8Array(24);
    crypto.getRandomValues(randomBytes);
    const token = Array.from(randomBytes).map((b) => b.toString(16).padStart(2, "0")).join("");

    const baseHost = hostDomain || "https://serveai.restaurant";
    const qrTargetUrl = `${baseHost}/r/${table.restaurants.slug}/table/${table.table_number}?token=${token}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(qrTargetUrl)}`;

    // Inactivate existing active tokens for this table
    await supabaseClient
      .from("table_qr_tokens")
      .update({ is_active: false })
      .eq("table_id", tableId);

    // Save new active token
    const { data: qrRecord, error: qrErr } = await supabaseClient
      .from("table_qr_tokens")
      .insert({
        table_id: tableId,
        restaurant_id: restaurantId,
        secure_token: token,
        qr_code_url: qrImageUrl,
        is_active: true,
      })
      .select()
      .single();

    if (qrErr) throw qrErr;

    return new Response(
      JSON.stringify({
        success: true,
        token: token,
        qrTargetUrl,
        qrImageUrl,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

