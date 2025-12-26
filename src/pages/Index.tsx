import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import DriverBottomNav from '@/components/DriverBottomNav';
import AuthPage from '@/pages/AuthPage';
import DashboardPage from '@/pages/DashboardPage';
import OrdersPage from '@/pages/OrdersPage';
import ActiveDeliveryPage from '@/pages/ActiveDeliveryPage';
import HistoryPage from '@/pages/HistoryPage';
import DriverProfilePage from '@/pages/DriverProfilePage';
import { DeliveryOrder } from '@/hooks/useDeliveryOrders';

type View = 'dashboard' | 'orders' | 'active-delivery' | 'history' | 'profile';

const DriverApp: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Ładowanie...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'dashboard') setCurrentView('dashboard');
    else if (tab === 'orders') setCurrentView('orders');
    else if (tab === 'history') setCurrentView('history');
    else if (tab === 'profile') setCurrentView('profile');
  };

  const handleSelectOrder = (order: DeliveryOrder) => {
    setSelectedOrder(order);
    setCurrentView('active-delivery');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardPage
            onViewOrders={() => { setCurrentView('orders'); setActiveTab('orders'); }}
            onViewHistory={() => { setCurrentView('history'); setActiveTab('history'); }}
          />
        );
      case 'orders':
        return (
          <OrdersPage
            onBack={() => { setCurrentView('dashboard'); setActiveTab('dashboard'); }}
            onSelectOrder={handleSelectOrder}
          />
        );
      case 'active-delivery':
        return selectedOrder ? (
          <ActiveDeliveryPage
            order={selectedOrder}
            onBack={() => { setCurrentView('orders'); setActiveTab('orders'); }}
            onComplete={() => { setCurrentView('dashboard'); setActiveTab('dashboard'); setSelectedOrder(null); }}
          />
        ) : null;
      case 'history':
        return <HistoryPage onBack={() => { setCurrentView('dashboard'); setActiveTab('dashboard'); }} />;
      case 'profile':
        return <DriverProfilePage onBack={() => { setCurrentView('dashboard'); setActiveTab('dashboard'); }} />;
      default:
        return <DashboardPage onViewOrders={() => setCurrentView('orders')} onViewHistory={() => setCurrentView('history')} />;
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-background min-h-screen relative">
      {renderContent()}
      {currentView !== 'active-delivery' && (
        <DriverBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  );
};

const Index: React.FC = () => {
  return (
    <AuthProvider>
      <DriverApp />
    </AuthProvider>
  );
};

export default Index;
