import { useState, useEffect } from "react";
import { Save, Shield, Power, Lock, Unlock, Building2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const MODULES = [
  { key: 'mod_ecommerce', label: 'Ecommerce', desc: 'Products, Orders, Payments, Cart, Checkout', icon: '🛒' },
  { key: 'mod_crm', label: 'CRM & Leads', desc: 'Lead management, pipeline, automations', icon: '👥' },
  { key: 'mod_erp', label: 'ERP (Job Cards)', desc: 'Repair job cards, SLA, warranty', icon: '🔧' },
  { key: 'mod_billing', label: 'Billing & Invoices', desc: 'GST invoices, recurring, credit notes', icon: '🧾' },
  { key: 'mod_inventory', label: 'Inventory & Stock', desc: 'Multi-branch stock, PO, suppliers', icon: '📦' },
  { key: 'mod_hr', label: 'HR & Staff', desc: 'Attendance, payroll, leaves, shifts', icon: '👔' },
  { key: 'mod_blog', label: 'Blog & CMS', desc: 'Blog posts, pages, media library', icon: '📝' },
  { key: 'mod_whatsapp', label: 'WhatsApp Integration', desc: 'Chat, broadcast, templates, AI agent', icon: '💬' },
  { key: 'mod_email', label: 'Email Campaigns', desc: 'Email marketing, newsletters', icon: '📧' },
  { key: 'mod_social', label: 'Social Media', desc: 'Social posts, reels, scheduling', icon: '📱' },
  { key: 'mod_analytics', label: 'Analytics & Reports', desc: 'Dashboard, report builder, KPI', icon: '📊' },
  { key: 'mod_loyalty', label: 'Loyalty & Coupons', desc: 'Points, referral, discount codes', icon: '🎁' },
  { key: 'mod_reviews', label: 'Reviews & Ratings', desc: 'Product reviews, testimonials', icon: '⭐' },
  { key: 'mod_multi_branch', label: 'Multi-Branch', desc: 'Multiple store locations', icon: '🏪' },
  { key: 'mod_ai_agent', label: 'AI Agent', desc: 'AI chatbot, auto-replies, smart suggestions', icon: '🤖' },
  { key: 'mod_custom_code', label: 'Custom CSS/JS', desc: 'Code injection, custom scripts', icon: '💻' },
];

export default function SuperAdminPanel() {
  const [s, setS] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const token = localStorage.getItem('ailaptopwala_token');
  const headers: any = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetch('/api/app-settings').then(r => r.json()).then(d => { if (d && typeof d === 'object') setS(d); }).catch(() => {}); }, []);
  const save = async () => { setSaving(true); await fetch('/api/app-settings', { method: 'PUT', headers, body: JSON.stringify(s) }); toast.success('Super Admin settings saved!'); setSaving(false); };
  const v = (key: string, fallback = '1') => s[key] || fallback;
  const set = (key: string, val: string) => setS(p => ({ ...p, [key]: val }));

  // Only superadmin can access
  if ((user as any)?.role !== 'superadmin') {
    return <AdminLayout><div className="p-8 text-center"><Shield className="h-16 w-16 mx-auto text-muted-foreground mb-4" /><h1 className="text-2xl font-bold">Access Denied</h1><p className="text-muted-foreground">Only MLHK Infotech Super Admin can access this panel.</p></div></AdminLayout>;
  }

  const enabledCount = MODULES.filter(m => v(m.key) !== '0').length;

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><Shield className="h-6 w-6 text-red-600" /> Super Admin Panel</h1>
            <p className="text-sm text-muted-foreground">MLHK Infotech — Control modules & features for this client</p>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2 bg-red-600 hover:bg-red-700"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save'}</Button>
        </div>

        {/* Client Info */}
        <Card className="mb-6 border-red-200 bg-red-50/30">
          <CardContent className="p-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div><Label className="text-[10px] text-red-600">Developer</Label><p className="font-bold text-sm">MLHK Infotech</p></div>
              <div><Label className="text-[10px] text-red-600">Client</Label><p className="font-bold text-sm">{v('store_name', 'AI Laptop Wala')}</p></div>
              <div><Label className="text-[10px] text-red-600">Modules Active</Label><p className="font-bold text-sm">{enabledCount} / {MODULES.length}</p></div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Settings (Super Admin only) */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4" /> Platform Configuration</CardTitle>
            <CardDescription>Only visible to MLHK Infotech super admin</CardDescription>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4">
            <div><Label className="text-xs">Platform Name</Label><Input className="mt-1" value={v('platform_name', 'MLHK ERP Platform')} onChange={e => set('platform_name', e.target.value)} /></div>
            <div><Label className="text-xs">Platform Version</Label><Input className="mt-1" value={v('platform_version', '2.0.0')} onChange={e => set('platform_version', e.target.value)} /></div>
            <div><Label className="text-xs">License Type</Label><Input className="mt-1" value={v('license_type', 'Enterprise')} onChange={e => set('license_type', e.target.value)} /></div>
            <div><Label className="text-xs">License Expiry</Label><Input className="mt-1" type="date" value={v('license_expiry', '2026-12-31')} onChange={e => set('license_expiry', e.target.value)} /></div>
            <div><Label className="text-xs">Max Users Allowed</Label><Input className="mt-1" type="number" value={v('max_users', '50')} onChange={e => set('max_users', e.target.value)} /></div>
            <div><Label className="text-xs">Max Products Allowed</Label><Input className="mt-1" type="number" value={v('max_products', '10000')} onChange={e => set('max_products', e.target.value)} /></div>
          </CardContent>
        </Card>

        {/* Module Control */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2"><Zap className="h-4 w-4" /> Module Control</CardTitle>
                <CardDescription>Enable/disable modules for this client. Disabled modules hide from admin sidebar.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { MODULES.forEach(m => set(m.key, '1')); }}>Enable All</Button>
                <Button size="sm" variant="outline" onClick={() => { MODULES.forEach(m => set(m.key, '0')); }}>Disable All</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {MODULES.map(mod => {
                const enabled = v(mod.key) !== '0';
                return (
                  <div key={mod.key} className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all ${enabled ? 'border-green-200 bg-green-50/30' : 'border-muted opacity-60'}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{mod.icon}</span>
                      <div>
                        <p className="text-sm font-medium flex items-center gap-1.5">
                          {mod.label}
                          {enabled ? <Unlock className="h-3 w-3 text-green-600" /> : <Lock className="h-3 w-3 text-muted-foreground" />}
                        </p>
                        <p className="text-[10px] text-muted-foreground">{mod.desc}</p>
                      </div>
                    </div>
                    <Switch checked={enabled} onCheckedChange={c => set(mod.key, c ? '1' : '0')} />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="mt-6 border-red-300">
          <CardHeader>
            <CardTitle className="text-base text-red-600">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 rounded-lg border border-red-200">
              <div><p className="text-sm font-medium">Suspend Client</p><p className="text-[10px] text-muted-foreground">Disable entire platform for this client</p></div>
              <Switch checked={v('client_suspended') === '1'} onCheckedChange={c => set('client_suspended', c ? '1' : '0')} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-red-200">
              <div><p className="text-sm font-medium">Read-only Mode</p><p className="text-[10px] text-muted-foreground">Admin can view but not edit</p></div>
              <Switch checked={v('readonly_mode') === '1'} onCheckedChange={c => set('readonly_mode', c ? '1' : '0')} />
            </div>
          </CardContent>
        </Card>

        <Button onClick={save} disabled={saving} size="lg" className="w-full mt-6 gap-2 bg-red-600 hover:bg-red-700"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save Super Admin Settings'}</Button>
      </div>
    </AdminLayout>
  );
}
