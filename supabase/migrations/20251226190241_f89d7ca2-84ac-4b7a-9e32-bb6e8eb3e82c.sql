-- Create enum for delivery status
CREATE TYPE public.delivery_status AS ENUM ('pending', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled');

-- Create profiles table for drivers
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  is_available BOOLEAN DEFAULT true,
  current_lat DOUBLE PRECISION,
  current_lng DOUBLE PRECISION,
  stripe_account_id TEXT,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create restaurants table
CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create delivery orders table
CREATE TABLE public.delivery_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_lat DOUBLE PRECISION NOT NULL,
  customer_lng DOUBLE PRECISION NOT NULL,
  order_details TEXT,
  status public.delivery_status DEFAULT 'pending',
  delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 5.00,
  estimated_time_minutes INTEGER,
  picked_up_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payouts table
CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  stripe_transfer_id TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Restaurants policies (public read for all authenticated)
CREATE POLICY "Authenticated users can view restaurants"
  ON public.restaurants FOR SELECT
  TO authenticated
  USING (true);

-- Delivery orders policies
CREATE POLICY "Drivers can view pending orders"
  ON public.delivery_orders FOR SELECT
  TO authenticated
  USING (status = 'pending' OR driver_id = auth.uid());

CREATE POLICY "Drivers can accept pending orders"
  ON public.delivery_orders FOR UPDATE
  TO authenticated
  USING (status = 'pending' OR driver_id = auth.uid());

-- Payouts policies
CREATE POLICY "Drivers can view their own payouts"
  ON public.payouts FOR SELECT
  USING (driver_id = auth.uid());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delivery_orders_updated_at
  BEFORE UPDATE ON public.delivery_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for delivery orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_orders;

-- Insert sample restaurants for Rabka-Zdrój
INSERT INTO public.restaurants (name, address, phone, lat, lng) VALUES
  ('Pizzeria Bella', 'ul. Orkana 12, Rabka-Zdrój', '+48 123 456 789', 49.6137, 19.9543),
  ('Karczma Góralska', 'ul. Parkowa 5, Rabka-Zdrój', '+48 123 456 790', 49.6152, 19.9521),
  ('Kebab House', 'ul. Sądecka 3, Rabka-Zdrój', '+48 123 456 791', 49.6128, 19.9498),
  ('Chińczyk Express', 'ul. Główna 18, Rabka-Zdrój', '+48 123 456 792', 49.6145, 19.9512);

-- Insert sample pending orders
INSERT INTO public.delivery_orders (restaurant_id, customer_name, customer_phone, customer_address, customer_lat, customer_lng, order_details, delivery_fee, estimated_time_minutes)
SELECT 
  r.id,
  'Jan Kowalski',
  '+48 600 111 222',
  'ul. Słoneczna 15, Rabka-Zdrój',
  49.6098,
  19.9478,
  '2x Pizza Margherita, 1x Cola',
  8.50,
  25
FROM public.restaurants r WHERE r.name = 'Pizzeria Bella'
UNION ALL
SELECT 
  r.id,
  'Anna Nowak',
  '+48 600 333 444',
  'ul. Leśna 8, Rabka-Zdrój',
  49.6175,
  19.9565,
  'Zestaw obiadowy góralski',
  7.00,
  30
FROM public.restaurants r WHERE r.name = 'Karczma Góralska';