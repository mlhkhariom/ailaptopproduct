import { useState, useEffect } from "react";
import ERPLayout from "@/components/ERPLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardList, Plus, Edit, Trash2, RefreshCw, Search, Printer, Send, ExternalLink, X } from "lucide-react";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const req = (method: string, path: string, body?: any) =>
  fetch(`/api/erp${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then(r => r.json());

const STATUS_COLORS: Record<string, any> = {
  pending: 'secondary', in_progress: 'default', completed: 'outline', cancelled: 'destructive',
};
const STATUS_LABELS: Record<string, string> = {
  pending: '⏳ Pending', in_progress: '🔧 In Progress', completed: '✅ Completed', cancelled: '❌ Cancelled',
};

const emptyForm = {
  customer_name: '', customer_phone: '', customer_email: '',
  service_name: 'General Repair', device_brand: '', device_model: '', device_serial: '',
  issue_description: '', priority: 'normal', technician: '',
  diagnosis: '',
  parts_used: [] as { name: string; qty: number; price: number }[],
  labour_charge: 0, parts_charge: 0,
  status: 'pending', payment_status: 'pending', payment_method: '', notes: '',
  branch_id: '', gst_enabled: 0,
};

export default function AdminJobCards() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [staff, setStaff] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (branchFilter) params.set('branch_id', branchFilter);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const data = await req('GET', `/job-cards?${params}`);
    setJobs(Array.isArray(data) ? data : []);
    const [s, b] = await Promise.all([req('GET', '/staff'), req('GET', '/branches')]);
    setStaff(Array.isArray(s) ? s : []);
    const bl = Array.isArray(b) ? b : [];
    setBranches(bl);
    setForm((f: any) => ({ ...f, branch_id: f.branch_id || bl[0]?.id || '' }));
    setLoading(false);
  };

  useEffect(() => { load(); }, [statusFilter, branchFilter, from, to]);

  const filtered = jobs.filter(j =>
    !search ||
    j.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    j.booking_number?.includes(search) ||
    j.device_brand?.toLowerCase().includes(search.toLowerCase()) ||
    j.customer_phone?.includes(search)
  );

  // Parts helpers
  const addPart = () => setForm((f: any) => ({ ...f, parts_used: [...f.parts_used, { name: '', qty: 1, price: 0 }] }));
  const setPart = (i: number, field: string, val: any) =>
    setForm((f: any) => {
      const parts = [...f.parts_used];
      parts[i] = { ...parts[i], [field]: val };
      const parts_charge = parts.reduce((s: number, p: any) => s + (p.qty || 1) * (p.price || 0), 0);
      return { ...f, parts_used: parts, parts_charge };
    });
  const removePart = (i: number) =>
    setForm((f: any) => {
      const parts = f.parts_used.filter((_: any, j: number) => j !== i);
      return { ...f, parts_used: parts, parts_charge: parts.reduce((s: number, p: any) => s + (p.qty || 1) * (p.price || 0), 0) };
    });

  const total = (form.labour_charge || 0) + (form.parts_charge || 0);
  const totalWithGST = form.gst_enabled ? total + Math.round(total * 0.18) : total;

  const save = async () => {
    if (!form.customer_name || !form.customer_phone) return toast.error('Name and phone required');
    try {
      if (editingId) await req('PUT', `/job-cards/${editingId}`, form);
      else await req('POST', '/job-cards', form);
      toast.success(editingId ? 'Job card updated!' : 'Job card created!');
      setDialogOpen(false); load();
    } catch { toast.error('Failed to save'); }
  };

  const openEdit = (j: any) => {
    setForm({ ...emptyForm, ...j, parts_used: Array.isArray(j.parts_used) ? j.parts_used : [] });
    setEditingId(j.id); setDialogOpen(true);
  };
  const openAdd = () => {
    setForm({ ...emptyForm, branch_id: branches[0]?.id || '' });
    setEditingId(null); setDialogOpen(true);
  };

  const deleteJob = async (id: string) => {
    if (!confirm('Delete this job card?')) return;
    await req('DELETE', `/job-cards/${id}`);
    toast.success('Deleted'); load();
  };

  const sendWhatsApp = async (j: any) => {
    if (!j.customer_phone) return toast.error('No phone number');
    try {
      await fetch(`/api/erp/billing/service/${j.id}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
        body: JSON.stringify({ payment_status: j.payment_status, payment_method: j.payment_method, send_whatsapp: true, invoice_number: j.booking_number, customer_name: j.customer_name, amount: j.total_charge }),
      });
      toast.success('WhatsApp invoice queued!');
    } catch { toast.error('Failed to send'); }
  };

  const counts = (s: string) => s === 'all' ? jobs.length : jobs.filter(j => j.status === s).length;

  return (
    <ERPLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-xl font-black flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" /> Job Cards
          </h1>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> New Job Card</Button>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid grid-cols-4 gap-2">
          {['all', 'pending', 'in_progress', 'completed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`border rounded-lg p-3 text-left transition-all ${statusFilter === s ? 'border-primary bg-primary/5' : 'hover:border-primary/40'}`}>
              <p className="text-[10px] text-muted-foreground capitalize">{s.replace('_', ' ')}</p>
              <p className="text-xl font-black">{counts(s)}</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search name, phone, JC#, device..." className="pl-8 h-8 text-sm"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {branches.length > 0 && (
            <Select value={branchFilter || 'all'} onValueChange={v => setBranchFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="All Branches" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
          <Input type="date" className="h-8 text-xs w-32" value={from} onChange={e => setFrom(e.target.value)} />
          <span className="text-xs text-muted-foreground">to</span>
          <Input type="date" className="h-8 text-xs w-32" value={to} onChange={e => setTo(e.target.value)} />
          {(from || to || branchFilter) && (
            <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => { setFrom(''); setTo(''); setBranchFilter(''); }}>
              <X className="h-3 w-3 mr-1" /> Clear
            </Button>
          )}
        </div>

        {/* Desktop Table */}
        <div className="border rounded-lg overflow-x-auto hidden md:block">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 text-xs">JC #</th>
                <th className="text-left p-3 text-xs">Customer</th>
                <th className="text-left p-3 text-xs">Device</th>
                <th className="text-left p-3 text-xs">Technician</th>
                <th className="text-center p-3 text-xs">Priority</th>
                <th className="text-center p-3 text-xs">Status</th>
                <th className="text-right p-3 text-xs">Amount</th>
                <th className="text-center p-3 text-xs">Payment</th>
                <th className="text-left p-3 text-xs">Date</th>
                <th className="text-center p-3 text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(j => (
                <tr key={j.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs font-bold text-primary">{j.booking_number}</td>
                  <td className="p-3">
                    <p className="text-xs font-medium">{j.customer_name}</p>
                    <p className="text-[10px] text-muted-foreground">{j.customer_phone}</p>
                  </td>
                  <td className="p-3 text-xs">
                    <p>{j.device_brand} {j.device_model}</p>
                    {j.device_serial && <p className="text-[10px] text-muted-foreground">S/N: {j.device_serial}</p>}
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{j.technician || '—'}</td>
                  <td className="p-3 text-center">
                    <Badge variant={j.priority === 'urgent' ? 'destructive' : j.priority === 'high' ? 'default' : 'outline'} className="text-[10px]">
                      {j.priority}
                    </Badge>
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant={STATUS_COLORS[j.status]} className="text-[10px]">
                      {STATUS_LABELS[j.status] || j.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <p className="text-xs font-bold">₹{(j.total_charge || 0).toLocaleString('en-IN')}</p>
                    {j.gst_enabled ? <p className="text-[10px] text-muted-foreground">+GST</p> : null}
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant={j.payment_status === 'paid' ? 'default' : 'secondary'} className="text-[10px]">
                      {j.payment_status}
                    </Badge>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">
                    {new Date(j.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1 justify-center">
                      <Button size="icon" variant="ghost" className="h-7 w-7" title="View Invoice"
                        onClick={() => window.open(`/api/invoice/${j.booking_number}`, '_blank')}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" title="Send WhatsApp"
                        onClick={() => sendWhatsApp(j)}>
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" title="Edit"
                        onClick={() => openEdit(j)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" title="Delete"
                        onClick={() => deleteJob(j.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={10} className="p-10 text-center text-muted-foreground text-xs">No job cards found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-2">
          {filtered.map(j => (
            <div key={j.id} className="border rounded-lg p-3 bg-card space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs font-bold text-primary">{j.booking_number}</p>
                  <p className="font-semibold text-sm">{j.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{j.customer_phone}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant={STATUS_COLORS[j.status] as any} className="text-[10px]">{STATUS_LABELS[j.status]}</Badge>
                  <Badge variant={j.priority === 'urgent' ? 'destructive' : 'outline'} className="text-[10px]">{j.priority}</Badge>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{j.device_brand} {j.device_model} {j.technician ? `• ${j.technician}` : ''}</div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">₹{(j.total_charge || 0).toLocaleString('en-IN')}</p>
                  <Badge variant={j.payment_status === 'paid' ? 'default' : 'secondary'} className="text-[10px]">{j.payment_status}</Badge>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => window.open(`/api/invoice/${j.booking_number}`, '_blank')}><ExternalLink className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => sendWhatsApp(j)}><Send className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(j)}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => deleteJob(j.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
          {!filtered.length && <p className="text-center text-muted-foreground text-xs py-10">No job cards found</p>}
        </div>

        {/* Job Card Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit' : 'New'} Job Card</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Customer */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Customer</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Name *</Label><Input className="mt-1 h-9" value={form.customer_name} onChange={e => setForm((f: any) => ({ ...f, customer_name: e.target.value }))} /></div>
                  <div><Label className="text-xs">Phone *</Label><Input className="mt-1 h-9" value={form.customer_phone} onChange={e => setForm((f: any) => ({ ...f, customer_phone: e.target.value }))} /></div>
                  <div className="col-span-2"><Label className="text-xs">Email</Label><Input className="mt-1 h-9" value={form.customer_email} onChange={e => setForm((f: any) => ({ ...f, customer_email: e.target.value }))} /></div>
                </div>
              </div>

              {/* Device */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Device</p>
                <div className="grid grid-cols-3 gap-3">
                  <div><Label className="text-xs">Brand</Label><Input className="mt-1 h-9" value={form.device_brand} onChange={e => setForm((f: any) => ({ ...f, device_brand: e.target.value }))} placeholder="Dell, HP, Apple..." /></div>
                  <div><Label className="text-xs">Model</Label><Input className="mt-1 h-9" value={form.device_model} onChange={e => setForm((f: any) => ({ ...f, device_model: e.target.value }))} placeholder="Latitude 5490..." /></div>
                  <div><Label className="text-xs">Serial No.</Label><Input className="mt-1 h-9" value={form.device_serial} onChange={e => setForm((f: any) => ({ ...f, device_serial: e.target.value }))} placeholder="SN123..." /></div>
                </div>
                <div className="mt-3"><Label className="text-xs">Issue Description</Label><Textarea className="mt-1" rows={2} value={form.issue_description} onChange={e => setForm((f: any) => ({ ...f, issue_description: e.target.value }))} placeholder="Describe the problem..." /></div>
              </div>

              {/* Assignment */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Assignment</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div><Label className="text-xs">Priority</Label>
                    <Select value={form.priority} onValueChange={v => setForm((f: any) => ({ ...f, priority: v }))}>
                      <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🟢 Low</SelectItem>
                        <SelectItem value="normal">🔵 Normal</SelectItem>
                        <SelectItem value="high">🟠 High</SelectItem>
                        <SelectItem value="urgent">🔴 Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Status</Label>
                    <Select value={form.status} onValueChange={v => setForm((f: any) => ({ ...f, status: v }))}>
                      <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">⏳ Pending</SelectItem>
                        <SelectItem value="in_progress">🔧 In Progress</SelectItem>
                        <SelectItem value="completed">✅ Completed</SelectItem>
                        <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Technician</Label>
                    <Select value={form.technician || '__none'} onValueChange={v => setForm((f: any) => ({ ...f, technician: v === '__none' ? '' : v }))}>
                      <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Assign" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">Unassigned</SelectItem>
                        {staff.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Branch</Label>
                    <Select value={form.branch_id || '__none'} onValueChange={v => setForm((f: any) => ({ ...f, branch_id: v === '__none' ? '' : v }))}>
                      <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">—</SelectItem>
                        {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div>
                <Label className="text-xs">Diagnosis / Work Done</Label>
                <Textarea className="mt-1" rows={2} value={form.diagnosis} onChange={e => setForm((f: any) => ({ ...f, diagnosis: e.target.value }))} placeholder="What was found and fixed..." />
              </div>

              {/* Parts Used */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Parts Used</p>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addPart}><Plus className="h-3 w-3 mr-1" /> Add Part</Button>
                </div>
                {form.parts_used.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2 border rounded-lg">No parts added</p>
                )}
                <div className="space-y-2">
                  {form.parts_used.map((p: any, i: number) => (
                    <div key={i} className="grid grid-cols-12 gap-1 items-center">
                      <Input className="col-span-5 h-8 text-xs" placeholder="Part name" value={p.name} onChange={e => setPart(i, 'name', e.target.value)} />
                      <Input type="number" className="col-span-2 h-8 text-xs" placeholder="Qty" value={p.qty} onChange={e => setPart(i, 'qty', Number(e.target.value))} />
                      <Input type="number" className="col-span-3 h-8 text-xs" placeholder="Price" value={p.price} onChange={e => setPart(i, 'price', Number(e.target.value))} />
                      <span className="col-span-1 text-xs text-right font-medium">₹{((p.qty || 1) * (p.price || 0)).toLocaleString('en-IN')}</span>
                      <Button size="icon" variant="ghost" className="col-span-1 h-7 w-7 text-destructive" onClick={() => removePart(i)}><X className="h-3 w-3" /></Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Charges */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Charges</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Labour Charge (₹)</Label><Input type="number" className="mt-1 h-9" value={form.labour_charge} onChange={e => setForm((f: any) => ({ ...f, labour_charge: Number(e.target.value) }))} /></div>
                  <div><Label className="text-xs">Parts Charge (₹) <span className="text-muted-foreground">(auto)</span></Label><Input type="number" className="mt-1 h-9" value={form.parts_charge} onChange={e => setForm((f: any) => ({ ...f, parts_charge: Number(e.target.value) }))} /></div>
                </div>
                <div className="flex items-center justify-between mt-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="gst" checked={!!form.gst_enabled} onChange={e => setForm((f: any) => ({ ...f, gst_enabled: e.target.checked ? 1 : 0 }))} className="h-4 w-4" />
                    <label htmlFor="gst" className="text-xs cursor-pointer">Add GST 18% (CGST 9% + SGST 9%)</label>
                  </div>
                  <p className="text-sm font-black">Total: ₹{totalWithGST.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Payment */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Payment</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Payment Status</Label>
                    <Select value={form.payment_status} onValueChange={v => setForm((f: any) => ({ ...f, payment_status: v }))}>
                      <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">⏳ Pending</SelectItem>
                        <SelectItem value="partial">🔶 Partial</SelectItem>
                        <SelectItem value="paid">✅ Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label className="text-xs">Payment Method</Label>
                    <Select value={form.payment_method || '__none'} onValueChange={v => setForm((f: any) => ({ ...f, payment_method: v === '__none' ? '' : v }))}>
                      <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none">—</SelectItem>
                        <SelectItem value="Cash">💵 Cash</SelectItem>
                        <SelectItem value="upi">📱 UPI</SelectItem>
                        <SelectItem value="debit_card">💳 Debit Card</SelectItem>
                        <SelectItem value="credit_card">💳 Credit Card</SelectItem>
                        <SelectItem value="net_banking">🏦 Net Banking</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label className="text-xs">Internal Notes</Label>
                <Textarea className="mt-1" rows={2} value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} placeholder="Any internal notes..." />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={save}>💾 Save Job Card</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
}
