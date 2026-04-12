import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Tag, Copy, Percent, IndianRupee, RefreshCw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";

const emptyForm = { code: '', type: 'percentage', value: 10, min_order: 0, max_uses: '', expires_at: '', is_active: true };

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ ...emptyForm });

  const load = async () => {
    setLoading(true);
    try { setCoupons(await api.getCoupons()); } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const f = (k: string) => (e: any) => setForm((p: any) => ({ ...p, [k]: e.target.value }));

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm }); setDialog(true); };
  const openEdit = (c: any) => {
    setEditing(c);
    setForm({ code: c.code, type: c.type, value: c.value, min_order: c.min_order, max_uses: c.max_uses || '', expires_at: c.expires_at ? c.expires_at.split('T')[0] : '', is_active: !!c.is_active });
    setDialog(true);
  };

  const save = async () => {
    if (!form.code || !form.value) return toast.error('Code and value required');
    const payload = { ...form, value: Number(form.value), min_order: Number(form.min_order) || 0, max_uses: form.max_uses ? Number(form.max_uses) : null, expires_at: form.expires_at || null };
    try {
      if (editing) await api.updateCoupon(editing.id, payload);
      else await api.createCoupon(payload);
      toast.success(editing ? 'Updated!' : 'Coupon created!');
      setDialog(false); load();
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    await api.deleteCoupon(id); toast.success('Deleted'); load();
  };

  const toggleActive = async (c: any) => {
    await api.updateCoupon(c.id, { ...c, is_active: !c.is_active });
    load();
  };

  const copyCode = (code: string) => { navigator.clipboard.writeText(code); toast.success('Copied!'); };

  const stats = { total: coupons.length, active: coupons.filter(c => c.is_active).length, used: coupons.reduce((s, c) => s + (c.used_count || 0), 0) };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-serif font-bold">Coupons & Discounts</h1>
            <p className="text-sm text-muted-foreground">{stats.active} active · {stats.used} total uses</p>
          </div>
          <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={openAdd}><Plus className="h-3.5 w-3.5" /> Create Coupon</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Coupons', value: stats.total, icon: Tag },
            { label: 'Active', value: stats.active, icon: CheckCircle },
            { label: 'Total Uses', value: stats.used, icon: Percent },
          ].map(s => (
            <Card key={s.label}><CardContent className="p-3 text-center">
              <s.icon className="h-5 w-5 mx-auto text-primary mb-1" />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent></Card>
          ))}
        </div>

        {/* Coupons List */}
        {loading ? (
          <div className="text-center py-12"><RefreshCw className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map(c => (
              <Card key={c.id} className={`hover:shadow-md transition-shadow ${!c.is_active ? 'opacity-60' : ''}`}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <code className="text-base font-bold tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded">{c.code}</code>
                      <button onClick={() => copyCode(c.code)}><Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" /></button>
                    </div>
                    <Switch checked={!!c.is_active} onCheckedChange={() => toggleActive(c)} />
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={`gap-1 ${c.type === 'percentage' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {c.type === 'percentage' ? <Percent className="h-3 w-3" /> : <IndianRupee className="h-3 w-3" />}
                      {c.type === 'percentage' ? `${c.value}% OFF` : `₹${c.value} OFF`}
                    </Badge>
                    {c.min_order > 0 && <span className="text-xs text-muted-foreground">Min ₹{c.min_order}</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div><p className="font-medium text-foreground">{c.used_count || 0}{c.max_uses ? `/${c.max_uses}` : ''}</p><p>Uses</p></div>
                    <div><p className="font-medium text-foreground">{c.expires_at ? new Date(c.expires_at).toLocaleDateString('en-IN') : 'No expiry'}</p><p>Expires</p></div>
                  </div>

                  {c.expires_at && new Date(c.expires_at) < new Date() && (
                    <Badge variant="destructive" className="text-[10px]">Expired</Badge>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" className="flex-1 h-7 text-xs gap-1" onClick={() => openEdit(c)}><Edit className="h-3 w-3" /> Edit</Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {coupons.length === 0 && (
              <div className="col-span-3 text-center py-12 text-muted-foreground">
                <Tag className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No coupons yet</p>
                <Button size="sm" className="mt-3" onClick={openAdd}><Plus className="h-3.5 w-3.5 mr-1" /> Create First Coupon</Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editing ? 'Edit Coupon' : 'Create Coupon'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Coupon Code *</Label>
              <Input value={form.code} onChange={f('code')} className="mt-1 text-sm font-mono uppercase" placeholder="SAVE20"
                onInput={e => (e.currentTarget.value = e.currentTarget.value.toUpperCase())} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={form.type} onValueChange={v => setForm((p: any) => ({ ...p, type: v }))}>
                  <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="flat">Flat (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Value *</Label>
                <Input type="number" value={form.value} onChange={f('value')} className="mt-1 text-sm" placeholder={form.type === 'percentage' ? '10' : '100'} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Min Order (₹)</Label>
                <Input type="number" value={form.min_order} onChange={f('min_order')} className="mt-1 text-sm" placeholder="0" />
              </div>
              <div>
                <Label className="text-xs">Max Uses</Label>
                <Input type="number" value={form.max_uses} onChange={f('max_uses')} className="mt-1 text-sm" placeholder="Unlimited" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Expiry Date</Label>
              <Input type="date" value={form.expires_at} onChange={f('expires_at')} className="mt-1 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm((p: any) => ({ ...p, is_active: v }))} />
              <Label className="text-xs">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Update' : 'Create'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCoupons;
