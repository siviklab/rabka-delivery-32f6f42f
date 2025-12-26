import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  CreditCard, 
  LogOut, 
  Save,
  Truck,
  DollarSign
} from 'lucide-react';

interface DriverProfilePageProps {
  onBack: () => void;
}

const DriverProfilePage: React.FC<DriverProfilePageProps> = ({ onBack }) => {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [isAvailable, setIsAvailable] = useState(profile?.is_available ?? true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateProfile({
      full_name: fullName,
      phone: phone,
      is_available: isAvailable,
    });

    if (error) {
      toast({
        title: 'Błąd',
        description: 'Nie udało się zapisać zmian',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Sukces',
        description: 'Profil został zaktualizowany',
      });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-background z-10 border-b border-border">
        <div className="flex items-center gap-4 p-4">
          <button onClick={onBack} className="w-10 h-10 flex items-center justify-center">
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Profil kierowcy</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Avatar & Status */}
        <div className="bg-card rounded-xl p-6 shadow-card text-center">
          <div className="w-24 h-24 rounded-full gradient-primary mx-auto flex items-center justify-center mb-4">
            <Truck className="w-12 h-12 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-bold text-foreground">{profile?.full_name}</h2>
          <p className="text-muted-foreground">{user?.email}</p>
          
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10">
            <DollarSign className="w-4 h-4 text-success" />
            <span className="font-semibold text-success">
              {Number(profile?.total_earnings || 0).toFixed(2)} zł
            </span>
            <span className="text-sm text-muted-foreground">zarobione</span>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isAvailable ? 'bg-success/10' : 'bg-muted'
              }`}>
                <Truck className={`w-5 h-5 ${isAvailable ? 'text-success' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="font-medium text-foreground">Dostępny do dostaw</p>
                <p className="text-sm text-muted-foreground">
                  {isAvailable ? 'Przyjmujesz zamówienia' : 'Nie przyjmujesz zamówień'}
                </p>
              </div>
            </div>
            <Switch
              checked={isAvailable}
              onCheckedChange={setIsAvailable}
            />
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-card rounded-xl p-4 shadow-card space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Imię i nazwisko</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Numer telefonu</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full gradient-primary"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Zapisuję...' : 'Zapisz zmiany'}
          </Button>
        </div>

        {/* Stripe Connect */}
        <div className="bg-card rounded-xl p-4 shadow-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">Wypłaty</p>
              <p className="text-sm text-muted-foreground">
                {profile?.stripe_account_id 
                  ? 'Konto połączone' 
                  : 'Połącz konto bankowe'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              toast({
                title: 'Wkrótce',
                description: 'Funkcja wypłat będzie dostępna wkrótce',
              });
            }}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {profile?.stripe_account_id ? 'Zarządzaj kontem' : 'Połącz konto'}
          </Button>
        </div>

        {/* Sign Out */}
        <Button
          variant="outline"
          className="w-full text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Wyloguj się
        </Button>
      </div>
    </div>
  );
};

export default DriverProfilePage;
