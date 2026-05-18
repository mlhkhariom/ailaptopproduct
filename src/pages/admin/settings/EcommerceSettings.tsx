import { useState, useEffect } from "react";
import { Save, ShoppingCart, Truck, CreditCard, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";

export default function EcommerceSettings() {
  const [s, setS] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('ailaptopwala_token');

  useEffect(() => { fetch('/api/app-settings', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setS(d || {})).catch(() => {}); }, []);
  const save = async () => { setSaving(true); await fetch('/api/app-settings', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(s) }); toast.success('Saved!'); setSaving(false); };
  const v = (key: string) => s[key] || '';
  const set = (key: string, val: string) => setS(p => ({ ...p, [key]: val }));

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-black flex items-center gap-2"><ShoppingCart className="h-6 w-6" /> Ecommerce Settings</h1><p className="text-sm text-muted-foreground">Shipping, payments, orders, returns</p></div>
          <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save'}</Button>
        </div>
        <div className="space-y-6">
          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Truck className="h-4 w-4" /> Shipping</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
            <div><Label>Free shipping above (Rs)</Label><Input className="mt-1" type="number" value={v('shipping_free_above')} onChange={e => set('shipping_free_above', e.target.value)} placeholder="499" /></div>
            <div><Label>Standard rate (Rs)</Label><Input className="mt-1" type="number" value={v('shipping_flat_rate')} onChange={e => set('shipping_flat_rate', e.target.value)} placeholder="50" /></div>
            <div><Label>Express rate (Rs)</Label><Input className="mt-1" type="number" value={v('shipping_express')} onChange={e => set('shipping_express', e.target.value)} placeholder="150" /></div>
            <div><Label>COD extra charge (Rs)</Label><Input className="mt-1" type="number" value={v('shipping_cod_charge')} onChange={e => set('shipping_cod_charge', e.target.value)} placeholder="30" /></div>
            <div><Label>Local pincode prefix</Label><Input className="mt-1" value={v('shipping_local_pincode')} onChange={e => set('shipping_local_pincode', e.target.value)} placeholder="452" /></div>
            <div><Label>Local delivery rate (Rs)</Label><Input className="mt-1" type="number" value={v('shipping_local_rate')} onChange={e => set('shipping_local_rate', e.target.value)} placeholder="0" /></div>
            <div><Label>Local delivery days</Label><Input className="mt-1" value={v('shipping_days_local')} onChange={e => set('shipping_days_local', e.target.value)} placeholder="1-2" /></div>
            <div><Label>National delivery days</Label><Input className="mt-1" value={v('shipping_days_national')} onChange={e => set('shipping_days_national', e.target.value)} placeholder="3-5" /></div>
            <div><Label>Courier partner</Label><Input className="mt-1" value={v('shipping_courier')} onChange={e => set('shipping_courier', e.target.value)} placeholder="DTDC / Delhivery" /></div>
            <div><Label>Max COD amount (Rs)</Label><Input className="mt-1" type="number" value={v('max_cod_amount')} onChange={e => set('max_cod_amount', e.target.value)} placeholder="50000" /></div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4" /> Payments</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
            <div><Label>Razorpay Key ID</Label><Input className="mt-1" type="password" value={v('razorpay_key_id')} onChange={e => set('razorpay_key_id', e.target.value)} /></div>
            <div><Label>Razorpay Secret</Label><Input className="mt-1" type="password" value={v('razorpay_key_secret')} onChange={e => set('razorpay_key_secret', e.target.value)} /></div>
            <div><Label>PhonePe Merchant ID</Label><Input className="mt-1" value={v('phonepe_merchant_id')} onChange={e => set('phonepe_merchant_id', e.target.value)} /></div>
            <div><Label>PhonePe Salt Key</Label><Input className="mt-1" type="password" value={v('phonepe_salt_key')} onChange={e => set('phonepe_salt_key', e.target.value)} /></div>
            <div><Label>Cashfree App ID</Label><Input className="mt-1" value={v('cashfree_app_id')} onChange={e => set('cashfree_app_id', e.target.value)} /></div>
            <div><Label>Cashfree Secret</Label><Input className="mt-1" type="password" value={v('cashfree_secret')} onChange={e => set('cashfree_secret', e.target.value)} /></div>
            <div><Label>Paytm MID</Label><Input className="mt-1" value={v('paytm_mid')} onChange={e => set('paytm_mid', e.target.value)} /></div>
            <div><Label>Merchant UPI ID</Label><Input className="mt-1" value={v('merchant_upi')} onChange={e => set('merchant_upi', e.target.value)} placeholder="shop@ybl" /></div>
            <div><Label>Default gateway</Label><Input className="mt-1" value={v('default_invoice_gateway')} onChange={e => set('default_invoice_gateway', e.target.value)} placeholder="razorpay" /></div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><RotateCcw className="h-4 w-4" /> Orders & Returns</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
            <div><Label>Return window (days)</Label><Input className="mt-1" type="number" value={v('return_window_days')} onChange={e => set('return_window_days', e.target.value)} placeholder="7" /></div>
            <div><Label>Auto-cancel unpaid after (hours)</Label><Input className="mt-1" type="number" value={v('auto_cancel_hours')} onChange={e => set('auto_cancel_hours', e.target.value)} placeholder="24" /></div>
            <div><Label>Min order amount (Rs)</Label><Input className="mt-1" type="number" value={v('min_order_amount')} onChange={e => set('min_order_amount', e.target.value)} placeholder="0" /></div>
            <div><Label>Wallet enabled</Label><Input className="mt-1" value={v('wallet_enabled')} onChange={e => set('wallet_enabled', e.target.value)} placeholder="yes" /></div>
            <div><Label>Referral reward (Rs)</Label><Input className="mt-1" type="number" value={v('referral_reward')} onChange={e => set('referral_reward', e.target.value)} placeholder="500" /></div>
            <div><Label>New user reward (Rs)</Label><Input className="mt-1" type="number" value={v('referral_new_user_reward')} onChange={e => set('referral_new_user_reward', e.target.value)} placeholder="250" /></div>
          </CardContent></Card>

          <Button onClick={save} disabled={saving} className="w-full gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All Ecommerce Settings'}</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
