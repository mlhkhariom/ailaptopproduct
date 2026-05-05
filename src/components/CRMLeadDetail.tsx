// CRM Lead Detail Drawer
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MessageCircle, ClipboardList, Edit, Save, X, Plus, Clock, CheckCircle, PhoneCall, Users } from "lucide-react";
import { toast } from "sonner";

const req = (method: string, path: string, body?: any) =>
  fetch(`/api/erp${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then(r => r.json());

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-gray-100 text-gray-700', contacted: 'bg-blue-100 text-blue-700',
  interested: 'bg-yellow-100 text-yellow-700', negotiating: 'bg-orange-100 text-orange-700',
  won: 'bg-green-100 text-green-700', lost: 'bg-red-100 text-red-700',
};

const FU_ICONS: Record<string, any> = {
  call: PhoneCall, whatsapp: MessageCircle, visit: Users, email: Mail,
};

interface Props {
  lead: any;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  staff: any[];
  onConvert: (lead: any) => void;
}

export default function CRMLeadDetail({ lead, open, onClose, onUpdate, staff, onConvert }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [followups, setFollowups] = useState<any[]>([]);
  const [fuForm, setFuForm] = useState({ type: 'call', notes: '', outcome: '', next_date: '' });
  const [addingFu, setAddingFu] = useState(false);

  useEffect(() => {
    if (lead) {
      setForm({ ...lead });
      req('GET', `/leads/${lead.id}/followups`).then(d => setFollowups(Array.isArray(d) ? d : []));
    }
  }, [lead]);

  const save = async () => {
    await req('PUT', `/leads/${lead.id}`, form);
    toast.success('Lead updated!'); setEditing(false); onUpdate();
  };

  const quickStatus = async (status: string) => {
    await req('PATCH', `/leads/${lead.id}/status`, { status });
    toast.success(`Marked as ${status}`); onUpdate();
  };

  const saveFu = async () => {
    if (!fuForm.notes) return toast.error('Notes required');
    await req('POST', `/leads/${lead.id}/followups`, fuForm);
    toast.success('Follow-up added!');
    const d = await req('GET', `/leads/${lead.id}/followups`);
    setFollowups(Array.isArray(d) ? d : []);
    setFuForm({ type: 'call', notes: '', outcome: '', next_date: '' });
    setAddingFu(false); onUpdate();
  };

  if (!lead) return null;

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p: any) => ({ ...p, [k]: e.target.value }));

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        <SheetHeader className="px-5 pt-5 pb-3 border-b">
          <div className="flex items-start justify-between">
            <div>
              {editing
                ? <Input className="text-lg font-bold h-9 w-48" value={form.name} onChange={f('name')} />
                : <SheetTitle className="text-xl">{lead.name}</SheetTitle>
              }
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[lead.status]}`}>{lead.status}</span>
                {lead.priority !== 'normal' && (
                  <Badge variant={lead.priority === 'high' ? 'destructive' : 'outline'} className="text-xs">{lead.priority}</Badge>
                )}
                {lead.score > 0 && <span className="text-xs text-muted-foreground">Score: {lead.score}/100</span>}
              </div>
            </div>
            <div className="flex gap-1">
              {editing
                ? <>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={save}><Save className="h-4 w-4" /></Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(false)}><X className="h-4 w-4" /></Button>
                  </>
                : <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditing(true)}><Edit className="h-4 w-4" /></Button>
              }
            </div>
          </div>
        </SheetHeader>

        <div className="px-5 py-4 space-y-5">
          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Phone</p>
              {editing
                ? <Input className="h-8 text-sm" value={form.phone} onChange={f('phone')} />
                : <p className="text-sm font-medium">{lead.phone || '—'}</p>
              }
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              {editing
                ? <Input className="h-8 text-sm" value={form.email} onChange={f('email')} />
                : <p className="text-sm font-medium">{lead.email || '—'}</p>
              }
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Interest</p>
              {editing
                ? <Input className="h-8 text-sm" value={form.interest} onChange={f('interest')} />
                : <p className="text-sm">{lead.interest || '—'}</p>
              }
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Deal Value</p>
              {editing
                ? <Input type="number" className="h-8 text-sm" value={form.deal_value || form.budget || ''} onChange={f('deal_value')} />
                : <p className="text-sm font-bold text-green-600">₹{(lead.deal_value || lead.budget || 0).toLocaleString('en-IN')}</p>
              }
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Source</p>
              <p className="text-sm">{lead.source}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
              {editing
                ? <Select value={form.assigned_to || '__none'} onValueChange={v => setForm((p: any) => ({ ...p, assigned_to: v === '__none' ? '' : v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Unassigned</SelectItem>
                      {staff.map(s => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                : <p className="text-sm">{lead.assigned_to || '—'}</p>
              }
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Next Follow-up</p>
              {editing
                ? <Input type="date" className="h-8 text-sm" value={form.next_followup || ''} onChange={f('next_followup')} />
                : <p className={`text-sm ${lead.next_followup && new Date(lead.next_followup) < new Date() ? 'text-red-600 font-bold' : ''}`}>{lead.next_followup || '—'}</p>
              }
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Expected Close</p>
              {editing
                ? <Input type="date" className="h-8 text-sm" value={form.expected_close || ''} onChange={f('expected_close')} />
                : <p className="text-sm">{lead.expected_close || '—'}</p>
              }
            </div>
          </div>

          {editing && (
            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea className="mt-1" rows={2} value={form.notes || ''} onChange={f('notes')} />
            </div>
          )}
          {!editing && lead.notes && (
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Notes</p>
              <p className="text-sm">{lead.notes}</p>
            </div>
          )}

          {/* Quick Status Change */}
          {!['won','lost'].includes(lead.status) && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Quick Status</p>
              <div className="flex gap-2 flex-wrap">
                {['contacted','interested','negotiating','won','lost'].filter(s => s !== lead.status).map(s => (
                  <button key={s} onClick={() => quickStatus(s)}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all hover:shadow-sm ${STATUS_COLORS[s]}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <a href={`tel:${lead.phone}`} className="flex-1">
              <Button variant="outline" size="sm" className="w-full gap-1.5"><Phone className="h-3.5 w-3.5" /> Call</Button>
            </a>
            <a href={`https://wa.me/91${lead.phone?.replace(/\D/g,'')}?text=Namaste ${lead.name}!`} target="_blank" rel="noreferrer" className="flex-1">
              <Button variant="outline" size="sm" className="w-full gap-1.5 text-green-600 border-green-200">
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </Button>
            </a>
            {!['won','lost'].includes(lead.status) && (
              <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-blue-600 border-blue-200" onClick={() => onConvert(lead)}>
                <ClipboardList className="h-3.5 w-3.5" /> Job Card
              </Button>
            )}
          </div>

          {/* Activity Timeline */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold">Activity Timeline</p>
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setAddingFu(v => !v)}>
                <Plus className="h-3 w-3" /> Add
              </Button>
            </div>

            {addingFu && (
              <div className="border rounded-xl p-3 mb-3 space-y-2 bg-muted/30">
                <div className="grid grid-cols-2 gap-2">
                  <Select value={fuForm.type} onValueChange={v => setFuForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="visit">Visit</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="date" className="h-8 text-xs" value={fuForm.next_date} onChange={e => setFuForm(f => ({ ...f, next_date: e.target.value }))} placeholder="Next date" />
                </div>
                <Textarea rows={2} className="text-xs" placeholder="Notes *" value={fuForm.notes} onChange={e => setFuForm(f => ({ ...f, notes: e.target.value }))} />
                <Input className="h-8 text-xs" placeholder="Outcome" value={fuForm.outcome} onChange={e => setFuForm(f => ({ ...f, outcome: e.target.value }))} />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 h-7 text-xs" onClick={saveFu}>Save</Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setAddingFu(false)}>Cancel</Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {/* Lead created */}
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="h-3.5 w-3.5 text-primary" />
                  </div>
                  {followups.length > 0 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="pb-3">
                  <p className="text-sm font-medium">Lead created</p>
                  <p className="text-xs text-muted-foreground">{lead.source} · {new Date(lead.created_at).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              {followups.map((fu, i) => {
                const Icon = FU_ICONS[fu.type] || Clock;
                return (
                  <div key={fu.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      {i < followups.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                    </div>
                    <div className="pb-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium capitalize">{fu.type}</p>
                        <span className="text-xs text-muted-foreground">{new Date(fu.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                      {fu.notes && <p className="text-xs text-muted-foreground mt-0.5">{fu.notes}</p>}
                      {fu.outcome && <p className="text-xs text-green-600 mt-0.5 font-medium flex items-center gap-1"><CheckCircle className="h-3 w-3" />{fu.outcome}</p>}
                      {fu.next_date && <p className="text-xs text-blue-600 mt-0.5">Next: {fu.next_date}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
