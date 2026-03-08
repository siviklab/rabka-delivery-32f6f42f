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

  // Validate API key and get restaurant
  const { data: restaurant, error: restError } = await supabase
    .from("restaurants")
    .select("id, name")
    .eq("api_key", apiKey)
    .single();

  if (restError || !restaurant) {
    return json({ success: false, error: "Invalid API key" }, 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ success: false, error: "Invalid JSON body" }, 400);
  }

  // Validate required fields
  const errors: { field: string; message: string }[] = [];

  const requiredStr: [string, string, number][] = [
    ["external_order_id", "External order ID is required", 100],
    ["customer_name", "Customer name is required", 100],
    ["customer_phone", "Customer phone is required", 20],
    ["customer_address", "Customer address is required", 300],
  ];

  for (const [field, msg, max] of requiredStr) {
    const val = body[field];
    if (!val || typeof val !== "string" || val.trim().length === 0) {
      errors.push({ field, message: msg });
    } else if ((val as string).length > max) {
      errors.push({ field, message: `${field} must be less than ${max} characters` });
    }
  }

  if (typeof body.customer_lat !== "number" || body.customer_lat < -90 || body.customer_lat > 90) {
    errors.push({ field: "customer_lat", message: "Valid latitude required (-90 to 90)" });
  }
  if (typeof body.customer_lng !== "number" || body.customer_lng < -180 || body.customer_lng > 180) {
    errors.push({ field: "customer_lng", message: "Valid longitude required (-180 to 180)" });
  }

  const items = body.items;
  if (!Array.isArray(items) || items.length === 0) {
    errors.push({ field: "items", message: "At least one item is required" });
  } else if (items.length > 50) {
    errors.push({ field: "items", message: "Maximum 50 items per order" });
  } else {
    for (let i = 0; i < items.length; i++) {
      const item = items[i] as Record<string, unknown>;
      if (!item.item_name || typeof item.item_name !== "string") {
        errors.push({ field: `items[${i}].item_name`, message: "Item name is required" });
      }
      if (typeof item.quantity !== "number" || item.quantity < 1) {
        errors.push({ field: `items[${i}].quantity`, message: "Quantity must be >= 1" });
      }
      if (typeof item.unit_price !== "number" || item.unit_price < 0) {
        errors.push({ field: `items[${i}].unit_price`, message: "Unit price must be >= 0" });
      }
    }
  }

  if (errors.length > 0) {
    return json({ success: false, error: "Validation failed", details: errors }, 400);
  }

  // Check for duplicate external_order_id
  const { data: existing } = await supabase
    .from("delivery_orders")
    .select("id")
    .eq("restaurant_id", restaurant.id)
    .eq("external_order_id", body.external_order_id as string)
    .maybeSingle();

  if (existing) {
    return json({ success: false, error: "Duplicate external_order_id" }, 409);
  }

  // Create order
  const deliveryFee =
    typeof body.delivery_fee === "number" && body.delivery_fee >= 0
      ? body.delivery_fee
      : 5.0;

  const { data: order, error: orderError } = await supabase
    .from("delivery_orders")
    .insert({
      restaurant_id: restaurant.id,
      external_order_id: body.external_order_id as string,
      customer_name: (body.customer_name as string).trim(),
      customer_phone: (body.customer_phone as string).trim(),
      customer_address: (body.customer_address as string).trim(),
      customer_lat: body.customer_lat as number,
      customer_lng: body.customer_lng as number,
      order_details: body.order_details
        ? String(body.order_details).substring(0, 1000)
        : null,
      delivery_fee: deliveryFee,
      status: "pending",
    })
    .select("id, external_order_id, status, created_at")
    .single();

  if (orderError) {
    console.error("Order insert error:", orderError);
    return json({ success: false, error: "Failed to create order" }, 500);
  }

  // Insert order items
  const orderItems = (items as Record<string, unknown>[]).map((item) => ({
    order_id: order.id,
    item_name: String(item.item_name).substring(0, 200),
    quantity: item.quantity as number,
    unit_price: item.unit_price as number,
    notes: item.notes ? String(item.notes).substring(0, 500) : null,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    console.error("Items insert error:", itemsError);
  }

  return json(
    {
      success: true,
      order: {
        id: order.id,
        external_order_id: order.external_order_id,
        status: order.status,
        created_at: order.created_at,
      },
    },
    201
  );
});
