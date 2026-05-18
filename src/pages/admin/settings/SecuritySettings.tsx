import { useState, useEffect } from "react";
import { Save, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";

export default function SecuritySettings() {
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
          <div><h1 className="text-2xl font-black flex items-center gap-2"><Shield className="h-6 w-6" /> Security & Integrations</h1><p className="text-sm text-muted-foreground">API keys, security, system config</p></div>
          <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save'}</Button>
        </div>
        <div className="space-y-6">
          <Card><CardHeader><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" /> Security</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
            <div><Label>JWT expiry</Label><Input className="mt-1" value={v('jwt_expiry')} onChange={e => set('jwt_expiry', e.target.value)} placeholder="30d" /></div>
            <div><Label>Rate limit (req/15min)</Label><Input className="mt-1" type="number" value={v('rate_limit')} onChange={e => set('rate_limit', e.target.value)} placeholder="200" /></div>
            <div><Label>Auth rate limit (req/15min)</Label><Input className="mt-1" type="number" value={v('auth_rate_limit')} onChange={e => set('auth_rate_limit', e.target.value)} placeholder="20" /></div>
            <div><Label>Min password length</Label><Input className="mt-1" type="number" value={v('min_password_length')} onChange={e => set('min_password_length', e.target.value)} placeholder="6" /></div>
            <div><Label>2FA enabled</Label><Input className="mt-1" value={v('2fa_enabled')} onChange={e => set('2fa_enabled', e.target.value)} placeholder="yes / no" /></div>
            <div><Label>Maintenance mode</Label><Input className="mt-1" value={v('maintenance_mode')} onChange={e => set('maintenance_mode', e.target.value)} placeholder="off / on" /></div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base">AI Agent</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
            <div><Label>AI Provider</Label><Input className="mt-1" value={v('ai_provider')} onChange={e => set('ai_provider', e.target.value)} placeholder="openrouter / gemini" /></div>
            <div><Label>AI Model</Label><Input className="mt-1" value={v('ai_model')} onChange={e => set('ai_model', e.target.value)} placeholder="google/gemini-2.0-flash-exp:free" /></div>
            <div><Label>AI API Key</Label><Input className="mt-1" type="password" value={v('ai_api_key')} onChange={e => set('ai_api_key', e.target.value)} /></div>
            <div><Label>Business hours (e.g. 10-21)</Label><Input className="mt-1" value={v('ai_business_hours')} onChange={e => set('ai_business_hours', e.target.value)} placeholder="10-21" /></div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base">System</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
            <div><Label>Frontend URL</Label><Input className="mt-1" value={v('frontend_url')} onChange={e => set('frontend_url', e.target.value)} placeholder="https://ailaptopwala.com" /></div>
            <div><Label>Config cache TTL (sec)</Label><Input className="mt-1" type="number" value={v('config_cache_ttl')} onChange={e => set('config_cache_ttl', e.target.value)} placeholder="30" /></div>
            <div><Label>Max upload size (MB)</Label><Input className="mt-1" type="number" value={v('max_upload_mb')} onChange={e => set('max_upload_mb', e.target.value)} placeholder="50" /></div>
            <div><Label>Google Analytics ID</Label><Input className="mt-1" value={v('ga_id')} onChange={e => set('ga_id', e.target.value)} placeholder="G-XXXXXXXXXX" /></div>
          </CardContent></Card>

          <Button onClick={save} disabled={saving} className="w-full gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All'}</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
