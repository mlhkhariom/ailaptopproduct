import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, Plus, Edit, Trash2, RefreshCw, Search, Printer, Phone, Mail } from "lucide-react";
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

  const load = async () => {
    setLoading(true);
    // Fetch all (active + inactive)
    const [active, inactive] = await Promise.all([
      req('GET', '/staff'),
      req('GET', '/staff?include_inactive=1'),
    ]);
    const all = Array.isArray(inactive) ? inactive : (Array.isArray(active) ? active : []);
    setStaff(all);
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
    <AdminLayout>
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
      </div>
    </AdminLayout>
  );
}
