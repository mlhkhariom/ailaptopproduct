import { useState, useEffect } from "react";
import { Save, Wrench, Clock, Package, Users, IndianRupee, MapPin } from "lucide-react";
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

          {/* Branch Management */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" /> Branch Management</CardTitle>
              <CardDescription>Multi-branch settings</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div><Label className="text-xs">Default branch ID</Label><Input className="mt-1" value={v('default_branch', 'branch-silver-mall')} onChange={e => set('default_branch', e.target.value)} /></div>
              <div><Label className="text-xs">Multi-branch enabled</Label>
                <div className="mt-2"><Switch checked={v('multi_branch') !== '0' && v('multi_branch') !== 'no'} onCheckedChange={c => set('multi_branch', c ? 'yes' : 'no')} /></div>
              </div>
              <div><Label className="text-xs">Stock transfer approval</Label>
                <div className="mt-2"><Switch checked={v('transfer_approval') !== '0'} onCheckedChange={c => set('transfer_approval', c ? '1' : '0')} /></div>
              </div>
              <div><Label className="text-xs">Branch stock sync on order</Label>
                <div className="mt-2"><Switch checked={v('branch_stock_sync', '1') !== '0'} onCheckedChange={c => set('branch_stock_sync', c ? '1' : '0')} /></div>
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
