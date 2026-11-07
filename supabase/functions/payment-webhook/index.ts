// Serve.AI - payment-webhook Edge Function
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

    const body = await req.json();
    const { event, payload } = body;

    // Handles payment capture event
    if (event === "payment.captured" || body.status === "captured") {
      const orderId = payload?.payment?.entity?.notes?.order_id || body.orderId;
      const paymentId = payload?.payment?.entity?.id || body.paymentId;
      const amount = (payload?.payment?.entity?.amount ? payload.payment.entity.amount / 100 : body.amount);

      if (orderId) {
        // Update order status
        await supabaseClient
          .from("orders")
          .update({ payment_status: "paid", updated_at: new Date().toISOString() })
          .eq("id", orderId);

        // Record payment
        await supabaseClient.from("payments").insert({
          restaurant_id: body.restaurantId,
          order_id: orderId,
          transaction_reference: paymentId,
          gateway_payment_id: paymentId,
          payment_method: body.method || "upi",
          amount: amount,
          status: "success",
          paid_at: new Date().toISOString(),
          raw_response: body,
        });
      }
    }

    return new Response(JSON.stringify({ status: "acknowledged" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

