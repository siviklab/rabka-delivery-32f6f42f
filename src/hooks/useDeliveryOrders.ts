import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface DeliveryOrder {
  id: string;
  restaurant_id: string;
  driver_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_lat: number;
  customer_lng: number;
  order_details: string | null;
  status: 'pending' | 'accepted' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  delivery_fee: number;
  estimated_time_minutes: number | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
  restaurant?: {
    id: string;
    name: string;
    address: string;
    phone: string | null;
    lat: number;
    lng: number;
  };
}

export const useDeliveryOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<DeliveryOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('delivery_orders')
      .select(`
        *,
        restaurant:restaurants(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Błąd',
        description: 'Nie udało się pobrać zamówień',
        variant: 'destructive',
      });
    } else {
      setOrders(data as unknown as DeliveryOrder[]);
    }
    setLoading(false);
  };

  const acceptOrder = async (orderId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    const { error } = await supabase
      .from('delivery_orders')
      .update({
        driver_id: user.id,
        status: 'accepted' as const,
      })
      .eq('id', orderId)
      .eq('status', 'pending');

    if (error) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się przyjąć zamówienia',
        variant: 'destructive',
      });
      return { error };
    }

    toast({
      title: 'Sukces',
      description: 'Zamówienie przyjęte!',
    });

    await fetchOrders();
    return { error: null };
  };

  const updateOrderStatus = async (orderId: string, status: DeliveryOrder['status']) => {
    const updates: Record<string, unknown> = { status };
    
    if (status === 'picked_up') {
      updates.picked_up_at = new Date().toISOString();
    } else if (status === 'delivered') {
      updates.delivered_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('delivery_orders')
      .update(updates)
      .eq('id', orderId);

    if (error) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się zaktualizować statusu',
        variant: 'destructive',
      });
      return { error };
    }

    toast({
      title: 'Sukces',
      description: 'Status zamówienia zaktualizowany',
    });

    await fetchOrders();
    return { error: null };
  };

  useEffect(() => {
    if (user) {
      fetchOrders();

      // Subscribe to realtime updates
      const channel = supabase
        .channel('delivery-orders-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'delivery_orders',
          },
          () => {
            fetchOrders();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const activeOrders = orders.filter(
    (o) => o.driver_id === user?.id && ['accepted', 'picked_up', 'in_transit'].includes(o.status)
  );
  const completedOrders = orders.filter(
    (o) => o.driver_id === user?.id && o.status === 'delivered'
  );

  return {
    orders,
    pendingOrders,
    activeOrders,
    completedOrders,
    loading,
    acceptOrder,
    updateOrderStatus,
    refreshOrders: fetchOrders,
  };
};
