import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, Plus, Edit, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const req = (method: string, path: string, body?: any) =>
  fetch(`/api/erp${path}`, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` }, ...(body ? { body: JSON.stringify(body) } : {}) }).then(r => r.json());

const emptyForm = { name: '', role: '', phone: '', email: '', salary: 0, joining_date: '', address: '', is_active: 1 };

export default function AdminStaff() {
  const [staff, setStaff] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [loading, setLoading] = useState(false);

  const load = async () => { setLoading(true); const d = await req('GET', '/staff'); setStaff(Array.isArray(d) ? d : []); setLoading(false); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name) return toast.error('Name required');
    if (editingId) await req('PUT', `/staff/${editingId}`, form);
    else await req('POST', '/staff', form);
    toast.success('Staff saved!'); setOpen(false); load();
  };

  const openEdit = (s: any) => { setForm({ ...emptyForm, ...s }); setEditingId(s.id); setOpen(true); };
  const openAdd = () => { setForm(emptyForm); setEditingId(null); setOpen(true); };

  const totalSalary = staff.reduce((s, e) => s + (e.salary || 0), 0);

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black flex items-center gap-2"><UserCheck className="h-5 w-5 text-primary" /> Staff Management</h1>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={load} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
            <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add Staff</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="border rounded-lg p-4"><p className="text-xs text-muted-foreground">Total Staff</p><p className="text-2xl font-black text-primary">{staff.length}</p></div>
          <div className="border rounded-lg p-4"><p className="text-xs text-muted-foreground">Monthly Salary</p><p className="text-2xl font-black">₹{totalSalary.toLocaleString('en-IN')}</p></div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {staff.map(s => (
            <div key={s.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-sm">{s.name}</p>
                  <Badge variant="outline" className="text-[10px] mt-0.5">{s.role || 'Staff'}</Badge>
                  <p className="text-xs text-muted-foreground mt-1">{s.phone} {s.email && `• ${s.email}`}</p>
                  <p className="text-xs font-semibold text-primary mt-1">₹{(s.salary || 0).toLocaleString('en-IN')}/month</p>
                  {s.joining_date && <p className="text-[10px] text-muted-foreground">Joined: {s.joining_date}</p>}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(s)}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={async () => { await req('DELETE', `/staff/${s.id}`); load(); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
          {!staff.length && <p className="text-sm text-muted-foreground col-span-2 text-center py-8">No staff added yet</p>}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>{editingId ? 'Edit' : 'Add'} Staff</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Name *</Label><Input className="mt-1 h-9" value={form.name} onChange={e => setForm((f:any) => ({...f, name: e.target.value}))} /></div>
              <div><Label className="text-xs">Role</Label>
                <Select value={form.role || 'none'} onValueChange={v => setForm((f:any) => ({...f, role: v === 'none' ? '' : v}))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">-</SelectItem>
                    <SelectItem value="Technician">Technician</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Accountant">Accountant</SelectItem>
                    <SelectItem value="Helper">Helper</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Phone</Label><Input className="mt-1 h-9" value={form.phone} onChange={e => setForm((f:any) => ({...f, phone: e.target.value}))} /></div>
                <div><Label className="text-xs">Salary (₹/month)</Label><Input type="number" className="mt-1 h-9" value={form.salary || ''} onChange={e => setForm((f:any) => ({...f, salary: Number(e.target.value)}))} /></div>
              </div>
              <div><Label className="text-xs">Email</Label><Input className="mt-1 h-9" value={form.email} onChange={e => setForm((f:any) => ({...f, email: e.target.value}))} /></div>
              <div><Label className="text-xs">Joining Date</Label><Input type="date" className="mt-1 h-9" value={form.joining_date} onChange={e => setForm((f:any) => ({...f, joining_date: e.target.value}))} /></div>
              <div><Label className="text-xs">Address</Label><Input className="mt-1 h-9" value={form.address} onChange={e => setForm((f:any) => ({...f, address: e.target.value}))} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
