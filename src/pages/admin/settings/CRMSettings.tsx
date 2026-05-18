import { useState, useEffect } from "react";
import { Save, Users, Target, MessageCircle, Zap, Plus, X, GripVertical, Clock, Bell, Shield, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";

const STAGE_COLORS: Record<string, string> = { new: 'bg-blue-100 text-blue-800 border-blue-300', contacted: 'bg-yellow-100 text-yellow-800 border-yellow-300', interested: 'bg-green-100 text-green-800 border-green-300', negotiation: 'bg-purple-100 text-purple-800 border-purple-300', won: 'bg-emerald-100 text-emerald-800 border-emerald-300', lost: 'bg-red-100 text-red-800 border-red-300' };
const PRIORITY_COLORS: Record<string, string> = { urgent: 'bg-red-500', high: 'bg-orange-500', normal: 'bg-blue-500', low: 'bg-gray-400' };

export default function CRMSettings() {
  const [s, setS] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [automations, setAutomations] = useState<any[]>([]);
  const [newStage, setNewStage] = useState('');
  const [newSource, setNewSource] = useState('');
  const [newReason, setNewReason] = useState('');
  const [newTag, setNewTag] = useState('');
  const token = localStorage.getItem('ailaptopwala_token');
  const headers: any = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

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
  const getList = (key: string, fallback: string) => v(key, fallback).split(',').map(s => s.trim()).filter(Boolean);
  const setList = (key: string, arr: string[]) => set(key, arr.join(','));

  // Lists
  const stages = getList('lead_stages', 'new,contacted,interested,negotiation,won,lost');
  const sources = getList('lead_sources', 'WhatsApp,Enquiry Form,Walk-in,Referral,Social Media,Website');
  const reasons = getList('lost_reasons', 'Price too high,Bought elsewhere,Not interested,No response,Budget issue');
  const tags = getList('lead_tags', 'hot-lead,follow-up,vip,callback,demo-done,price-sent');

  // WhatsApp template CRUD
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

  const toggleAutomation = async (id: string, active: boolean) => {
    await fetch(`/api/crm-tools/automations/${id}`, { method: 'PUT', headers, body: JSON.stringify({ is_active: active ? 1 : 0 }) });
    setAutomations(a => a.map(x => x.id === id ? { ...x, is_active: active ? 1 : 0 } : x));
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><Users className="h-6 w-6" /> CRM Settings</h1>
            <p className="text-sm text-muted-foreground">Pipeline, scoring, automations, templates — all dynamic</p>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All'}</Button>
        </div>

        <div className="space-y-6">

          {/* ─── 1. PIPELINE STAGES ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Palette className="h-4 w-4" /> Pipeline Stages</CardTitle>
              <CardDescription>Color-coded stages. Leads move through these in order.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {stages.map((stage, i) => (
                  <div key={stage} className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 border text-xs font-semibold capitalize ${STAGE_COLORS[stage] || 'bg-slate-100 text-slate-700 border-slate-300'}`}>
                    <GripVertical className="h-3 w-3 opacity-40 cursor-grab" />
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/60 text-[9px] font-bold">{i + 1}</span>
                    {stage}
                    {!['new', 'won', 'lost'].includes(stage) && (
                      <button onClick={() => setList('lead_stages', stages.filter(x => x !== stage))} className="ml-1 opacity-60 hover:opacity-100"><X className="h-3 w-3" /></button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Add stage name..." value={newStage} onChange={e => setNewStage(e.target.value)} className="h-8 max-w-[200px]" onKeyDown={e => { if (e.key === 'Enter' && newStage.trim()) { setList('lead_stages', [...stages, newStage.trim().toLowerCase()]); setNewStage(''); } }} />
                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => { if (newStage.trim()) { setList('lead_stages', [...stages, newStage.trim().toLowerCase()]); setNewStage(''); } }}><Plus className="h-3 w-3" /> Add</Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">Press Enter or click Add. Fixed: new, won, lost.</p>
            </CardContent>
          </Card>

          {/* ─── 2. LEAD SOURCES ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lead Sources</CardTitle>
              <CardDescription>Where leads come from — used in attribution, filters, and reports</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {sources.map(src => {
                  const icons: Record<string, string> = { 'WhatsApp': '💬', 'Enquiry Form': '📋', 'Walk-in': '🚶', 'Referral': '🤝', 'Social Media': '📱', 'Website': '🌐', 'Phone Call': '📞', 'JustDial': '📍', 'IndiaMart': '🏭', 'Google Ads': '📢', 'Facebook': '👤', 'Instagram': '📸', 'YouTube': '▶️', 'Email': '✉️', 'Exhibition': '🎪', 'Repeat Customer': '🔄' };
                  return (
                    <div key={src} className="group relative flex items-center gap-2 p-2.5 rounded-lg border bg-card hover:border-primary/40 hover:shadow-sm transition-all">
                      <span className="text-base">{icons[src] || '📌'}</span>
                      <span className="text-xs font-medium flex-1 truncate">{src}</span>
                      <button onClick={() => setList('lead_sources', sources.filter(x => x !== src))} className="opacity-0 group-hover:opacity-100 absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full w-4 h-4 flex items-center justify-center transition-opacity"><X className="h-2.5 w-2.5" /></button>
                    </div>
                  );
                })}
              </div>
              {/* Quick add presets */}
              <div className="pt-3 border-t">
                <p className="text-[10px] font-medium text-muted-foreground mb-2">QUICK ADD COMMON SOURCES:</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {['Phone Call', 'Google Ads', 'Facebook', 'Instagram', 'YouTube', 'Email', 'JustDial', 'IndiaMart', 'Exhibition', 'Repeat Customer'].filter(x => !sources.includes(x)).map(preset => (
                    <button key={preset} onClick={() => setList('lead_sources', [...sources, preset])} className="text-[10px] px-2 py-1 rounded-md border border-dashed border-primary/40 text-primary hover:bg-primary/5 transition-colors">+ {preset}</button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Custom source name..." value={newSource} onChange={e => setNewSource(e.target.value)} className="h-8 max-w-[220px]" onKeyDown={e => { if (e.key === 'Enter' && newSource.trim()) { setList('lead_sources', [...sources, newSource.trim()]); setNewSource(''); } }} />
                  <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => { if (newSource.trim()) { setList('lead_sources', [...sources, newSource.trim()]); setNewSource(''); } }}><Plus className="h-3 w-3" /> Add Custom</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ─── 3. PRIORITY LEVELS ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Priority Levels</CardTitle>
              <CardDescription>Color-coded priority for leads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {getList('lead_priorities', 'urgent,high,normal,low').map(p => (
                  <div key={p} className="flex items-center gap-2 border rounded-lg px-3 py-2">
                    <span className={`w-3 h-3 rounded-full ${PRIORITY_COLORS[p] || 'bg-gray-400'}`} />
                    <span className="text-sm font-medium capitalize">{p}</span>
                    <button onClick={() => setList('lead_priorities', getList('lead_priorities', 'urgent,high,normal,low').filter(x => x !== p))} className="opacity-40 hover:opacity-100"><X className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ─── 4. LOST REASONS ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lost Reasons</CardTitle>
              <CardDescription>Shown when marking a lead as lost — helps analyze why deals fail</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {reasons.map(r => (
                  <div key={r} className="flex items-center gap-1 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 text-xs text-red-700">
                    {r}
                    <button onClick={() => setList('lost_reasons', reasons.filter(x => x !== r))} className="ml-1 opacity-60 hover:opacity-100"><X className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="Add reason..." value={newReason} onChange={e => setNewReason(e.target.value)} className="h-8 max-w-[250px]" onKeyDown={e => { if (e.key === 'Enter' && newReason.trim()) { setList('lost_reasons', [...reasons, newReason.trim()]); setNewReason(''); } }} />
                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => { if (newReason.trim()) { setList('lost_reasons', [...reasons, newReason.trim()]); setNewReason(''); } }}><Plus className="h-3 w-3" /> Add</Button>
              </div>
            </CardContent>
          </Card>

          {/* ─── 5. TAGS ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lead Tags</CardTitle>
              <CardDescription>Quick-add tags in lead detail view</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map(t => (
                  <Badge key={t} className="gap-1 px-2.5 py-1 text-xs">{t}<button onClick={() => setList('lead_tags', tags.filter(x => x !== t))} className="ml-1"><X className="h-3 w-3" /></button></Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder="New tag..." value={newTag} onChange={e => setNewTag(e.target.value)} className="h-8 max-w-[180px]" onKeyDown={e => { if (e.key === 'Enter' && newTag.trim()) { setList('lead_tags', [...tags, newTag.trim()]); setNewTag(''); } }} />
                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => { if (newTag.trim()) { setList('lead_tags', [...tags, newTag.trim()]); setNewTag(''); } }}><Plus className="h-3 w-3" /> Add</Button>
              </div>
            </CardContent>
          </Card>

          {/* ─── 6. SCORING (Sliders) ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" /> Lead Scoring Rules</CardTitle>
              <CardDescription>Points awarded automatically. Higher score = hotter lead.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { key: 'score_contacted', label: 'Contacted', fallback: '10', max: 50 },
                { key: 'score_interested', label: 'Interested', fallback: '20', max: 50 },
                { key: 'score_negotiation', label: 'Negotiation', fallback: '30', max: 50 },
                { key: 'score_budget_high', label: 'Budget > 50k', fallback: '20', max: 50 },
                { key: 'score_per_followup', label: 'Per follow-up', fallback: '10', max: 30 },
              ].map(item => (
                <div key={item.key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-primary font-bold">+{v(item.key, item.fallback)} pts</span>
                  </div>
                  <Slider value={[parseInt(v(item.key, item.fallback))]} max={item.max} step={5} onValueChange={([val]) => set(item.key, String(val))} className="w-full" />
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs font-medium">Max score cap</span>
                <Input type="number" value={v('score_max', '100')} onChange={e => set('score_max', e.target.value)} className="h-7 w-20 text-center text-xs" />
              </div>
            </CardContent>
          </Card>

          {/* ─── 7. ASSIGNMENT & FOLLOW-UP ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" /> Assignment & Follow-up</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
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
              <div><Label className="text-xs">Campaign sender name</Label><Input className="mt-1" value={v('campaign_sender_name', 'AI Laptop Wala')} onChange={e => set('campaign_sender_name', e.target.value)} /></div>
            </CardContent>
          </Card>

          {/* ─── 8. BUSINESS HOURS & AUTO-CLOSE ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Business Hours & Auto-close</CardTitle>
              <CardDescription>When AI agent replies + auto-close inactive leads</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Business hours start</Label><Input className="mt-1" type="time" value={v('crm_hours_start', '10:00')} onChange={e => set('crm_hours_start', e.target.value)} /></div>
              <div><Label className="text-xs">Business hours end</Label><Input className="mt-1" type="time" value={v('crm_hours_end', '21:00')} onChange={e => set('crm_hours_end', e.target.value)} /></div>
              <div><Label className="text-xs">Auto-close after (days inactive)</Label><Input className="mt-1" type="number" value={v('auto_close_days', '90')} onChange={e => set('auto_close_days', e.target.value)} /><p className="text-[10px] text-muted-foreground mt-1">0 = disabled</p></div>
              <div>
                <Label className="text-xs">Auto-close status</Label>
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

          {/* ─── 9. DUPLICATE & NOTIFICATIONS ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" /> Duplicate Detection</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-sm font-medium">Duplicate detection</p><p className="text-[10px] text-muted-foreground">Check before creating lead</p></div>
                <Switch checked={v('duplicate_detection', '1') !== '0'} onCheckedChange={c => set('duplicate_detection', c ? '1' : '0')} />
              </div>
              <div>
                <Label className="text-xs">Match field</Label>
                <Select value={v('duplicate_field', 'phone')} onValueChange={val => set('duplicate_field', val)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone number</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="both">Phone OR Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* ─── 10. NOTIFICATIONS ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4" /> Notification Events</CardTitle>
              <CardDescription>Which events trigger notifications</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-3">
              {[
                { key: 'notify_new_lead', label: 'New lead created', desc: 'Admin gets notified' },
                { key: 'notify_lead_won', label: 'Lead won (deal closed)', desc: 'Celebrate!' },
                { key: 'notify_overdue_followup', label: 'Overdue follow-up', desc: 'Reminder to assigned staff' },
                { key: 'notify_staff_whatsapp', label: 'Notify staff via WhatsApp', desc: 'Send WA to assigned person' },
              ].map(n => (
                <div key={n.key} className="flex items-center justify-between p-3 rounded-lg border">
                  <div><p className="text-sm font-medium">{n.label}</p><p className="text-[10px] text-muted-foreground">{n.desc}</p></div>
                  <Switch checked={v(n.key, '1') !== '0'} onCheckedChange={c => set(n.key, c ? '1' : '0')} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ─── 11. AUTOMATIONS ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4" /> Automations</CardTitle>
              <CardDescription>Rules that run automatically. <a href="/admin/automations" className="text-primary underline text-xs">Manage all rules</a></CardDescription>
            </CardHeader>
            <CardContent>
              {automations.length === 0 ? <p className="text-sm text-muted-foreground py-4 text-center">No automations yet. <a href="/admin/automations" className="text-primary underline">Create one</a></p> : (
                <div className="space-y-2">
                  {automations.map(a => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium">{a.name}</p>
                        <p className="text-[10px] text-muted-foreground">Trigger: <span className="font-medium">{a.trigger_type}</span> | Action: <span className="font-medium">{a.action_type}</span> | Ran {a.run_count || 0}x</p>
                      </div>
                      <Switch checked={a.is_active === 1} onCheckedChange={c => toggleAutomation(a.id, c)} />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* ─── 12. WHATSAPP TEMPLATES ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp Templates</CardTitle>
              <CardDescription>Pre-saved messages for quick sending. Use {'{name}'} for customer name.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {templates.map(t => (
                <div key={t.name} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase text-muted-foreground mb-1">{t.name}</p>
                    {/* WhatsApp bubble preview */}
                    <div className="bg-[#dcf8c6] rounded-lg rounded-tl-none px-3 py-2 text-sm max-w-[320px] shadow-sm">
                      {t.message}
                      <span className="text-[9px] text-gray-500 float-right mt-1 ml-2">10:30 AM</span>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-destructive h-7 shrink-0" onClick={() => deleteTemplate(t.name)}><X className="h-3 w-3" /></Button>
                </div>
              ))}
              <div className="p-4 border-2 border-dashed rounded-lg space-y-3">
                <p className="text-xs font-medium text-muted-foreground">Add new template</p>
                <Input placeholder="Template name (e.g., welcome, follow-up)" value={newTpl.name} onChange={e => setNewTpl(t => ({ ...t, name: e.target.value }))} className="h-8" />
                <textarea className="w-full border rounded-lg px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Hi {name}, thanks for your enquiry at AI Laptop Wala! How can we help you today?" value={newTpl.message} onChange={e => setNewTpl(t => ({ ...t, message: e.target.value }))} />
                <Button size="sm" onClick={addTemplate} disabled={!newTpl.name || !newTpl.message}>Save Template</Button>
              </div>
            </CardContent>
          </Card>

          <Button onClick={save} disabled={saving} size="lg" className="w-full gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All CRM Settings'}</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
