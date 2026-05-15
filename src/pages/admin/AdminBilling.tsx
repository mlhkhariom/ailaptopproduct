import { useState, useEffect } from "react";
import ERPLayout from "@/components/layout/ERPLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { IndianRupee, Plus, RefreshCw, Download, CheckCircle, Clock, AlertCircle, Banknote, Smartphone, CreditCard, Building2, Zap, History, FileText } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import BillingKPICards from "@/components/billing/BillingKPICards";
import BillingFilters from "@/components/billing/BillingFilters";
import BranchSelector from "@/components/BranchSelector";
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
  discount: 0, discount_type: 'flat', notes: '', payment_status: 'pending',
  payment_mode: 'cash', online_method: 'UPI',
  gst_enabled: false, send_whatsapp: false,
  due_date: '', advance_paid: 0,
};

export default function AdminBilling() {
  const [rows, setRows] = useState<BillingRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  // Custom invoice
  const [customOpen, setCustomOpen] = useState(false);
  const [proformaMode, setProformaMode] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);

  // Payment update
  const [partialOpen, setPartialOpen] = useState(false);
  const [partialRow, setPartialRow] = useState<BillingRow | null>(null);
  const [payRow, setPayRow] = useState<BillingRow | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [irnOpen, setIrnOpen] = useState(false);
  const [irnRow, setIrnRow] = useState<BillingRow | null>(null);
  const [histOpen, setHistOpen] = useState(false);
  const [histRow, setHistRow] = useState<BillingRow | null>(null);
  const [histData, setHistData] = useState<any[]>([]);
  const [irnData, setIrnData] = useState<any>(null);
  const [irnLoading, setIrnLoading] = useState(false);
  const [partialHistory, setPartialHistory] = useState<any[]>([]);
  const [partialForm, setPartialForm] = useState({ amount: 0, payment_method: "Cash", notes: "" });
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

  // Counts for tabs — use branch-filtered rows
  const branchRows = rows.filter((r: any) => branchFilter === 'all' || r.branch_id === branchFilter);
  const counts = {
    all: branchRows.length,
    order: branchRows.filter((r: any) => r.type === 'order').length,
    service: branchRows.filter((r: any) => r.type === 'service').length,
    custom: branchRows.filter((r: any) => r.type === 'custom').length,
  };

  // Custom invoice save
  const saveCustom = async () => {
    if (!form.customer_name || !form.items?.some((i: any) => i.price > 0))
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

  // Bulk mark paid
  const bulkMarkPaid = async () => {
    if (!selected.size) return;
    const ids = [...selected];
    await Promise.all(ids.map(id => {
      const r = rows.find((x: any) => x.id === id);
      if (!r) return Promise.resolve();
      return fetch(`/api/erp/billing/${r.type}/${id}/payment`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` }, body: JSON.stringify({ payment_status: 'paid', payment_method: 'Cash' }) });
    }));
    setSelected(new Set()); load();
  };

  // E-Invoice IRN
  const openIRN = async (r: BillingRow) => {
    setIrnRow(r); setIrnOpen(true); setIrnData(null);
    const type = r.type === "service" ? "service" : "custom";
    const d = await fetch(`/api/erp/einvoice/${r.id}?type=${type}`, { headers: { Authorization: `Bearer ${localStorage.getItem("ailaptopwala_token")}` } }).then(x => x.json()).catch(() => null);
    setIrnData(d);
  };
  const generateIRN = async () => {
    if (!irnRow) return;
    setIrnLoading(true);
    const type = irnRow.type === "service" ? "service" : "custom";
    const res = await fetch("/api/erp/einvoice/generate", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("ailaptopwala_token")}` }, body: JSON.stringify({ invoice_id: irnRow.id, invoice_type: type }) }).then(x => x.json());
    setIrnLoading(false);
    if (res.irn) { toast.success("IRN Generated: " + res.irn.slice(0, 16) + "..."); setIrnData(res); }
    else toast.error(res.error || "IRN generation failed");
  };
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

  const openPartial = async (r: BillingRow) => {
    if (r.type === 'order') return; // orders use Razorpay
    setPartialRow(r);
    setPartialForm({ amount: 0, payment_method: 'Cash', notes: '' });
    try {
      const d = await fetch(`/api/erp/payments/${r.type}/${r.id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` } }).then(res => res.json());
      setPartialHistory(d.payments || []);
    } catch { setPartialHistory([]); }
    setPartialOpen(true);
  };

  const savePartial = async () => {
    if (!partialRow || !partialForm.amount) return toast.error('Amount required');
    try {
      const res = await fetch(`/api/erp/payments/${partialRow.type}/${partialRow.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
        body: JSON.stringify(partialForm),
      }).then(r => r.json());
      toast.success(`Payment recorded! Status: ${res.payment_status}`);
      setPartialOpen(false); load();
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
            <Button size="sm" variant="outline" className="gap-1.5 h-9" onClick={() => { setForm(emptyForm); setEditingId(null); setProformaMode(true); setCustomOpen(true); }}>
              <FileText className="h-4 w-4" /> Proforma
            </Button>
            <Button size="sm" className="gap-1.5 h-9" onClick={() => { setForm(emptyForm); setEditingId(null); setProformaMode(false); setCustomOpen(true); }}>
              <Plus className="h-4 w-4" /> Custom Invoice
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <BillingKPICards rows={rows} />

        {/* Filters */}
        <BranchSelector value={branchFilter} onChange={setBranchFilter} className="w-44" />
          <BillingFilters
          typeFilter={typeFilter} setTypeFilter={setTypeFilter}
          statusFilter={statusFilter} setStatusFilter={setStatusFilter}
          search={search} setSearch={setSearch}
          from={from} setFrom={setFrom}
          to={to} setTo={setTo}
          onSearch={load}
          counts={counts}
        />

        {/* Bulk actions */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
            <span className="text-sm font-medium">{selected.size} selected</span>
            <button onClick={bulkMarkPaid} className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">Mark All Paid</button>
            <button onClick={() => setSelected(new Set())} className="text-xs px-3 py-1.5 border rounded-lg hover:bg-muted">Clear</button>
          </div>
        )}
        {/* Table */}
        <BillingTable
          rows={rows.filter((r: any) => branchFilter === 'all' || r.branch_id === branchFilter)}
          onView={handleView}
          onSendWA={handleSendWA}
          onEdit={openEdit}
          onPayClick={openPay}
          onPartialClick={openPartial}
          onIRN={openIRN}
          selected={selected}
          onSelect={(id, checked) => { const s = new Set(selected); checked ? s.add(id) : s.delete(id); setSelected(s); }}
          onHistory={async (r: any) => {
            setHistRow(r); setHistOpen(true);
            const d = await fetch(`/api/erp/payment-history/${r.type}/${r.id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` } }).then(x => x.json()).catch(() => []);
            setHistData(Array.isArray(d) ? d : []);
          }}
          onPaymentLink={async (r: any) => {
            const res = await fetch('/api/erp/payment-link', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` }, body: JSON.stringify({ invoice_id: r.id, invoice_type: r.type === 'service' ? 'service' : 'custom', amount: r.amount, customer_name: r.customer_name, customer_phone: r.customer_phone }) }).then(x => x.json());
            if (res.payment_link) { toast.success(res.mock ? 'Mock link (set Razorpay keys for live): ' + res.payment_link : 'Payment link created!'); load(); }
            else toast.error(res.error || 'Failed');
          }}
          onConvertProforma={async (r: any) => {
            const res = await fetch(`/api/erp/proforma/${r.id}/convert`, { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` } }).then(x => x.json());
            if (res.invoice_number) { toast.success('Converted: ' + res.invoice_number); load(); }
            else toast.error(res.error || 'Failed');
          }}
        />

        {/* Custom Invoice Form */}
        <CustomInvoiceForm proformaMode={proformaMode}
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

        {/* Partial Payment Dialog */}
        <Dialog open={partialOpen} onOpenChange={setPartialOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Collect Payment — {partialRow?.invoice_number}</DialogTitle>
            </DialogHeader>
            {partialRow && (() => {
              const totalAmt = partialRow.amount || 0;
              const collected = partialHistory.reduce((s, p) => s + (p.amount || 0), 0);
              const due = Math.max(0, totalAmt - collected);
              return (
                <div className="space-y-3">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="border rounded-lg p-2.5 text-center">
                      <p className="text-[10px] text-muted-foreground">Total</p>
                      <p className="text-sm font-black">₹{totalAmt.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="border rounded-lg p-2.5 text-center bg-green-50 border-green-200">
                      <p className="text-[10px] text-green-700">Collected</p>
                      <p className="text-sm font-black text-green-700">₹{collected.toLocaleString('en-IN')}</p>
                    </div>
                    <div className={`border rounded-lg p-2.5 text-center ${due > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                      <p className={`text-[10px] ${due > 0 ? 'text-red-700' : 'text-green-700'}`}>Due</p>
                      <p className={`text-sm font-black ${due > 0 ? 'text-red-700' : 'text-green-700'}`}>₹{due.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Payment history */}
                  {partialHistory.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <p className="text-xs font-semibold px-3 py-2 bg-muted/50">Payment History</p>
                      {partialHistory.map((p: any) => (
                        <div key={p.id} className="flex justify-between items-center px-3 py-2 border-t text-xs">
                          <span className="text-muted-foreground">{new Date(p.created_at).toLocaleDateString('en-IN')}</span>
                          <span className="font-medium">{p.payment_method}</span>
                          <span className="font-bold text-green-600">+₹{(p.amount || 0).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {due > 0 ? (
                    <>
                      <div><Label className="text-xs">Amount Collecting (₹) *</Label>
                        <Input type="number" min={1} max={due} className="mt-1 h-9" placeholder={`Max ₹${due.toLocaleString('en-IN')}`} value={partialForm.amount || ''} onChange={e => setPartialForm(f => ({ ...f, amount: Math.min(Number(e.target.value), due) }))} />
                        <div className="flex gap-2 mt-1.5">
                          <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => setPartialForm(f => ({ ...f, amount: due }))}>Full Due ₹{due.toLocaleString('en-IN')}</Button>
                          {due > 1000 && <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => setPartialForm(f => ({ ...f, amount: Math.round(due / 2) }))}>Half ₹{Math.round(due / 2).toLocaleString('en-IN')}</Button>}
                        </div>
                      </div>
                      <div><Label className="text-xs">Payment Method</Label>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                          {[{ v: 'Cash', icon: Banknote }, { v: 'UPI', icon: Smartphone }, { v: 'Card', icon: CreditCard }].map(m => (
                            <button key={m.v} type="button" onClick={() => setPartialForm(f => ({ ...f, payment_method: m.v }))}
                              className={`flex items-center justify-center gap-1.5 border rounded-lg py-2 text-xs font-medium transition-all ${partialForm.payment_method === m.v ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40'}`}>
                              <m.icon className="h-3.5 w-3.5" />{m.v}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div><Label className="text-xs">Notes</Label>
                        <Input className="mt-1 h-9" value={partialForm.notes} onChange={e => setPartialForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 bg-green-50 rounded-xl border border-green-200">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-bold text-green-700">Fully Paid!</p>
                      <p className="text-xs text-green-600">All payments collected</p>
                    </div>
                  )}
                </div>
              );
            })()}
            <DialogFooter>
              <Button variant="outline" onClick={() => setPartialOpen(false)}>Close</Button>
              {(() => { const due = (partialRow?.amount || 0) - partialHistory.reduce((s, p) => s + (p.amount || 0), 0); return due > 0; })() && (
                <Button onClick={savePartial} className="gap-1.5"><Banknote className="h-4 w-4" /> Collect ₹{partialForm.amount || 0}</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Payment History Dialog */}
      <Dialog open={histOpen} onOpenChange={setHistOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Payment History — {histRow?.invoice_number}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span>Total:</span><span className="font-bold">₹{(histRow?.amount || 0).toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between text-sm"><span>Status:</span><span className={`font-bold ${histRow?.payment_status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>{histRow?.payment_status}</span></div>
            {histData.length > 0 ? (
              <table className="w-full text-xs border rounded-lg overflow-hidden mt-2">
                <thead className="bg-muted/50"><tr><th className="p-2 text-left">Date</th><th className="p-2 text-right">Amount</th><th className="p-2 text-left">Method</th><th className="p-2 text-left">By</th></tr></thead>
                <tbody>{histData.map((h: any) => <tr key={h.id} className="border-t"><td className="p-2">{new Date(h.created_at).toLocaleDateString('en-IN')}</td><td className="p-2 text-right font-bold">₹{(h.amount||0).toLocaleString('en-IN')}</td><td className="p-2">{h.payment_method||'—'}</td><td className="p-2 text-muted-foreground">{h.created_by||'—'}</td></tr>)}</tbody>
              </table>
            ) : <p className="text-sm text-muted-foreground py-4 text-center">No payment records found.</p>}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setHistOpen(false)}>Close</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* E-Invoice IRN Dialog */}
      <Dialog open={irnOpen} onOpenChange={setIrnOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2">E-Invoice (IRN) — {irnRow?.invoice_number}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {irnData?.irn || irnData?.irn_status === 'generated' ? (
              <div className="space-y-2">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-xs text-green-700 font-semibold mb-1">IRN Generated</p>
                  <p className="text-xs font-mono break-all">{irnData.irn}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span className="text-muted-foreground">Ack No:</span> <span className="font-medium">{irnData.ack_no}</span></div>
                  <div><span className="text-muted-foreground">Ack Date:</span> <span className="font-medium">{irnData.ack_date}</span></div>
                </div>
                {irnData.mock && <p className="text-xs text-orange-600 bg-orange-50 rounded p-2">Sandbox/Mock IRN — Set EINVOICE_USERNAME + EINVOICE_PASSWORD in backend .env for live NIC API</p>}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">No IRN generated yet for this invoice.</p>
                {!irnRow?.gst_enabled && <p className="text-xs text-red-600">GST must be enabled on this invoice to generate IRN.</p>}
                <p className="text-xs text-muted-foreground bg-muted/50 rounded p-2">IRN (Invoice Reference Number) is required for B2B invoices above ₹5 crore turnover. For testing, sandbox mode generates a mock IRN.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIrnOpen(false)}>Close</Button>
            {!irnData?.irn && <Button onClick={generateIRN} disabled={irnLoading}>{irnLoading ? 'Generating...' : 'Generate IRN'}</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </ERPLayout>
  );
}
