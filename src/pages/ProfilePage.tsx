import React from 'react';
import { User, MapPin, CreditCard, Bell, HelpCircle, LogOut, ChevronRight, Heart, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProfilePage: React.FC = () => {
  const menuItems = [
    { icon: MapPin, label: 'Adresy dostawy', badge: '2' },
    { icon: CreditCard, label: 'Metody płatności' },
    { icon: Heart, label: 'Ulubione restauracje', badge: '4' },
    { icon: Clock, label: 'Historia zamówień' },
    { icon: Bell, label: 'Powiadomienia' },
    { icon: HelpCircle, label: 'Pomoc i kontakt' },
  ];

  return (
    <div className="min-h-screen pb-20">
      <header className="gradient-primary px-4 py-8 text-primary-foreground">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Gość</h1>
            <p className="text-primary-foreground/80 text-sm">Zaloguj się, aby zobaczyć więcej</p>
          </div>
        </div>
      </header>

      <main className="px-4 py-6 -mt-4">
        {/* Quick Actions */}
        <div className="bg-card rounded-2xl shadow-card p-4 mb-6 animate-slide-up">
          <div className="grid grid-cols-2 gap-4">
            <Button variant="soft" className="flex-col h-auto py-4 rounded-xl">
              <span className="text-2xl mb-1">📱</span>
              <span className="text-sm">Zaloguj się</span>
            </Button>
            <Button variant="soft" className="flex-col h-auto py-4 rounded-xl">
              <span className="text-2xl mb-1">✨</span>
              <span className="text-sm">Zarejestruj się</span>
            </Button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-card rounded-2xl shadow-card overflow-hidden animate-slide-up" style={{ animationDelay: '100ms' }}>
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className="w-full flex items-center gap-4 px-4 py-4 hover:bg-accent transition-colors duration-200 border-b border-border last:border-b-0"
              >
                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="flex-1 text-left font-medium text-foreground">{item.label}</span>
                {item.badge && (
                  <span className="px-2.5 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <button className="w-full flex items-center justify-center gap-2 mt-6 py-4 text-destructive font-semibold animate-fade-in" style={{ animationDelay: '200ms' }}>
          <LogOut className="w-5 h-5" />
          <span>Wyloguj się</span>
        </button>

        {/* App Info */}
        <div className="text-center mt-8 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <p className="text-muted-foreground text-sm">Rabka Eats v1.0.0</p>
          <p className="text-muted-foreground text-xs mt-1">Made with ❤️ in Rabka-Zdrój</p>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
