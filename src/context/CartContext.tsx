import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MenuItem, Restaurant } from '@/data/restaurants';

export interface CartItem extends MenuItem {
  quantity: number;
  restaurantId: string;
  restaurantName: string;
}

interface CartContextType {
  items: CartItem[];
  restaurantId: string | null;
  addItem: (item: MenuItem, restaurant: Restaurant) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  deliveryFee: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [deliveryFee, setDeliveryFee] = useState(0);

  const addItem = (item: MenuItem, restaurant: Restaurant) => {
    if (restaurantId && restaurantId !== restaurant.id) {
      // Clear cart if adding from different restaurant
      setItems([]);
    }
    
    setRestaurantId(restaurant.id);
    setDeliveryFee(restaurant.deliveryFee);

    setItems((prev) => {
      const existingItem = prev.find((i) => i.id === item.id);
      if (existingItem) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        { ...item, quantity: 1, restaurantId: restaurant.id, restaurantName: restaurant.name },
      ];
    });
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => {
      const newItems = prev.filter((i) => i.id !== itemId);
      if (newItems.length === 0) {
        setRestaurantId(null);
        setDeliveryFee(0);
      }
      return newItems;
    });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
    setDeliveryFee(0);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        restaurantId,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        deliveryFee,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
