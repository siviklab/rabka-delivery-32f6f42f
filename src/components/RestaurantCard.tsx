import React from 'react';
import { Star, Clock, Bike } from 'lucide-react';
import { Restaurant } from '@/data/restaurants';
import { cn } from '@/lib/utils';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
  index?: number;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick, index = 0 }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 animate-slide-up group'
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {restaurant.featured && (
          <div className="absolute top-3 left-3 gradient-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
            Polecane
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-primary-foreground font-bold text-lg drop-shadow-md">
            {restaurant.name}
          </h3>
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-muted-foreground text-sm mb-3 line-clamp-1">
          {restaurant.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-warning fill-warning" />
            <span className="font-semibold">{restaurant.rating}</span>
            <span className="text-muted-foreground">({restaurant.reviewCount})</span>
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
      </div>
    </button>
  );
};

export default RestaurantCard;
