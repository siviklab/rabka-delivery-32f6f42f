import React, { useMemo } from 'react';
import { ArrowLeft, Star, Clock, Bike, MapPin, Heart } from 'lucide-react';
import { restaurants } from '@/data/restaurants';
import { Button } from '@/components/ui/button';
import MenuItemCard from '@/components/MenuItemCard';
import { useCart } from '@/context/CartContext';

interface RestaurantPageProps {
  restaurantId: string;
  onBack: () => void;
  onGoToCart: () => void;
}

const RestaurantPage: React.FC<RestaurantPageProps> = ({ restaurantId, onBack, onGoToCart }) => {
  const restaurant = restaurants.find((r) => r.id === restaurantId);
  const { totalItems, totalPrice } = useCart();

  const menuByCategory = useMemo(() => {
    if (!restaurant) return {};
    return restaurant.menu.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, typeof restaurant.menu>);
  }, [restaurant]);

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Restauracja nie znaleziona</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Hero Image */}
      <div className="relative h-56">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
        
        {/* Back Button */}
        <Button
          variant="icon"
          size="icon"
          onClick={onBack}
          className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* Favorite Button */}
        <Button
          variant="icon"
          size="icon"
          className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm"
        >
          <Heart className="w-5 h-5" />
        </Button>

        {/* Restaurant Name Overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl font-bold text-primary-foreground drop-shadow-lg">
            {restaurant.name}
          </h1>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="bg-card rounded-t-3xl -mt-6 relative z-10 animate-slide-up">
        <div className="px-4 py-6 space-y-4">
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-warning fill-warning" />
              <span className="font-bold">{restaurant.rating}</span>
              <span className="text-muted-foreground">({restaurant.reviewCount} opinii)</span>
            </div>
            
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{restaurant.deliveryTime}</span>
            </div>
            
            <div className="flex items-center gap-1 text-muted-foreground">
              <Bike className="w-4 h-4" />
              <span>{restaurant.deliveryFee} zł</span>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{restaurant.address}</span>
          </div>

          {/* Description */}
          <p className="text-muted-foreground">{restaurant.description}</p>

          {/* Min Order Info */}
          <div className="bg-accent rounded-xl p-3 text-sm">
            <span className="text-muted-foreground">Minimalne zamówienie: </span>
            <span className="font-bold text-foreground">{restaurant.minOrder} zł</span>
          </div>
        </div>

        {/* Menu */}
        <div className="px-4 pb-6">
          {Object.entries(menuByCategory).map(([category, items], categoryIndex) => (
            <div key={category} className="mb-6">
              <h2 className="text-lg font-bold text-foreground mb-3">{category}</h2>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    restaurant={restaurant}
                    index={categoryIndex * 10 + index}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Summary - Fixed Bottom */}
      {totalItems > 0 && (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
          <Button
            onClick={onGoToCart}
            className="w-full h-14 text-base rounded-2xl shadow-lg"
          >
            <span className="flex-1 text-left">
              Koszyk ({totalItems} {totalItems === 1 ? 'produkt' : 'produkty'})
            </span>
            <span className="font-bold">{totalPrice.toFixed(2)} zł</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default RestaurantPage;
