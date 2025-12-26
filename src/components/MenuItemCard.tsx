import React from 'react';
import { Plus, Flame } from 'lucide-react';
import { MenuItem, Restaurant } from '@/data/restaurants';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface MenuItemCardProps {
  item: MenuItem;
  restaurant: Restaurant;
  index?: number;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, restaurant, index = 0 }) => {
  const { addItem, restaurantId } = useCart();

  const handleAddToCart = () => {
    if (restaurantId && restaurantId !== restaurant.id) {
      toast.warning('Dodanie produktu z innej restauracji wyczyści koszyk', {
        action: {
          label: 'Kontynuuj',
          onClick: () => {
            addItem(item, restaurant);
            toast.success(`${item.name} dodano do koszyka`);
          },
        },
      });
      return;
    }
    addItem(item, restaurant);
    toast.success(`${item.name} dodano do koszyka`);
  };

  return (
    <div
      className={cn(
        'bg-card rounded-xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up flex gap-4'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <h4 className="font-bold text-foreground">{item.name}</h4>
          {item.popular && (
            <span className="flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              <Flame className="w-3 h-3" />
              Hit
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
          {item.description}
        </p>
        <p className="font-bold text-primary mt-2">{item.price.toFixed(2)} zł</p>
      </div>
      
      <Button
        variant="soft"
        size="icon"
        onClick={handleAddToCart}
        className="shrink-0 self-center rounded-full h-10 w-10"
      >
        <Plus className="w-5 h-5" />
      </Button>
    </div>
  );
};

export default MenuItemCard;
