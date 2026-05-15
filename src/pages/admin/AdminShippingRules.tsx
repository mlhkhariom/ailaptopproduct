import { useState, useEffect } from "react";
import { Truck, Save } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AdminShippingRules() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('ailaptopwala_token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetch('/api/settings/shipping_free_above,shipping_flat_rate,shipping_express,shipping_cod_charge,shipping_local_rate,shipping_local_pincode,shipping_courier,shipping_days_local,shipping_days_national', { headers })
      .then(r => r.json()).then(d => { if (typeof d === 'object') setSettings(d); }).catch(() => {});
    // Fallback: load from payment/shipping
    fetch('/api/payment/shipping?subtotal=0').then(r => r.json()).then(d => {
      setSettings(s => ({
        shipping_free_above: String(d.free_above || 499),
        shipping_flat_rate: String(d.standard || 50),
        shipping_express: String(d.express || 150),
        shipping_cod_charge: String(d.cod_charge || 30),
        shipping_local_rate: String(d.local_rate || 0),
        shipping_local_pincode: d.local_prefix || '452',
        shipping_courier: d.courier || 'dtdc',
        shipping_days_local: d.days_local || '1-2',
        shipping_days_national: d.days_national || '3-5',
        ...s,
      }));
    }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      for (const [key, value] of Object.entries(settings)) {
        await fetch('/api/app-settings', { method: 'POST', headers, body: JSON.stringify({ key, value }) });
      }
      toast.success('Shipping rules saved!');
    } catch { toast.error('Failed'); }
    setSaving(false);
  };

  const update = (key: string, value: string) => setSettings(s => ({ ...s, [key]: value }));

  return (
    <AdminLayout>
      <div className="p-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><Truck className="h-6 w-6" /> Shipping Rules</h1>
            <p className="text-sm text-muted-foreground">Configure delivery charges and zones</p>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Rules'}</Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Free Shipping</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><Label>Free shipping above (₹)</Label><Input className="mt-1" type="number" value={settings.shipping_free_above || ''} onChange={e => update('shipping_free_above', e.target.value)} placeholder="499" /></div>
              <p className="text-xs text-muted-foreground">Orders above this amount get free shipping</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Delivery Charges</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div><Label>Standard Rate (₹)</Label><Input className="mt-1" type="number" value={settings.shipping_flat_rate || ''} onChange={e => update('shipping_flat_rate', e.target.value)} placeholder="50" /></div>
              <div><Label>Express Rate (₹)</Label><Input className="mt-1" type="number" value={settings.shipping_express || ''} onChange={e => update('shipping_express', e.target.value)} placeholder="150" /></div>
              <div><Label>COD Extra Charge (₹)</Label><Input className="mt-1" type="number" value={settings.shipping_cod_charge || ''} onChange={e => update('shipping_cod_charge', e.target.value)} placeholder="30" /></div>
              <div><Label>Local Delivery Rate (₹)</Label><Input className="mt-1" type="number" value={settings.shipping_local_rate || ''} onChange={e => update('shipping_local_rate', e.target.value)} placeholder="0 (free)" /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Local Zone (Indore)</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div><Label>Local Pincode Prefix</Label><Input className="mt-1" value={settings.shipping_local_pincode || ''} onChange={e => update('shipping_local_pincode', e.target.value)} placeholder="452" /><p className="text-[10px] text-muted-foreground mt-1">Pincodes starting with this = local delivery</p></div>
              <div><Label>Local Delivery Days</Label><Input className="mt-1" value={settings.shipping_days_local || ''} onChange={e => update('shipping_days_local', e.target.value)} placeholder="1-2" /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">National Shipping</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div><Label>Courier Partner</Label><Input className="mt-1" value={settings.shipping_courier || ''} onChange={e => update('shipping_courier', e.target.value)} placeholder="DTDC / Delhivery / BlueDart" /></div>
              <div><Label>National Delivery Days</Label><Input className="mt-1" value={settings.shipping_days_national || ''} onChange={e => update('shipping_days_national', e.target.value)} placeholder="3-5" /></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
