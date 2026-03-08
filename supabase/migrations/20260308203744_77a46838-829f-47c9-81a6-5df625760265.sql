
-- Add api_key and webhook_url to restaurants
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS api_key text UNIQUE,
  ADD COLUMN IF NOT EXISTS webhook_url text,
  ADD COLUMN IF NOT EXISTS webhook_secret text;

-- Add external_order_id to delivery_orders
ALTER TABLE public.delivery_orders
  ADD COLUMN IF NOT EXISTS external_order_id text;

-- Create unique index on external_order_id per restaurant
CREATE UNIQUE INDEX IF NOT EXISTS idx_delivery_orders_external_order_id
  ON public.delivery_orders (restaurant_id, external_order_id)
  WHERE external_order_id IS NOT NULL;
