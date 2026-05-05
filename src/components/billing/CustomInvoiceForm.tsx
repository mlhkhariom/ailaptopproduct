// CustomInvoiceForm — clean invoice builder
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, MessageCircle, Save, User, Package, CreditCard, Clock, CheckCircle, AlertCircle, Banknote, Smartphone, Search, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Props {
  open: boolean;
  onClose: () => void;
  form: any;
  setForm: (f: any) => void;
  editingId: string | null;
  onSave: () => void;
}

const ONLINE_METHODS = ['UPI', 'Debit Card', 'Credit Card', 'Net Banking'];

export default function CustomInvoiceForm({ open, onClose, form, setForm, editingId, onSave }: Props) {
  const sf = (k: string) => (v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const [products, setProducts] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState('');

  useEffect(() => {
    if (open) api.getProducts().then((p: any) => setProducts(Array.isArray(p) ? p : p?.products || []));
  }, [open]);

  const filteredProducts = products.filter(p =>
    !productSearch || p.name?.toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 8);

  const setItem = (i: number, field: string, val: any) =>
    setForm((f: any) => {
      const items = [...f.items];
      items[i] = { ...items[i], [field]: val };
      return { ...f, items };
    });

  const removeItem = (i: number) =>
    setForm((f: any) => ({ ...f, items: f.items.filter((_: any, j: number) => j !== i) }));

  const addItem = () =>
    setForm((f: any) => ({ ...f, items: [...f.items, { name: '', qty: 1, price: 0 }] }));

  const subtotal = (form.items || []).reduce((s: number, i: any) => s + ((i.price || 0) * (i.qty || 1)), 0);
  const afterDiscount = subtotal - (form.discount || 0);
  const gst = form.gst_enabled ? Math.round(afterDiscount * 0.18) : 0;
  const total = afterDiscount + gst;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-black">
            {editingId ? 'Edit Invoice' : 'New Custom Invoice'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">

          {/* ── Customer ── */}
          <div className="border rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <User className="h-3.5 w-3.5" /> Customer Details
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Name *</Label>
                <Input className="mt-1 h-9" placeholder="Customer name" value={form.customer_name} onChange={e => sf('customer_name')(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Phone</Label>
                <Input className="mt-1 h-9" placeholder="+91 98765 43210" value={form.customer_phone} onChange={e => sf('customer_phone')(e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Email</Label>
                <Input className="mt-1 h-9" placeholder="customer@email.com" value={form.customer_email} onChange={e => sf('customer_email')(e.target.value)} />
              </div>
            </div>
          </div>

          {/* ── Items ── */}
          <div className="border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <Package className="h-3.5 w-3.5" /> Items *
              </p>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={addItem}>
                <Plus className="h-3 w-3" /> Add Row
              </Button>
            </div>

            {/* Product quick-add search */}
            <div className="px-4 py-2 border-b bg-muted/10">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  className="pl-8 h-8 text-xs"
                  placeholder="Search & add product from inventory..."
                  value={productSearch}
                  onChange={e => setProductSearch(e.target.value)}
                />
              </div>
              {productSearch && filteredProducts.length > 0 && (
                <div className="mt-1 border rounded-lg bg-white shadow-sm max-h-40 overflow-y-auto">
                  {filteredProducts.map(p => (
                    <button key={p.id} className="flex items-center justify-between w-full px-3 py-2 text-xs hover:bg-muted/50 transition-colors text-left border-b last:border-b-0"
                      onClick={() => {
                        setForm((f: any) => ({ ...f, items: [...f.items, { name: p.name, qty: 1, price: p.price, product_id: p.id }] }));
                        setProductSearch('');
                      }}>
                      <span className="font-medium">{p.name}</span>
                      <span className="text-muted-foreground ml-2">₹{p.price?.toLocaleString('en-IN')} · Stock: {p.stock}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <table className="w-full text-sm">
              <thead className="bg-muted/20">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground">Description</th>
                  <th className="text-center px-3 py-2.5 text-xs font-semibold text-muted-foreground w-20">Qty</th>
                  <th className="text-right px-3 py-2.5 text-xs font-semibold text-muted-foreground w-28">Unit Price</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-muted-foreground w-24">Total</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {(form.items || []).map((item: any, i: number) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2">
                      <Input className="h-8 text-sm" placeholder="Item or service name" value={item.name} onChange={e => setItem(i, 'name', e.target.value)} />
                    </td>
                    <td className="px-2 py-2">
                      <Input type="number" min={1} className="h-8 text-sm text-center" value={item.qty} onChange={e => setItem(i, 'qty', Number(e.target.value))} />
                    </td>
                    <td className="px-2 py-2">
                      <Input type="number" min={0} className="h-8 text-sm text-right" placeholder="0" value={item.price || ''} onChange={e => setItem(i, 'price', Number(e.target.value))} />
                    </td>
                    <td className="px-4 py-2 text-right font-semibold text-sm">
                      ₹{((item.qty || 1) * (item.price || 0)).toLocaleString('en-IN')}
                    </td>
                    <td className="px-2 py-2">
                      {(form.items || []).length > 1 && (
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-red-50" onClick={() => removeItem(i)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals inside items box */}
            <div className="border-t bg-muted/10 px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-sm font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">Discount (₹)</Label>
                <Input
                  type="number" min={0}
                  className="h-7 w-28 text-sm text-right"
                  value={form.discount || ''}
                  onChange={e => sf('discount')(Number(e.target.value))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Switch checked={!!form.gst_enabled} onCheckedChange={sf('gst_enabled')} />
                  <span className="text-sm text-muted-foreground">GST 18% (CGST 9% + SGST 9%)</span>
                </div>
                {gst > 0 && <span className="text-sm font-medium text-orange-600">+₹{gst.toLocaleString('en-IN')}</span>}
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-base font-black">Total Payable</span>
                <span className="text-xl font-black text-primary">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* ── Payment ── */}
          <div className="border rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5" /> Payment
            </p>
            {/* Status buttons */}
            <div>
              <Label className="text-xs mb-2 block">Status</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: 'pending', label: 'Pending', icon: Clock, active: 'border-orange-400 bg-orange-50 text-orange-700' },
                  { v: 'paid',    label: 'Paid',    icon: CheckCircle, active: 'border-green-400 bg-green-50 text-green-700' },
                  { v: 'partial', label: 'Partial', icon: AlertCircle, active: 'border-yellow-400 bg-yellow-50 text-yellow-700' },
                ].map(s => (
                  <button key={s.v} type="button" onClick={() => sf('payment_status')(s.v)}
                    className={`flex items-center justify-center gap-1.5 border rounded-lg py-2 text-xs font-semibold transition-all ${form.payment_status === s.v ? s.active : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                    <s.icon className="h-3.5 w-3.5" />{s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment mode buttons */}
            <div>
              <Label className="text-xs mb-2 block">Payment Mode</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { v: 'cash',   label: 'Cash',   icon: Banknote },
                  { v: 'online', label: 'Online', icon: Smartphone },
                ].map(m => (
                  <button key={m.v} type="button" onClick={() => sf('payment_mode')(m.v)}
                    className={`flex items-center justify-center gap-1.5 border rounded-lg py-2 text-xs font-semibold transition-all ${(form.payment_mode || 'cash') === m.v ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                    <m.icon className="h-3.5 w-3.5" />{m.label}
                  </button>
                ))}
              </div>
            </div>

            {form.payment_mode === 'online' && (
              <div>
                <Label className="text-xs mb-2 block">Online Method</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { v: 'UPI', icon: Smartphone },
                    { v: 'Debit Card', icon: CreditCard },
                    { v: 'Credit Card', icon: CreditCard },
                    { v: 'Net Banking', icon: Building2 },
                  ].map(m => (
                    <button key={m.v} type="button" onClick={() => sf('online_method')(m.v)}
                      className={`flex items-center justify-center gap-1.5 border rounded-lg py-2 text-xs font-semibold transition-all ${(form.online_method || 'UPI') === m.v ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                      <m.icon className="h-3.5 w-3.5" />{m.v}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Notes ── */}
          <div>
            <Label className="text-xs">Notes (optional)</Label>
            <Input className="mt-1 h-9" placeholder="Any additional notes..." value={form.notes || ''} onChange={e => sf('notes')(e.target.value)} />
          </div>

          {/* ── WhatsApp ── */}
          <div className="flex items-center justify-between border rounded-xl p-4 bg-green-50/50 border-green-200">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-green-100 flex items-center justify-center">
                <MessageCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold">Send Invoice on WhatsApp</p>
                <p className="text-xs text-muted-foreground">Invoice link auto-sent to customer after save</p>
              </div>
            </div>
            <Switch checked={!!form.send_whatsapp} onCheckedChange={sf('send_whatsapp')} />
          </div>

        </div>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave} className="gap-1.5 px-6">
            <Save className="h-4 w-4" />
            {editingId ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
