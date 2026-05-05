import { useState, useEffect } from "react";
import ERPLayout from "@/components/ERPLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { IndianRupee, Plus, RefreshCw, Download, CheckCircle, Clock, AlertCircle, Banknote, Smartphone, CreditCard, Building2, Zap } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import BillingKPICards from "@/components/billing/BillingKPICards";
import BillingFilters from "@/components/billing/BillingFilters";
import BillingTable from "@/components/billing/BillingTable";
import CustomInvoiceForm from "@/components/billing/CustomInvoiceForm";

type BillingRow = {
  id: string; invoice_number: string; type: 'order' | 'service' | 'custom';
  customer_name: string; customer_phone: string; amount: number;
  payment_status: string; payment_method: string; created_at: string;
  items?: any; discount?: number; device?: string; service_name?: string; notes?: string;
};

const emptyForm = {
  customer_name: '', customer_phone: '', customer_email: '',
  items: [{ name: '', qty: 1, price: 0 }],
  discount: 0, notes: '', payment_status: 'pending',
  payment_mode: 'cash', online_method: 'UPI',
  gst_enabled: false, send_whatsapp: false,
};

export default function AdminBilling() {
  const [rows, setRows] = useState<BillingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // Custom invoice
  const [customOpen, setCustomOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);

  // Payment update
  const [payOpen, setPayOpen] = useState(false);
  const [payRow, setPayRow] = useState<BillingRow | null>(null);
  const [payForm, setPayForm] = useState({ payment_status: 'paid', payment_method: 'Cash' });

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
    } catch { toast.error('Failed to load'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [typeFilter, statusFilter, from, to]);

  // Counts for tabs
  const counts = {
    all: rows.length,
    order: rows.filter(r => r.type === 'order').length,
    service: rows.filter(r => r.type === 'service').length,
    custom: rows.filter(r => r.type === 'custom').length,
  };

  // Custom invoice save
  const saveCustom = async () => {
    if (!form.customer_name || !form.items?.some((i: any) => i.name && i.price > 0))
      return toast.error('Customer name and at least one item required');
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
    setForm({ ...emptyForm, customer_name: r.customer_name, customer_phone: r.customer_phone || '', discount: r.discount || 0, notes: r.notes || '', payment_status: r.payment_status, items });
    setEditingId(r.id); setCustomOpen(true);
  };

  // View invoice
  const handleView = (r: BillingRow) => window.open(`/api/invoice/${r.invoice_number}`, '_blank');

  // WhatsApp send
  const handleSendWA = async (r: BillingRow) => {
    if (!r.customer_phone) return toast.error('No phone number');
    try {
      await api.updateBillingPayment(r.type, r.id, { payment_status: r.payment_status, payment_method: r.payment_method, send_whatsapp: true, invoice_number: r.invoice_number, customer_name: r.customer_name, amount: r.amount });
      toast.success('WhatsApp invoice queued!');
    } catch { toast.error('Failed'); }
  };

  // Payment update
  const openPay = (r: BillingRow) => {
    setPayRow(r);
    setPayForm({ payment_status: r.payment_status === 'paid' ? 'pending' : 'paid', payment_method: r.payment_method || 'Cash' });
    setPayOpen(true);
  };
  const savePay = async () => {
    if (!payRow) return;
    try {
      await api.updateBillingPayment(payRow.type, payRow.id, payForm);
      toast.success('Payment updated!'); setPayOpen(false); load();
    } catch { toast.error('Failed'); }
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['Invoice #', 'Type', 'Customer', 'Phone', 'Amount', 'Payment Status', 'Method', 'Date'];
    const csvRows = [headers, ...rows.map(r => [r.invoice_number, r.type, r.customer_name, r.customer_phone, r.amount, r.payment_status, r.payment_method, new Date(r.created_at).toLocaleDateString('en-IN')])];
    const csv = csvRows.map(r => r.map(c => `"${c || ''}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `billing-${new Date().toISOString().split('T')[0]}.csv`; a.click();
  };

  return (
    <ERPLayout onAction={() => { setForm(emptyForm); setEditingId(null); setCustomOpen(true); }}>
      <div className="space-y-5 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl font-black flex items-center gap-2">
            <IndianRupee className="h-6 w-6 text-primary" /> Unified Billing
          </h1>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5 h-9" onClick={exportCSV}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button size="sm" variant="outline" className="h-9" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button size="sm" className="gap-1.5 h-9" onClick={() => { setForm(emptyForm); setEditingId(null); setCustomOpen(true); }}>
              <Plus className="h-4 w-4" /> Custom Invoice
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <BillingKPICards rows={rows} />

        {/* Filters */}
        <BillingFilters
          typeFilter={typeFilter} setTypeFilter={setTypeFilter}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          search={search} setSearch={setSearch}
          from={from} setFrom={setFrom}
          to={to} setTo={setTo}
          onSearch={load}
          counts={counts}
        />

        {/* Table */}
        <BillingTable
          rows={rows}
          onView={handleView}
          onSendWA={handleSendWA}
          onEdit={openEdit}
          onPayClick={openPay}
        />

        {/* Custom Invoice Form */}
        <CustomInvoiceForm
          open={customOpen}
          onClose={() => setCustomOpen(false)}
          form={form}
          setForm={setForm}
          editingId={editingId}
          onSave={saveCustom}
        />

        {/* Payment Update Dialog */}
        <Dialog open={payOpen} onOpenChange={setPayOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Update Payment</DialogTitle>
              {payRow && (
                <p className="text-sm text-muted-foreground mt-1">
                  {payRow.invoice_number} · {payRow.customer_name} · <span className="font-bold">₹{(payRow.amount || 0).toLocaleString('en-IN')}</span>
                </p>
              )}
            </DialogHeader>
            <div className="space-y-3">
              {/* Quick status buttons */}
              <div>
                <Label className="text-xs mb-2 block">Quick Status</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: 'paid', label: 'Paid', icon: CheckCircle, cls: 'border-green-300 bg-green-50 text-green-700' },
                    { v: 'pending', label: 'Pending', icon: Clock, cls: 'border-orange-300 bg-orange-50 text-orange-700' },
                    { v: 'partial', label: 'Partial', icon: AlertCircle, cls: 'border-yellow-300 bg-yellow-50 text-yellow-700' },
                  ].map(s => (
                    <button key={s.v} onClick={() => setPayForm(f => ({ ...f, payment_status: s.v }))}
                      className={`border rounded-lg py-2 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${payForm.payment_status === s.v ? s.cls + ' ring-2 ring-offset-1 ring-current' : 'border-border hover:border-primary/40'}`}>
                      <s.icon className="h-3.5 w-3.5" />{s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs">Payment Method</Label>
                <Select value={payForm.payment_method} onValueChange={v => setPayForm(f => ({ ...f, payment_method: v }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash"><span className="flex items-center gap-2"><Banknote className="h-3.5 w-3.5" /> Cash</span></SelectItem>
                    <SelectItem value="UPI"><span className="flex items-center gap-2"><Smartphone className="h-3.5 w-3.5" /> UPI</span></SelectItem>
                    <SelectItem value="Debit Card"><span className="flex items-center gap-2"><CreditCard className="h-3.5 w-3.5" /> Debit Card</span></SelectItem>
                    <SelectItem value="Credit Card"><span className="flex items-center gap-2"><CreditCard className="h-3.5 w-3.5" /> Credit Card</span></SelectItem>
                    <SelectItem value="Net Banking"><span className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" /> Net Banking</span></SelectItem>
                    <SelectItem value="Razorpay"><span className="flex items-center gap-2"><Zap className="h-3.5 w-3.5" /> Razorpay</span></SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPayOpen(false)}>Cancel</Button>
              <Button onClick={savePay} className="gap-1.5">Save Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
}
