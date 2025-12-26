import React from 'react';
import { MapPin, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 safe-area-top border-b border-border/50">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
            <span className="text-xl">🍽️</span>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Dostarczymy do</p>
            <button className="flex items-center gap-1 font-semibold text-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Rabka-Zdrój</span>
            </button>
          </div>
        </div>
        
        <Button variant="icon" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
