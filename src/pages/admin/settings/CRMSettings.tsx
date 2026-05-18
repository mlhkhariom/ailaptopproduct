import { useState, useEffect } from "react";
import { Save, Users, Target, MessageCircle, Zap, Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";

export default function CRMSettings() {
  const [s, setS] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [automations, setAutomations] = useState<any[]>([]);
  const token = localStorage.getItem('ailaptopwala_token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetch('/api/app-settings').then(r => r.json()).then(d => { if (d && typeof d === 'object') setS(d); }).catch(() => {});
    fetch('/api/erp/wa-templates', { headers }).then(r => r.json()).then(d => { if (Array.isArray(d)) setTemplates(d); }).catch(() => {});
    fetch('/api/crm-tools/automations', { headers }).then(r => r.json()).then(d => { if (Array.isArray(d)) setAutomations(d); }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch('/api/app-settings', { method: 'PUT', headers, body: JSON.stringify(s) });
    toast.success('CRM Settings saved!'); setSaving(false);
  };

  const v = (key: string, fallback = '') => s[key] || fallback;
  const set = (key: string, val: string) => setS(p => ({ ...p, [key]: val }));

  // Lead stages management
  const stages = v('lead_stages', 'new,contacted,interested,negotiation,won,lost').split(',').map(s => s.trim());
  const addStage = () => { const name = prompt('New stage name:'); if (name) set('lead_stages', [...stages, name.toLowerCase()].join(',')); };
  const removeStage = (stage: string) => set('lead_stages', stages.filter(s => s !== stage).join(','));

  // Lead sources management
  const sources = v('lead_sources', 'WhatsApp,Enquiry Form,Walk-in,Referral,Social Media').split(',').map(s => s.trim());
  const addSource = () => { const name = prompt('New source:'); if (name) set('lead_sources', [...sources, name].join(',')); };
  const removeSource = (src: string) => set('lead_sources', sources.filter(s => s !== src).join(','));

  // WhatsApp template
  const [newTpl, setNewTpl] = useState({ name: '', message: '' });
  const addTemplate = async () => {
    if (!newTpl.name || !newTpl.message) return toast.error('Name and message required');
    await fetch('/api/erp/wa-templates', { method: 'POST', headers, body: JSON.stringify(newTpl) });
    toast.success('Template saved'); setNewTpl({ name: '', message: '' });
    fetch('/api/erp/wa-templates', { headers }).then(r => r.json()).then(d => { if (Array.isArray(d)) setTemplates(d); });
  };
  const deleteTemplate = async (name: string) => {
    await fetch(`/api/erp/wa-templates/${name}`, { method: 'DELETE', headers });
    setTemplates(t => t.filter(x => x.name !== name));
  };

  // Toggle automation
  const toggleAutomation = async (id: string, active: boolean) => {
    await fetch(`/api/crm-tools/automations/${id}`, { method: 'PUT', headers, body: JSON.stringify({ is_active: active ? 1 : 0 }) });
    setAutomations(a => a.map(x => x.id === id ? { ...x, is_active: active ? 1 : 0 } : x));
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><Users className="h-6 w-6" /> CRM Settings</h1>
            <p className="text-sm text-muted-foreground">Pipeline, scoring, automations, templates</p>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save'}</Button>
        </div>

        <div className="space-y-6">

          {/* Lead Stages (Dynamic) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Pipeline Stages</CardTitle>
              <CardDescription>Customize your lead pipeline. Drag to reorder (coming soon).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {stages.map((stage, i) => (
                  <div key={stage} className="flex items-center gap-1 bg-muted rounded-lg px-3 py-1.5">
                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium capitalize">{stage}</span>
                    {!['new', 'won', 'lost'].includes(stage) && (
                      <button onClick={() => removeStage(stage)} className="text-muted-foreground hover:text-destructive ml-1"><Trash2 className="h-3 w-3" /></button>
                    )}
                  </div>
                ))}
                <Button size="sm" variant="outline" className="gap-1 h-8" onClick={addStage}><Plus className="h-3 w-3" /> Add Stage</Button>
              </div>
              <p className="text-[10px] text-muted-foreground">Fixed stages: new, won, lost (cannot remove). Others are customizable.</p>
            </CardContent>
          </Card>

          {/* Lead Sources (Dynamic) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lead Sources</CardTitle>
              <CardDescription>Where do your leads come from? Track attribution.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-3">
                {sources.map(src => (
                  <Badge key={src} variant="secondary" className="gap-1 px-3 py-1">
                    {src}
                    <button onClick={() => removeSource(src)} className="text-muted-foreground hover:text-destructive ml-1"><Trash2 className="h-3 w-3" /></button>
                  </Badge>
                ))}
                <Button size="sm" variant="outline" className="gap-1 h-7" onClick={addSource}><Plus className="h-3 w-3" /> Add</Button>
              </div>
            </CardContent>
          </Card>

          {/* Assignment & Follow-up */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" /> Assignment & Follow-up</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Auto-assign method</Label>
                <Select value={v('lead_assign_method', 'manual')} onValueChange={val => set('lead_assign_method', val)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual (admin assigns)</SelectItem>
                    <SelectItem value="round_robin">Round Robin (rotate staff)</SelectItem>
                    <SelectItem value="load_balance">Load Balance (least leads)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Follow-up reminder (hours)</Label><Input className="mt-1" type="number" value={v('followup_reminder_hours', '2')} onChange={e => set('followup_reminder_hours', e.target.value)} /></div>
              <div><Label className="text-xs">Default deal value (Rs)</Label><Input className="mt-1" type="number" value={v('default_deal_value', '0')} onChange={e => set('default_deal_value', e.target.value)} /></div>
              <div><Label className="text-xs">AI daily message limit</Label><Input className="mt-1" type="number" value={v('ai_daily_limit', '50')} onChange={e => set('ai_daily_limit', e.target.value)} /></div>
            </CardContent>
          </Card>

          {/* Scoring Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" /> Lead Scoring</CardTitle>
              <CardDescription>Points awarded automatically based on lead activity</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div><Label className="text-xs">Contacted bonus</Label><Input className="mt-1" type="number" value={v('score_contacted', '10')} onChange={e => set('score_contacted', e.target.value)} /></div>
              <div><Label className="text-xs">Interested bonus</Label><Input className="mt-1" type="number" value={v('score_interested', '20')} onChange={e => set('score_interested', e.target.value)} /></div>
              <div><Label className="text-xs">Negotiation bonus</Label><Input className="mt-1" type="number" value={v('score_negotiation', '30')} onChange={e => set('score_negotiation', e.target.value)} /></div>
              <div><Label className="text-xs">Budget above 50k</Label><Input className="mt-1" type="number" value={v('score_budget_high', '20')} onChange={e => set('score_budget_high', e.target.value)} /></div>
              <div><Label className="text-xs">Per follow-up</Label><Input className="mt-1" type="number" value={v('score_per_followup', '10')} onChange={e => set('score_per_followup', e.target.value)} /></div>
              <div><Label className="text-xs">Max score</Label><Input className="mt-1" type="number" value={v('score_max', '100')} onChange={e => set('score_max', e.target.value)} /></div>
            </CardContent>
          </Card>

          {/* Automations (Live from DB) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4" /> Active Automations</CardTitle>
              <CardDescription>Rules that run automatically on new leads. <a href="/admin/automations" className="text-primary underline">Manage rules</a></CardDescription>
            </CardHeader>
            <CardContent>
              {automations.length === 0 ? <p className="text-sm text-muted-foreground">No automations configured. <a href="/admin/automations" className="text-primary underline">Create one</a></p> : (
                <div className="space-y-2">
                  {automations.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-2 rounded border">
                      <div>
                        <p className="text-sm font-medium">{a.name}</p>
                        <p className="text-[10px] text-muted-foreground">Trigger: {a.trigger_type} | Action: {a.action_type} | Ran {a.run_count}x</p>
                      </div>
                      <Switch checked={a.is_active === 1} onCheckedChange={c => toggleAutomation(a.id, c)} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* WhatsApp Templates (Live CRUD) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp Templates</CardTitle>
              <CardDescription>Pre-saved messages for quick sending from CRM</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {templates.map(t => (
                <div key={t.name} className="flex items-start justify-between p-2 rounded border">
                  <div>
                    <p className="text-sm font-medium capitalize">{t.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{t.message}</p>
                  </div>
                  <Button size="sm" variant="ghost" className="text-destructive h-7" onClick={() => deleteTemplate(t.name)}><Trash2 className="h-3 w-3" /></Button>
                </div>
              ))}
              <div className="p-3 border rounded-lg space-y-2 bg-muted/30">
                <Input placeholder="Template name (e.g., welcome)" value={newTpl.name} onChange={e => setNewTpl(t => ({ ...t, name: e.target.value }))} className="h-8" />
                <textarea className="w-full border rounded px-3 py-2 text-sm min-h-[60px]" placeholder="Message text... Use {name} for customer name" value={newTpl.message} onChange={e => setNewTpl(t => ({ ...t, message: e.target.value }))} />
                <Button size="sm" onClick={addTemplate}>Save Template</Button>
              </div>
            </CardContent>
          </Card>

          {/* Priority Levels & Lost Reasons */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Priority & Lost Reasons</CardTitle>
              <CardDescription>Predefined options for quick selection</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Priority levels (comma-separated)</Label>
                <Input className="mt-1" value={v('lead_priorities', 'urgent,high,normal,low')} onChange={e => set('lead_priorities', e.target.value)} />
                <p className="text-[10px] text-muted-foreground mt-1">Used in lead form dropdown</p>
              </div>
              <div>
                <Label className="text-xs">Lost reasons (comma-separated)</Label>
                <Input className="mt-1" value={v('lost_reasons', 'Price too high,Bought elsewhere,Not interested,No response,Budget issue')} onChange={e => set('lost_reasons', e.target.value)} />
                <p className="text-[10px] text-muted-foreground mt-1">Shown when marking lead as lost</p>
              </div>
              <div>
                <Label className="text-xs">Predefined tags (comma-separated)</Label>
                <Input className="mt-1" value={v('lead_tags', 'hot-lead,follow-up,vip,callback,demo-done,price-sent')} onChange={e => set('lead_tags', e.target.value)} />
                <p className="text-[10px] text-muted-foreground mt-1">Quick-add tags in lead detail</p>
              </div>
              <div>
                <Label className="text-xs">Campaign sender name</Label>
                <Input className="mt-1" value={v('campaign_sender_name', 'AI Laptop Wala')} onChange={e => set('campaign_sender_name', e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Business Hours & Auto-close */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Business Hours & Auto-close</CardTitle>
              <CardDescription>When AI agent replies + auto-close inactive leads</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div><Label className="text-xs">Business hours start</Label><Input className="mt-1" type="time" value={v('crm_hours_start', '10:00')} onChange={e => set('crm_hours_start', e.target.value)} /></div>
              <div><Label className="text-xs">Business hours end</Label><Input className="mt-1" type="time" value={v('crm_hours_end', '21:00')} onChange={e => set('crm_hours_end', e.target.value)} /></div>
              <div><Label className="text-xs">Auto-close inactive leads after (days)</Label><Input className="mt-1" type="number" value={v('auto_close_days', '90')} onChange={e => set('auto_close_days', e.target.value)} /><p className="text-[10px] text-muted-foreground mt-1">0 = disabled</p></div>
              <div><Label className="text-xs">Auto-close status</Label>
                <Select value={v('auto_close_status', 'lost')} onValueChange={val => set('auto_close_status', val)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lost">Mark as Lost</SelectItem>
                    <SelectItem value="archived">Archive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Duplicate Detection & Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Duplicate Detection & Notifications</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div><Label className="text-xs">Duplicate detection</Label>
                <div className="mt-2"><Switch checked={v('duplicate_detection', '1') !== '0'} onCheckedChange={c => set('duplicate_detection', c ? '1' : '0')} /></div>
                <p className="text-[10px] text-muted-foreground mt-1">Check phone number before creating lead</p>
              </div>
              <div><Label className="text-xs">Match field for duplicates</Label>
                <Select value={v('duplicate_field', 'phone')} onValueChange={val => set('duplicate_field', val)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone number</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="both">Phone OR Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Notify on new lead</Label>
                <div className="mt-2"><Switch checked={v('notify_new_lead', '1') !== '0'} onCheckedChange={c => set('notify_new_lead', c ? '1' : '0')} /></div>
              </div>
              <div><Label className="text-xs">Notify on lead won</Label>
                <div className="mt-2"><Switch checked={v('notify_lead_won', '1') !== '0'} onCheckedChange={c => set('notify_lead_won', c ? '1' : '0')} /></div>
              </div>
              <div><Label className="text-xs">Notify on overdue follow-up</Label>
                <div className="mt-2"><Switch checked={v('notify_overdue_followup', '1') !== '0'} onCheckedChange={c => set('notify_overdue_followup', c ? '1' : '0')} /></div>
              </div>
              <div><Label className="text-xs">Notify assigned staff via WhatsApp</Label>
                <div className="mt-2"><Switch checked={v('notify_staff_whatsapp', '1') !== '0'} onCheckedChange={c => set('notify_staff_whatsapp', c ? '1' : '0')} /></div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={save} disabled={saving} className="w-full gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All CRM Settings'}</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
