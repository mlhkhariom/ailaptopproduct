import { useState, useEffect } from "react";
import ERPLayout from "@/components/ERPLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Plus, Edit, Trash2, Send, RefreshCw, Copy } from "lucide-react";
import { toast } from "sonner";

const req = (method: string, path: string, body?: any) =>
  fetch(`/api/erp${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then(r => r.json());

const DEFAULT_TEMPLATES = [
  { name: 'Job Card Created', category: 'job_card', message: 'Namaste {{name}}!\n\nAapka device repair ke liye register ho gaya hai.\nJob ID: {{job_id}}\nDevice: {{device}}\n\nHum aapko update karte rahenge.\n\nAI Laptop Wala\n+91 98934 96163' },
  { name: 'Repair Complete', category: 'job_card', message: 'Namaste {{name}}!\n\nAapka {{device}} repair complete ho gaya hai!\nJob ID: {{job_id}}\nTotal: Rs.{{amount}}\n\nPickup ke liye aayein:\nSilver Mall, RNT Marg, Indore\n+91 98934 96163' },
  { name: 'Payment Reminder', category: 'billing', message: 'Namaste {{name}}!\n\nAapka payment pending hai.\nInvoice: {{invoice}}\nAmount: Rs.{{amount}}\n\nKripya jaldi payment karein.\n+91 98934 96163' },
  { name: 'Follow-up', category: 'crm', message: 'Namaste {{name}}!\n\nAI Laptop Wala se bol raha hoon.\nAapne {{interest}} ke baare mein poochha tha.\n\nKya aap abhi available hain?\n+91 98934 96163' },
  { name: 'Warranty Expiry', category: 'job_card', message: 'Namaste {{name}}!\n\nAapke device {{device}} ki warranty {{date}} ko expire ho rahi hai.\n\nKoi problem ho to contact karein:\n+91 98934 96163' },
];

const CATEGORIES = ['general', 'job_card', 'billing', 'crm', 'marketing'];
const CAT_COLORS: Record<string, string> = {
  general: 'bg-gray-100 text-gray-700', job_card: 'bg-blue-100 text-blue-700',
  billing: 'bg-green-100 text-green-700', crm: 'bg-purple-100 text-purple-700',
  marketing: 'bg-orange-100 text-orange-700',
};

const emptyForm = { name: '', category: 'general', message: '' };

export default function AdminWATemplates() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [sendPhone, setSendPhone] = useState('');
  const [sendTemplate, setSendTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const d = await req('GET', '/wa-templates');
    setTemplates(Array.isArray(d) ? d : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name || !form.message) return toast.error('Name and message required');
    if (editingId) await req('PUT', `/wa-templates/${editingId}`, form);
    else await req('POST', '/wa-templates', form);
    toast.success('Template saved!'); setOpen(false); load();
  };

  const del = async (id: string) => {
    if (!confirm('Delete template?')) return;
    await req('DELETE', `/wa-templates/${id}`); load();
  };

  const sendMsg = async () => {
    if (!sendPhone) return toast.error('Phone required');
    await req('POST', `/wa-templates/${sendTemplate.id}/send`, { phone: sendPhone });
    toast.success('Message queued!'); setSendOpen(false); setSendPhone('');
  };

  const seedDefaults = async () => {
    for (const t of DEFAULT_TEMPLATES) await req('POST', '/wa-templates', t);
    toast.success('Default templates added!'); load();
  };

  const copyMsg = (msg: string) => { navigator.clipboard.writeText(msg); toast.success('Copied!'); };

  // Extract variables from message
  const getVars = (msg: string) => [...new Set([...msg.matchAll(/{{(\w+)}}/g)].map(m => m[1]))];

  return (
    <ERPLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl font-black flex items-center gap-2"><MessageCircle className="h-5 w-5 text-green-600" /> WhatsApp Templates</h1>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={load} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
            {!templates.length && <Button size="sm" variant="outline" onClick={seedDefaults}>Load Defaults</Button>}
            <Button size="sm" onClick={() => { setForm(emptyForm); setEditingId(null); setOpen(true); }} className="gap-1.5">
              <Plus className="h-4 w-4" /> New Template
            </Button>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          {['all', ...CATEGORIES].map(c => (
            <span key={c} className={`text-xs px-3 py-1 rounded-full cursor-pointer border ${CAT_COLORS[c] || 'bg-muted text-muted-foreground'}`}>{c}</span>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {templates.map(t => {
            const vars = getVars(t.message);
            return (
              <div key={t.id} className="border rounded-xl p-4 space-y-3 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-sm">{t.name}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${CAT_COLORS[t.category] || CAT_COLORS.general}`}>{t.category}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyMsg(t.message)} title="Copy"><Copy className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-green-600" onClick={() => { setSendTemplate(t); setSendPhone(''); setSendOpen(true); }} title="Send"><Send className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setForm({ name: t.name, category: t.category, message: t.message }); setEditingId(t.id); setOpen(true); }}><Edit className="h-3.5 w-3.5" /></Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => del(t.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-2 whitespace-pre-line line-clamp-4">{t.message}</p>
                {vars.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {vars.map(v => <span key={v} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">{`{{${v}}}`}</span>)}
                  </div>
                )}
              </div>
            );
          })}
          {!templates.length && (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              <MessageCircle className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No templates yet</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={seedDefaults}>Load Default Templates</Button>
            </div>
          )}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editingId ? 'Edit' : 'New'} Template</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Name *</Label><Input className="mt-1 h-9" value={form.name} onChange={e => setForm((f: any) => ({ ...f, name: e.target.value }))} /></div>
              <div><Label className="text-xs">Category</Label>
                <Select value={form.category} onValueChange={v => setForm((f: any) => ({ ...f, category: v }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Message * <span className="text-muted-foreground font-normal">(use {'{{name}}'}, {'{{amount}}'} etc.)</span></Label>
                <Textarea className="mt-1" rows={6} value={form.message} onChange={e => setForm((f: any) => ({ ...f, message: e.target.value }))} placeholder="Namaste {{name}}!..." />
              </div>
              {getVars(form.message).length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  <span className="text-xs text-muted-foreground">Variables:</span>
                  {getVars(form.message).map(v => <span key={v} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">{`{{${v}}}`}</span>)}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save}>Save Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Send Dialog */}
        <Dialog open={sendOpen} onOpenChange={setSendOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Send — {sendTemplate?.name}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Phone Number *</Label><Input className="mt-1 h-9" placeholder="+91 98765 43210" value={sendPhone} onChange={e => setSendPhone(e.target.value)} /></div>
              {sendTemplate && (
                <div className="bg-muted/50 rounded-lg p-3 text-xs whitespace-pre-line text-muted-foreground">{sendTemplate.message}</div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSendOpen(false)}>Cancel</Button>
              <Button onClick={sendMsg} className="gap-1.5"><Send className="h-4 w-4" /> Send</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
}
