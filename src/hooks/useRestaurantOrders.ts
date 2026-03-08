import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface OrderItem {
  id?: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  notes?: string;
}

interface RestaurantOrder {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  customer_lat: number;
  customer_lng: number;
  order_details: string | null;
  status: string;
  delivery_fee: number;
  estimated_time_minutes: number | null;
  created_at: string;
  updated_at: string;
  driver_id: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
}

export const useRestaurantOrders = (restaurantId: string | undefined) => {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!restaurantId) return;

    const { data, error } = await supabase
      .from('delivery_orders')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching restaurant orders:', error);
    } else {
      setOrders(data as RestaurantOrder[]);
    }
    setLoading(false);
  }, [restaurantId]);

  const createOrder = async (order: {
    customer_name: string;
    customer_phone: string;
    customer_address: string;
    customer_lat: number;
    customer_lng: number;
    order_details?: string;
    delivery_fee: number;
    items: OrderItem[];
  }) => {
    if (!restaurantId) return { error: new Error('No restaurant') };

    const { data, error } = await supabase
      .from('delivery_orders')
      .insert({
        restaurant_id: restaurantId,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_address: order.customer_address,
        customer_lat: order.customer_lat,
        customer_lng: order.customer_lng,
        order_details: order.order_details || null,
        delivery_fee: order.delivery_fee,
        status: 'pending' as const,
      })
      .select()
      .single();

    if (error) {
      toast({ title: 'Błąd', description: 'Nie udało się utworzyć zamówienia', variant: 'destructive' });
      return { error };
    }

    // Insert order items
    if (order.items.length > 0 && data) {
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(
          order.items.map((item) => ({
            order_id: data.id,
            item_name: item.item_name,
            quantity: item.quantity,
            unit_price: item.unit_price,
            notes: item.notes || null,
          }))
        );

      if (itemsError) {
        console.error('Error inserting order items:', itemsError);
      }
    }

    toast({ title: 'Sukces', description: 'Zamówienie utworzone!' });
    await fetchOrders();
    return { error: null };
  };

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('delivery_orders')
      .update({ status: status as any })
      .eq('id', orderId);

    if (error) {
      toast({ title: 'Błąd', description: 'Nie udało się zaktualizować statusu', variant: 'destructive' });
      return { error };
    }

    toast({ title: 'Sukces', description: 'Status zaktualizowany' });
    await fetchOrders();
    return { error: null };
  };

  useEffect(() => {
    if (restaurantId) {
      fetchOrders();

      const channel = supabase
        .channel('restaurant-orders-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'delivery_orders',
            filter: `restaurant_id=eq.${restaurantId}`,
          },
          () => fetchOrders()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [restaurantId, fetchOrders]);

  const activeOrders = orders.filter((o) => !['delivered', 'cancelled'].includes(o.status));
  const completedOrders = orders.filter((o) => o.status === 'delivered');

  return { orders, activeOrders, completedOrders, loading, createOrder, updateStatus, refreshOrders: fetchOrders };
};
