import { useState, useEffect } from "react";
import { Save, Wrench, Package, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";

export default function ERPSettings() {
  const [s, setS] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('ailaptopwala_token');
  useEffect(() => { fetch('/api/app-settings', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setS(d || {})).catch(() => {}); }, []);
  const save = async () => { setSaving(true); await fetch('/api/app-settings', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(s) }); toast.success('Saved!'); setSaving(false); };
  const v = (key: string) => s[key] || '';
  const set = (key: string, val: string) => setS(p => ({ ...p, [key]: val }));

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-black flex items-center gap-2"><Wrench className="h-6 w-6" /> ERP Settings</h1><p className="text-sm text-muted-foreground">Job cards, inventory, purchase orders</p></div>
          <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save'}</Button>
        </div>
        <div className="space-y-6">
          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Job Card SLA</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
            <div><Label>Urgent SLA (hours)</Label><Input className="mt-1" type="number" value={v('sla_urgent')} onChange={e => set('sla_urgent', e.target.value)} placeholder="24" /></div>
            <div><Label>High SLA (hours)</Label><Input className="mt-1" type="number" value={v('sla_high')} onChange={e => set('sla_high', e.target.value)} placeholder="48" /></div>
            <div><Label>Normal SLA (hours)</Label><Input className="mt-1" type="number" value={v('sla_normal')} onChange={e => set('sla_normal', e.target.value)} placeholder="72" /></div>
            <div><Label>Low SLA (hours)</Label><Input className="mt-1" type="number" value={v('sla_low')} onChange={e => set('sla_low', e.target.value)} placeholder="96" /></div>
            <div><Label>Escalation after (hours)</Label><Input className="mt-1" type="number" value={v('escalation_hours')} onChange={e => set('escalation_hours', e.target.value)} placeholder="48" /></div>
            <div><Label>Default warranty (days)</Label><Input className="mt-1" type="number" value={v('default_warranty_days')} onChange={e => set('default_warranty_days', e.target.value)} placeholder="90" /></div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4" /> Inventory</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
            <div><Label>Low stock threshold</Label><Input className="mt-1" type="number" value={v('low_stock_threshold')} onChange={e => set('low_stock_threshold', e.target.value)} placeholder="5" /></div>
            <div><Label>Auto-reorder enabled</Label><Input className="mt-1" value={v('auto_reorder')} onChange={e => set('auto_reorder', e.target.value)} placeholder="yes / no" /></div>
            <div><Label>PO approval required</Label><Input className="mt-1" value={v('po_approval_required')} onChange={e => set('po_approval_required', e.target.value)} placeholder="yes / no" /></div>
            <div><Label>Default reorder qty</Label><Input className="mt-1" type="number" value={v('default_reorder_qty')} onChange={e => set('default_reorder_qty', e.target.value)} placeholder="10" /></div>
            <div><Label>Expense approval above (Rs)</Label><Input className="mt-1" type="number" value={v('expense_approval_above')} onChange={e => set('expense_approval_above', e.target.value)} placeholder="1000" /></div>
            <div><Label>GSTIN</Label><Input className="mt-1" value={v('gstin')} onChange={e => set('gstin', e.target.value)} placeholder="23XXXXX1234X1ZX" /></div>
          </CardContent></Card>

          <Button onClick={save} disabled={saving} className="w-full gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All ERP Settings'}</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
