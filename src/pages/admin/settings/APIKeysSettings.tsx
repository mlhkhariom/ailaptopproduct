import { useState, useEffect } from "react";
import { Save, Key, Bot, Eye, EyeOff, Copy, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";

const API_SERVICES = [
  { id: 'ai', name: 'AI / LLM', icon: '🤖', keys: [
    { key: 'ai_provider', type: 'select', label: 'Provider', options: ['openai', 'gemini', 'claude', 'groq', 'deepseek'] },
    { key: 'ai_api_key', type: 'secret', label: 'API Key' },
    { key: 'ai_model', type: 'text', label: 'Model', placeholder: 'gpt-4o-mini' },
    { key: 'ai_max_tokens', type: 'number', label: 'Max tokens', placeholder: '500' },
    { key: 'ai_temperature', type: 'number', label: 'Temperature (0-1)', placeholder: '0.7' },
  ]},
  { id: 'razorpay', name: 'Razorpay', icon: '💳', keys: [
    { key: 'razorpay_key_id', type: 'text', label: 'Key ID' },
    { key: 'razorpay_key_secret', type: 'secret', label: 'Key Secret' },
    { key: 'razorpay_webhook_secret', type: 'secret', label: 'Webhook Secret' },
  ]},
  { id: 'phonepe', name: 'PhonePe', icon: '📱', keys: [
    { key: 'phonepe_merchant_id', type: 'text', label: 'Merchant ID' },
    { key: 'phonepe_salt_key', type: 'secret', label: 'Salt Key' },
    { key: 'phonepe_salt_index', type: 'text', label: 'Salt Index', placeholder: '1' },
  ]},
  { id: 'whatsapp', name: 'WhatsApp API', icon: '💬', keys: [
    { key: 'wa_provider', type: 'select', label: 'Provider', options: ['wati', 'twilio', 'meta', 'aisensy', 'interakt'] },
    { key: 'wa_api_key', type: 'secret', label: 'API Key / Token' },
    { key: 'wa_api_url', type: 'text', label: 'API Base URL', placeholder: 'https://live-server-xxxx.wati.io' },
  ]},
  { id: 'sms', name: 'SMS Gateway', icon: '📲', keys: [
    { key: 'sms_provider', type: 'select', label: 'Provider', options: ['none', 'msg91', 'twilio', 'textlocal', 'fast2sms'] },
    { key: 'sms_api_key', type: 'secret', label: 'API Key' },
    { key: 'sms_sender_id', type: 'text', label: 'Sender ID', placeholder: 'AILPTW' },
  ]},
  { id: 'smtp', name: 'Email SMTP', icon: '✉️', keys: [
    { key: 'smtp_host', type: 'text', label: 'Host', placeholder: 'smtp.gmail.com' },
    { key: 'smtp_port', type: 'number', label: 'Port', placeholder: '587' },
    { key: 'smtp_user', type: 'text', label: 'Username' },
    { key: 'smtp_pass', type: 'secret', label: 'Password' },
  ]},
  { id: 'maps', name: 'Google Maps', icon: '🗺️', keys: [
    { key: 'google_maps_key', type: 'secret', label: 'Maps API Key' },
  ]},
  { id: 'analytics', name: 'Analytics', icon: '📊', keys: [
    { key: 'ga_measurement_id', type: 'text', label: 'GA4 Measurement ID', placeholder: 'G-XXXXXXXXXX' },
    { key: 'fb_pixel_id', type: 'text', label: 'Facebook Pixel ID' },
  ]},
  { id: 'cloudinary', name: 'Cloudinary (Images)', icon: '🖼️', keys: [
    { key: 'cloudinary_cloud_name', type: 'text', label: 'Cloud Name' },
    { key: 'cloudinary_api_key', type: 'text', label: 'API Key' },
    { key: 'cloudinary_api_secret', type: 'secret', label: 'API Secret' },
  ]},
  { id: 'firebase', name: 'Firebase (Push)', icon: '🔥', keys: [
    { key: 'fcm_server_key', type: 'secret', label: 'FCM Server Key' },
    { key: 'vapid_public_key', type: 'text', label: 'VAPID Public Key' },
    { key: 'vapid_private_key', type: 'secret', label: 'VAPID Private Key' },
  ]},
];

export default function APIKeysSettings() {
  const [s, setS] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const token = localStorage.getItem('ailaptopwala_token');
  const headers: any = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetch('/api/app-settings').then(r => r.json()).then(d => { if (d && typeof d === 'object') setS(d); }).catch(() => {}); }, []);
  const save = async () => { setSaving(true); await fetch('/api/app-settings', { method: 'PUT', headers, body: JSON.stringify(s) }); toast.success('API Keys saved!'); setSaving(false); };
  const v = (key: string, fallback = '') => s[key] || fallback;
  const set = (key: string, val: string) => setS(p => ({ ...p, [key]: val }));
  const toggle = (key: string) => setVisible(p => ({ ...p, [key]: !p[key] }));
  const copy = (val: string) => { navigator.clipboard.writeText(val); toast.success('Copied!'); };

  const isConfigured = (service: typeof API_SERVICES[0]) => service.keys.some(k => k.type === 'secret' && v(k.key));

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><Key className="h-6 w-6" /> API Keys & Integrations</h1>
            <p className="text-sm text-muted-foreground">All third-party API keys in one place</p>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All'}</Button>
        </div>

        {/* Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-6">
          {API_SERVICES.map(svc => (
            <div key={svc.id} className={`p-2 rounded-lg border text-center text-[10px] ${isConfigured(svc) ? 'border-green-200 bg-green-50' : 'border-muted'}`}>
              <span className="text-lg">{svc.icon}</span>
              <p className="font-medium mt-0.5">{svc.name}</p>
              {isConfigured(svc) ? <CheckCircle className="h-3 w-3 text-green-600 mx-auto mt-0.5" /> : <AlertCircle className="h-3 w-3 text-muted-foreground mx-auto mt-0.5" />}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {API_SERVICES.map(svc => (
            <Card key={svc.id} className={isConfigured(svc) ? 'border-green-200' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <span className="text-lg">{svc.icon}</span> {svc.name}
                  </CardTitle>
                  <Badge variant="secondary" className={`text-[9px] ${isConfigured(svc) ? 'bg-green-100 text-green-700' : 'bg-muted'}`}>
                    {isConfigured(svc) ? 'Connected' : 'Not configured'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-3">
                  {svc.keys.map(field => (
                    <div key={field.key}>
                      <Label className="text-[10px] uppercase text-muted-foreground">{field.label}</Label>
                      {field.type === 'select' ? (
                        <Select value={v(field.key, field.options?.[0] || '')} onValueChange={val => set(field.key, val)}>
                          <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                          <SelectContent>{field.options?.map(o => <SelectItem key={o} value={o} className="capitalize">{o}</SelectItem>)}</SelectContent>
                        </Select>
                      ) : (
                        <div className="relative mt-1">
                          <Input
                            className="h-8 text-xs font-mono pr-16"
                            type={field.type === 'secret' && !visible[field.key] ? 'password' : field.type === 'number' ? 'number' : 'text'}
                            value={v(field.key)}
                            onChange={e => set(field.key, e.target.value)}
                            placeholder={field.placeholder || ''}
                          />
                          {field.type === 'secret' && (
                            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-0.5">
                              <button onClick={() => toggle(field.key)} className="p-1 text-muted-foreground hover:text-foreground">{visible[field.key] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}</button>
                              {v(field.key) && <button onClick={() => copy(v(field.key))} className="p-1 text-muted-foreground hover:text-foreground"><Copy className="h-3 w-3" /></button>}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI System Prompt (special — full width) */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><Bot className="h-4 w-4" /> AI Agent System Prompt</CardTitle>
            <CardDescription>Instructions for the AI chatbot/agent</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea className="w-full border rounded-lg px-3 py-2 text-sm min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono text-xs" value={v('ai_system_prompt', 'You are a helpful assistant for AI Laptop Wala, a laptop store in Indore. Help customers with laptop queries, pricing, and repairs.')} onChange={e => set('ai_system_prompt', e.target.value)} />
            <div className="flex items-center justify-between mt-2">
              <p className="text-[10px] text-muted-foreground">{v('ai_system_prompt', '').length} characters</p>
              <div className="flex items-center gap-2">
                <Label className="text-[10px]">AI Enabled</Label>
                <Switch checked={v('ai_enabled', '1') !== '0'} onCheckedChange={c => set('ai_enabled', c ? '1' : '0')} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={save} disabled={saving} size="lg" className="w-full mt-6 gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All API Keys'}</Button>
      </div>
    </AdminLayout>
  );
}
