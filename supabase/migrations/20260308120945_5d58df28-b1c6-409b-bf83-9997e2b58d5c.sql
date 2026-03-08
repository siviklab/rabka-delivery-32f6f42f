
-- Create order_items table (enum and restaurant columns already added by partial migration)
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.delivery_orders(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- order_items RLS: drivers can view items for orders they can see
CREATE POLICY "Users can view order items for visible orders"
ON public.order_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.delivery_orders d_ord
    WHERE d_ord.id = order_items.order_id
    AND (d_ord.status = 'pending' OR d_ord.driver_id = auth.uid())
  )
);

-- Create restaurant_users table
CREATE TABLE IF NOT EXISTS public.restaurant_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'staff',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);

ALTER TABLE public.restaurant_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own restaurant membership"
ON public.restaurant_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Helper function
CREATE OR REPLACE FUNCTION public.is_restaurant_user(_user_id uuid, _restaurant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.restaurant_users
    WHERE user_id = _user_id AND restaurant_id = _restaurant_id
  )
$$;

-- delivery_orders policies for restaurant users
CREATE POLICY "Restaurant users can create orders"
ON public.delivery_orders
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_restaurant_user(auth.uid(), restaurant_id)
);

CREATE POLICY "Restaurant users can view their orders"
ON public.delivery_orders
FOR SELECT
TO authenticated
USING (
  public.is_restaurant_user(auth.uid(), restaurant_id)
);

CREATE POLICY "Restaurant users can update their orders"
ON public.delivery_orders
FOR UPDATE
TO authenticated
USING (
  public.is_restaurant_user(auth.uid(), restaurant_id)
);

-- order_items insert for restaurant users
CREATE POLICY "Restaurant users can insert order items"
ON public.order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.delivery_orders d_ord
    WHERE d_ord.id = order_items.order_id
    AND public.is_restaurant_user(auth.uid(), d_ord.restaurant_id)
  )
);

-- Enable realtime on order_items
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_items;
