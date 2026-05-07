import { useState, useEffect } from "react";
import ERPLayout from "@/components/ERPLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UserCheck, Plus, Edit, Trash2, RefreshCw, Search, Printer, Phone, Mail, IndianRupee, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const req = (method: string, path: string, body?: any) =>
  fetch(`/api/erp${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then(r => r.json());

const ROLES = ['Technician', 'Sales', 'Manager', 'Accountant', 'Helper', 'Receptionist', 'Driver'];

const emptyForm = { name: '', role: '', phone: '', email: '', salary: 0, joining_date: '', address: '', is_active: 1 };

const ROLE_COLORS: Record<string, string> = {
  Technician: 'bg-blue-100 text-blue-700',
  Sales: 'bg-green-100 text-green-700',
  Manager: 'bg-purple-100 text-purple-700',
  Accountant: 'bg-yellow-100 text-yellow-700',
  Helper: 'bg-gray-100 text-gray-700',
  Receptionist: 'bg-pink-100 text-pink-700',
  Driver: 'bg-orange-100 text-orange-700',
};

export default function AdminStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [slipMonth, setSlipMonth] = useState(new Date().toISOString().slice(0, 7));
  const [commissions, setCommissions] = useState<any[]>([]);
  const [commSummary, setCommSummary] = useState<any[]>([]);
  const [commForm, setCommForm] = useState({ staff_id: '', staff_name: '', reference_type: 'manual', amount: 0, rate: 0, notes: '' });
  const [commDialog, setCommDialog] = useState(false);

  const load = async () => {
    setLoading(true);
    const [active, inactive, c, cs] = await Promise.all([
      req('GET', '/staff'),
      req('GET', '/staff?include_inactive=1'),
      req('GET', '/commissions'),
      req('GET', '/commissions/summary'),
    ]);
    const all = Array.isArray(inactive) ? inactive : (Array.isArray(active) ? active : []);
    setStaff(all);
    setCommissions(Array.isArray(c) ? c : []);
    setCommSummary(Array.isArray(cs) ? cs : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = staff.filter(s => {
    const matchSearch = !search ||
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.role?.toLowerCase().includes(search.toLowerCase()) ||
      s.phone?.includes(search);
    const matchActive = showInactive ? true : s.is_active !== 0;
    return matchSearch && matchActive;
  });

  const activeStaff = staff.filter(s => s.is_active !== 0);
  const totalSalary = activeStaff.reduce((s, e) => s + (e.salary || 0), 0);

  const save = async () => {
    if (!form.name) return toast.error('Name required');
    try {
      if (editingId) await req('PUT', `/staff/${editingId}`, form);
      else await req('POST', '/staff', form);
      toast.success(editingId ? 'Staff updated!' : 'Staff added!');
      setOpen(false); load();
    } catch { toast.error('Failed to save'); }
  };

  const toggleActive = async (s: any) => {
    await req('PUT', `/staff/${s.id}`, { ...s, is_active: s.is_active ? 0 : 1 });
    toast.success(s.is_active ? 'Marked inactive' : 'Marked active');
    load();
  };

  const del = async (id: string) => {
    if (!confirm('Delete this staff member?')) return;
    await req('DELETE', `/staff/${id}`);
    toast.success('Deleted'); load();
  };

  const printSalarySlip = (s: any) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const [year, month] = slipMonth.split('-');
    const monthName = new Date(Number(year), Number(month) - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Salary Slip — ${s.name}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;padding:40px;max-width:680px;margin:0 auto;color:#333}
  .hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #FF8000;padding-bottom:16px;margin-bottom:20px}
  .brand h1{color:#FF8000;font-size:20px;font-weight:800}
  .brand p{font-size:11px;color:#666;margin-top:2px}
  .slip-title{text-align:right}
  .slip-title h2{font-size:16px;font-weight:700;color:#333}
  .slip-title p{font-size:12px;color:#666}
  .emp-box{background:#fafafa;border:1px solid #eee;border-radius:8px;padding:14px;margin-bottom:20px;display:grid;grid-template-columns:1fr 1fr;gap:8px}
  .emp-box p{font-size:12px;color:#555}
  .emp-box strong{color:#111}
  table{width:100%;border-collapse:collapse;margin-bottom:16px}
  th{background:#FF8000;color:#fff;padding:9px 12px;text-align:left;font-size:12px}
  td{padding:9px 12px;font-size:12px;border-bottom:1px solid #f0f0f0}
  .net{background:#fff8f0;font-weight:800;font-size:14px;color:#FF8000}
  .footer{margin-top:32px;display:flex;justify-content:space-between;font-size:11px;color:#aaa;border-top:1px solid #eee;padding-top:12px}
  @media print{button{display:none}}
</style></head><body>
<div class="hdr">
  <div class="brand">
    <h1>💻 AI Laptop Wala</h1>
    <p>Asati Infotech | Silver Mall, Indore</p>
    <p>GSTIN: 23ATNPA4415H1Z2</p>
  </div>
  <div class="slip-title">
    <h2>SALARY SLIP</h2>
    <p>${monthName}</p>
  </div>
</div>
<div class="emp-box">
  <p><strong>${s.name}</strong></p>
  <p>Role: <strong>${s.role || 'Staff'}</strong></p>
  <p>Phone: ${s.phone || '—'}</p>
  <p>Email: ${s.email || '—'}</p>
  <p>Joining: ${s.joining_date || '—'}</p>
  <p>Status: <strong style="color:${s.is_active ? '#2e7d32' : '#c62828'}">${s.is_active ? 'Active' : 'Inactive'}</strong></p>
</div>
<table>
  <tr><th>Earnings</th><th>Amount</th></tr>
  <tr><td>Basic Salary</td><td>₹${(s.salary || 0).toLocaleString('en-IN')}</td></tr>
  <tr><td>HRA (0%)</td><td>₹0</td></tr>
  <tr><td>Other Allowances</td><td>₹0</td></tr>
  <tr class="net"><td>Gross Salary</td><td>₹${(s.salary || 0).toLocaleString('en-IN')}</td></tr>
</table>
<table>
  <tr><th>Deductions</th><th>Amount</th></tr>
  <tr><td>PF (0%)</td><td>₹0</td></tr>
  <tr><td>TDS</td><td>₹0</td></tr>
  <tr class="net"><td>Net Payable</td><td>₹${(s.salary || 0).toLocaleString('en-IN')}</td></tr>
</table>
<div class="footer">
  <p>Generated: ${new Date().toLocaleDateString('en-IN')}</p>
  <p>This is a computer-generated salary slip.</p>
</div>
<br><button onclick="window.print()" style="background:#FF8000;color:#fff;border:none;padding:10px 24px;border-radius:6px;cursor:pointer;font-size:13px">🖨️ Print Salary Slip</button>
</body></html>`);
    win.document.close();
  };

  return (
    <ERPLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-xl font-black flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" /> Staff Management
          </h1>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button size="sm" onClick={() => { setForm(emptyForm); setEditingId(null); setOpen(true); }}>
              <Plus className="h-4 w-4 mr-1" /> Add Staff
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          <div className="border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Active Staff</p>
            <p className="text-2xl font-black text-primary">{activeStaff.length}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Monthly Salary</p>
            <p className="text-2xl font-black">₹{totalSalary.toLocaleString('en-IN')}</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">Avg Salary</p>
            <p className="text-2xl font-black text-orange-600">
              ₹{activeStaff.length ? Math.round(totalSalary / activeStaff.length).toLocaleString('en-IN') : 0}
            </p>
          </div>
        </div>

        {/* Filters */}
        <Tabs defaultValue="staff">
          <TabsList className="h-9">
            <TabsTrigger value="staff" className="gap-1.5"><UserCheck className="h-3.5 w-3.5" /> Staff ({activeStaff.length})</TabsTrigger>
            <TabsTrigger value="commission" className="gap-1.5"><IndianRupee className="h-3.5 w-3.5" /> Commission ({commissions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="staff" className="space-y-4 mt-4">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search name, role, phone..." className="pl-8 h-8 text-sm"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={showInactive} onCheckedChange={setShowInactive} />
            <span className="text-xs text-muted-foreground">Show Inactive</span>
          </div>
          {/* Salary slip month picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Slip Month:</span>
            <Input type="month" className="h-8 text-xs w-36" value={slipMonth} onChange={e => setSlipMonth(e.target.value)} />
          </div>
        </div>

        {/* Staff Cards */}
        <div className="grid md:grid-cols-2 gap-3">
          {filtered.map(s => (
            <div key={s.id} className={`border rounded-lg p-4 transition-all ${!s.is_active ? 'opacity-50 bg-muted/30' : 'hover:shadow-md'}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-sm">{s.name}</p>
                    {!s.is_active && <Badge variant="secondary" className="text-[10px]">Inactive</Badge>}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${ROLE_COLORS[s.role] || 'bg-gray-100 text-gray-700'}`}>
                    {s.role || 'Staff'}
                  </span>
                  <div className="mt-2 space-y-0.5">
                    {s.phone && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{s.phone}</p>}
                    {s.email && <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{s.email}</p>}
                    <p className="text-xs font-semibold text-primary">₹{(s.salary || 0).toLocaleString('en-IN')}/month</p>
                    {s.joining_date && <p className="text-[10px] text-muted-foreground">Joined: {s.joining_date}</p>}
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" title="Salary Slip"
                      onClick={() => printSalarySlip(s)}>
                      <Printer className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7"
                      onClick={() => { setForm({ ...emptyForm, ...s }); setEditingId(s.id); setOpen(true); }}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive"
                      onClick={() => del(s.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-[10px] text-muted-foreground">{s.is_active ? 'Active' : 'Inactive'}</span>
                    <Switch checked={!!s.is_active} onCheckedChange={() => toggleActive(s)} />
                  </div>
                </div>
              </div>
            </div>
          ))}
          {!filtered.length && (
            <p className="text-sm text-muted-foreground col-span-2 text-center py-10">No staff found</p>
          )}
        </div>
          </TabsContent>

          {/* Commission Tab */}
          <TabsContent value="commission" className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{commissions.length} commission entries</p>
              <Button size="sm" onClick={() => { setCommForm({ staff_id: '', staff_name: '', reference_type: 'manual', amount: 0, rate: 0, notes: '' }); setCommDialog(true); }} className="gap-1.5">
                <Plus className="h-4 w-4" /> Add Commission
              </Button>
            </div>

            {/* Summary */}
            {commSummary.length > 0 && (
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr>
                    <th className="text-left p-3 text-xs font-semibold">Staff</th>
                    <th className="text-right p-3 text-xs font-semibold text-green-600">Total</th>
                    <th className="text-right p-3 text-xs font-semibold text-orange-600">Pending</th>
                    <th className="text-right p-3 text-xs font-semibold text-blue-600">Paid</th>
                    <th className="text-center p-3 text-xs font-semibold">Entries</th>
                  </tr></thead>
                  <tbody>
                    {commSummary.map((s: any) => (
                      <tr key={s.staff_id} className="border-t hover:bg-muted/30">
                        <td className="p-3 font-medium">{s.staff_name}</td>
                        <td className="p-3 text-right font-bold text-green-600">₹{(s.total || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-bold text-orange-600">₹{(s.pending || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right font-bold text-blue-600">₹{(s.paid || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3 text-center">{s.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Commission list */}
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr>
                  <th className="text-left p-3 text-xs font-semibold">Staff</th>
                  <th className="text-left p-3 text-xs font-semibold">Type</th>
                  <th className="text-right p-3 text-xs font-semibold">Amount</th>
                  <th className="text-center p-3 text-xs font-semibold">Status</th>
                  <th className="text-left p-3 text-xs font-semibold">Date</th>
                  <th className="text-center p-3 text-xs font-semibold">Action</th>
                </tr></thead>
                <tbody>
                  {commissions.map((c: any) => (
                    <tr key={c.id} className="border-t hover:bg-muted/30">
                      <td className="p-3 font-medium">{c.staff_name}</td>
                      <td className="p-3 text-sm text-muted-foreground capitalize">{c.reference_type}</td>
                      <td className="p-3 text-right font-bold text-green-600">₹{(c.amount || 0).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-center">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${c.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{c.status}</span>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                      <td className="p-3 text-center">
                        {c.status === 'pending' && (
                          <Button size="sm" className="h-7 text-xs gap-1 bg-green-600 hover:bg-green-700" onClick={async () => { await req('PATCH', `/commissions/${c.id}/pay`, {}); load(); }}>
                            <CheckCircle className="h-3 w-3" /> Pay
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!commissions.length && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No commissions yet</td></tr>}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>{editingId ? 'Edit' : 'Add'} Staff</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Name *</Label>
                <Input className="mt-1 h-9" value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} />
              </div>
              <div><Label className="text-xs">Role</Label>
                <Select value={form.role || '__none'} onValueChange={v => setForm((f: any) => ({ ...f, role: v === '__none' ? '' : v }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none">—</SelectItem>
                    {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Phone</Label>
                  <Input className="mt-1 h-9" value={form.phone} onChange={e => setForm((f: any) => ({ ...f, phone: e.target.value }))} />
                </div>
                <div><Label className="text-xs">Salary (₹/month)</Label>
                  <Input type="number" className="mt-1 h-9" value={form.salary || ''} onChange={e => setForm((f: any) => ({ ...f, salary: Number(e.target.value) }))} />
                </div>
              </div>
              <div><Label className="text-xs">Email</Label>
                <Input className="mt-1 h-9" value={form.email} onChange={e => setForm((f: any) => ({ ...f, email: e.target.value }))} />
              </div>
              <div><Label className="text-xs">Joining Date</Label>
                <Input type="date" className="mt-1 h-9" value={form.joining_date} onChange={e => setForm((f: any) => ({ ...f, joining_date: e.target.value }))} />
              </div>
              <div><Label className="text-xs">Address</Label>
                <Input className="mt-1 h-9" value={form.address} onChange={e => setForm((f: any) => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={!!form.is_active} onCheckedChange={v => setForm((f: any) => ({ ...f, is_active: v ? 1 : 0 }))} />
                <Label className="text-xs">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>💾 Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Commission Dialog */}
        <Dialog open={commDialog} onOpenChange={setCommDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Add Commission</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Staff *</Label>
                <Select value={commForm.staff_id} onValueChange={v => { const s = staff.find((x: any) => x.id === v); setCommForm(f => ({ ...f, staff_id: v, staff_name: s?.name || '' })); }}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select staff" /></SelectTrigger>
                  <SelectContent>{staff.filter((s: any) => s.is_active).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name} ({s.role})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Type</Label>
                <Select value={commForm.reference_type} onValueChange={v => setCommForm(f => ({ ...f, reference_type: v }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="sale">Sale</SelectItem>
                    <SelectItem value="lead_won">Lead Won</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Amount (₹) *</Label><Input type="number" className="mt-1 h-9" value={commForm.amount || ''} onChange={e => setCommForm(f => ({ ...f, amount: Number(e.target.value) }))} /></div>
                <div><Label className="text-xs">Rate (%)</Label><Input type="number" className="mt-1 h-9" value={commForm.rate || ''} onChange={e => setCommForm(f => ({ ...f, rate: Number(e.target.value) }))} /></div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCommDialog(false)}>Cancel</Button>
              <Button onClick={async () => {
                if (!commForm.staff_id || !commForm.amount) return toast.error('Staff and amount required');
                await req('POST', '/commissions', commForm);
                toast.success('Commission added!'); setCommDialog(false); load();
              }}>Add Commission</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
}
