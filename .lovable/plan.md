

# Rabka Eat - Full Delivery Platform Architecture & Implementation Plan

## Current State

The app currently has:
- **Driver app** (Rabka Dostawa): Auth, dashboard, order list, active delivery view, history, profile
- **Database**: `restaurants`, `delivery_orders`, `profiles`, `payouts` tables with RLS
- **Realtime**: enabled on `delivery_orders`
- **Static restaurant data** in `src/data/restaurants.ts` (not connected to DB restaurants)

## Architecture Overview

```text
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│  Restaurant Panel   │     │    Lovable Cloud DB   │     │  Driver App (Mobile)│
│  (per restaurant)   │────▶│                       │◀────│  "Rabka Dostawa"    │
│                     │     │  delivery_orders      │     │                     │
│  - View orders      │     │  restaurants          │     │  - Accept orders    │
│  - Create orders    │     │  order_items           │     │  - Map + navigation │
│  - Update status    │     │  profiles             │     │  - Update status    │
│  - Menu management  │     │  restaurant_users     │     │  - Earnings         │
└─────────────────────┘     └──────────────────────┘     └─────────────────────┘
         │                           │                            │
         │         Realtime (postgres_changes)                    │
         └───────────────────────────┴────────────────────────────┘
```

## Order Workflow

```text
Customer orders on          Restaurant sees         Driver sees in
restaurant website  ──▶     new order in panel ──▶  "Dostępne zamówienia"
                            status: "pending"

Restaurant confirms  ──▶   status: "confirmed"  ──▶  Driver accepts
                                                      status: "accepted"

Driver picks up      ──▶   status: "picked_up"  ──▶  Restaurant sees update

Driver delivers      ──▶   status: "delivered"   ──▶  Restaurant sees completed
```

## Implementation Plan (6 phases)

### Phase 1: Database Schema Updates
Add new tables and modify existing ones:

- **`order_items`** table: `id`, `order_id` (FK delivery_orders), `item_name`, `quantity`, `unit_price`, `notes`
- **`restaurant_users`** table: `id`, `user_id` (auth.users), `restaurant_id` (FK restaurants), `role` (owner/staff) -- links restaurant staff to their restaurant
- Add `confirmed` status to `delivery_status` enum (between pending and accepted)
- Add `webhook_url` column to `restaurants` for external order intake
- Add RLS policies: restaurant users can INSERT orders, view/update their own restaurant's orders
- Enable realtime on `order_items`

### Phase 2: Restaurant Panel (new route `/restaurant`)
A separate authenticated view for restaurant staff:

- **Login/Auth**: Same auth system, but checks `restaurant_users` table to determine role
- **Orders Dashboard**: Live list of orders with status badges, realtime updates
- **Create Order**: Form to create a delivery order (customer name, phone, address with geocoding, items list, delivery fee)
- **Update Status**: Restaurant can mark orders as confirmed/cancelled
- **Simple Menu Management**: CRUD for menu items stored in DB (optional, phase 2+)

### Phase 3: Map Integration in Driver App
Use **Leaflet** (free, no API key needed) with OpenStreetMap tiles:

- **Map View on ActiveDeliveryPage**: Show restaurant location, customer location, and driver's current position
- **Route display**: Use OSRM (free routing API) to draw the delivery route
- **Estimated distance & time**: Calculate from OSRM response, display on order cards
- **Map on OrdersPage**: Small map preview showing restaurant + customer pins for each pending order

### Phase 4: Mobile Optimization (PWA)
Make the app installable on phones:

- Install `vite-plugin-pwa`, configure manifest with app name "Rabka Eat", Polish language, theme colors
- Add proper mobile meta tags, icons, splash screens
- Service worker for offline support (cache shell, network-first for API)
- Add `/install` page with install instructions
- Ensure all views are touch-friendly (already mobile-first with `max-w-lg`)

### Phase 5: External Order Intake (Edge Function)
An edge function that restaurants can call from their websites to create orders:

- **`create-order` edge function**: Accepts order payload (restaurant API key, customer info, items), validates, inserts into `delivery_orders` + `order_items`
- **API key per restaurant**: Add `api_key` column to `restaurants`, used for webhook authentication
- This lets any restaurant website POST orders into the system

### Phase 6: Status Sync & Notifications
- **Realtime subscriptions** on both restaurant panel and driver app (already partially done for driver)
- **Push notifications** via service worker for new orders (driver) and status changes (restaurant)
- **Order timeline**: Show full status history with timestamps on both sides

## Technical Details

**Map library**: Leaflet + react-leaflet (free, no API key)
**Routing API**: OSRM `https://router.project-osrm.org/route/v1/driving/{coords}` (free, public)
**Geocoding**: Nominatim OpenStreetMap API (free) for address-to-coordinates
**PWA**: vite-plugin-pwa with workbox

**New dependencies needed**: `leaflet`, `react-leaflet`, `@types/leaflet`, `vite-plugin-pwa`

## Recommended Build Order

I recommend implementing in this order, one phase at a time:
1. **Phase 3 (Map)** -- Most impactful for the driver app, immediate visual improvement
2. **Phase 1 (DB schema)** -- Foundation for restaurant panel
3. **Phase 2 (Restaurant panel)** -- Enables restaurants to create/manage orders
4. **Phase 4 (PWA)** -- Makes the driver app installable on mobile
5. **Phase 5 (External API)** -- Enables restaurant websites to push orders
6. **Phase 6 (Notifications)** -- Polish and real-time alerts

