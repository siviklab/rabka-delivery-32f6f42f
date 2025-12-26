import React, { useState } from 'react';
import { CartProvider } from '@/context/CartContext';
import BottomNav from '@/components/BottomNav';
import HomePage from '@/pages/HomePage';
import RestaurantPage from '@/pages/RestaurantPage';
import CartPage from '@/pages/CartPage';
import SearchPage from '@/pages/SearchPage';
import ProfilePage from '@/pages/ProfilePage';

type View = 'home' | 'restaurant' | 'cart' | 'search' | 'profile';

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'home') setCurrentView('home');
    else if (tab === 'search') setCurrentView('search');
    else if (tab === 'cart') setCurrentView('cart');
    else if (tab === 'profile') setCurrentView('profile');
  };

  const handleRestaurantClick = (restaurantId: string) => {
    setSelectedRestaurantId(restaurantId);
    setCurrentView('restaurant');
  };

  const handleBackFromRestaurant = () => {
    setCurrentView('home');
    setActiveTab('home');
  };

  const handleGoToCart = () => {
    setCurrentView('cart');
    setActiveTab('cart');
  };

  const handleCheckout = () => {
    setCurrentView('home');
    setActiveTab('home');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <HomePage onRestaurantClick={handleRestaurantClick} />;
      case 'restaurant':
        return selectedRestaurantId ? (
          <RestaurantPage
            restaurantId={selectedRestaurantId}
            onBack={handleBackFromRestaurant}
            onGoToCart={handleGoToCart}
          />
        ) : null;
      case 'cart':
        return <CartPage onCheckout={handleCheckout} />;
      case 'search':
        return <SearchPage onRestaurantClick={handleRestaurantClick} />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage onRestaurantClick={handleRestaurantClick} />;
    }
  };

  return (
    <CartProvider>
      <div className="max-w-lg mx-auto bg-background min-h-screen relative">
        {renderContent()}
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </CartProvider>
  );
};

export default Index;
