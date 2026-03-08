import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface RestaurantMembership {
  id: string;
  restaurant_id: string;
  role: string;
  restaurant?: {
    id: string;
    name: string;
    address: string;
    phone: string | null;
  };
}

export const useRestaurantUser = () => {
  const { user } = useAuth();
  const [membership, setMembership] = useState<RestaurantMembership | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembership = async () => {
      if (!user) {
        setMembership(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('restaurant_users')
        .select(`
          *,
          restaurant:restaurants(*)
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching restaurant membership:', error);
      }

      setMembership(data as unknown as RestaurantMembership | null);
      setLoading(false);
    };

    fetchMembership();
  }, [user]);

  return { membership, loading, isRestaurantUser: !!membership };
};
