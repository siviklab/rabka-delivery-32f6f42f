import React, { useState } from 'react';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useRestaurantUser } from '@/hooks/useRestaurantUser';
import { useRestaurantOrders } from '@/hooks/useRestaurantOrders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import AuthPage from '@/pages/AuthPage';
import {
  Plus,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Store,
  Truck,
  MapPin,
  Phone,
  ArrowRight,
  LogOut,
  Trash2,
} from 'lucide-react';

const RestaurantDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const { membership, loading: membershipLoading } = useRestaurantUser();
  const { activeOrders, completedOrders, loading, createOrder, updateStatus } = useRestaurantOrders(
    membership?.restaurant_id
  );
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Create order form state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderDetails, setOrderDetails] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('5.00');
  const [items, setItems] = useState<{ item_name: string; quantity: number; unit_price: number }[]>([
    { item_name: '', quantity: 1, unit_price: 0 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  if (!user) return <AuthPage />;

  if (membershipLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Ładowanie...</div>
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center bg-card rounded-2xl p-8 shadow-card max-w-md">
          <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Brak dostępu</h2>
          <p className="text-muted-foreground mb-4">
            Twoje konto nie jest przypisane do żadnej restauracji. Skontaktuj się z administratorem.
          </p>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Wyloguj
          </Button>
        </div>
      </div>
    );
  }

  const handleGeocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const data = await res.json();
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
      return null;
    } catch {
      return null;
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const validItems = items.filter((i) => i.item_name.trim());
    
    // Geocode address
    const coords = await handleGeocodeAddress(customerAddress);
    if (!coords) {
      toast({ title: 'Błąd', description: 'Nie udało się znaleźć adresu. Podaj dokładniejszy adres.', variant: 'destructive' });
      setSubmitting(false);
      return;
    }

    await createOrder({
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      customer_lat: coords.lat,
      customer_lng: coords.lng,
      order_details: orderDetails || validItems.map((i) => `${i.quantity}x ${i.item_name}`).join(', '),
      delivery_fee: parseFloat(deliveryFee),
      items: validItems,
    });

    // Reset form
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setOrderDetails('');
    setDeliveryFee('5.00');
    setItems([{ item_name: '', quantity: 1, unit_price: 0 }]);
    setShowCreateForm(false);
    setSubmitting(false);
  };

  const getStatusInfo = (status: string) => {
    const statuses: Record<string, { label: string; color: string; icon: React.ElementType }> = {
      pending: { label: 'Oczekuje', color: 'bg-warning/10 text-warning', icon: Clock },
      confirmed: { label: 'Potwierdzone', color: 'bg-accent text-accent-foreground', icon: CheckCircle },
      accepted: { label: 'Kierowca w drodze', color: 'bg-primary/10 text-primary', icon: Truck },
      picked_up: { label: 'Odebrane', color: 'bg-secondary/10 text-secondary', icon: Package },
      in_transit: { label: 'W drodze do klienta', color: 'bg-primary/10 text-primary', icon: Truck },
      delivered: { label: 'Dostarczone', color: 'bg-success/10 text-success', icon: CheckCircle },
      cancelled: { label: 'Anulowane', color: 'bg-destructive/10 text-destructive', icon: XCircle },
    };
    return statuses[status] || statuses.pending;
  };

  const formatTime = (dateString: string) =>
    new Date(dateString).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-primary p-6 pt-8 pb-6">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary-foreground">{membership.restaurant?.name}</h1>
            <p className="text-primary-foreground/80 text-sm">Panel restauracji</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl p-3 shadow-card text-center">
            <p className="text-2xl font-bold text-foreground">{activeOrders.length}</p>
            <p className="text-xs text-muted-foreground">Aktywne</p>
          </div>
          <div className="bg-card rounded-xl p-3 shadow-card text-center">
            <p className="text-2xl font-bold text-foreground">{completedOrders.length}</p>
            <p className="text-xs text-muted-foreground">Dostarczone</p>
          </div>
          <div className="bg-card rounded-xl p-3 shadow-card text-center">
            <p className="text-2xl font-bold text-foreground">
              {completedOrders.reduce((s, o) => s + Number(o.delivery_fee), 0).toFixed(0)} zł
            </p>
            <p className="text-xs text-muted-foreground">Dostawy</p>
          </div>
        </div>

        {/* New Order Button */}
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="w-full h-12 gradient-primary text-lg font-semibold"
        >
          <Plus className="w-5 h-5 mr-2" />
          {showCreateForm ? 'Anuluj' : 'Nowe zamówienie'}
        </Button>

        {/* Create Order Form */}
        {showCreateForm && (
          <form onSubmit={handleCreateOrder} className="bg-card rounded-xl p-4 shadow-card space-y-4">
            <h2 className="font-bold text-foreground text-lg">Nowe zamówienie dostawy</h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Imię klienta</Label>
                <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required placeholder="Jan Kowalski" />
              </div>
              <div className="space-y-1">
                <Label>Telefon</Label>
                <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required placeholder="+48 123 456 789" />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Adres dostawy</Label>
              <Input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} required placeholder="ul. Główna 10, Rabka-Zdrój" />
            </div>

            {/* Items */}
            <div className="space-y-2">
              <Label>Pozycje zamówienia</Label>
              {items.map((item, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <Input
                    placeholder="Nazwa"
                    className="flex-1"
                    value={item.item_name}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[i].item_name = e.target.value;
                      setItems(newItems);
                    }}
                  />
                  <Input
                    type="number"
                    className="w-16"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[i].quantity = parseInt(e.target.value) || 1;
                      setItems(newItems);
                    }}
                  />
                  <Input
                    type="number"
                    className="w-20"
                    step="0.01"
                    placeholder="Cena"
                    value={item.unit_price || ''}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[i].unit_price = parseFloat(e.target.value) || 0;
                      setItems(newItems);
                    }}
                  />
                  {items.length > 1 && (
                    <button type="button" onClick={() => setItems(items.filter((_, idx) => idx !== i))}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setItems([...items, { item_name: '', quantity: 1, unit_price: 0 }])}
              >
                <Plus className="w-4 h-4 mr-1" /> Dodaj pozycję
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Opłata za dostawę (zł)</Label>
                <Input type="number" step="0.01" value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Uwagi</Label>
                <Input value={orderDetails} onChange={(e) => setOrderDetails(e.target.value)} placeholder="Dodatkowe uwagi..." />
              </div>
            </div>

            <Button type="submit" className="w-full gradient-primary" disabled={submitting}>
              {submitting ? 'Tworzenie...' : 'Utwórz zamówienie'}
            </Button>
          </form>
        )}

        {/* Active Orders */}
        <div>
          <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Aktywne zamówienia ({activeOrders.length})
          </h2>
          {activeOrders.length === 0 ? (
            <div className="bg-card rounded-xl p-8 text-center shadow-card">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Brak aktywnych zamówień</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <div key={order.id} className="bg-card rounded-xl p-4 shadow-card">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusInfo.label}
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">{formatTime(order.created_at)}</p>
                      </div>
                      <p className="font-bold text-primary">{Number(order.delivery_fee).toFixed(2)} zł</p>
                    </div>
                    <p className="font-semibold text-foreground">{order.customer_name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {order.customer_address}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {order.customer_phone}
                    </p>
                    {order.order_details && (
                      <p className="text-xs text-muted-foreground mt-1">📦 {order.order_details}</p>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-3">
                      {order.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="flex-1 gradient-primary"
                            onClick={() => updateStatus(order.id, 'confirmed')}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Potwierdź
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatus(order.id, 'cancelled')}
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {order.status === 'confirmed' && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Truck className="w-4 h-4" /> Oczekiwanie na kierowcę...
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Orders */}
        {completedOrders.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Dostarczone ({completedOrders.length})
            </h2>
            <div className="space-y-2">
              {completedOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="bg-card rounded-xl p-3 shadow-card flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{formatTime(order.created_at)}</p>
                  </div>
                  <span className="text-sm font-bold text-success">{Number(order.delivery_fee).toFixed(2)} zł</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const RestaurantPage: React.FC = () => (
  <AuthProvider>
    <RestaurantDashboard />
  </AuthProvider>
);

export default RestaurantPage;
