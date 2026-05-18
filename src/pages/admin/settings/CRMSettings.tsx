import { useState, useEffect } from "react";
import { Save, Users, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";

export default function CRMSettings() {
  const [s, setS] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('ailaptopwala_token');
  useEffect(() => { fetch('/api/app-settings', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setS(d || {})).catch(() => {}); }, []);
  const save = async () => { setSaving(true); await fetch('/api/app-settings', { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(s) }); toast.success('Saved!'); setSaving(false); };
  const v = (key: string) => s[key] || '';
  const set = (key: string, val: string) => setS(p => ({ ...p, [key]: val }));

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-black flex items-center gap-2"><Users className="h-6 w-6" /> CRM Settings</h1><p className="text-sm text-muted-foreground">Leads, pipeline, scoring, automation</p></div>
          <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save'}</Button>
        </div>
        <div className="space-y-6">
          <Card><CardHeader><CardTitle className="text-base">Lead Management</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
            <div><Label>Lead stages (comma-separated)</Label><Input className="mt-1" value={v('lead_stages')} onChange={e => set('lead_stages', e.target.value)} placeholder="new,contacted,interested,negotiation,won,lost" /></div>
            <div><Label>Lead sources</Label><Input className="mt-1" value={v('lead_sources')} onChange={e => set('lead_sources', e.target.value)} placeholder="WhatsApp,Enquiry Form,Walk-in,Referral" /></div>
            <div><Label>Auto-assign method</Label><Input className="mt-1" value={v('lead_assign_method')} onChange={e => set('lead_assign_method', e.target.value)} placeholder="round_robin / manual" /></div>
            <div><Label>Follow-up reminder (hours)</Label><Input className="mt-1" type="number" value={v('followup_reminder_hours')} onChange={e => set('followup_reminder_hours', e.target.value)} placeholder="2" /></div>
            <div><Label>Default deal value (Rs)</Label><Input className="mt-1" type="number" value={v('default_deal_value')} onChange={e => set('default_deal_value', e.target.value)} placeholder="0" /></div>
            <div><Label>Lead daily limit (AI agent)</Label><Input className="mt-1" type="number" value={v('ai_daily_limit')} onChange={e => set('ai_daily_limit', e.target.value)} placeholder="50" /></div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" /> Scoring Rules</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
            <div><Label>Status bonus: contacted</Label><Input className="mt-1" type="number" value={v('score_contacted')} onChange={e => set('score_contacted', e.target.value)} placeholder="10" /></div>
            <div><Label>Status bonus: interested</Label><Input className="mt-1" type="number" value={v('score_interested')} onChange={e => set('score_interested', e.target.value)} placeholder="20" /></div>
            <div><Label>Status bonus: negotiation</Label><Input className="mt-1" type="number" value={v('score_negotiation')} onChange={e => set('score_negotiation', e.target.value)} placeholder="30" /></div>
            <div><Label>Budget above 50k bonus</Label><Input className="mt-1" type="number" value={v('score_budget_high')} onChange={e => set('score_budget_high', e.target.value)} placeholder="20" /></div>
            <div><Label>Per followup bonus</Label><Input className="mt-1" type="number" value={v('score_per_followup')} onChange={e => set('score_per_followup', e.target.value)} placeholder="10" /></div>
            <div><Label>Max score</Label><Input className="mt-1" type="number" value={v('score_max')} onChange={e => set('score_max', e.target.value)} placeholder="100" /></div>
          </CardContent></Card>

          <Button onClick={save} disabled={saving} className="w-full gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All CRM Settings'}</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
