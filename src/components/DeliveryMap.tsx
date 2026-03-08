import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const restaurantIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const customerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface RouteInfo {
  distance: number; // km
  duration: number; // minutes
}

interface DeliveryMapProps {
  restaurantLat: number;
  restaurantLng: number;
  restaurantName: string;
  customerLat: number;
  customerLng: number;
  customerName: string;
  driverLat?: number | null;
  driverLng?: number | null;
  onRouteInfo?: (info: RouteInfo) => void;
}

// Auto-fit bounds component
const FitBounds: React.FC<{ bounds: L.LatLngBoundsExpression }> = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, bounds]);
  return null;
};

const DeliveryMap: React.FC<DeliveryMapProps> = ({
  restaurantLat,
  restaurantLng,
  restaurantName,
  customerLat,
  customerLng,
  customerName,
  driverLat,
  driverLng,
  onRouteInfo,
}) => {
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        // Build waypoints: driver -> restaurant -> customer (or restaurant -> customer)
        const waypoints: [number, number][] = [];
        if (driverLat && driverLng) {
          waypoints.push([driverLng, driverLat]); // OSRM uses lng,lat
        }
        waypoints.push([restaurantLng, restaurantLat]);
        waypoints.push([customerLng, customerLat]);

        const coordsStr = waypoints.map((w) => `${w[0]},${w[1]}`).join(';');
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${coordsStr}?overview=full&geometries=geojson`
        );
        const data = await res.json();

        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coords = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]] as [number, number]);
          setRouteCoords(coords);

          const info: RouteInfo = {
            distance: Math.round((route.distance / 1000) * 10) / 10,
            duration: Math.round(route.duration / 60),
          };
          setRouteInfo(info);
          onRouteInfo?.(info);
        }
      } catch (err) {
        console.error('Route fetch error:', err);
      }
    };

    fetchRoute();
  }, [restaurantLat, restaurantLng, customerLat, customerLng, driverLat, driverLng]);

  const allPoints: [number, number][] = [
    [restaurantLat, restaurantLng],
    [customerLat, customerLng],
  ];
  if (driverLat && driverLng) {
    allPoints.push([driverLat, driverLng]);
  }

  const bounds = L.latLngBounds(allPoints.map((p) => L.latLng(p[0], p[1])));

  return (
    <div className="rounded-xl overflow-hidden border border-border">
      <MapContainer
        center={[restaurantLat, restaurantLng]}
        zoom={13}
        style={{ height: '250px', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds bounds={bounds} />

        {/* Restaurant marker */}
        <Marker position={[restaurantLat, restaurantLng]} icon={restaurantIcon}>
          <Popup>🏪 {restaurantName}</Popup>
        </Marker>

        {/* Customer marker */}
        <Marker position={[customerLat, customerLng]} icon={customerIcon}>
          <Popup>📍 {customerName}</Popup>
        </Marker>

        {/* Driver marker */}
        {driverLat && driverLng && (
          <Marker position={[driverLat, driverLng]} icon={driverIcon}>
            <Popup>🚗 Twoja lokalizacja</Popup>
          </Marker>
        )}

        {/* Route line */}
        {routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: 'hsl(18, 85%, 55%)', weight: 4, opacity: 0.8 }}
          />
        )}
      </MapContainer>

      {/* Route info bar */}
      {routeInfo && (
        <div className="flex items-center justify-between bg-card px-4 py-2 text-sm">
          <span className="text-muted-foreground">
            📏 <span className="font-semibold text-foreground">{routeInfo.distance} km</span>
          </span>
          <span className="text-muted-foreground">
            ⏱️ <span className="font-semibold text-foreground">~{routeInfo.duration} min</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default DeliveryMap;
