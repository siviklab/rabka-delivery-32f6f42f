import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useGenerateApiKey, useUpdateRestaurantWebhook } from '@/hooks/useAdminData';
import { useToast } from '@/hooks/use-toast';
import { Key, Copy, RefreshCw, Globe, Shield, Eye, EyeOff } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  api_key: string | null;
  webhook_url: string | null;
  webhook_secret: string | null;
}

interface RestaurantApiDialogProps {
  restaurant: Restaurant | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RestaurantApiDialog: React.FC<RestaurantApiDialogProps> = ({ restaurant, open, onOpenChange }) => {
  const { toast } = useToast();
  const generateKey = useGenerateApiKey();
  const updateWebhook = useUpdateRestaurantWebhook();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);

  React.useEffect(() => {
    if (restaurant) {
      setWebhookUrl(restaurant.webhook_url ?? '');
      setGeneratedKey(null);
      setGeneratedSecret(null);
      setShowKey(false);
      setShowSecret(false);
    }
  }, [restaurant]);

  if (!restaurant) return null;

  const hasApiKey = !!restaurant.api_key || !!generatedKey;
  const displayKey = generatedKey ?? restaurant.api_key;
  const displaySecret = generatedSecret ?? restaurant.webhook_secret;

  const handleGenerate = async () => {
    try {
      const result = await generateKey.mutateAsync(restaurant.id);
      setGeneratedKey(result.api_key);
      setGeneratedSecret(result.webhook_secret);
      setShowKey(true);
      setShowSecret(true);
      toast({ title: 'API key generated', description: 'Make sure to copy the key now — it won\'t be shown in full again.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to generate API key', variant: 'destructive' });
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied to clipboard` });
  };

  const handleSaveWebhook = async () => {
    try {
      await updateWebhook.mutateAsync({ id: restaurant.id, webhook_url: webhookUrl });
      toast({ title: 'Webhook URL saved' });
    } catch {
      toast({ title: 'Error', description: 'Failed to save webhook URL', variant: 'destructive' });
    }
  };

  const maskValue = (val: string) => val.slice(0, 8) + '••••••••••••••••';
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const baseUrl = `https://${projectId}.supabase.co/functions/v1`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            API Integration — {restaurant.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* API Key Section */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" /> API Key
            </Label>
            {hasApiKey ? (
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded text-xs font-mono break-all">
                  {showKey ? displayKey : maskValue(displayKey!)}
                </code>
                <Button variant="ghost" size="icon" onClick={() => setShowKey(!showKey)}>
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(displayKey!, 'API Key')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No API key generated yet.</p>
            )}
            <Button
              variant={hasApiKey ? 'outline' : 'default'}
              size="sm"
              onClick={handleGenerate}
              disabled={generateKey.isPending}
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${generateKey.isPending ? 'animate-spin' : ''}`} />
              {hasApiKey ? 'Regenerate Key' : 'Generate API Key'}
            </Button>
            {hasApiKey && (
              <p className="text-xs text-muted-foreground">⚠️ Regenerating will invalidate the existing key.</p>
            )}
          </div>

          {/* Webhook Secret */}
          {displaySecret && (
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5" /> Webhook Secret
              </Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-muted px-3 py-2 rounded text-xs font-mono break-all">
                  {showSecret ? displaySecret : maskValue(displaySecret)}
                </code>
                <Button variant="ghost" size="icon" onClick={() => setShowSecret(!showSecret)}>
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(displaySecret, 'Webhook Secret')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Webhook URL */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" /> Webhook URL
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://restaurant.com/webhooks/delivery"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <Button size="sm" onClick={handleSaveWebhook} disabled={updateWebhook.isPending}>
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Status change notifications will be sent to this URL via POST.
            </p>
          </div>

          {/* Endpoints Reference */}
          <div className="space-y-2">
            <Label>API Endpoints</Label>
            <div className="bg-muted rounded-lg p-3 space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span><Badge variant="secondary" className="text-[10px] mr-1.5">POST</Badge>{baseUrl}/create-order</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(`${baseUrl}/create-order`, 'URL')}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span><Badge variant="secondary" className="text-[10px] mr-1.5">GET</Badge>{baseUrl}/order-status</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(`${baseUrl}/order-status`, 'URL')}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span><Badge variant="secondary" className="text-[10px] mr-1.5">POST</Badge>{baseUrl}/cancel-order</span>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(`${baseUrl}/cancel-order`, 'URL')}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RestaurantApiDialog;
