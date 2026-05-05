import { useState, useEffect } from "react";
import ERPLayout from "@/components/ERPLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Building2, Plus, Edit, MapPin, Phone, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const req = (method: string, path: string, body?: any) =>
  fetch(`/api/erp${path}`, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` }, ...(body ? { body: JSON.stringify(body) } : {}) }).then(r => r.json());

const emptyForm = { name: '', address: '', phone: '', manager: '', is_active: 1 };

export default function AdminBranches() {
  const [branches, setBranches] = useState<any[]>([]);
  const [stats, setStats] = useState<Record<string, any>>({});
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const d = await req('GET', '/branches');
    const branches = Array.isArray(d) ? d : [];
    setBranches(branches);
    const statsMap: Record<string, any> = {};
    await Promise.all(branches.map(async (b: any) => {
      const s = await req('GET', `/branches/${b.id}/stats`);
      statsMap[b.id] = s;
    }));
    setStats(statsMap);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name) return toast.error('Name required');
    if (editingId) await req('PUT', `/branches/${editingId}`, form);
    else await req('POST', '/branches', form);
    toast.success('Branch saved!'); setOpen(false); load();
  };

  return (
    <ERPLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Branch Management</h1>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={load} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
            <Button size="sm" onClick={() => { setForm(emptyForm); setEditingId(null); setOpen(true); }}><Plus className="h-4 w-4 mr-1" /> Add Branch</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {branches.map(b => {
            const s = stats[b.id] || {};
            return (
              <Card key={b.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold">{b.name}</h3>
                      <Badge variant={b.is_active ? 'default' : 'secondary'} className="text-[10px] mt-0.5">{b.is_active ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setForm({ ...emptyForm, ...b }); setEditingId(b.id); setOpen(true); }}><Edit className="h-3.5 w-3.5" /></Button>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground mb-3">
                    <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {b.address}</p>
                    <p className="flex items-center gap-1"><Phone className="h-3 w-3" /> {b.phone}</p>
                    {b.manager && <p>👤 Manager: {b.manager}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 border-t pt-3">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Orders</p>
                      <p className="font-bold text-sm">{s.orders || 0}</p>
                      <p className="text-[10px] text-green-600">₹{(s.orderRevenue || 0).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Service Jobs</p>
                      <p className="font-bold text-sm">{s.jobs || 0}</p>
                      <p className="text-[10px] text-green-600">₹{(s.jobRevenue || 0).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {!branches.length && <p className="text-sm text-muted-foreground col-span-2 text-center py-8">No branches found</p>}
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>{editingId ? 'Edit' : 'Add'} Branch</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Branch Name *</Label><Input className="mt-1 h-9" value={form.name} onChange={e => setForm((f:any) => ({...f, name: e.target.value}))} /></div>
              <div><Label className="text-xs">Address</Label><Input className="mt-1 h-9" value={form.address} onChange={e => setForm((f:any) => ({...f, address: e.target.value}))} /></div>
              <div><Label className="text-xs">Phone</Label><Input className="mt-1 h-9" value={form.phone} onChange={e => setForm((f:any) => ({...f, phone: e.target.value}))} /></div>
              <div><Label className="text-xs">Manager</Label><Input className="mt-1 h-9" value={form.manager} onChange={e => setForm((f:any) => ({...f, manager: e.target.value}))} /></div>
              <div className="flex items-center gap-2"><Switch checked={!!form.is_active} onCheckedChange={v => setForm((f:any) => ({...f, is_active: v ? 1 : 0}))} /><Label className="text-xs">Active</Label></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
}
