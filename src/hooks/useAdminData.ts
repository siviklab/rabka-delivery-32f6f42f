import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdminDeliveries = () => {
  return useQuery({
    queryKey: ['admin-deliveries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('delivery_orders')
        .select('*, restaurants(name, address), order_items(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useAdminDrivers = () => {
  return useQuery({
    queryKey: ['admin-drivers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useAdminRestaurants = () => {
  return useQuery({
    queryKey: ['admin-restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*, restaurant_users(*)');
      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateDeliveryStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('delivery_orders')
        .update({ status: status as any })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-deliveries'] });
    },
  });
};

export const useToggleDriverAvailability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, isAvailable }: { userId: string; isAvailable: boolean }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ is_available: isAvailable })
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-drivers'] });
    },
  });
};

export const useAddRestaurant = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (restaurant: { name: string; address: string; lat: number; lng: number; phone?: string }) => {
      const { error } = await supabase.from('restaurants').insert(restaurant);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] });
    },
  });
};

export const useGenerateApiKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (restaurantId: string) => {
      const { data, error } = await supabase.functions.invoke('generate-api-key', {
        body: { restaurant_id: restaurantId },
      });
      if (error) throw error;
      return data as { api_key: string; webhook_secret: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] });
    },
  });
};

export const useUpdateRestaurantWebhook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, webhook_url }: { id: string; webhook_url: string }) => {
      const { error } = await supabase
        .from('restaurants')
        .update({ webhook_url })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] });
    },
  });
};
