import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAdminRole } from '@/hooks/useAdminRole';
import {
  useAdminDeliveries,
  useAdminDrivers,
  useAdminRestaurants,
  useUpdateDeliveryStatus,
  useToggleDriverAvailability,
  useAddRestaurant,
} from '@/hooks/useAdminData';
import RestaurantApiDialog from '@/components/admin/RestaurantApiDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Truck, Users, Store, Package, MapPin, Phone, Clock,
  Shield, LogOut, Plus, RefreshCw, ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';

const AdminLoginForm: React.FC = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Shield className="h-12 w-12 mx-auto text-primary mb-2" />
          <CardTitle>Admin Panel Login</CardTitle>
          <CardDescription>Sign in with your admin account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input id="admin-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input id="admin-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-warning/20 text-warning border-warning/30',
  accepted: 'bg-blue-100 text-blue-700 border-blue-300',
  picked_up: 'bg-purple-100 text-purple-700 border-purple-300',
  in_transit: 'bg-orange-100 text-orange-700 border-orange-300',
  delivered: 'bg-green-100 text-green-700 border-green-300',
  cancelled: 'bg-destructive/20 text-destructive border-destructive/30',
};

const STATUSES = ['pending', 'accepted', 'picked_up', 'in_transit', 'delivered', 'cancelled'];

const AdminPanelPage: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { isAdmin, loading: roleLoading } = useAdminRole();
  const { toast } = useToast();

  const deliveries = useAdminDeliveries();
  const drivers = useAdminDrivers();
  const restaurants = useAdminRestaurants();
  const updateStatus = useUpdateDeliveryStatus();
  const toggleAvailability = useToggleDriverAvailability();
  const addRestaurant = useAddRestaurant();

  const [newRestaurant, setNewRestaurant] = useState({ name: '', address: '', lat: '', lng: '', phone: '' });
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [apiDialogRestaurant, setApiDialogRestaurant] = useState<any>(null);

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AdminLoginForm />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="h-12 w-12 mx-auto text-destructive mb-2" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Your account does not have admin privileges.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ id: orderId, status: newStatus });
      toast({ title: 'Status updated', description: `Order status changed to ${newStatus}` });
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleToggleAvailability = async (userId: string, current: boolean) => {
    try {
      await toggleAvailability.mutateAsync({ userId, isAvailable: !current });
      toast({ title: 'Driver updated' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update driver', variant: 'destructive' });
    }
  };

  const handleAddRestaurant = async () => {
    const lat = parseFloat(newRestaurant.lat);
    const lng = parseFloat(newRestaurant.lng);
    if (!newRestaurant.name || !newRestaurant.address || isNaN(lat) || isNaN(lng)) {
      toast({ title: 'Validation error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    try {
      await addRestaurant.mutateAsync({
        name: newRestaurant.name,
        address: newRestaurant.address,
        lat,
        lng,
        phone: newRestaurant.phone || undefined,
      });
      toast({ title: 'Restaurant added' });
      setNewRestaurant({ name: '', address: '', lat: '', lng: '', phone: '' });
      setAddDialogOpen(false);
    } catch {
      toast({ title: 'Error', description: 'Failed to add restaurant', variant: 'destructive' });
    }
  };

  const refreshAll = () => {
    deliveries.refetch();
    drivers.refetch();
    restaurants.refetch();
  };

  const activeDeliveries = deliveries.data?.filter(d => !['delivered', 'cancelled'].includes(d.status ?? '')) ?? [];
  const availableDrivers = drivers.data?.filter(d => d.is_available) ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={refreshAll}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{deliveries.data?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Truck className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeDeliveries.length}</p>
                <p className="text-xs text-muted-foreground">Active Deliveries</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{availableDrivers.length}</p>
                <p className="text-xs text-muted-foreground">Available Drivers</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Store className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{restaurants.data?.length ?? 0}</p>
                <p className="text-xs text-muted-foreground">Restaurants</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="deliveries" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="deliveries" className="flex items-center gap-1.5">
              <Truck className="h-4 w-4" /> Deliveries
            </TabsTrigger>
            <TabsTrigger value="drivers" className="flex items-center gap-1.5">
              <Users className="h-4 w-4" /> Drivers
            </TabsTrigger>
            <TabsTrigger value="restaurants" className="flex items-center gap-1.5">
              <Store className="h-4 w-4" /> Restaurants
            </TabsTrigger>
          </TabsList>

          {/* Deliveries Tab */}
          <TabsContent value="deliveries">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" /> All Deliveries
                </CardTitle>
              </CardHeader>
              <CardContent>
                {deliveries.isLoading ? (
                  <p className="text-muted-foreground text-center py-8">Loading...</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Restaurant</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Fee</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deliveries.data?.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}…</TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">{order.customer_name}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" /> {order.customer_address}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Phone className="h-3 w-3" /> {order.customer_phone}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{(order as any).restaurants?.name ?? '—'}</TableCell>
                            <TableCell>
                              <Badge className={`text-xs ${STATUS_COLORS[order.status ?? 'pending']}`}>
                                {order.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-xs space-y-0.5">
                                {(order as any).order_items?.map((item: any) => (
                                  <p key={item.id}>{item.quantity}× {item.item_name}</p>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell className="font-semibold">{order.delivery_fee} zł</TableCell>
                            <TableCell className="text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {order.created_at ? format(new Date(order.created_at), 'dd/MM HH:mm') : '—'}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={order.status ?? 'pending'}
                                onValueChange={(val) => handleStatusChange(order.id, val)}
                              >
                                <SelectTrigger className="w-[130px] h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {STATUSES.map(s => (
                                    <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(deliveries.data?.length ?? 0) === 0 && (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                              No delivery orders found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Drivers Tab */}
          <TabsContent value="drivers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> All Drivers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {drivers.isLoading ? (
                  <p className="text-muted-foreground text-center py-8">Loading...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Driver</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Earnings</TableHead>
                        <TableHead>Available</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {drivers.data?.map((driver) => (
                        <TableRow key={driver.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                {driver.full_name?.charAt(0) ?? '?'}
                              </div>
                              <span className="font-medium text-sm">{driver.full_name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{driver.phone ?? '—'}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {driver.current_lat && driver.current_lng
                              ? `${driver.current_lat.toFixed(4)}, ${driver.current_lng.toFixed(4)}`
                              : 'Unknown'}
                          </TableCell>
                          <TableCell className="font-semibold">{driver.total_earnings ?? 0} zł</TableCell>
                          <TableCell>
                            <Switch
                              checked={driver.is_available ?? false}
                              onCheckedChange={() => handleToggleAvailability(driver.user_id, driver.is_available ?? false)}
                            />
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {driver.created_at ? format(new Date(driver.created_at), 'dd/MM/yyyy') : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                      {(drivers.data?.length ?? 0) === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No drivers found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Restaurants Tab */}
          <TabsContent value="restaurants">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" /> Restaurants
                </CardTitle>
                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-1" /> Add Restaurant
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Restaurant</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <Input
                        placeholder="Restaurant name"
                        value={newRestaurant.name}
                        onChange={(e) => setNewRestaurant(p => ({ ...p, name: e.target.value }))}
                      />
                      <Input
                        placeholder="Address"
                        value={newRestaurant.address}
                        onChange={(e) => setNewRestaurant(p => ({ ...p, address: e.target.value }))}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Latitude"
                          type="number"
                          step="any"
                          value={newRestaurant.lat}
                          onChange={(e) => setNewRestaurant(p => ({ ...p, lat: e.target.value }))}
                        />
                        <Input
                          placeholder="Longitude"
                          type="number"
                          step="any"
                          value={newRestaurant.lng}
                          onChange={(e) => setNewRestaurant(p => ({ ...p, lng: e.target.value }))}
                        />
                      </div>
                      <Input
                        placeholder="Phone (optional)"
                        value={newRestaurant.phone}
                        onChange={(e) => setNewRestaurant(p => ({ ...p, phone: e.target.value }))}
                      />
                      <Button className="w-full" onClick={handleAddRestaurant} disabled={addRestaurant.isPending}>
                        {addRestaurant.isPending ? 'Adding...' : 'Add Restaurant'}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {restaurants.isLoading ? (
                  <p className="text-muted-foreground text-center py-8">Loading...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>API Key</TableHead>
                        <TableHead>Staff</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {restaurants.data?.map((restaurant) => (
                        <TableRow key={restaurant.id}>
                          <TableCell className="font-medium">{restaurant.name}</TableCell>
                          <TableCell className="text-sm">{restaurant.address}</TableCell>
                          <TableCell className="text-sm">{restaurant.phone ?? '—'}</TableCell>
                          <TableCell>
                            {restaurant.api_key ? (
                              <Badge variant="default" className="text-xs">Active</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">None</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {(restaurant as any).restaurant_users?.length ?? 0} users
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => setApiDialogRestaurant(restaurant)}>
                              <Key className="h-3.5 w-3.5 mr-1" /> Manage API
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                        {(restaurants.data?.length ?? 0) === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No restaurants found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <RestaurantApiDialog
          restaurant={apiDialogRestaurant}
          open={!!apiDialogRestaurant}
          onOpenChange={(open) => { if (!open) setApiDialogRestaurant(null); }}
        />
      </main>
    </div>
  );
};

export default AdminPanelPage;
