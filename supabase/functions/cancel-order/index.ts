import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-restaurant-api-key",
};

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, 405);
  }

  const apiKey = req.headers.get("x-restaurant-api-key");
  if (!apiKey) {
    return json({ success: false, error: "Missing API key" }, 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: restaurant } = await supabase
    .from("restaurants")
    .select("id")
    .eq("api_key", apiKey)
    .single();

  if (!restaurant) {
    return json({ success: false, error: "Invalid API key" }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ success: false, error: "Invalid JSON body" }, 400);
  }

  const orderId = body.order_id as string | undefined;
  if (!orderId) {
    return json({ success: false, error: "order_id is required" }, 400);
  }

  // Fetch order
  const { data: order } = await supabase
    .from("delivery_orders")
    .select("id, status")
    .eq("id", orderId)
    .eq("restaurant_id", restaurant.id)
    .single();

  if (!order) {
    return json({ success: false, error: "Order not found" }, 404);
  }

  const cancellable = ["pending", "accepted"];
  if (!cancellable.includes(order.status ?? "")) {
    return json(
      {
        success: false,
        error: `Cannot cancel order with status '${order.status}'. Only pending or accepted orders can be cancelled.`,
      },
      400
    );
  }

  const { error } = await supabase
    .from("delivery_orders")
    .update({ status: "cancelled" as any })
    .eq("id", orderId);

  if (error) {
    console.error("Cancel error:", error);
    return json({ success: false, error: "Failed to cancel order" }, 500);
  }

  return json({ success: true, message: "Order cancelled" });
});
