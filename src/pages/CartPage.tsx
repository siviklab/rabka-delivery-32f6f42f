import React from 'react';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface CartPageProps {
  onCheckout: () => void;
}

const CartPage: React.FC<CartPageProps> = ({ onCheckout }) => {
  const { items, totalPrice, deliveryFee, updateQuantity, removeItem, clearCart } = useCart();

  const handleCheckout = () => {
    toast.success('Zamówienie zostało złożone! 🎉', {
      description: 'Wkrótce otrzymasz potwierdzenie.',
    });
    clearCart();
    onCheckout();
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 pb-20">
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-6 bg-muted rounded-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Koszyk jest pusty</h2>
          <p className="text-muted-foreground">Dodaj coś pysznego z menu!</p>
        </div>
      </div>
    );
  }

  const subtotal = totalPrice;
  const total = subtotal + deliveryFee;

  return (
    <div className="min-h-screen pb-40">
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b border-border/50 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Twój koszyk</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearCart}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Wyczyść
          </Button>
        </div>
        {items[0] && (
          <p className="text-sm text-muted-foreground mt-1">
            z {items[0].restaurantName}
          </p>
        )}
      </header>

      <main className="px-4 py-4 space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="bg-card rounded-xl p-4 shadow-card animate-slide-up flex items-center gap-4"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">{item.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
              <p className="font-bold text-primary mt-1">{(item.price * item.quantity).toFixed(2)} zł</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="soft"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="font-bold text-foreground w-6 text-center">{item.quantity}</span>
              <Button
                variant="soft"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </main>

      {/* Order Summary - Fixed Bottom */}
      <div className="fixed bottom-20 left-0 right-0 bg-card border-t border-border px-4 py-4 z-50 animate-slide-up">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Produkty</span>
            <span className="text-foreground">{subtotal.toFixed(2)} zł</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Dostawa</span>
            <span className="text-foreground">{deliveryFee.toFixed(2)} zł</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
            <span>Razem</span>
            <span className="text-primary">{total.toFixed(2)} zł</span>
          </div>
        </div>

        <Button onClick={handleCheckout} className="w-full h-14 text-base rounded-2xl">
          Zamów teraz
        </Button>
      </div>
    </div>
  );
};

export default CartPage;
