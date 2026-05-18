import { useState, useEffect } from "react";
import { Save, Bell, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";

export default function NotificationSettings() {
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
          <div><h1 className="text-2xl font-black flex items-center gap-2"><Bell className="h-6 w-6" /> Notification Settings</h1><p className="text-sm text-muted-foreground">Email, WhatsApp, push notification config</p></div>
          <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save'}</Button>
        </div>
        <div className="space-y-6">
          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4" /> Email (SMTP)</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
            <div><Label>SMTP Host</Label><Input className="mt-1" value={v('smtp_host')} onChange={e => set('smtp_host', e.target.value)} placeholder="smtp.gmail.com" /></div>
            <div><Label>SMTP Port</Label><Input className="mt-1" value={v('smtp_port')} onChange={e => set('smtp_port', e.target.value)} placeholder="587" /></div>
            <div><Label>SMTP User</Label><Input className="mt-1" value={v('smtp_user')} onChange={e => set('smtp_user', e.target.value)} placeholder="your@gmail.com" /></div>
            <div><Label>SMTP Password</Label><Input className="mt-1" type="password" value={v('smtp_pass')} onChange={e => set('smtp_pass', e.target.value)} /></div>
            <div><Label>From Name</Label><Input className="mt-1" value={v('email_from_name')} onChange={e => set('email_from_name', e.target.value)} placeholder="AI Laptop Wala" /></div>
            <div><Label>Admin Email (reports)</Label><Input className="mt-1" value={v('site_email')} onChange={e => set('site_email', e.target.value)} /></div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
            <div><Label>Owner phone (reports)</Label><Input className="mt-1" value={v('admin_phone')} onChange={e => set('admin_phone', e.target.value)} placeholder="9893496163" /></div>
            <div><Label>Daily report time (24h)</Label><Input className="mt-1" value={v('daily_report_hour')} onChange={e => set('daily_report_hour', e.target.value)} placeholder="21" /></div>
            <div><Label>Abandoned cart reminder (hours)</Label><Input className="mt-1" value={v('abandoned_cart_hours')} onChange={e => set('abandoned_cart_hours', e.target.value)} placeholder="2" /></div>
            <div><Label>Overdue reminder interval (hours)</Label><Input className="mt-1" value={v('overdue_reminder_hours')} onChange={e => set('overdue_reminder_hours', e.target.value)} placeholder="6" /></div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base">Email Toggles</CardTitle></CardHeader><CardContent className="space-y-3">
            {['email_order_confirmation','email_order_shipped','email_order_delivered','email_daily_report','email_new_lead','email_payment_received'].map(key => (
              <div key={key} className="flex items-center justify-between py-1.5 border-b last:border-0">
                <Label className="text-sm">{key.replace(/email_/,'').replace(/_/g,' ')}</Label>
                <Switch checked={v(key) !== '0' && v(key) !== 'false'} onCheckedChange={checked => set(key, checked ? '1' : '0')} />
              </div>
            ))}
          </CardContent></Card>

          <Button onClick={save} disabled={saving} className="w-full gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All'}</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
