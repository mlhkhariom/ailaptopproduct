import { useState, useEffect } from "react";
import { Save, Shield, Key, Lock, Globe, Bot, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";

export default function SecuritySettings() {
  const [s, setS] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('ailaptopwala_token');
  const headers: any = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetch('/api/app-settings').then(r => r.json()).then(d => { if (d && typeof d === 'object') setS(d); }).catch(() => {}); }, []);
  const save = async () => { setSaving(true); await fetch('/api/app-settings', { method: 'PUT', headers, body: JSON.stringify(s) }); toast.success('Security settings saved!'); setSaving(false); };
  const v = (key: string, fallback = '') => s[key] || fallback;
  const set = (key: string, val: string) => setS(p => ({ ...p, [key]: val }));

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><Shield className="h-6 w-6" /> Security & System</h1>
            <p className="text-sm text-muted-foreground">Authentication, rate limits, AI agent, system config</p>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All'}</Button>
        </div>

        <div className="space-y-6">

          {/* ─── AUTHENTICATION ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Key className="h-4 w-4" /> Authentication</CardTitle>
              <CardDescription>JWT, session, password policies</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">JWT Secret</Label><Input className="mt-1 font-mono text-xs" type="password" value={v('jwt_secret')} onChange={e => set('jwt_secret', e.target.value)} placeholder="auto-generated if empty" /></div>
              <div><Label className="text-xs">JWT Expiry</Label>
                <Select value={v('jwt_expiry', '7d')} onValueChange={val => set('jwt_expiry', val)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hour</SelectItem>
                    <SelectItem value="24h">24 hours</SelectItem>
                    <SelectItem value="7d">7 days</SelectItem>
                    <SelectItem value="30d">30 days</SelectItem>
                    <SelectItem value="90d">90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Min password length</Label><Input className="mt-1" type="number" value={v('min_password_length', '6')} onChange={e => set('min_password_length', e.target.value)} /></div>
              <div><Label className="text-xs">Max login attempts (before lockout)</Label><Input className="mt-1" type="number" value={v('max_login_attempts', '5')} onChange={e => set('max_login_attempts', e.target.value)} /></div>
              <div><Label className="text-xs">Lockout duration (minutes)</Label><Input className="mt-1" type="number" value={v('lockout_minutes', '15')} onChange={e => set('lockout_minutes', e.target.value)} /></div>
              <div><Label className="text-xs">2FA (Two-Factor Auth)</Label><div className="mt-2"><Switch checked={v('two_factor_enabled') === '1'} onCheckedChange={c => set('two_factor_enabled', c ? '1' : '0')} /></div><p className="text-[10px] text-muted-foreground mt-1">OTP via email on admin login</p></div>
            </CardContent>
          </Card>

          {/* ─── RATE LIMITING ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Rate Limiting & Protection</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">API rate limit (requests/min)</Label><Input className="mt-1" type="number" value={v('rate_limit_per_min', '100')} onChange={e => set('rate_limit_per_min', e.target.value)} /></div>
              <div><Label className="text-xs">Login rate limit (attempts/hour)</Label><Input className="mt-1" type="number" value={v('login_rate_limit', '20')} onChange={e => set('login_rate_limit', e.target.value)} /></div>
              <div><Label className="text-xs">CORS allowed origins</Label><Input className="mt-1" value={v('cors_origins', '*')} onChange={e => set('cors_origins', e.target.value)} placeholder="https://ailaptopwala.com,http://localhost:8080" /></div>
              <div><Label className="text-xs">IP whitelist (admin panel)</Label><Input className="mt-1" value={v('ip_whitelist')} onChange={e => set('ip_whitelist', e.target.value)} placeholder="Leave empty for all IPs" /><p className="text-[10px] text-muted-foreground mt-1">Comma-separated IPs</p></div>
            </CardContent>
          </Card>

          {/* ─── AI AGENT ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Bot className="h-4 w-4" /> AI Agent Configuration</CardTitle>
              <CardDescription>AI chatbot and automation settings</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">AI enabled</Label><div className="mt-2"><Switch checked={v('ai_enabled', '1') !== '0'} onCheckedChange={c => set('ai_enabled', c ? '1' : '0')} /></div></div>
              <div>
                <Label className="text-xs">AI Provider</Label>
                <Select value={v('ai_provider', 'openai')} onValueChange={val => set('ai_provider', val)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                    <SelectItem value="claude">Anthropic Claude</SelectItem>
                    <SelectItem value="groq">Groq</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">API Key</Label><Input className="mt-1 font-mono text-xs" type="password" value={v('ai_api_key')} onChange={e => set('ai_api_key', e.target.value)} /></div>
              <div><Label className="text-xs">Model</Label><Input className="mt-1" value={v('ai_model', 'gpt-4o-mini')} onChange={e => set('ai_model', e.target.value)} /></div>
              <div><Label className="text-xs">Max tokens per response</Label><Input className="mt-1" type="number" value={v('ai_max_tokens', '500')} onChange={e => set('ai_max_tokens', e.target.value)} /></div>
              <div><Label className="text-xs">Temperature (0-1)</Label><Input className="mt-1" type="number" step="0.1" min="0" max="1" value={v('ai_temperature', '0.7')} onChange={e => set('ai_temperature', e.target.value)} /></div>
              <div className="sm:col-span-2"><Label className="text-xs">System prompt</Label><textarea className="mt-1 w-full border rounded-lg px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" value={v('ai_system_prompt', 'You are a helpful assistant for AI Laptop Wala, a laptop store in Indore.')} onChange={e => set('ai_system_prompt', e.target.value)} /></div>
            </CardContent>
          </Card>

          {/* ─── SESSION & COOKIES ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Session & Cookies</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Session timeout (minutes)</Label><Input className="mt-1" type="number" value={v('session_timeout', '1440')} onChange={e => set('session_timeout', e.target.value)} /><p className="text-[10px] text-muted-foreground mt-1">1440 = 24 hours</p></div>
              <div><Label className="text-xs">Remember me duration (days)</Label><Input className="mt-1" type="number" value={v('remember_me_days', '30')} onChange={e => set('remember_me_days', e.target.value)} /></div>
              <div><Label className="text-xs">Secure cookies (HTTPS only)</Label><div className="mt-2"><Switch checked={v('secure_cookies', '0') === '1'} onCheckedChange={c => set('secure_cookies', c ? '1' : '0')} /></div></div>
              <div><Label className="text-xs">Force logout on password change</Label><div className="mt-2"><Switch checked={v('logout_on_password_change', '1') !== '0'} onCheckedChange={c => set('logout_on_password_change', c ? '1' : '0')} /></div></div>
            </CardContent>
          </Card>

          {/* ─── SYSTEM ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> System & Maintenance</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Maintenance mode</Label><div className="mt-2"><Switch checked={v('maintenance_mode') === '1'} onCheckedChange={c => set('maintenance_mode', c ? '1' : '0')} /></div><p className="text-[10px] text-muted-foreground mt-1">Shows maintenance page to visitors</p></div>
              <div><Label className="text-xs">Debug mode</Label><div className="mt-2"><Switch checked={v('debug_mode') === '1'} onCheckedChange={c => set('debug_mode', c ? '1' : '0')} /></div><p className="text-[10px] text-muted-foreground mt-1">Shows detailed errors (disable in production)</p></div>
              <div><Label className="text-xs">Log level</Label>
                <Select value={v('log_level', 'info')} onValueChange={val => set('log_level', val)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="error">Error only</SelectItem>
                    <SelectItem value="warn">Warnings + Errors</SelectItem>
                    <SelectItem value="info">Info (recommended)</SelectItem>
                    <SelectItem value="debug">Debug (verbose)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Backup frequency</Label>
                <Select value={v('backup_frequency', 'daily')} onValueChange={val => set('backup_frequency', val)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="manual">Manual only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button onClick={save} disabled={saving} size="lg" className="w-full gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All Security Settings'}</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
