import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardList, Plus, Edit, Trash2, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

const req = (method: string, path: string, body?: any) =>
  fetch(`/api/erp${path}`, {
    method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
    ...(body ? { body: JSON.stringify(body) } : {})
  }).then(r => r.json());

const statusColors: Record<string, string> = {
  pending: 'secondary', in_progress: 'default', completed: 'outline', cancelled: 'destructive'
};

const emptyForm = {
  customer_name: '', customer_phone: '', customer_email: '',
  service_name: 'General Repair', device_brand: '', device_model: '',
  issue_description: '', priority: 'normal', technician: '',
  diagnosis: '', parts_used: [], labour_charge: 0, parts_charge: 0,
  status: 'pending', payment_status: 'pending', payment_method: '', notes: '',
  branch_id: '',
};

export default function AdminJobCards() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [staff, setStaff] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    const data = await req('GET', '/job-cards');
    setJobs(Array.isArray(data) ? data : []);
    const s = await req('GET', '/staff');
    setStaff(Array.isArray(s) ? s : []);
    const b = await req('GET', '/branches');
    const branchList = Array.isArray(b) ? b : [];
    setBranches(branchList);
    setForm((f: any) => ({ ...f, branch_id: f.branch_id || branchList[0]?.id || '' }));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = jobs.filter(j =>
    (statusFilter === 'all' || j.status === statusFilter) &&
    (j.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
     j.booking_number?.includes(search) ||
     j.device_brand?.toLowerCase().includes(search.toLowerCase()))
  );

  const save = async () => {
    if (!form.customer_name || !form.customer_phone) return toast.error('Name and phone required');
    if (editingId) await req('PUT', `/job-cards/${editingId}`, form);
    else await req('POST', '/job-cards', form);
    toast.success(editingId ? 'Job card updated!' : 'Job card created!');
    setDialogOpen(false); load();
  };

  const openEdit = (j: any) => { setForm({ ...emptyForm, ...j }); setEditingId(j.id); setDialogOpen(true); };
  const openAdd = () => { setForm(emptyForm); setEditingId(null); setDialogOpen(true); };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-xl font-black flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary" /> Job Cards</h1>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={load} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
            <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> New Job Card</Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-8 h-8 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {['all','pending','in_progress','completed','cancelled'].map(s => (
            <Button key={s} size="sm" variant={statusFilter === s ? 'default' : 'outline'} className="h-8 text-xs" onClick={() => setStatusFilter(s)}>
              {s === 'all' ? 'All' : s.replace('_', ' ')} ({s === 'all' ? jobs.length : jobs.filter(j => j.status === s).length})
            </Button>
          ))}
        </div>

        {/* Job Cards Table */}
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>
              <th className="text-left p-3 text-xs">JC #</th>
              <th className="text-left p-3 text-xs">Customer</th>
              <th className="text-left p-3 text-xs">Device</th>
              <th className="text-left p-3 text-xs">Technician</th>
              <th className="text-center p-3 text-xs">Priority</th>
              <th className="text-center p-3 text-xs">Status</th>
              <th className="text-right p-3 text-xs">Amount</th>
              <th className="text-center p-3 text-xs">Payment</th>
              <th className="text-center p-3 text-xs">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(j => (
                <tr key={j.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs font-bold">{j.booking_number}</td>
                  <td className="p-3"><p className="text-xs font-medium">{j.customer_name}</p><p className="text-[10px] text-muted-foreground">{j.customer_phone}</p></td>
                  <td className="p-3 text-xs">{j.device_brand} {j.device_model}</td>
                  <td className="p-3 text-xs text-muted-foreground">{j.technician || '-'}</td>
                  <td className="p-3 text-center"><Badge variant={j.priority === 'urgent' ? 'destructive' : 'outline'} className="text-[10px]">{j.priority}</Badge></td>
                  <td className="p-3 text-center"><Badge variant={statusColors[j.status] as any} className="text-[10px]">{j.status?.replace('_',' ')}</Badge></td>
                  <td className="p-3 text-right text-xs font-bold">₹{(j.total_charge || 0).toLocaleString('en-IN')}</td>
                  <td className="p-3 text-center"><Badge variant={j.payment_status === 'paid' ? 'default' : 'secondary'} className="text-[10px]">{j.payment_status}</Badge></td>
                  <td className="p-3 text-center">
                    <div className="flex gap-1 justify-center">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(j)}><Edit className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={async () => { await req('DELETE', `/job-cards/${j.id}`); load(); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={9} className="p-8 text-center text-muted-foreground text-xs">No job cards found</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingId ? 'Edit' : 'New'} Job Card</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Customer Name *</Label><Input className="mt-1 h-9" value={form.customer_name} onChange={e => setForm((f:any) => ({...f, customer_name: e.target.value}))} /></div>
                <div><Label className="text-xs">Phone *</Label><Input className="mt-1 h-9" value={form.customer_phone} onChange={e => setForm((f:any) => ({...f, customer_phone: e.target.value}))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Device Brand</Label><Input className="mt-1 h-9" value={form.device_brand} onChange={e => setForm((f:any) => ({...f, device_brand: e.target.value}))} placeholder="Dell, HP, Apple..." /></div>
                <div><Label className="text-xs">Device Model</Label><Input className="mt-1 h-9" value={form.device_model} onChange={e => setForm((f:any) => ({...f, device_model: e.target.value}))} placeholder="Latitude E7470..." /></div>
              </div>
              <div><Label className="text-xs">Issue Description</Label><Textarea className="mt-1" rows={2} value={form.issue_description} onChange={e => setForm((f:any) => ({...f, issue_description: e.target.value}))} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><Label className="text-xs">Priority</Label>
                  <Select value={form.priority} onValueChange={v => setForm((f:any) => ({...f, priority: v}))}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Status</Label>
                  <Select value={form.status} onValueChange={v => setForm((f:any) => ({...f, status: v}))}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Technician</Label>
                  <Select value={form.technician || 'none'} onValueChange={v => setForm((f:any) => ({...f, technician: v === 'none' ? '' : v}))}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Assign" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Unassigned</SelectItem>
                      {staff.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label className="text-xs">Branch</Label>
                <Select value={form.branch_id || ''} onValueChange={v => setForm((f:any) => ({...f, branch_id: v}))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Diagnosis</Label><Textarea className="mt-1" rows={2} value={form.diagnosis} onChange={e => setForm((f:any) => ({...f, diagnosis: e.target.value}))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Labour Charge (₹)</Label><Input type="number" className="mt-1 h-9" value={form.labour_charge} onChange={e => setForm((f:any) => ({...f, labour_charge: Number(e.target.value)}))} /></div>
                <div><Label className="text-xs">Parts Charge (₹)</Label><Input type="number" className="mt-1 h-9" value={form.parts_charge} onChange={e => setForm((f:any) => ({...f, parts_charge: Number(e.target.value)}))} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Payment Status</Label>
                  <Select value={form.payment_status} onValueChange={v => setForm((f:any) => ({...f, payment_status: v}))}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Payment Method</Label>
                  <Select value={form.payment_method || 'none'} onValueChange={v => setForm((f:any) => ({...f, payment_method: v === 'none' ? '' : v}))}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label className="text-xs">Notes</Label><Textarea className="mt-1" rows={2} value={form.notes} onChange={e => setForm((f:any) => ({...f, notes: e.target.value}))} /></div>
              <div className="bg-muted/50 rounded-lg p-3 text-sm font-bold text-right">
                Total: ₹{((form.labour_charge || 0) + (form.parts_charge || 0)).toLocaleString('en-IN')}
              </div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
