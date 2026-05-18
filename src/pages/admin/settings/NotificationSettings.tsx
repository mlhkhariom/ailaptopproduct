import { useState, useEffect } from "react";
import { Save, Bell, Mail, MessageCircle, Smartphone, Send, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";

export default function NotificationSettings() {
  const [s, setS] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingWa, setTestingWa] = useState(false);
  const token = localStorage.getItem('ailaptopwala_token');
  const headers: any = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetch('/api/app-settings').then(r => r.json()).then(d => { if (d && typeof d === 'object') setS(d); }).catch(() => {}); }, []);
  const save = async () => { setSaving(true); await fetch('/api/app-settings', { method: 'PUT', headers, body: JSON.stringify(s) }); toast.success('Notification settings saved!'); setSaving(false); };
  const v = (key: string, fallback = '') => s[key] || fallback;
  const set = (key: string, val: string) => setS(p => ({ ...p, [key]: val }));

  const testEmail = async () => {
    setTestingEmail(true);
    try {
      const res = await fetch('/api/notifications/test-email', { method: 'POST', headers, body: JSON.stringify({ to: v('admin_email', v('store_email')) }) });
      if (res.ok) toast.success('Test email sent!'); else toast.error('Email failed — check SMTP config');
    } catch { toast.error('Email test failed'); }
    setTestingEmail(false);
  };

  const testWhatsApp = async () => {
    setTestingWa(true);
    try {
      const res = await fetch('/api/notifications/test-whatsapp', { method: 'POST', headers, body: JSON.stringify({ to: v('admin_phone', v('whatsapp_number')) }) });
      if (res.ok) toast.success('Test WhatsApp sent!'); else toast.error('WhatsApp failed — check API config');
    } catch { toast.error('WhatsApp test failed'); }
    setTestingWa(false);
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><Bell className="h-6 w-6" /> Notification Settings</h1>
            <p className="text-sm text-muted-foreground">Email, WhatsApp, SMS, push notification config</p>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All'}</Button>
        </div>

        <div className="space-y-6">

          {/* ─── SMTP / EMAIL ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4" /> Email (SMTP)</CardTitle>
              <CardDescription>Configure SMTP for transactional emails (order confirmations, OTP, etc.)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label className="text-xs">SMTP Host</Label><Input className="mt-1" value={v('smtp_host')} onChange={e => set('smtp_host', e.target.value)} placeholder="smtp.gmail.com" /></div>
                <div><Label className="text-xs">SMTP Port</Label><Input className="mt-1" type="number" value={v('smtp_port', '587')} onChange={e => set('smtp_port', e.target.value)} /></div>
                <div><Label className="text-xs">SMTP User / Email</Label><Input className="mt-1" value={v('smtp_user')} onChange={e => set('smtp_user', e.target.value)} placeholder="noreply@ailaptopwala.com" /></div>
                <div><Label className="text-xs">SMTP Password</Label><Input className="mt-1" type="password" value={v('smtp_pass')} onChange={e => set('smtp_pass', e.target.value)} /></div>
                <div><Label className="text-xs">From Name</Label><Input className="mt-1" value={v('smtp_from_name', 'AI Laptop Wala')} onChange={e => set('smtp_from_name', e.target.value)} /></div>
                <div>
                  <Label className="text-xs">Encryption</Label>
                  <Select value={v('smtp_encryption', 'tls')} onValueChange={val => set('smtp_encryption', val)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tls">TLS (port 587)</SelectItem>
                      <SelectItem value="ssl">SSL (port 465)</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={testEmail} disabled={testingEmail}>
                <Send className="h-3 w-3" />{testingEmail ? 'Sending...' : 'Send Test Email'}
              </Button>
            </CardContent>
          </Card>

          {/* ─── WHATSAPP API ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp API</CardTitle>
              <CardDescription>For automated messages, broadcasts, and CRM notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Provider</Label>
                  <Select value={v('wa_provider', 'wati')} onValueChange={val => set('wa_provider', val)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wati">WATI</SelectItem>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="meta">Meta Cloud API</SelectItem>
                      <SelectItem value="aisensy">AiSensy</SelectItem>
                      <SelectItem value="interakt">Interakt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">API Key / Token</Label><Input className="mt-1" type="password" value={v('wa_api_key')} onChange={e => set('wa_api_key', e.target.value)} /></div>
                <div><Label className="text-xs">API Base URL</Label><Input className="mt-1" value={v('wa_api_url')} onChange={e => set('wa_api_url', e.target.value)} placeholder="https://live-server-xxxx.wati.io" /></div>
                <div><Label className="text-xs">Business Phone (with country code)</Label><Input className="mt-1" value={v('wa_business_phone')} onChange={e => set('wa_business_phone', e.target.value)} placeholder="919893496163" /></div>
              </div>
              <Button variant="outline" size="sm" className="gap-2" onClick={testWhatsApp} disabled={testingWa}>
                <Send className="h-3 w-3" />{testingWa ? 'Sending...' : 'Send Test WhatsApp'}
              </Button>
            </CardContent>
          </Card>

          {/* ─── SMS ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Smartphone className="h-4 w-4" /> SMS Gateway</CardTitle>
              <CardDescription>For OTP, order updates, delivery notifications</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">SMS Provider</Label>
                <Select value={v('sms_provider', 'none')} onValueChange={val => set('sms_provider', val)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Disabled</SelectItem>
                    <SelectItem value="msg91">MSG91</SelectItem>
                    <SelectItem value="twilio">Twilio</SelectItem>
                    <SelectItem value="textlocal">TextLocal</SelectItem>
                    <SelectItem value="fast2sms">Fast2SMS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">API Key</Label><Input className="mt-1" type="password" value={v('sms_api_key')} onChange={e => set('sms_api_key', e.target.value)} /></div>
              <div><Label className="text-xs">Sender ID (6 chars)</Label><Input className="mt-1" value={v('sms_sender_id', 'AILPTW')} onChange={e => set('sms_sender_id', e.target.value)} maxLength={6} /></div>
              <div><Label className="text-xs">DLT Template ID (for OTP)</Label><Input className="mt-1" value={v('sms_dlt_template')} onChange={e => set('sms_dlt_template', e.target.value)} /></div>
            </CardContent>
          </Card>

          {/* ─── EMAIL EVENTS ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Notification Events</CardTitle>
              <CardDescription>Which events send emails to customers/admin</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-3">
              {[
                { key: 'email_order_confirm', label: 'Order confirmation', desc: 'To customer on order placed' },
                { key: 'email_order_shipped', label: 'Order shipped', desc: 'To customer with tracking' },
                { key: 'email_order_delivered', label: 'Order delivered', desc: 'To customer' },
                { key: 'email_new_order_admin', label: 'New order (admin)', desc: 'To admin on every order' },
                { key: 'email_signup_welcome', label: 'Welcome email', desc: 'To customer on signup' },
                { key: 'email_abandoned_cart', label: 'Abandoned cart', desc: 'Reminder after X hours' },
                { key: 'email_review_request', label: 'Review request', desc: 'After delivery' },
                { key: 'email_lead_assigned', label: 'Lead assigned (CRM)', desc: 'To staff member' },
              ].map(ev => (
                <div key={ev.key} className="flex items-center justify-between p-3 rounded-lg border">
                  <div><p className="text-sm font-medium">{ev.label}</p><p className="text-[10px] text-muted-foreground">{ev.desc}</p></div>
                  <Switch checked={v(ev.key, '1') !== '0'} onCheckedChange={c => set(ev.key, c ? '1' : '0')} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ─── PUSH NOTIFICATIONS ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Push Notifications (PWA)</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Push enabled</Label><div className="mt-2"><Switch checked={v('push_enabled') === '1'} onCheckedChange={c => set('push_enabled', c ? '1' : '0')} /></div></div>
              <div><Label className="text-xs">VAPID Public Key</Label><Input className="mt-1 font-mono text-xs" value={v('vapid_public_key')} onChange={e => set('vapid_public_key', e.target.value)} /></div>
              <div><Label className="text-xs">VAPID Private Key</Label><Input className="mt-1 font-mono text-xs" type="password" value={v('vapid_private_key')} onChange={e => set('vapid_private_key', e.target.value)} /></div>
              <div><Label className="text-xs">FCM Server Key (optional)</Label><Input className="mt-1 font-mono text-xs" type="password" value={v('fcm_server_key')} onChange={e => set('fcm_server_key', e.target.value)} /></div>
            </CardContent>
          </Card>

          <Button onClick={save} disabled={saving} size="lg" className="w-full gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All Notification Settings'}</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
