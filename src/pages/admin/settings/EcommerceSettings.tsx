import { useState, useEffect } from "react";
import { Save, ShoppingCart, CreditCard, Truck, Tag, Package, CheckCircle, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";

const GATEWAYS = [
  { id: 'razorpay', name: 'Razorpay', fields: ['razorpay_key_id', 'razorpay_key_secret'] },
  { id: 'phonepe', name: 'PhonePe', fields: ['phonepe_merchant_id', 'phonepe_salt_key', 'phonepe_salt_index'] },
  { id: 'paytm', name: 'Paytm', fields: ['paytm_mid', 'paytm_merchant_key'] },
  { id: 'cod', name: 'Cash on Delivery', fields: [] },
  { id: 'upi', name: 'UPI Direct', fields: ['upi_id'] },
  { id: 'bank_transfer', name: 'Bank Transfer', fields: ['bank_name', 'bank_account', 'bank_ifsc'] },
];

export default function EcommerceSettings() {
  const [s, setS] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newZone, setNewZone] = useState({ name: '', charge: '' });
  const token = localStorage.getItem('ailaptopwala_token');
  const headers: any = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetch('/api/app-settings').then(r => r.json()).then(d => { if (d && typeof d === 'object') setS(d); }).catch(() => {}); }, []);

  const save = async () => { setSaving(true); await fetch('/api/app-settings', { method: 'PUT', headers, body: JSON.stringify(s) }); toast.success('Ecommerce settings saved!'); setSaving(false); };
  const v = (key: string, fallback = '') => s[key] || fallback;
  const set = (key: string, val: string) => setS(p => ({ ...p, [key]: val }));
  const getList = (key: string, fallback: string) => v(key, fallback).split(',').map(s => s.trim()).filter(Boolean);
  const setList = (key: string, arr: string[]) => set(key, arr.join(','));

  const orderStatuses = getList('order_statuses', 'pending,confirmed,processing,shipped,delivered,cancelled,returned');
  const shippingZones = (() => { try { return JSON.parse(v('shipping_zones', '[]')); } catch { return []; } })() as { name: string; charge: string }[];

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><ShoppingCart className="h-6 w-6" /> Ecommerce Settings</h1>
            <p className="text-sm text-muted-foreground">Payments, shipping, orders, tax, returns</p>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All'}</Button>
        </div>

        <div className="space-y-6">

          {/* ─── PAYMENT GATEWAYS ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><CreditCard className="h-4 w-4" /> Payment Gateways</CardTitle>
              <CardDescription>Enable/disable gateways and configure API keys</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {GATEWAYS.map(gw => {
                const enabled = v(`gateway_${gw.id}`, gw.id === 'cod' ? '1' : '0') === '1';
                return (
                  <div key={gw.id} className={`p-4 rounded-lg border-2 transition-colors ${enabled ? 'border-primary/30 bg-primary/5' : 'border-muted'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {enabled && <CheckCircle className="h-4 w-4 text-primary" />}
                        <span className="font-medium text-sm">{gw.name}</span>
                      </div>
                      <Switch checked={enabled} onCheckedChange={c => set(`gateway_${gw.id}`, c ? '1' : '0')} />
                    </div>
                    {enabled && gw.fields.length > 0 && (
                      <div className="grid sm:grid-cols-2 gap-3 mt-3 pt-3 border-t">
                        {gw.fields.map(f => (
                          <div key={f}>
                            <Label className="text-[10px] uppercase text-muted-foreground">{f.replace(/_/g, ' ')}</Label>
                            <Input className="mt-1 h-8 text-xs font-mono" type={f.includes('secret') || f.includes('key') ? 'password' : 'text'} value={v(f)} onChange={e => set(f, e.target.value)} placeholder={f.includes('secret') ? '••••••••' : ''} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* ─── SHIPPING ZONES ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Truck className="h-4 w-4" /> Shipping Zones & Charges</CardTitle>
              <CardDescription>Define shipping charges by zone/city</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {shippingZones.map((z: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                  <div><span className="text-sm font-medium">{z.name}</span></div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary">Rs {z.charge}</span>
                    <button onClick={() => { const updated = shippingZones.filter((_: any, idx: number) => idx !== i); set('shipping_zones', JSON.stringify(updated)); }} className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Input placeholder="Zone name (e.g., Indore Local)" value={newZone.name} onChange={e => setNewZone(z => ({ ...z, name: e.target.value }))} className="h-8" />
                <Input placeholder="Charge (Rs)" type="number" value={newZone.charge} onChange={e => setNewZone(z => ({ ...z, charge: e.target.value }))} className="h-8 w-28" />
                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => { if (newZone.name && newZone.charge) { set('shipping_zones', JSON.stringify([...shippingZones, newZone])); setNewZone({ name: '', charge: '' }); } }}><Plus className="h-3 w-3" /> Add</Button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t">
                <div><Label className="text-xs">Free shipping above (Rs)</Label><Input className="mt-1" type="number" value={v('free_shipping_above', '0')} onChange={e => set('free_shipping_above', e.target.value)} /><p className="text-[10px] text-muted-foreground mt-1">0 = no free shipping</p></div>
                <div><Label className="text-xs">Default shipping charge (Rs)</Label><Input className="mt-1" type="number" value={v('default_shipping', '100')} onChange={e => set('default_shipping', e.target.value)} /></div>
              </div>
            </CardContent>
          </Card>

          {/* ─── ORDER STATUSES ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4" /> Order Statuses</CardTitle>
              <CardDescription>Customize order lifecycle stages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {orderStatuses.map((st, i) => (
                  <div key={st} className="flex items-center gap-1 bg-muted rounded-full px-3 py-1.5 text-xs font-medium capitalize">
                    <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[9px] flex items-center justify-center font-bold">{i + 1}</span>
                    {st}
                    {!['pending', 'delivered', 'cancelled'].includes(st) && (
                      <button onClick={() => setList('order_statuses', orderStatuses.filter(x => x !== st))} className="ml-1 opacity-50 hover:opacity-100"><X className="h-3 w-3" /></button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="New status..." value={newStatus} onChange={e => setNewStatus(e.target.value)} className="h-8 max-w-[200px]" onKeyDown={e => { if (e.key === 'Enter' && newStatus.trim()) { setList('order_statuses', [...orderStatuses, newStatus.trim().toLowerCase()]); setNewStatus(''); } }} />
                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => { if (newStatus.trim()) { setList('order_statuses', [...orderStatuses, newStatus.trim().toLowerCase()]); setNewStatus(''); } }}><Plus className="h-3 w-3" /> Add</Button>
              </div>
            </CardContent>
          </Card>

          {/* ─── TAX & GST ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Tag className="h-4 w-4" /> Tax & GST</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Default GST rate (%)</Label><Input className="mt-1" type="number" value={v('ecom_gst_rate', '18')} onChange={e => set('ecom_gst_rate', e.target.value)} /></div>
              <div><Label className="text-xs">Show price inclusive of tax</Label><div className="mt-2"><Switch checked={v('price_inclusive_tax', '1') !== '0'} onCheckedChange={c => set('price_inclusive_tax', c ? '1' : '0')} /></div></div>
              <div><Label className="text-xs">Show MRP + discount</Label><div className="mt-2"><Switch checked={v('show_mrp_discount', '1') !== '0'} onCheckedChange={c => set('show_mrp_discount', c ? '1' : '0')} /></div></div>
              <div><Label className="text-xs">HSN code required</Label><div className="mt-2"><Switch checked={v('hsn_required') === '1'} onCheckedChange={c => set('hsn_required', c ? '1' : '0')} /></div></div>
            </CardContent>
          </Card>

          {/* ─── ORDERS & RETURNS ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Orders & Returns Policy</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Return window (days)</Label><Input className="mt-1" type="number" value={v('return_window_days', '7')} onChange={e => set('return_window_days', e.target.value)} /></div>
              <div><Label className="text-xs">Replacement window (days)</Label><Input className="mt-1" type="number" value={v('replacement_window_days', '15')} onChange={e => set('replacement_window_days', e.target.value)} /></div>
              <div><Label className="text-xs">Min order amount (Rs)</Label><Input className="mt-1" type="number" value={v('min_order_amount', '0')} onChange={e => set('min_order_amount', e.target.value)} /></div>
              <div><Label className="text-xs">Max COD amount (Rs)</Label><Input className="mt-1" type="number" value={v('max_cod_amount', '50000')} onChange={e => set('max_cod_amount', e.target.value)} /></div>
              <div><Label className="text-xs">Auto-confirm orders</Label><div className="mt-2"><Switch checked={v('auto_confirm_orders', '1') !== '0'} onCheckedChange={c => set('auto_confirm_orders', c ? '1' : '0')} /></div></div>
              <div><Label className="text-xs">Send order SMS</Label><div className="mt-2"><Switch checked={v('order_sms_enabled', '1') !== '0'} onCheckedChange={c => set('order_sms_enabled', c ? '1' : '0')} /></div></div>
            </CardContent>
          </Card>

          {/* ─── CART & CHECKOUT ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Cart & Checkout</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Abandoned cart reminder (hours)</Label><Input className="mt-1" type="number" value={v('abandoned_cart_hours', '2')} onChange={e => set('abandoned_cart_hours', e.target.value)} /></div>
              <div><Label className="text-xs">Guest checkout</Label><div className="mt-2"><Switch checked={v('guest_checkout', '1') !== '0'} onCheckedChange={c => set('guest_checkout', c ? '1' : '0')} /></div></div>
              <div><Label className="text-xs">Coupon system enabled</Label><div className="mt-2"><Switch checked={v('coupons_enabled', '1') !== '0'} onCheckedChange={c => set('coupons_enabled', c ? '1' : '0')} /></div></div>
              <div><Label className="text-xs">Wallet/store credit</Label><div className="mt-2"><Switch checked={v('wallet_enabled', '1') !== '0'} onCheckedChange={c => set('wallet_enabled', c ? '1' : '0')} /></div></div>
            </CardContent>
          </Card>

          <Button onClick={save} disabled={saving} size="lg" className="w-full gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All Ecommerce Settings'}</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
