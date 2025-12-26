import React from 'react';
import { Home, Package, History, User } from 'lucide-react';

interface DriverBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DriverBottomNav: React.FC<DriverBottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Start' },
    { id: 'orders', icon: Package, label: 'Zamówienia' },
    { id: 'history', icon: History, label: 'Historia' },
    { id: 'profile', icon: User, label: 'Profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-area-bottom z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <tab.icon
                className={`w-6 h-6 mb-1 transition-transform ${
                  isActive ? 'scale-110' : ''
                }`}
              />
              <span className={`text-xs font-medium ${isActive ? 'text-primary' : ''}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default DriverBottomNav;
