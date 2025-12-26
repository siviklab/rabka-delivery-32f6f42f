import React from 'react';
import { Home, Search, ShoppingBag, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { totalItems } = useCart();

  const navItems = [
    { id: 'home', icon: Home, label: 'Główna' },
    { id: 'search', icon: Search, label: 'Szukaj' },
    { id: 'cart', icon: ShoppingBag, label: 'Koszyk' },
    { id: 'profile', icon: User, label: 'Profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                'flex flex-col items-center justify-center w-16 h-full transition-colors duration-200 relative',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    'w-6 h-6 transition-transform duration-200',
                    isActive && 'scale-110'
                  )} 
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {item.id === 'cart' && totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce-in">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className={cn(
                'text-xs mt-1 font-medium transition-colors duration-200',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 gradient-primary rounded-b-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
