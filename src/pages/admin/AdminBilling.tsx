import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IndianRupee, Plus, Printer, RefreshCw, Search, Trash2, Edit, Send, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

type BillingRow = {
  id: string; invoice_number: string; type: 'order' | 'service' | 'custom';
  customer_name: string; customer_phone: string; amount: number;
  payment_status: string; payment_method: string; created_at: string;
  items?: any; address?: any; discount?: number; subtotal?: number;
  razorpay_id?: string; device?: string; service_name?: string;
  labour_charge?: number; parts_charge?: number; technician?: string; diagnosis?: string; notes?: string;
};

const emptyCustom = {
  customer_name: '', customer_phone: '', customer_email: '',
  items: [{ name: '', qty: 1, price: 0 }],
  discount: 0, notes: '', payment_status: 'pending',
  payment_method: 'cash', payment_mode: 'cash', // cash | online
  online_method: 'upi', gst_enabled: false, send_whatsapp: false,
};

const TYPE_LABELS: Record<string, string> = { order: '🛒 Order', service: '🔧 Service', custom: '📄 Custom' };
const TYPE_COLORS: Record<string, string> = { order: 'bg-blue-100 text-blue-700', service: 'bg-orange-100 text-orange-700', custom: 'bg-purple-100 text-purple-700' };

export default function AdminBilling() {
  const [rows, setRows] = useState<BillingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // Custom invoice dialog
  const [customOpen, setCustomOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyCustom);

  // Payment dialog
  const [payOpen, setPayOpen] = useState(false);
  const [payRow, setPayRow] = useState<BillingRow | null>(null);
  const [payForm, setPayForm] = useState({ payment_status: 'paid', payment_method: 'cash' });

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (from) params.from = from;
      if (to) params.to = to;
      if (search) params.search = search;
      const data = await api.getBilling(params);
      setRows(Array.isArray(data) ? data : []);
    } catch { toast.error('Failed to load billing'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [typeFilter, statusFilter, from, to]);

  const totalCollected = rows.filter(r => r.payment_status === 'paid').reduce((s, r) => s + r.amount, 0);
  const totalPending = rows.filter(r => r.payment_status !== 'paid').reduce((s, r) => s + r.amount, 0);

  // ── Custom Invoice ──
  const setItem = (i: number, field: string, val: any) =>
    setForm((f: any) => { const items = [...f.items]; items[i] = { ...items[i], [field]: val }; return { ...f, items }; });

  const saveCustom = async () => {
    if (!form.customer_name || !form.items.some((i: any) => i.name && i.price > 0))
      return toast.error('Customer name and at least one item required');
    // resolve payment_method from mode
    const payment_method = form.payment_mode === 'cash' ? 'Cash' : form.online_method;
    const payload = { ...form, payment_method, gst_enabled: form.gst_enabled ? 1 : 0 };
    try {
      if (editingId) await api.updateCustomInvoice(editingId, payload);
      else await api.createCustomInvoice(payload);
      toast.success(editingId ? 'Invoice updated!' : 'Invoice created!');
      if (form.send_whatsapp) toast.success('WhatsApp queued!');
      setCustomOpen(false); load();
    } catch (e: any) { toast.error(e.message); }
  };

  const openEdit = (r: BillingRow) => {
    const items = Array.isArray(r.items) ? r.items : JSON.parse(typeof r.items === 'string' ? r.items : '[{"name":"","qty":1,"price":0}]');
    setForm({
      customer_name: r.customer_name, customer_phone: r.customer_phone || '',
      customer_email: '', discount: r.discount || 0, notes: r.notes || '',
      payment_status: r.payment_status, payment_method: r.payment_method || 'cash',
      payment_mode: 'cash', online_method: 'upi',
      gst_enabled: false, send_whatsapp: false, items,
    });
    setEditingId(r.id); setCustomOpen(true);
  };

  const getInvoiceUrl = (r: BillingRow) => `/api/invoice/${r.invoice_number}`;

  // ── Payment Update ──
  const openPay = (r: BillingRow) => {
    setPayRow(r);
    setPayForm({ payment_status: r.payment_status === 'paid' ? 'pending' : 'paid', payment_method: r.payment_method || 'cash' });
    setPayOpen(true);
  };

  const savePay = async () => {
    if (!payRow) return;
    try {
      await api.updateBillingPayment(payRow.type, payRow.id, payForm);
      toast.success('Payment updated!'); setPayOpen(false); load();
    } catch (e: any) { toast.error(e.message); }
  };

  // ── Print Invoice — always use server URL ──
  const printInvoice = (r: BillingRow) => {
    window.open(getInvoiceUrl(r), '_blank');
  };

  const sendWhatsApp = async (r: BillingRow) => {
    if (!r.customer_phone) return toast.error('No phone number');
    try {
      await api.updateBillingPayment(r.type, r.id, { payment_status: r.payment_status, payment_method: r.payment_method, send_whatsapp: true, invoice_number: r.invoice_number, customer_name: r.customer_name, amount: r.amount });
      toast.success('WhatsApp invoice queued!');
    } catch (e: any) { toast.error(e.message); }
  };
    const win = window.open('', '_blank');
    if (!win) return;
    const items = r.type === 'service'
      ? [
          { name: r.service_name || 'Repair Service', desc: r.diagnosis || '', amount: r.labour_charge || 0 },
          ...(r.parts_charge ? [{ name: 'Parts & Components', desc: '', amount: r.parts_charge }] : []),
        ]
      : (Array.isArray(r.items) ? r.items : JSON.parse(r.items || '[]')).map((i: any) => ({
          name: i.name, desc: '', amount: i.price * i.qty,
        }));
    const subtotal = r.amount;
    const gst = r.type === 'service' ? Math.round(subtotal * 0.18) : 0;
    const total = subtotal + gst;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Invoice ${r.invoice_number}</title>
<style>
  body{font-family:Arial,sans-serif;padding:30px;max-width:700px;margin:0 auto;color:#333}
  .hdr{display:flex;justify-content:space-between;border-bottom:3px solid #FF8000;padding-bottom:15px;margin-bottom:20px}
  .brand h1{color:#FF8000;font-size:22px;margin:0}.brand p{color:#666;font-size:11px;margin:2px 0}
  .inv{text-align:right}.inv h2{font-size:18px;margin:0}
  table{width:100%;border-collapse:collapse;margin:15px 0}
  th{background:#FF8000;color:white;padding:8px;text-align:left;font-size:12px}
  td{padding:8px;border-bottom:1px solid #eee;font-size:12px}
  .tot{text-align:right;margin-top:10px}.tot p{margin:3px 0;font-size:13px}
  .grand{font-size:16px;font-weight:bold;color:#FF8000}
  .ftr{margin-top:30px;text-align:center;color:#999;font-size:10px;border-top:1px solid #eee;padding-top:15px}
  @media print{button{display:none}}
</style></head><body>
<div class="hdr">
  <div class="brand">
    <h1>💻 AI Laptop Wala</h1>
    <p>Asati Infotech | GST: 23ATNPA4415H1Z2</p>
    <p>Silver Mall, LB-21, RNT Marg, Indore 452001</p>
    <p>📞 +91 98934 96163</p>
  </div>
  <div class="inv">
    <h2>${r.type === 'service' ? 'SERVICE INVOICE' : 'INVOICE'}</h2>
    <p>Invoice #: <strong>${r.invoice_number}</strong></p>
    <p>Date: ${new Date(r.created_at).toLocaleDateString('en-IN')}</p>
  </div>
</div>
<div style="display:flex;justify-content:space-between;margin-bottom:15px">
  <div>
    <p style="font-size:11px;color:#666">Bill To:</p>
    <p style="font-weight:bold">${r.customer_name}</p>
    <p style="font-size:12px">${r.customer_phone || ''}</p>
  </div>
  ${r.type === 'service' ? `<div style="text-align:right">
    <p style="font-size:11px;color:#666">Device:</p>
    <p style="font-weight:bold">${r.device || ''}</p>
    <p style="font-size:12px">Technician: ${r.technician || 'N/A'}</p>
  </div>` : ''}
</div>
<table>
  <tr><th>Description</th><th style="text-align:right">Amount</th></tr>
  ${items.map((i: any) => `<tr><td>${i.name}${i.desc ? `<br><small style="color:#666">${i.desc}</small>` : ''}</td><td style="text-align:right">₹${Number(i.amount).toLocaleString('en-IN')}</td></tr>`).join('')}
</table>
<div class="tot">
  <p>Subtotal: ₹${subtotal.toLocaleString('en-IN')}</p>
  ${r.discount ? `<p>Discount: -₹${Number(r.discount).toLocaleString('en-IN')}</p>` : ''}
  ${gst ? `<p>GST (18%): ₹${gst.toLocaleString('en-IN')}</p>` : ''}
  <p class="grand">Total: ₹${total.toLocaleString('en-IN')}</p>
  <p style="font-size:11px;color:#666">Payment: ${r.payment_status === 'paid' ? `✅ Paid via ${r.payment_method || 'Cash'}` : '⏳ Pending'}</p>
</div>
  const customTotal = (() => {
    const sub = form.items.reduce((s: number, i: any) => s + ((i.price || 0) * (i.qty || 1)), 0);
    const afterDiscount = sub - (form.discount || 0);
    const gst = form.gst_enabled ? Math.round(afterDiscount * 0.18) : 0;
    return afterDiscount + gst;
  })();

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-xl font-black flex items-center gap-2"><IndianRupee className="h-5 w-5 text-primary" /> Unified Billing</h1>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={load} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
            <Button size="sm" onClick={() => { setForm(emptyCustom); setEditingId(null); setCustomOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Custom Invoice
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="border rounded-lg p-4"><p className="text-xs text-muted-foreground">Collected</p><p className="text-2xl font-black text-green-600">₹{totalCollected.toLocaleString('en-IN')}</p></div>
          <div className="border rounded-lg p-4"><p className="text-xs text-muted-foreground">Pending</p><p className="text-2xl font-black text-red-600">₹{totalPending.toLocaleString('en-IN')}</p></div>
          <div className="border rounded-lg p-4"><p className="text-xs text-muted-foreground">Orders</p><p className="text-2xl font-black text-blue-600">{rows.filter(r => r.type === 'order').length}</p></div>
          <div className="border rounded-lg p-4"><p className="text-xs text-muted-foreground">Service Jobs</p><p className="text-2xl font-black text-orange-600">{rows.filter(r => r.type === 'service').length}</p></div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <Tabs value={typeFilter} onValueChange={setTypeFilter}>
            <TabsList className="h-8">
              {['all','order','service','custom'].map(t => (
                <TabsTrigger key={t} value={t} className="text-xs h-7 px-3 capitalize">
                  {t === 'all' ? `All (${rows.length})` : `${TYPE_LABELS[t]} (${rows.filter(r => r.type === t).length})`}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" className="h-8 text-xs w-36" value={from} onChange={e => setFrom(e.target.value)} placeholder="From" />
          <Input type="date" className="h-8 text-xs w-36" value={to} onChange={e => setTo(e.target.value)} placeholder="To" />
          <div className="relative flex-1 min-w-40">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search name / invoice #..." className="pl-8 h-8 text-sm" value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && load()} />
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>
              <th className="text-left p-3 text-xs">Invoice #</th>
              <th className="text-left p-3 text-xs">Type</th>
              <th className="text-left p-3 text-xs">Customer</th>
              <th className="text-left p-3 text-xs">Details</th>
              <th className="text-right p-3 text-xs">Amount</th>
              <th className="text-center p-3 text-xs">Payment</th>
              <th className="text-center p-3 text-xs">Date</th>
              <th className="text-center p-3 text-xs">Actions</th>
            </tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={`${r.type}-${r.id}`} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs font-bold">{r.invoice_number}</td>
                  <td className="p-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[r.type]}`}>{TYPE_LABELS[r.type]}</span>
                  </td>
                  <td className="p-3">
                    <p className="text-xs font-medium">{r.customer_name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.customer_phone}</p>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {r.type === 'service' ? r.device : r.type === 'order' ? `${Array.isArray(r.items) ? JSON.parse(typeof r.items === 'string' ? r.items : '[]').length : 0} items` : 'Custom'}
                  </td>
                  <td className="p-3 text-right text-xs font-bold">₹{(r.amount || 0).toLocaleString('en-IN')}</td>
                  <td className="p-3 text-center">
                    <Badge
                      variant={r.payment_status === 'paid' ? 'default' : 'destructive'}
                      className="text-[10px] cursor-pointer"
                      onClick={() => openPay(r)}
                    >{r.payment_status}</Badge>
                  </td>
                  <td className="p-3 text-center text-xs text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1 justify-center">
                      <Button size="icon" variant="ghost" className="h-7 w-7" title="View Invoice" onClick={() => printInvoice(r)}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" title="Send on WhatsApp" onClick={() => sendWhatsApp(r)}>
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                      {r.type === 'custom' && (
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(r)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && !loading && (
                <tr><td colSpan={8} className="p-8 text-center text-muted-foreground text-xs">No records found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Custom Invoice Dialog */}
        <Dialog open={customOpen} onOpenChange={setCustomOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? 'Edit' : 'New'} Custom Invoice</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Customer Name *</Label><Input className="mt-1 h-9" value={form.customer_name} onChange={e => setForm((f: any) => ({ ...f, customer_name: e.target.value }))} /></div>
                <div><Label className="text-xs">Phone</Label><Input className="mt-1 h-9" value={form.customer_phone} onChange={e => setForm((f: any) => ({ ...f, customer_phone: e.target.value }))} /></div>
              </div>
              <div><Label className="text-xs">Email</Label><Input className="mt-1 h-9" value={form.customer_email} onChange={e => setForm((f: any) => ({ ...f, customer_email: e.target.value }))} /></div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label className="text-xs">Items *</Label>
                  <Button size="sm" variant="ghost" className="h-6 text-xs px-2"
                    onClick={() => setForm((f: any) => ({ ...f, items: [...f.items, { name: '', qty: 1, price: 0 }] }))}>
                    + Add Row
                  </Button>
                </div>
                <div className="space-y-2">
                  {form.items.map((item: any, i: number) => (
                    <div key={i} className="grid grid-cols-12 gap-1 items-center">
                      <Input className="col-span-5 h-8 text-xs" placeholder="Item name" value={item.name} onChange={e => setItem(i, 'name', e.target.value)} />
                      <Input type="number" className="col-span-2 h-8 text-xs" placeholder="Qty" value={item.qty} onChange={e => setItem(i, 'qty', Number(e.target.value))} />
                      <Input type="number" className="col-span-3 h-8 text-xs" placeholder="Price" value={item.price} onChange={e => setItem(i, 'price', Number(e.target.value))} />
                      <span className="col-span-1 text-xs text-right font-medium">₹{((item.qty || 1) * (item.price || 0)).toLocaleString('en-IN')}</span>
                      {form.items.length > 1 && (
                        <Button size="icon" variant="ghost" className="col-span-1 h-7 w-7 text-destructive"
                          onClick={() => setForm((f: any) => ({ ...f, items: f.items.filter((_: any, j: number) => j !== i) }))}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Discount (₹)</Label><Input type="number" className="mt-1 h-9" value={form.discount} onChange={e => setForm((f: any) => ({ ...f, discount: Number(e.target.value) }))} /></div>
                <div className="flex items-end pb-1"><p className="text-sm font-black">Total: ₹{customTotal.toLocaleString('en-IN')}</p></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Payment Status</Label>
                  <Select value={form.payment_status} onValueChange={v => setForm((f: any) => ({ ...f, payment_status: v }))}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Payment Mode</Label>
                  <Select value={form.payment_mode} onValueChange={v => setForm((f: any) => ({ ...f, payment_mode: v }))}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">💵 Cash</SelectItem>
                      <SelectItem value="online">📱 Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {form.payment_mode === 'online' && (
                <div><Label className="text-xs">Online Method</Label>
                  <Select value={form.online_method} onValueChange={v => setForm((f: any) => ({ ...f, online_method: v }))}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="net_banking">Net Banking</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center justify-between border rounded-lg p-3">
                <div>
                  <p className="text-xs font-medium">GST (18%)</p>
                  <p className="text-[10px] text-muted-foreground">Add CGST 9% + SGST 9%</p>
                </div>
                <Switch checked={form.gst_enabled} onCheckedChange={v => setForm((f: any) => ({ ...f, gst_enabled: v }))} />
              </div>

              <div className="flex items-center justify-between border rounded-lg p-3 bg-green-50">
                <div>
                  <p className="text-xs font-medium">Send on WhatsApp</p>
                  <p className="text-[10px] text-muted-foreground">Invoice link auto-send to customer</p>
                </div>
                <Switch checked={form.send_whatsapp} onCheckedChange={v => setForm((f: any) => ({ ...f, send_whatsapp: v }))} />
              </div>
              <div><Label className="text-xs">Notes</Label><Input className="mt-1 h-9" value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCustomOpen(false)}>Cancel</Button>
              <Button onClick={saveCustom}>Save Invoice</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Update Dialog */}
        <Dialog open={payOpen} onOpenChange={setPayOpen}>
          <DialogContent className="max-w-xs">
            <DialogHeader><DialogTitle>Update Payment — {payRow?.invoice_number}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Payment Status</Label>
                <Select value={payForm.payment_status} onValueChange={v => setPayForm(f => ({ ...f, payment_status: v }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Payment Method</Label>
                <Select value={payForm.payment_method} onValueChange={v => setPayForm(f => ({ ...f, payment_method: v }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">💵 Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="debit_card">Debit Card</SelectItem>
                    <SelectItem value="credit_card">Credit Card</SelectItem>
                    <SelectItem value="net_banking">Net Banking</SelectItem>
                    <SelectItem value="razorpay">Razorpay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
              <Button onClick={savePay}>Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
