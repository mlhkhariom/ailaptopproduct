// CustomInvoiceForm — full invoice builder dialog
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, MessageCircle, Save } from "lucide-react";

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

  const setItem = (i: number, field: string, val: any) =>
    setForm((f: any) => {
      const items = [...f.items];
      items[i] = { ...items[i], [field]: val };
      const parts_charge = items.reduce((s: number, it: any) => s + ((it.price || 0) * (it.qty || 1)), 0);
      return { ...f, items, _subtotal: parts_charge };
    });

  const removeItem = (i: number) =>
    setForm((f: any) => ({ ...f, items: f.items.filter((_: any, j: number) => j !== i) }));

  const subtotal = form.items?.reduce((s: number, i: any) => s + ((i.price || 0) * (i.qty || 1)), 0) || 0;
  const afterDiscount = subtotal - (form.discount || 0);
  const gst = form.gst_enabled ? Math.round(afterDiscount * 0.18) : 0;
  const total = afterDiscount + gst;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editingId ? 'Edit' : 'New'} Custom Invoice
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Customer</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Name *</Label><Input className="mt-1 h-9" value={form.customer_name} onChange={e => sf('customer_name')(e.target.value)} /></div>
              <div><Label className="text-xs">Phone</Label><Input className="mt-1 h-9" value={form.customer_phone} onChange={e => sf('customer_phone')(e.target.value)} /></div>
              <div className="col-span-2"><Label className="text-xs">Email</Label><Input className="mt-1 h-9" value={form.customer_email} onChange={e => sf('customer_email')(e.target.value)} /></div>
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Items *</p>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1"
                onClick={() => setForm((f: any) => ({ ...f, items: [...f.items, { name: '', qty: 1, price: 0 }] }))}>
                <Plus className="h-3 w-3" /> Add Row
              </Button>
            </div>
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-2.5 text-xs">Item</th>
                    <th className="text-center p-2.5 text-xs w-16">Qty</th>
                    <th className="text-right p-2.5 text-xs w-24">Price</th>
                    <th className="text-right p-2.5 text-xs w-20">Total</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {(form.items || []).map((item: any, i: number) => (
                    <tr key={i} className="border-t">
                      <td className="p-1.5">
                        <Input className="h-8 text-xs border-0 bg-transparent focus-visible:ring-1" placeholder="Item name" value={item.name} onChange={e => setItem(i, 'name', e.target.value)} />
                      </td>
                      <td className="p-1.5">
                        <Input type="number" className="h-8 text-xs text-center border-0 bg-transparent focus-visible:ring-1" value={item.qty} onChange={e => setItem(i, 'qty', Number(e.target.value))} min={1} />
                      </td>
                      <td className="p-1.5">
                        <Input type="number" className="h-8 text-xs text-right border-0 bg-transparent focus-visible:ring-1" value={item.price} onChange={e => setItem(i, 'price', Number(e.target.value))} />
                      </td>
                      <td className="p-1.5 text-right text-xs font-medium pr-2">
                        ₹{((item.qty || 1) * (item.price || 0)).toLocaleString('en-IN')}
                      </td>
                      <td className="p-1.5">
                        {(form.items || []).length > 1 && (
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeItem(i)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="bg-muted/30 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">Discount (₹)</Label>
              <Input type="number" className="h-7 w-24 text-xs text-right" value={form.discount || ''} onChange={e => sf('discount')(Number(e.target.value))} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch checked={!!form.gst_enabled} onCheckedChange={sf('gst_enabled')} />
                <span className="text-sm text-muted-foreground">GST 18% (CGST+SGST)</span>
              </div>
              {gst > 0 && <span className="text-sm">₹{gst.toLocaleString('en-IN')}</span>}
            </div>
            <div className="flex justify-between font-black text-base border-t pt-1.5">
              <span>Total</span><span className="text-primary">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Payment */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Payment</p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Status</Label>
                <Select value={form.payment_status} onValueChange={sf('payment_status')}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Mode</Label>
                <Select value={form.payment_mode || 'cash'} onValueChange={sf('payment_mode')}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.payment_mode === 'online' && (
              <div className="mt-3"><Label className="text-xs">Online Method</Label>
                <Select value={form.online_method || 'UPI'} onValueChange={sf('online_method')}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ONLINE_METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Notes */}
          <div><Label className="text-xs">Notes</Label>
            <Input className="mt-1 h-9" value={form.notes || ''} onChange={e => sf('notes')(e.target.value)} placeholder="Any notes for this invoice..." />
          </div>

          {/* WhatsApp toggle */}
          <div className="flex items-center justify-between border rounded-xl p-3 bg-green-50/50">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Send on WhatsApp</p>
                <p className="text-xs text-muted-foreground">Invoice link auto-sent to customer</p>
              </div>
            </div>
            <Switch checked={!!form.send_whatsapp} onCheckedChange={sf('send_whatsapp')} />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave} className="gap-1.5">
            <Save className="h-4 w-4" /> {editingId ? 'Update' : 'Create'} Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
