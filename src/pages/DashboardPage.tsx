import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDeliveryOrders } from '@/hooks/useDeliveryOrders';
import { Button } from '@/components/ui/button';
import { Package, Clock, CheckCircle, DollarSign, TrendingUp } from 'lucide-react';

interface DashboardPageProps {
  onViewOrders: () => void;
  onViewHistory: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onViewOrders, onViewHistory }) => {
  const { profile } = useAuth();
  const { pendingOrders, activeOrders, completedOrders } = useDeliveryOrders();

  const todayDeliveries = completedOrders.filter((order) => {
    const deliveredDate = new Date(order.delivered_at || '');
    const today = new Date();
    return deliveredDate.toDateString() === today.toDateString();
  });

  const todayEarnings = todayDeliveries.reduce(
    (sum, order) => sum + Number(order.delivery_fee),
    0
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-primary p-6 pt-12 pb-20 rounded-b-3xl">
        <h1 className="text-2xl font-bold text-primary-foreground">
          Cześć, {profile?.full_name?.split(' ')[0] || 'Kierowco'}! 👋
        </h1>
        <p className="text-primary-foreground/80 mt-1">
          {activeOrders.length > 0
            ? `Masz ${activeOrders.length} aktywną dostawę`
            : 'Gotowy na nowe dostawy?'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="px-4 -mt-12">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card rounded-xl p-4 shadow-card animate-slide-up">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <span className="text-muted-foreground text-sm">Dziś</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{todayEarnings.toFixed(2)} zł</p>
            <p className="text-xs text-muted-foreground">{todayDeliveries.length} dostaw</p>
          </div>

          <div className="bg-card rounded-xl p-4 shadow-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <span className="text-muted-foreground text-sm">Łącznie</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {Number(profile?.total_earnings || 0).toFixed(2)} zł
            </p>
            <p className="text-xs text-muted-foreground">{completedOrders.length} dostaw</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          {/* Pending Orders */}
          <button
            onClick={onViewOrders}
            className="w-full bg-card rounded-xl p-4 shadow-card flex items-center gap-4 hover:shadow-card-hover transition-shadow animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="w-14 h-14 rounded-full bg-warning/10 flex items-center justify-center">
              <Package className="w-7 h-7 text-warning" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">Dostępne zamówienia</p>
              <p className="text-muted-foreground text-sm">
                {pendingOrders.length} {pendingOrders.length === 1 ? 'zamówienie czeka' : 'zamówień czeka'}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-warning text-warning-foreground flex items-center justify-center font-bold">
              {pendingOrders.length}
            </div>
          </button>

          {/* Active Deliveries */}
          {activeOrders.length > 0 && (
            <button
              onClick={onViewOrders}
              className="w-full bg-card rounded-xl p-4 shadow-card flex items-center gap-4 hover:shadow-card-hover transition-shadow animate-slide-up border-2 border-primary"
              style={{ animationDelay: '0.25s' }}
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-7 h-7 text-primary animate-pulse" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-foreground">Aktywna dostawa</p>
                <p className="text-muted-foreground text-sm">Kliknij, aby kontynuować</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                {activeOrders.length}
              </div>
            </button>
          )}

          {/* Delivery History */}
          <button
            onClick={onViewHistory}
            className="w-full bg-card rounded-xl p-4 shadow-card flex items-center gap-4 hover:shadow-card-hover transition-shadow animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-success" />
            </div>
            <div className="flex-1 text-left">
              <p className="font-semibold text-foreground">Historia dostaw</p>
              <p className="text-muted-foreground text-sm">
                {completedOrders.length} {completedOrders.length === 1 ? 'ukończona dostawa' : 'ukończonych dostaw'}
              </p>
            </div>
          </button>
        </div>

        {/* Start Delivering CTA */}
        {pendingOrders.length > 0 && activeOrders.length === 0 && (
          <Button
            onClick={onViewOrders}
            className="w-full mt-6 h-14 text-lg font-semibold gradient-primary animate-bounce-in"
            style={{ animationDelay: '0.4s' }}
          >
            Rozpocznij dostawy 🚗
          </Button>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
