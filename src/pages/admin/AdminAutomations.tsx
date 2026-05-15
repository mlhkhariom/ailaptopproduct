import { useState, useEffect } from "react";
import { Zap, Plus, Trash2, Play, Pause } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const TRIGGERS = [
  { value: 'new_lead', label: 'New Lead Created' },
  { value: 'source_match', label: 'Lead Source Matches' },
  { value: 'interest_contains', label: 'Interest Contains Keyword' },
  { value: 'budget_above', label: 'Budget Above Amount' },
];
const ACTIONS = [
  { value: 'assign', label: 'Auto-Assign to Staff' },
  { value: 'tag', label: 'Add Tag' },
  { value: 'priority', label: 'Set Priority' },
  { value: 'notify', label: 'Send Notification' },
];

export default function AdminAutomations() {
  const [rules, setRules] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', trigger_type: 'new_lead', trigger_conditions: {} as any, action_type: 'assign', action_config: {} as any });
  const token = localStorage.getItem('ailaptopwala_token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const load = () => fetch('/api/crm-tools/automations', { headers }).then(r => r.json()).then(d => { if (Array.isArray(d)) setRules(d); });
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name) return toast.error('Name required');
    await fetch('/api/crm-tools/automations', { method: 'POST', headers, body: JSON.stringify(form) });
    toast.success('Automation created');
    setShowAdd(false);
    load();
  };

  const toggle = async (id: string, active: boolean) => {
    await fetch(`/api/crm-tools/automations/${id}`, { method: 'PUT', headers, body: JSON.stringify({ is_active: active ? 1 : 0 }) });
    load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/crm-tools/automations/${id}`, { method: 'DELETE', headers });
    toast.success('Deleted');
    load();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><Zap className="h-6 w-6" /> CRM Automations</h1>
            <p className="text-sm text-muted-foreground">Auto-assign, auto-tag, and notify on new leads</p>
          </div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> New Rule</Button></DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Create Automation Rule</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div><Label>Rule Name</Label><Input className="mt-1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g., Assign MacBook leads to Rahul" /></div>
                <div><Label>When (Trigger)</Label>
                  <Select value={form.trigger_type} onValueChange={v => setForm(f => ({ ...f, trigger_type: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{TRIGGERS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {form.trigger_type === 'source_match' && <div><Label>Source Value</Label><Input className="mt-1" placeholder="e.g., WhatsApp" onChange={e => setForm(f => ({ ...f, trigger_conditions: { source: e.target.value } }))} /></div>}
                {form.trigger_type === 'interest_contains' && <div><Label>Keyword</Label><Input className="mt-1" placeholder="e.g., MacBook" onChange={e => setForm(f => ({ ...f, trigger_conditions: { keyword: e.target.value } }))} /></div>}
                {form.trigger_type === 'budget_above' && <div><Label>Amount (₹)</Label><Input type="number" className="mt-1" placeholder="50000" onChange={e => setForm(f => ({ ...f, trigger_conditions: { amount: Number(e.target.value) } }))} /></div>}
                <div><Label>Then (Action)</Label>
                  <Select value={form.action_type} onValueChange={v => setForm(f => ({ ...f, action_type: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{ACTIONS.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {form.action_type === 'assign' && <div><Label>Assign To (Staff Name)</Label><Input className="mt-1" placeholder="Rahul" onChange={e => setForm(f => ({ ...f, action_config: { assigned_to: e.target.value } }))} /></div>}
                {form.action_type === 'tag' && <div><Label>Tag</Label><Input className="mt-1" placeholder="hot-lead" onChange={e => setForm(f => ({ ...f, action_config: { tag: e.target.value } }))} /></div>}
                {form.action_type === 'priority' && <div><Label>Priority</Label>
                  <Select onValueChange={v => setForm(f => ({ ...f, action_config: { priority: v } }))}><SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="high">High</SelectItem><SelectItem value="urgent">Urgent</SelectItem></SelectContent></Select>
                </div>}
                {form.action_type === 'notify' && <div><Label>Message</Label><Input className="mt-1" placeholder="New lead: {name}" onChange={e => setForm(f => ({ ...f, action_config: { message: e.target.value } }))} /></div>}
                <Button onClick={save} className="w-full">Create Rule</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {rules.length === 0 ? (
          <Card><CardContent className="p-10 text-center text-muted-foreground">No automation rules yet. Create one to auto-assign leads, add tags, or send notifications.</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {rules.map((r: any) => (
              <Card key={r.id} className={!r.is_active ? 'opacity-50' : ''}>
                <CardContent className="p-4 flex items-center gap-4">
                  <Zap className={`h-5 w-5 ${r.is_active ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      When: {TRIGGERS.find(t => t.value === r.trigger_type)?.label} → {ACTIONS.find(a => a.value === r.action_type)?.label}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">Ran {r.run_count}x</Badge>
                  <Button size="icon" variant="ghost" onClick={() => toggle(r.id, !r.is_active)}>
                    {r.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4" /></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
