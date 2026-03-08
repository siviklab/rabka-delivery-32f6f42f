
-- Step 1: Create enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Step 2: Create table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create has_role function BEFORE any policies that use it
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Step 4: user_roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Step 5: Admin policies on other tables
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can view all delivery_orders" ON public.delivery_orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update all delivery_orders" ON public.delivery_orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can view all order_items" ON public.order_items FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can view all restaurants" ON public.restaurants FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can update all restaurants" ON public.restaurants FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can insert restaurants" ON public.restaurants FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can view all restaurant_users" ON public.restaurant_users FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can insert restaurant_users" ON public.restaurant_users FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can delete restaurant_users" ON public.restaurant_users FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
CREATE POLICY "Admins can view all payouts" ON public.payouts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));
