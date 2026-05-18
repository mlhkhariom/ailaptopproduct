import { useState, useEffect } from "react";
import { Save, Wrench, Clock, Package, Users, IndianRupee, MapPin, Plus, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";

export default function ERPSettings() {
  const [s, setS] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('ailaptopwala_token');

  useEffect(() => {
    fetch('/api/app-settings').then(r => r.json()).then(d => { if (d && typeof d === 'object') setS(d); }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await fetch('/api/app-settings', { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(s) });
      toast.success('ERP Settings saved!');
    } catch { toast.error('Failed to save'); }
    setSaving(false);
  };

  const v = (key: string, fallback = '') => s[key] || fallback;
  const set = (key: string, val: string) => setS(p => ({ ...p, [key]: val }));

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><Wrench className="h-6 w-6" /> ERP Settings</h1>
            <p className="text-sm text-muted-foreground">Job cards, billing, inventory, staff, finance configuration</p>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All'}</Button>
        </div>

        <div className="space-y-6">

          {/* Job Card Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Job Card / Repair</CardTitle>
              <CardDescription>SLA timers, escalation, warranty defaults</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div><Label className="text-xs">Urgent SLA (hours)</Label><Input className="mt-1" type="number" value={v('sla_urgent', '24')} onChange={e => set('sla_urgent', e.target.value)} /></div>
              <div><Label className="text-xs">High SLA (hours)</Label><Input className="mt-1" type="number" value={v('sla_high', '48')} onChange={e => set('sla_high', e.target.value)} /></div>
              <div><Label className="text-xs">Normal SLA (hours)</Label><Input className="mt-1" type="number" value={v('sla_normal', '72')} onChange={e => set('sla_normal', e.target.value)} /></div>
              <div><Label className="text-xs">Low SLA (hours)</Label><Input className="mt-1" type="number" value={v('sla_low', '96')} onChange={e => set('sla_low', e.target.value)} /></div>
              <div><Label className="text-xs">Escalation after (hours)</Label><Input className="mt-1" type="number" value={v('escalation_hours', '48')} onChange={e => set('escalation_hours', e.target.value)} /></div>
              <div><Label className="text-xs">Default warranty (days)</Label><Input className="mt-1" type="number" value={v('default_warranty_days', '90')} onChange={e => set('default_warranty_days', e.target.value)} /></div>
              <div><Label className="text-xs">Job card number prefix</Label><Input className="mt-1" value={v('job_card_prefix', 'JC')} onChange={e => set('job_card_prefix', e.target.value)} /></div>
              <div><Label className="text-xs">Labour charge default (Rs)</Label><Input className="mt-1" type="number" value={v('default_labour_charge', '500')} onChange={e => set('default_labour_charge', e.target.value)} /></div>
              <div><Label className="text-xs">Auto-notify customer on status</Label>
                <div className="mt-2"><Switch checked={v('job_notify_customer') !== '0'} onCheckedChange={c => set('job_notify_customer', c ? '1' : '0')} /></div>
              </div>
            </CardContent>
          </Card>

          {/* Billing & Invoice */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><IndianRupee className="h-4 w-4" /> Billing & Invoice</CardTitle>
              <CardDescription>GST, invoice format, recurring settings</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div><Label className="text-xs">GSTIN</Label><Input className="mt-1" value={v('gstin')} onChange={e => set('gstin', e.target.value)} placeholder="23XXXXX1234X1ZX" /></div>
              <div><Label className="text-xs">Default GST rate (%)</Label><Input className="mt-1" type="number" value={v('default_gst_rate', '18')} onChange={e => set('default_gst_rate', e.target.value)} /></div>
              <div><Label className="text-xs">Invoice prefix</Label><Input className="mt-1" value={v('invoice_prefix', 'INV-')} onChange={e => set('invoice_prefix', e.target.value)} /></div>
              <div><Label className="text-xs">Invoice footer text</Label><Input className="mt-1" value={v('invoice_footer')} onChange={e => set('invoice_footer', e.target.value)} placeholder="Thank you for your business!" /></div>
              <div><Label className="text-xs">Payment terms (days)</Label><Input className="mt-1" type="number" value={v('payment_terms_days', '15')} onChange={e => set('payment_terms_days', e.target.value)} /></div>
              <div><Label className="text-xs">Overdue reminder interval (hours)</Label><Input className="mt-1" type="number" value={v('overdue_reminder_hours', '6')} onChange={e => set('overdue_reminder_hours', e.target.value)} /></div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4" /> Inventory & Stock</CardTitle>
              <CardDescription>Thresholds, reorder, purchase orders</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div><Label className="text-xs">Low stock threshold</Label><Input className="mt-1" type="number" value={v('low_stock_threshold', '5')} onChange={e => set('low_stock_threshold', e.target.value)} /></div>
              <div><Label className="text-xs">Default reorder quantity</Label><Input className="mt-1" type="number" value={v('default_reorder_qty', '10')} onChange={e => set('default_reorder_qty', e.target.value)} /></div>
              <div><Label className="text-xs">Auto-reorder enabled</Label>
                <div className="mt-2"><Switch checked={v('auto_reorder') !== '0' && v('auto_reorder') !== 'no'} onCheckedChange={c => set('auto_reorder', c ? 'yes' : 'no')} /></div>
              </div>
              <div><Label className="text-xs">PO approval required</Label>
                <div className="mt-2"><Switch checked={v('po_approval_required') !== '0' && v('po_approval_required') !== 'no'} onCheckedChange={c => set('po_approval_required', c ? 'yes' : 'no')} /></div>
              </div>
              <div><Label className="text-xs">PO number prefix</Label><Input className="mt-1" value={v('po_prefix', 'PO-')} onChange={e => set('po_prefix', e.target.value)} /></div>
              <div><Label className="text-xs">Dead stock days (no sale)</Label><Input className="mt-1" type="number" value={v('dead_stock_days', '60')} onChange={e => set('dead_stock_days', e.target.value)} /></div>
            </CardContent>
          </Card>

          {/* Branch Management — Dynamic */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" /> Branch Management</CardTitle>
              <CardDescription>Add, edit, delete branches. Set default.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Branch List */}
              <BranchManager token={token} defaultBranch={v('default_branch', 'branch-silver-mall')} setDefault={(id: string) => set('default_branch', id)} />
              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t">
                <div><Label className="text-xs">Multi-branch enabled</Label>
                  <div className="mt-2"><Switch checked={v('multi_branch') !== '0' && v('multi_branch') !== 'no'} onCheckedChange={c => set('multi_branch', c ? 'yes' : 'no')} /></div>
                </div>
                <div><Label className="text-xs">Stock transfer approval</Label>
                  <div className="mt-2"><Switch checked={v('transfer_approval') !== '0'} onCheckedChange={c => set('transfer_approval', c ? '1' : '0')} /></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff & HR */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Staff & HR</CardTitle>
              <CardDescription>Attendance, leaves, payroll, expenses</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div><Label className="text-xs">Work start time</Label><Input className="mt-1" type="time" value={v('work_start_time', '10:00')} onChange={e => set('work_start_time', e.target.value)} /></div>
              <div><Label className="text-xs">Work end time</Label><Input className="mt-1" type="time" value={v('work_end_time', '19:00')} onChange={e => set('work_end_time', e.target.value)} /></div>
              <div><Label className="text-xs">Late threshold (minutes)</Label><Input className="mt-1" type="number" value={v('late_threshold', '15')} onChange={e => set('late_threshold', e.target.value)} /></div>
              <div><Label className="text-xs">Annual leaves</Label><Input className="mt-1" type="number" value={v('annual_leaves', '12')} onChange={e => set('annual_leaves', e.target.value)} /></div>
              <div><Label className="text-xs">Sick leaves</Label><Input className="mt-1" type="number" value={v('sick_leaves', '6')} onChange={e => set('sick_leaves', e.target.value)} /></div>
              <div><Label className="text-xs">Payroll day of month</Label><Input className="mt-1" type="number" value={v('payroll_day', '1')} onChange={e => set('payroll_day', e.target.value)} /></div>
              <div><Label className="text-xs">Expense approval above (Rs)</Label><Input className="mt-1" type="number" value={v('expense_approval_above', '1000')} onChange={e => set('expense_approval_above', e.target.value)} /></div>
              <div><Label className="text-xs">Leave approval required</Label>
                <div className="mt-2"><Switch checked={v('leave_approval', '1') !== '0'} onCheckedChange={c => set('leave_approval', c ? '1' : '0')} /></div>
              </div>
            </CardContent>
          </Card>

          {/* Finance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><IndianRupee className="h-4 w-4" /> Finance & Accounting</CardTitle>
              <CardDescription>Bank details, tax, reconciliation</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div><Label className="text-xs">Bank name</Label><Input className="mt-1" value={v('bank_name')} onChange={e => set('bank_name', e.target.value)} /></div>
              <div><Label className="text-xs">Account number</Label><Input className="mt-1" value={v('bank_account')} onChange={e => set('bank_account', e.target.value)} /></div>
              <div><Label className="text-xs">IFSC code</Label><Input className="mt-1" value={v('bank_ifsc')} onChange={e => set('bank_ifsc', e.target.value)} /></div>
              <div><Label className="text-xs">Account holder name</Label><Input className="mt-1" value={v('bank_holder_name')} onChange={e => set('bank_holder_name', e.target.value)} /></div>
              <div><Label className="text-xs">UPI ID (for invoices)</Label><Input className="mt-1" value={v('bank_upi')} onChange={e => set('bank_upi', e.target.value)} placeholder="shop@ybl" /></div>
              <div><Label className="text-xs">Financial year start</Label><Input className="mt-1" value={v('fy_start', 'April')} onChange={e => set('fy_start', e.target.value)} /></div>
            </CardContent>
          </Card>

          <Button onClick={save} disabled={saving} className="w-full gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All ERP Settings'}</Button>
        </div>
      </div>
    </AdminLayout>
  );
}

// Branch Manager (dynamic CRUD)
function BranchManager({ token, defaultBranch, setDefault }: { token: string | null; defaultBranch: string; setDefault: (id: string) => void }) {
  const [branches, setBranches] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', address: '', phone: '', manager: '', map_url: '' });
  const headers: any = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const load = () => fetch('/api/erp/branches', { headers }).then(r => r.json()).then(d => { if (Array.isArray(d)) setBranches(d); }).catch(() => {});
  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.name) return toast.error('Branch name required');
    await fetch('/api/erp/branches', { method: 'POST', headers, body: JSON.stringify(form) });
    toast.success('Branch added'); setAdding(false); setForm({ name: '', address: '', phone: '', manager: '', map_url: '' }); load();
  };

  const update = async (id: string) => {
    await fetch(`/api/erp/branches/${id}`, { method: 'PUT', headers, body: JSON.stringify({ ...form, is_active: true }) });
    toast.success('Branch updated'); setEditing(null); setForm({ name: '', address: '', phone: '', manager: '', map_url: '' }); load();
  };

  const toggleActive = async (b: any) => {
    await fetch(`/api/erp/branches/${b.id}`, { method: 'PUT', headers, body: JSON.stringify({ ...b, is_active: b.is_active ? 0 : 1 }) });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this branch permanently? All stock data for this branch will be lost.')) return;
    await fetch(`/api/erp/branches/${id}`, { method: 'DELETE', headers });
    toast.success('Branch deleted'); load();
  };

  const startEdit = (b: any) => { setEditing(b.id); setForm({ name: b.name, address: b.address || '', phone: b.phone || '', manager: b.manager || '', map_url: b.map_url || '' }); };

  return (
    <div className="space-y-3">
      {branches.length === 0 && !adding && (
        <div className="text-center py-6 text-muted-foreground">
          <MapPin className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No branches added yet</p>
          <p className="text-xs">Add your first branch location below</p>
        </div>
      )}

      {branches.map(b => (
        <div key={b.id} className={`rounded-xl border-2 overflow-hidden transition-all ${b.id === defaultBranch ? 'border-primary shadow-sm' : b.is_active ? 'border-muted' : 'border-muted opacity-60'}`}>
          {editing === b.id ? (
            <div className="p-4 space-y-3 bg-muted/30">
              <p className="text-xs font-bold text-muted-foreground uppercase">Editing: {b.name}</p>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><Label className="text-[10px]">Branch Name *</Label><Input className="mt-1 h-8" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div><Label className="text-[10px]">Manager Name</Label><Input className="mt-1 h-8" value={form.manager} onChange={e => setForm(f => ({ ...f, manager: e.target.value }))} /></div>
                <div><Label className="text-[10px]">Address</Label><Input className="mt-1 h-8" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
                <div className="sm:col-span-2"><Label className="text-[10px]">Google Maps Link</Label><Input className="mt-1 h-8" value={form.map_url} onChange={e => setForm(f => ({ ...f, map_url: e.target.value }))} placeholder="https://maps.app.goo.gl/..." /></div>
                <div><Label className="text-[10px]">Phone</Label><Input className="mt-1 h-8" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => update(b.id)}>Save Changes</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${b.id === defaultBranch ? 'bg-primary text-white' : 'bg-muted'}`}>
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{b.name}</p>
                      {b.id === defaultBranch && <span className="text-[9px] bg-primary text-white px-1.5 py-0.5 rounded-full font-bold">DEFAULT</span>}
                      {!b.is_active && <span className="text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">Inactive</span>}
                    </div>
                    {b.address && <p className="text-xs text-muted-foreground mt-0.5">{b.address}</p>}
                    <div className="flex items-center gap-3 mt-1">
                      {b.phone && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Phone className="h-2.5 w-2.5" />{b.phone}</span>}
                      {b.manager && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Users className="h-2.5 w-2.5" />{b.manager}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {b.id !== defaultBranch && <Button size="sm" variant="outline" className="text-[10px] h-7 px-2" onClick={() => setDefault(b.id)}>Set Default</Button>}
                  <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => startEdit(b)}>Edit</Button>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-muted-foreground" onClick={() => toggleActive(b)}>{b.is_active ? 'Disable' : 'Enable'}</Button>
                  {b.id !== defaultBranch && <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => remove(b.id)}>Delete</Button>}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {!adding ? (
        <Button variant="outline" className="w-full gap-2 border-dashed" onClick={() => setAdding(true)}><Plus className="h-4 w-4" /> Add New Branch</Button>
      ) : (
        <div className="p-4 border-2 border-dashed border-primary/30 rounded-xl space-y-3 bg-primary/5">
          <p className="text-xs font-bold text-primary uppercase">New Branch</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><Label className="text-[10px]">Branch Name *</Label><Input className="mt-1 h-8" placeholder="e.g., Silver Mall Branch" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><Label className="text-[10px]">Manager Name</Label><Input className="mt-1 h-8" placeholder="e.g., Rahul Sharma" value={form.manager} onChange={e => setForm(f => ({ ...f, manager: e.target.value }))} /></div>
            <div><Label className="text-[10px]">Full Address</Label><Input className="mt-1 h-8" placeholder="Shop 12, Silver Mall, RNT Marg, Indore" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div><Label className="text-[10px]">Phone Number</Label><Input className="mt-1 h-8" placeholder="+91 98934 96163" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div className="sm:col-span-2"><Label className="text-[10px]">Google Maps Link</Label><Input className="mt-1 h-8" placeholder="https://maps.app.goo.gl/..." value={form.map_url} onChange={e => setForm(f => ({ ...f, map_url: e.target.value }))} /></div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={add} disabled={!form.name}>Add Branch</Button>
            <Button size="sm" variant="ghost" onClick={() => { setAdding(false); setForm({ name: '', address: '', phone: '', manager: '', map_url: '' }); }}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
