import { useState, useEffect } from "react";
import { Save, Bell, Mail, MessageCircle, Smartphone, Send, CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";

export default function NotificationSettings() {
  const [s, setS] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingWa, setTestingWa] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [waStatus, setWaStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const token = localStorage.getItem('ailaptopwala_token');
  const headers: any = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetch('/api/app-settings').then(r => r.json()).then(d => { if (d && typeof d === 'object') setS(d); }).catch(() => {}); }, []);
  const save = async () => { setSaving(true); await fetch('/api/app-settings', { method: 'PUT', headers, body: JSON.stringify(s) }); toast.success('Notification settings saved!'); setSaving(false); };
  const v = (key: string, fallback = '') => s[key] || fallback;
  const set = (key: string, val: string) => setS(p => ({ ...p, [key]: val }));

  const testEmail = async () => {
    setTestingEmail(true); setEmailStatus('idle');
    try {
      const res = await fetch('/api/notifications/test-email', { method: 'POST', headers, body: JSON.stringify({ to: v('smtp_user', v('store_email')) }) });
      if (res.ok) { toast.success('Test email sent!'); setEmailStatus('success'); }
      else { const d = await res.json(); toast.error(d.message || 'Failed'); setEmailStatus('error'); }
    } catch { toast.error('Connection failed'); setEmailStatus('error'); }
    setTestingEmail(false);
  };

  const testWhatsApp = async () => {
    setTestingWa(true); setWaStatus('idle');
    try {
      const res = await fetch('/api/notifications/test-whatsapp', { method: 'POST', headers, body: JSON.stringify({ to: v('wa_business_phone', v('whatsapp_number')) }) });
      if (res.ok) { toast.success('Test WhatsApp sent!'); setWaStatus('success'); }
      else { const d = await res.json(); toast.error(d.message || 'Failed'); setWaStatus('error'); }
    } catch { toast.error('Connection failed'); setWaStatus('error'); }
    setTestingWa(false);
  };

  const StatusBadge = ({ configured, label }: { configured: boolean; label: string }) => (
    <Badge variant={configured ? 'default' : 'secondary'} className={`text-[10px] ${configured ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
      {configured ? <CheckCircle className="h-3 w-3 mr-1" /> : <AlertCircle className="h-3 w-3 mr-1" />}
      {label}
    </Badge>
  );

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><Bell className="h-6 w-6" /> Notification Settings</h1>
            <p className="text-sm text-muted-foreground">Email, WhatsApp, SMS, push — configure and test</p>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All'}</Button>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className={`p-3 rounded-lg border-2 text-center ${v('smtp_host') ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
            <Mail className={`h-5 w-5 mx-auto mb-1 ${v('smtp_host') ? 'text-green-600' : 'text-orange-500'}`} />
            <p className="text-[10px] font-bold">{v('smtp_host') ? 'Email Ready' : 'Not Configured'}</p>
          </div>
          <div className={`p-3 rounded-lg border-2 text-center ${v('wa_api_key') ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
            <MessageCircle className={`h-5 w-5 mx-auto mb-1 ${v('wa_api_key') ? 'text-green-600' : 'text-orange-500'}`} />
            <p className="text-[10px] font-bold">{v('wa_api_key') ? 'WhatsApp Ready' : 'Not Configured'}</p>
          </div>
          <div className={`p-3 rounded-lg border-2 text-center ${v('sms_api_key') ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
            <Smartphone className={`h-5 w-5 mx-auto mb-1 ${v('sms_api_key') ? 'text-green-600' : 'text-orange-500'}`} />
            <p className="text-[10px] font-bold">{v('sms_api_key') ? 'SMS Ready' : 'Not Configured'}</p>
          </div>
          <div className={`p-3 rounded-lg border-2 text-center ${v('push_enabled') === '1' ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
            <Bell className={`h-5 w-5 mx-auto mb-1 ${v('push_enabled') === '1' ? 'text-green-600' : 'text-orange-500'}`} />
            <p className="text-[10px] font-bold">{v('push_enabled') === '1' ? 'Push Active' : 'Push Off'}</p>
          </div>
        </div>

        <div className="space-y-6">

          {/* ─── SMTP / EMAIL ─── */}
          <Card className={v('smtp_host') ? 'border-green-200' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2"><Mail className="h-4 w-4" /> Email (SMTP)</CardTitle>
                  <CardDescription>Transactional emails — order confirmations, OTP, notifications</CardDescription>
                </div>
                <StatusBadge configured={!!v('smtp_host')} label={v('smtp_host') ? 'Configured' : 'Setup needed'} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label className="text-xs">SMTP Host</Label><Input className="mt-1" value={v('smtp_host')} onChange={e => set('smtp_host', e.target.value)} placeholder="smtp.gmail.com" /></div>
                <div><Label className="text-xs">Port</Label><Input className="mt-1" type="number" value={v('smtp_port', '587')} onChange={e => set('smtp_port', e.target.value)} /></div>
                <div><Label className="text-xs">Username / Email</Label><Input className="mt-1" value={v('smtp_user')} onChange={e => set('smtp_user', e.target.value)} placeholder="noreply@ailaptopwala.com" /></div>
                <div><Label className="text-xs">Password / App Password</Label><Input className="mt-1" type="password" value={v('smtp_pass')} onChange={e => set('smtp_pass', e.target.value)} /></div>
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
              <div className="flex items-center gap-3 pt-2 border-t">
                <Button variant="outline" size="sm" className="gap-2" onClick={testEmail} disabled={testingEmail || !v('smtp_host')}>
                  {testingEmail ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                  {testingEmail ? 'Sending...' : 'Send Test Email'}
                </Button>
                {emailStatus === 'success' && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Sent successfully</span>}
                {emailStatus === 'error' && <span className="text-xs text-red-600 flex items-center gap-1"><XCircle className="h-3 w-3" /> Failed — check config</span>}
              </div>
            </CardContent>
          </Card>

          {/* ─── WHATSAPP API ─── */}
          <Card className={v('wa_api_key') ? 'border-green-200' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2"><MessageCircle className="h-4 w-4" /> WhatsApp API</CardTitle>
                  <CardDescription>Automated messages, broadcasts, CRM notifications</CardDescription>
                </div>
                <StatusBadge configured={!!v('wa_api_key')} label={v('wa_api_key') ? 'Connected' : 'Setup needed'} />
              </div>
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
              <div className="flex items-center gap-3 pt-2 border-t">
                <Button variant="outline" size="sm" className="gap-2" onClick={testWhatsApp} disabled={testingWa || !v('wa_api_key')}>
                  {testingWa ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                  {testingWa ? 'Sending...' : 'Send Test WhatsApp'}
                </Button>
                {waStatus === 'success' && <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Sent</span>}
                {waStatus === 'error' && <span className="text-xs text-red-600 flex items-center gap-1"><XCircle className="h-3 w-3" /> Failed</span>}
              </div>
            </CardContent>
          </Card>

          {/* ─── SMS ─── */}
          <Card className={v('sms_api_key') ? 'border-green-200' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2"><Smartphone className="h-4 w-4" /> SMS Gateway</CardTitle>
                  <CardDescription>OTP, order updates, delivery notifications</CardDescription>
                </div>
                <StatusBadge configured={!!v('sms_api_key')} label={v('sms_api_key') ? 'Active' : 'Disabled'} />
              </div>
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
              <div><Label className="text-xs">DLT Template ID (OTP)</Label><Input className="mt-1" value={v('sms_dlt_template')} onChange={e => set('sms_dlt_template', e.target.value)} /></div>
            </CardContent>
          </Card>

          {/* ─── EMAIL EVENTS ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Email Notification Events</CardTitle>
              <CardDescription>Toggle which events send emails</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { key: 'email_order_confirm', label: 'Order confirmation', desc: 'Customer — on order placed', icon: '🛒' },
                  { key: 'email_order_shipped', label: 'Order shipped', desc: 'Customer — with tracking info', icon: '📦' },
                  { key: 'email_order_delivered', label: 'Order delivered', desc: 'Customer — delivery confirmed', icon: '✅' },
                  { key: 'email_new_order_admin', label: 'New order (admin)', desc: 'Admin — every new order', icon: '🔔' },
                  { key: 'email_signup_welcome', label: 'Welcome email', desc: 'Customer — on signup', icon: '👋' },
                  { key: 'email_abandoned_cart', label: 'Abandoned cart', desc: 'Customer — reminder after X hours', icon: '🛒' },
                  { key: 'email_review_request', label: 'Review request', desc: 'Customer — after delivery', icon: '⭐' },
                  { key: 'email_lead_assigned', label: 'Lead assigned (CRM)', desc: 'Staff — when lead assigned', icon: '👤' },
                ].map(ev => (
                  <div key={ev.key} className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{ev.icon}</span>
                      <div><p className="text-sm font-medium">{ev.label}</p><p className="text-[10px] text-muted-foreground">{ev.desc}</p></div>
                    </div>
                    <Switch checked={v(ev.key, '1') !== '0'} onCheckedChange={c => set(ev.key, c ? '1' : '0')} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ─── PUSH NOTIFICATIONS ─── */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Push Notifications (PWA)</CardTitle>
                  <CardDescription>Browser push for real-time alerts</CardDescription>
                </div>
                <Switch checked={v('push_enabled') === '1'} onCheckedChange={c => set('push_enabled', c ? '1' : '0')} />
              </div>
            </CardHeader>
            {v('push_enabled') === '1' && (
              <CardContent className="grid sm:grid-cols-2 gap-4">
                <div><Label className="text-xs">VAPID Public Key</Label><Input className="mt-1 font-mono text-[10px]" value={v('vapid_public_key')} onChange={e => set('vapid_public_key', e.target.value)} /></div>
                <div><Label className="text-xs">VAPID Private Key</Label><Input className="mt-1 font-mono text-[10px]" type="password" value={v('vapid_private_key')} onChange={e => set('vapid_private_key', e.target.value)} /></div>
                <div><Label className="text-xs">FCM Server Key (optional)</Label><Input className="mt-1 font-mono text-[10px]" type="password" value={v('fcm_server_key')} onChange={e => set('fcm_server_key', e.target.value)} /></div>
                <div><Label className="text-xs">Contact email (for VAPID)</Label><Input className="mt-1" value={v('vapid_email', v('store_email'))} onChange={e => set('vapid_email', e.target.value)} /></div>
              </CardContent>
            )}
          </Card>

          <Button onClick={save} disabled={saving} size="lg" className="w-full gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All Notification Settings'}</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
