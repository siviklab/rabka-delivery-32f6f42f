import React from 'react';
import { useDeliveryOrders } from '@/hooks/useDeliveryOrders';
import { ArrowLeft, CheckCircle, Calendar, DollarSign } from 'lucide-react';

interface HistoryPageProps {
  onBack: () => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onBack }) => {
  const { completedOrders, loading } = useDeliveryOrders();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Group orders by date
  const ordersByDate = completedOrders.reduce((acc, order) => {
    const date = formatDate(order.delivered_at || order.created_at);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(order);
    return acc;
  }, {} as Record<string, typeof completedOrders>);

  const totalEarnings = completedOrders.reduce(
    (sum, order) => sum + Number(order.delivery_fee),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Ładowanie historii...</div>
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
          <h1 className="text-xl font-bold text-foreground">Historia dostaw</h1>
        </div>
      </div>

      {/* Summary Card */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-4 text-primary-foreground mb-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6" />
            <span className="text-sm opacity-90">Łączne zarobki</span>
          </div>
          <p className="text-3xl font-bold">{totalEarnings.toFixed(2)} zł</p>
          <p className="text-sm opacity-80 mt-1">{completedOrders.length} ukończonych dostaw</p>
        </div>
      </div>

      {/* Orders by Date */}
      <div className="px-4 space-y-6">
        {Object.keys(ordersByDate).length === 0 ? (
          <div className="bg-card rounded-xl p-8 text-center shadow-card">
            <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Brak ukończonych dostaw</p>
            <p className="text-sm text-muted-foreground">Twoje dostawy pojawią się tutaj</p>
          </div>
        ) : (
          Object.entries(ordersByDate).map(([date, orders]) => {
            const dayTotal = orders.reduce((sum, o) => sum + Number(o.delivery_fee), 0);

            return (
              <div key={date}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {date}
                  </h2>
                  <span className="text-sm text-primary font-medium">{dayTotal.toFixed(2)} zł</span>
                </div>
                <div className="space-y-2">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-card rounded-xl p-4 shadow-card flex items-center gap-4"
                    >
                      <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-success" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{order.restaurant?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.customer_address}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.delivered_at && formatTime(order.delivered_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          +{Number(order.delivery_fee).toFixed(2)} zł
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
