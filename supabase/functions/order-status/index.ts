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
  const externalOrderId = body.external_order_id as string | undefined;

  if (!orderId && !externalOrderId) {
    return json({ success: false, error: "order_id or external_order_id required" }, 400);
  }

  let query = supabase
    .from("delivery_orders")
    .select("id, external_order_id, status, estimated_time_minutes, picked_up_at, delivered_at, driver_id")
    .eq("restaurant_id", restaurant.id);

  if (orderId) {
    query = query.eq("id", orderId);
  } else {
    query = query.eq("external_order_id", externalOrderId!);
  }

  const { data: order, error } = await query.maybeSingle();

  if (error || !order) {
    return json({ success: false, error: "Order not found" }, 404);
  }

  // Get driver info if assigned
  let driverName: string | null = null;
  let driverPhone: string | null = null;

  if (order.driver_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("user_id", order.driver_id)
      .single();

    if (profile) {
      driverName = profile.full_name;
      driverPhone = profile.phone;
    }
  }

  return json({
    success: true,
    order: {
      id: order.id,
      external_order_id: order.external_order_id,
      status: order.status,
      driver_name: driverName,
      driver_phone: driverPhone,
      estimated_time_minutes: order.estimated_time_minutes,
      picked_up_at: order.picked_up_at,
      delivered_at: order.delivered_at,
    },
  });
});
