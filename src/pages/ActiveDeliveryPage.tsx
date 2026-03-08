import React, { useState, useEffect } from 'react';
import { DeliveryOrder, useDeliveryOrders } from '@/hooks/useDeliveryOrders';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import DeliveryMap from '@/components/DeliveryMap';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Navigation, 
  Package, 
  CheckCircle,
  Store
} from 'lucide-react';

interface ActiveDeliveryPageProps {
  order: DeliveryOrder;
  onBack: () => void;
  onComplete: () => void;
}

const ActiveDeliveryPage: React.FC<ActiveDeliveryPageProps> = ({ order, onBack, onComplete }) => {
  const { updateOrderStatus } = useDeliveryOrders();
  const { updateProfile, profile } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);

  // Update driver location periodically (only if geolocation is available and succeeds)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    let geoAvailable = false;

    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            geoAvailable = true;
            await updateProfile({
              current_lat: position.coords.latitude,
              current_lng: position.coords.longitude,
            });
          },
          () => {
            // Geolocation failed — use existing DB coordinates, don't overwrite
          }
        );
      }
    };

    updateLocation();
    interval = setInterval(updateLocation, 30000);
    return () => { if (interval) clearInterval(interval); };
  }, []);

  const handleStatusUpdate = async (newStatus: DeliveryOrder['status']) => {
    setUpdating(true);
    const { error } = await updateOrderStatus(order.id, newStatus);
    setUpdating(false);

    if (!error && newStatus === 'delivered') {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('total_earnings')
        .eq('user_id', order.driver_id!)
        .maybeSingle();

      if (currentProfile) {
        await supabase
          .from('profiles')
          .update({
            total_earnings: Number(currentProfile.total_earnings) + Number(order.delivery_fee),
          })
          .eq('user_id', order.driver_id!);
      }

      onComplete();
    }
  };

  const openNavigation = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const getStepStatus = (step: 'accepted' | 'picked_up' | 'delivered') => {
    const statusOrder = ['accepted', 'picked_up', 'in_transit', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);
    const stepIndex = statusOrder.indexOf(step);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const StepIndicator = ({ step, label, icon: Icon }: { step: 'accepted' | 'picked_up' | 'delivered'; label: string; icon: React.ElementType }) => {
    const status = getStepStatus(step);
    
    return (
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            status === 'completed'
              ? 'bg-success text-success-foreground'
              : status === 'current'
              ? 'bg-primary text-primary-foreground animate-pulse'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {status === 'completed' ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
        </div>
        <span
          className={`font-medium ${
            status === 'pending' ? 'text-muted-foreground' : 'text-foreground'
          }`}
        >
          {label}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background z-10 border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Aktywna dostawa</h1>
            <p className="text-sm text-muted-foreground">{order.restaurant?.name}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">{Number(order.delivery_fee).toFixed(2)} zł</p>
            {routeInfo && (
              <p className="text-xs text-muted-foreground">~{routeInfo.duration} min • {routeInfo.distance} km</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Map */}
        {order.restaurant && (
          <DeliveryMap
            restaurantLat={order.restaurant.lat}
            restaurantLng={order.restaurant.lng}
            restaurantName={order.restaurant.name}
            customerLat={order.customer_lat}
            customerLng={order.customer_lng}
            customerName={order.customer_name}
            driverLat={profile?.current_lat}
            driverLng={profile?.current_lng}
            onRouteInfo={setRouteInfo}
          />
        )}

        {/* Progress Steps */}
        <div className="bg-card rounded-xl p-4 shadow-card">
          <h2 className="font-semibold text-foreground mb-4">Status dostawy</h2>
          <div className="space-y-4">
            <StepIndicator step="accepted" label="Zamówienie przyjęte" icon={Package} />
            <div className="ml-5 w-0.5 h-4 bg-border" />
            <StepIndicator step="picked_up" label="Odebrane z restauracji" icon={Store} />
            <div className="ml-5 w-0.5 h-4 bg-border" />
            <StepIndicator step="delivered" label="Dostarczone klientowi" icon={CheckCircle} />
          </div>
        </div>

        {/* Restaurant Info */}
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Odbiór z:</p>
              <p className="text-foreground">{order.restaurant?.name}</p>
              <p className="text-sm text-muted-foreground">{order.restaurant?.address}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => openNavigation(order.restaurant!.lat, order.restaurant!.lng)}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Nawiguj
            </Button>
            {order.restaurant?.phone && (
              <a
                href={`tel:${order.restaurant.phone}`}
                className="w-12 h-10 flex items-center justify-center rounded-lg border border-input"
              >
                <Phone className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-secondary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Dostawa do:</p>
              <p className="text-foreground">{order.customer_name}</p>
              <p className="text-sm text-muted-foreground">{order.customer_address}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => openNavigation(order.customer_lat, order.customer_lng)}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Nawiguj
            </Button>
            <a
              href={`tel:${order.customer_phone}`}
              className="w-12 h-10 flex items-center justify-center rounded-lg border border-input"
            >
              <Phone className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Order Details */}
        {order.order_details && (
          <div className="bg-card rounded-xl p-4 shadow-card">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Szczegóły zamówienia
            </h3>
            <p className="text-muted-foreground">{order.order_details}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {order.status === 'accepted' && (
            <Button
              onClick={() => handleStatusUpdate('picked_up')}
              disabled={updating}
              className="w-full h-14 text-lg font-semibold gradient-primary"
            >
              <Store className="w-5 h-5 mr-2" />
              {updating ? 'Aktualizuję...' : 'Odebrałem zamówienie'}
            </Button>
          )}

          {(order.status === 'picked_up' || order.status === 'in_transit') && (
            <Button
              onClick={() => handleStatusUpdate('delivered')}
              disabled={updating}
              className="w-full h-14 text-lg font-semibold bg-success hover:bg-success/90"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              {updating ? 'Aktualizuję...' : 'Dostarczyłem zamówienie'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActiveDeliveryPage;
