import React from 'react';
import { useDeliveryOrders, DeliveryOrder } from '@/hooks/useDeliveryOrders';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Phone, Package, Clock, Navigation } from 'lucide-react';

interface OrdersPageProps {
  onBack: () => void;
  onSelectOrder: (order: DeliveryOrder) => void;
}

const OrdersPage: React.FC<OrdersPageProps> = ({ onBack, onSelectOrder }) => {
  const { pendingOrders, activeOrders, loading, acceptOrder } = useDeliveryOrders();

  const handleAcceptOrder = async (orderId: string) => {
    await acceptOrder(orderId);
  };

  const getStatusBadge = (status: DeliveryOrder['status']) => {
    const badges = {
      pending: { label: 'Oczekuje', className: 'bg-warning/10 text-warning' },
      accepted: { label: 'Przyjęte', className: 'bg-primary/10 text-primary' },
      picked_up: { label: 'Odebrane', className: 'bg-secondary/10 text-secondary' },
      in_transit: { label: 'W drodze', className: 'bg-primary/10 text-primary' },
      delivered: { label: 'Dostarczone', className: 'bg-success/10 text-success' },
      cancelled: { label: 'Anulowane', className: 'bg-destructive/10 text-destructive' },
    };
    return badges[status];
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const OrderCard = ({ order, showAccept }: { order: DeliveryOrder; showAccept?: boolean }) => {
    const badge = getStatusBadge(order.status);

    return (
      <div className="bg-card rounded-xl p-4 shadow-card animate-slide-up">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                {badge.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTime(order.created_at)}
              </span>
            </div>
            <h3 className="font-semibold text-foreground">{order.restaurant?.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {order.restaurant?.address}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">{Number(order.delivery_fee).toFixed(2)} zł</p>
            {order.estimated_time_minutes && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                <Clock className="w-3 h-3" />
                ~{order.estimated_time_minutes} min
              </p>
            )}
          </div>
        </div>

        {/* Customer info */}
        <div className="border-t border-border pt-3 mb-3">
          <p className="font-medium text-foreground text-sm">{order.customer_name}</p>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Navigation className="w-3 h-3" />
            {order.customer_address}
          </p>
          {order.order_details && (
            <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
              <Package className="w-3 h-3 mt-0.5" />
              {order.order_details}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {showAccept && order.status === 'pending' && (
            <Button
              onClick={() => handleAcceptOrder(order.id)}
              className="flex-1 gradient-primary"
            >
              Przyjmij zamówienie
            </Button>
          )}
          {order.status !== 'pending' && (
            <Button
              onClick={() => onSelectOrder(order)}
              className="flex-1"
              variant="outline"
            >
              Zobacz szczegóły
            </Button>
          )}
          <a
            href={`tel:${order.customer_phone}`}
            className="w-12 h-10 flex items-center justify-center rounded-lg bg-secondary text-secondary-foreground"
          >
            <Phone className="w-5 h-5" />
          </a>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Ładowanie zamówień...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background z-10 border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Zamówienia</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Active Orders */}
        {activeOrders.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Aktywne dostawy ({activeOrders.length})
            </h2>
            <div className="space-y-3">
              {activeOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          </div>
        )}

        {/* Pending Orders */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-warning" />
            Dostępne zamówienia ({pendingOrders.length})
          </h2>
          {pendingOrders.length === 0 ? (
            <div className="bg-card rounded-xl p-8 text-center shadow-card">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Brak dostępnych zamówień</p>
              <p className="text-sm text-muted-foreground">Nowe zamówienia pojawią się tutaj automatycznie</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOrders.map((order) => (
                <OrderCard key={order.id} order={order} showAccept />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
