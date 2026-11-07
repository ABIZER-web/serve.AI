// Serve.AI - generate-invoice Edge Function
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

    const { orderId } = await req.json();

    // Check existing invoice
    const { data: existing } = await supabaseClient
      .from("invoices")
      .select("*, invoice_items(*)")
      .eq("order_id", orderId)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ invoice: existing }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch order details
    const { data: order, error: orderErr } = await supabaseClient
      .from("orders")
      .select("*, tables(table_number), restaurants(*), order_items(*)")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: invNum } = await supabaseClient.rpc("generate_invoice_number", {
      p_restaurant_id: order.restaurant_id,
    });

    const restaurant = order.restaurants;
    const { data: invoice, error: invErr } = await supabaseClient
      .from("invoices")
      .insert({
        restaurant_id: order.restaurant_id,
        order_id: order.id,
        invoice_number: invNum || `INV-2026-${Date.now().toString().slice(-4)}`,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        table_number: order.tables?.table_number || "Takeaway",
        subtotal: order.subtotal,
        discount_amount: order.discount_amount,
        taxable_amount: order.taxable_amount,
        cgst_rate: 2.5,
        cgst_amount: order.cgst_amount,
        sgst_rate: 2.5,
        sgst_amount: order.sgst_amount,
        grand_total: order.grand_total,
        payment_method: order.payment_method,
        payment_status: "paid",
        gstin: restaurant?.gstin || "29AABCU9603R1ZM",
        restaurant_snapshot: {
          name: restaurant?.name || "Food House",
          address: restaurant?.address || "Bangalore, India",
          phone: restaurant?.phone || "+91 98765 43210",
        },
      })
      .select()
      .single();

    if (invErr) throw invErr;

    // Line items
    const invItems = order.order_items.map((oi: any) => ({
      invoice_id: invoice.id,
      item_name: oi.item_name,
      variant_name: oi.variant_name,
      quantity: oi.quantity,
      unit_price: oi.unit_price,
      total_price: oi.total_price,
    }));

    await supabaseClient.from("invoice_items").insert(invItems);

    return new Response(JSON.stringify({ invoice }), {
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

