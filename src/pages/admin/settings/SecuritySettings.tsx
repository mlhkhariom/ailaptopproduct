import { useState, useEffect } from "react";
import { Save, Shield, Key, Lock, Globe, Bot, Clock, AlertTriangle, Eye, EyeOff, Copy, RefreshCw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";

export default function SecuritySettings() {
  const [s, setS] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showJwt, setShowJwt] = useState(false);
  const token = localStorage.getItem('ailaptopwala_token');
  const headers: any = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetch('/api/app-settings').then(r => r.json()).then(d => { if (d && typeof d === 'object') setS(d); }).catch(() => {}); }, []);
  const save = async () => { setSaving(true); await fetch('/api/app-settings', { method: 'PUT', headers, body: JSON.stringify(s) }); toast.success('Security settings saved!'); setSaving(false); };
  const v = (key: string, fallback = '') => s[key] || fallback;
  const set = (key: string, val: string) => setS(p => ({ ...p, [key]: val }));

  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = ''; for (let i = 0; i < 64; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    set('jwt_secret', result); toast.success('New JWT secret generated');
  };

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); toast.success('Copied!'); };

  // Security score
  const checks = [!!v('jwt_secret'), v('max_login_attempts', '5') !== '0', v('two_factor_enabled') === '1', v('rate_limit_per_min'), v('secure_cookies') === '1', v('maintenance_mode') !== '1'];
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><Shield className="h-6 w-6" /> Security & System</h1>
            <p className="text-sm text-muted-foreground">Authentication, rate limits, sessions, maintenance</p>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All'}</Button>
        </div>

        {/* Security Score */}
        <div className="mb-6 p-4 rounded-xl border-2 border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold">Security Score</span>
            <Badge className={score >= 80 ? 'bg-green-100 text-green-700' : score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}>{score}%</Badge>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${score}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Based on: JWT secret, login limits, 2FA, rate limiting, secure cookies</p>
        </div>

        <div className="space-y-6">

          {/* ─── AUTHENTICATION ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Key className="h-4 w-4" /> Authentication</CardTitle>
              <CardDescription>JWT, password policy, login protection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* JWT Secret */}
              <div className="p-3 rounded-lg border bg-muted/30">
                <Label className="text-xs font-bold">JWT Secret Key</Label>
                <div className="flex gap-2 mt-1">
                  <div className="relative flex-1">
                    <Input className="pr-10 font-mono text-xs" type={showJwt ? 'text' : 'password'} value={v('jwt_secret')} onChange={e => set('jwt_secret', e.target.value)} placeholder="Click Generate to create one" />
                    <button onClick={() => setShowJwt(!showJwt)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">{showJwt ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
                  </div>
                  <Button size="sm" variant="outline" className="gap-1 shrink-0" onClick={generateSecret}><RefreshCw className="h-3 w-3" /> Generate</Button>
                  {v('jwt_secret') && <Button size="sm" variant="ghost" className="shrink-0" onClick={() => copyToClipboard(v('jwt_secret'))}><Copy className="h-3 w-3" /></Button>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Token Expiry</Label>
                  <Select value={v('jwt_expiry', '7d')} onValueChange={val => set('jwt_expiry', val)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hour (high security)</SelectItem>
                      <SelectItem value="24h">24 hours</SelectItem>
                      <SelectItem value="7d">7 days (recommended)</SelectItem>
                      <SelectItem value="30d">30 days</SelectItem>
                      <SelectItem value="90d">90 days (convenience)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Min password length</Label><Input className="mt-1" type="number" value={v('min_password_length', '6')} onChange={e => set('min_password_length', e.target.value)} /></div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div><p className="text-xs font-medium">2FA (OTP on login)</p><p className="text-[9px] text-muted-foreground">Email OTP for admin</p></div>
                  <Switch checked={v('two_factor_enabled') === '1'} onCheckedChange={c => set('two_factor_enabled', c ? '1' : '0')} />
                </div>
                <div className="p-3 rounded-lg border">
                  <Label className="text-[10px]">Max login attempts</Label>
                  <Input className="mt-1 h-7" type="number" value={v('max_login_attempts', '5')} onChange={e => set('max_login_attempts', e.target.value)} />
                </div>
                <div className="p-3 rounded-lg border">
                  <Label className="text-[10px]">Lockout (minutes)</Label>
                  <Input className="mt-1 h-7" type="number" value={v('lockout_minutes', '15')} onChange={e => set('lockout_minutes', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ─── RATE LIMITING ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Rate Limiting & CORS</CardTitle>
              <CardDescription>Protect against abuse and configure allowed origins</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border">
                <Label className="text-[10px] uppercase text-muted-foreground">API requests / minute</Label>
                <Input className="mt-1 h-8 text-lg font-bold text-center" type="number" value={v('rate_limit_per_min', '100')} onChange={e => set('rate_limit_per_min', e.target.value)} />
              </div>
              <div className="p-3 rounded-lg border">
                <Label className="text-[10px] uppercase text-muted-foreground">Login attempts / hour</Label>
                <Input className="mt-1 h-8 text-lg font-bold text-center" type="number" value={v('login_rate_limit', '20')} onChange={e => set('login_rate_limit', e.target.value)} />
              </div>
              <div><Label className="text-xs">CORS allowed origins</Label><Input className="mt-1 font-mono text-xs" value={v('cors_origins', '*')} onChange={e => set('cors_origins', e.target.value)} placeholder="* or https://ailaptopwala.com" /><p className="text-[10px] text-muted-foreground mt-1">Comma-separated. * = allow all</p></div>
              <div><Label className="text-xs">IP whitelist (admin only)</Label><Input className="mt-1 font-mono text-xs" value={v('ip_whitelist')} onChange={e => set('ip_whitelist', e.target.value)} placeholder="Empty = all IPs allowed" /><p className="text-[10px] text-muted-foreground mt-1">Comma-separated IPs</p></div>
            </CardContent>
          </Card>

          {/* ─── SESSION ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Session & Cookies</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Session timeout (minutes)</Label><Input className="mt-1" type="number" value={v('session_timeout', '1440')} onChange={e => set('session_timeout', e.target.value)} /><p className="text-[10px] text-muted-foreground mt-1">1440 = 24 hours</p></div>
              <div><Label className="text-xs">Remember me (days)</Label><Input className="mt-1" type="number" value={v('remember_me_days', '30')} onChange={e => set('remember_me_days', e.target.value)} /></div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-xs font-medium">Secure cookies</p><p className="text-[9px] text-muted-foreground">HTTPS only (enable in production)</p></div>
                <Switch checked={v('secure_cookies') === '1'} onCheckedChange={c => set('secure_cookies', c ? '1' : '0')} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-xs font-medium">Logout on password change</p><p className="text-[9px] text-muted-foreground">Force re-login everywhere</p></div>
                <Switch checked={v('logout_on_password_change', '1') !== '0'} onCheckedChange={c => set('logout_on_password_change', c ? '1' : '0')} />
              </div>
            </CardContent>
          </Card>

          {/* ─── SYSTEM ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> System & Maintenance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className={`flex items-center justify-between p-3 rounded-lg border-2 ${v('maintenance_mode') === '1' ? 'border-red-300 bg-red-50' : ''}`}>
                  <div><p className="text-xs font-medium">Maintenance mode</p><p className="text-[9px] text-muted-foreground">Shows maintenance page to visitors</p></div>
                  <Switch checked={v('maintenance_mode') === '1'} onCheckedChange={c => set('maintenance_mode', c ? '1' : '0')} />
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg border-2 ${v('debug_mode') === '1' ? 'border-yellow-300 bg-yellow-50' : ''}`}>
                  <div><p className="text-xs font-medium">Debug mode</p><p className="text-[9px] text-muted-foreground">Detailed errors (disable in prod)</p></div>
                  <Switch checked={v('debug_mode') === '1'} onCheckedChange={c => set('debug_mode', c ? '1' : '0')} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Log level</Label>
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
                <div>
                  <Label className="text-xs">Backup frequency</Label>
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
              </div>
            </CardContent>
          </Card>

          <Button onClick={save} disabled={saving} size="lg" className="w-full gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All Security Settings'}</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
