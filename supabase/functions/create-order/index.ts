// Serve.AI - create-order Edge Function
// Validates QR token, checks real menu prices server-side, and commits order transaction.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const {
      restaurantSlug,
      tableNumber,
      tableToken,
      items,
      customerName,
      customerPhone,
      paymentMethod,
      specialInstructions,
    } = await req.json();

    if (!restaurantSlug || !tableNumber || !tableToken || !items || !items.length) {
      return new Response(
        JSON.stringify({ error: "Missing required order parameters." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Verify table and secure token server-side
    const { data: tokenData, error: tokenError } = await supabaseClient.rpc(
      "verify_table_qr_token",
      {
        p_restaurant_slug: restaurantSlug,
        p_table_number: tableNumber,
        p_token: tableToken,
      }
    );

    if (tokenError || !tokenData || tokenData.length === 0 || !tokenData[0].is_valid) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired table QR token. Please scan again." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { restaurant_id, table_id } = tokenData[0];

    // 2. Fetch restaurant tax settings
    const { data: settings } = await supabaseClient
      .from("restaurant_settings")
      .select("*")
      .eq("restaurant_id", restaurant_id)
      .single();

    const cgstRate = settings?.cgst_rate ?? 2.5;
    const sgstRate = settings?.sgst_rate ?? 2.5;

    // 3. Fetch item prices from database to ensure no client tampering
    let subtotal = 0;
    const verifiedItems: any[] = [];

    for (const item of items) {
      const { data: menuItem } = await supabaseClient
        .from("menu_items")
        .select("id, name, base_price, is_available")
        .eq("id", item.menuItemId)
        .single();

      if (!menuItem || !menuItem.is_available) {
        return new Response(
          JSON.stringify({ error: `Item '${item.name}' is unavailable.` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      let unitPrice = Number(menuItem.base_price);
      let variantName = item.variantName || "Standard";

      if (item.variantId) {
        const { data: variant } = await supabaseClient
          .from("menu_item_variants")
          .select("name, price")
          .eq("id", item.variantId)
          .single();
        if (variant) {
          unitPrice = Number(variant.price);
          variantName = variant.name;
        }
      }

      const itemTotal = unitPrice * (item.quantity || 1);
      subtotal += itemTotal;

      verifiedItems.push({
        menu_item_id: menuItem.id,
        variant_id: item.variantId || null,
        item_name: menuItem.name,
        variant_name: variantName,
        unit_price: unitPrice,
        quantity: item.quantity || 1,
        total_price: itemTotal,
        special_notes: item.notes || null,
      });
    }

    const discountAmount = 0.0;
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const cgstAmount = Number(((taxableAmount * cgstRate) / 100).toFixed(2));
    const sgstAmount = Number(((taxableAmount * sgstRate) / 100).toFixed(2));
    const grandTotal = Math.round(taxableAmount + cgstAmount + sgstAmount);

    // 4. Generate order number
    const { data: orderNum } = await supabaseClient.rpc("generate_order_number", {
      p_restaurant_id: restaurant_id,
    });

    // 5. Insert order
    const { data: newOrder, error: orderInsertError } = await supabaseClient
      .from("orders")
      .insert({
        restaurant_id,
        table_id,
        order_number: orderNum || `ORD-${Date.now().toString().slice(-4)}`,
        customer_name: customerName || "Guest",
        customer_phone: customerPhone || null,
        status: "pending",
        payment_status: paymentMethod === "counter" ? "pending" : "paid",
        payment_method: paymentMethod || "counter",
        special_instructions: specialInstructions || null,
        subtotal,
        discount_amount: discountAmount,
        taxable_amount: taxableAmount,
        cgst_amount: cgstAmount,
        sgst_amount: sgstAmount,
        grand_total: grandTotal,
        estimated_prep_time_minutes: 20,
      })
      .select()
      .single();

    if (orderInsertError) {
      throw orderInsertError;
    }

    // 6. Insert order items
    const itemsToInsert = verifiedItems.map((vi) => ({
      ...vi,
      order_id: newOrder.id,
    }));

    await supabaseClient.from("order_items").insert(itemsToInsert);

    return new Response(
      JSON.stringify({
        success: true,
        order: newOrder,
        message: "Order placed successfully!",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

