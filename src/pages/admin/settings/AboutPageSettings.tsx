import { useState, useEffect } from "react";
import { Save, Info, Users, Star, Award, MapPin, Phone, Image, Plus, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";

export default function AboutPageSettings() {
  const [s, setS] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);
  const token = localStorage.getItem('ailaptopwala_token');
  const headers: any = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetch('/api/app-settings').then(r => r.json()).then(d => { if (d && typeof d === 'object') setS(d); }).catch(() => {});
    fetch('/api/erp/branches', { headers }).then(r => r.json()).then(d => { if (Array.isArray(d)) setBranches(d); }).catch(() => {});
  }, []);

  const save = async () => { setSaving(true); await fetch('/api/app-settings', { method: 'PUT', headers, body: JSON.stringify(s) }); toast.success('About page settings saved!'); setSaving(false); };
  const v = (key: string, fallback = '') => s[key] || fallback;
  const set = (key: string, val: string) => setS(p => ({ ...p, [key]: val }));

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><Info className="h-6 w-6" /> About Page Content</h1>
            <p className="text-sm text-muted-foreground">Manage everything shown on the public About Us page</p>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All'}</Button>
        </div>

        <div className="space-y-6">

          {/* ─── HERO SECTION ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Hero Section</CardTitle>
              <CardDescription>Top banner on About page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label className="text-xs">Page Title</Label><Input className="mt-1" value={v('about_title', 'About AI Laptop Wala')} onChange={e => set('about_title', e.target.value)} /></div>
                <div><Label className="text-xs">Badge Text</Label><Input className="mt-1" value={v('about_badge', 'Since 2011 — Asati Infotech')} onChange={e => set('about_badge', e.target.value)} /></div>
              </div>
              <div><Label className="text-xs">Hero Description</Label><textarea className="mt-1 w-full border rounded-lg px-3 py-2 text-sm min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" value={v('about_hero_text', "Indore's most trusted laptop store. We buy, sell and repair laptops since 2011. Serving 5000+ happy customers across Madhya Pradesh.")} onChange={e => set('about_hero_text', e.target.value)} /></div>
            </CardContent>
          </Card>

          {/* ─── STATS ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4" /> Stats / Numbers</CardTitle>
              <CardDescription>Shown as counters on About page</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg border">
                <Input className="text-center text-lg font-bold border-0 p-0 h-auto" value={v('stat_customers', '5000+')} onChange={e => set('stat_customers', e.target.value)} />
                <p className="text-[10px] text-muted-foreground mt-1">Happy Customers</p>
              </div>
              <div className="text-center p-3 rounded-lg border">
                <Input className="text-center text-lg font-bold border-0 p-0 h-auto" value={v('stat_experience', '15+')} onChange={e => set('stat_experience', e.target.value)} />
                <p className="text-[10px] text-muted-foreground mt-1">Years Experience</p>
              </div>
              <div className="text-center p-3 rounded-lg border">
                <Input className="text-center text-lg font-bold border-0 p-0 h-auto" value={v('stat_rating', '4.8')} onChange={e => set('stat_rating', e.target.value)} />
                <p className="text-[10px] text-muted-foreground mt-1">Google Rating</p>
              </div>
              <div className="text-center p-3 rounded-lg border bg-muted/30">
                <p className="text-lg font-bold">{branches.length}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Branches (auto)</p>
              </div>
            </CardContent>
          </Card>

          {/* ─── VALUE PROPOSITIONS ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Award className="h-4 w-4" /> Value Propositions</CardTitle>
              <CardDescription>4 key selling points shown with icons</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="p-3 rounded-lg border hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{i}</span>
                    <Input className="h-7 font-medium border-0 p-0 text-sm focus-visible:ring-0" value={v(`about_value${i}_title`, ['Certified Refurbished', '6 Month Warranty', 'Expert Repair & Home Service', 'Best Price Guarantee'][i - 1])} onChange={e => set(`about_value${i}_title`, e.target.value)} placeholder="Title" />
                  </div>
                  <Input className="h-7 text-xs text-muted-foreground border-0 p-0 pl-8 focus-visible:ring-0" value={v(`about_value${i}_desc`, ['Every laptop tested, cleaned & certified.', 'Free repair if any issue within warranty.', 'Same day repair. Free home pickup & delivery.', '40-60% off MRP. No hidden charges.'][i - 1])} onChange={e => set(`about_value${i}_desc`, e.target.value)} placeholder="Description" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* ─── FOUNDER / TEAM ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" /> Founder & Team</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border-2 border-primary/20 bg-primary/5">
                <p className="text-[10px] font-bold text-primary uppercase mb-3">Founder</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><Label className="text-[10px]">Name</Label><Input className="mt-1 h-8" value={v('founder_name', 'Bhagwan Das Asati')} onChange={e => set('founder_name', e.target.value)} /></div>
                  <div><Label className="text-[10px]">Role / Title</Label><Input className="mt-1 h-8" value={v('founder_role', 'Founder — Asati Infotech')} onChange={e => set('founder_role', e.target.value)} /></div>
                </div>
                <div className="mt-3"><Label className="text-[10px]">Bio / Description</Label><textarea className="mt-1 w-full border rounded-lg px-3 py-2 text-sm min-h-[60px] resize-none" value={v('founder_desc', '15+ years in laptop sales & repair. Started AI Laptop Wala in 2011 with a vision to make quality laptops affordable for everyone in Indore.')} onChange={e => set('founder_desc', e.target.value)} /></div>
                <div className="mt-3"><Label className="text-[10px]">Photo URL (optional)</Label><Input className="mt-1 h-8" value={v('founder_photo')} onChange={e => set('founder_photo', e.target.value)} placeholder="/assets/founder.jpg" /></div>
              </div>

              <div className="p-4 rounded-lg border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-3">Technical Team</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><Label className="text-[10px]">Team Name</Label><Input className="mt-1 h-8" value={v('team_tech_name', 'Technical Team')} onChange={e => set('team_tech_name', e.target.value)} /></div>
                  <div><Label className="text-[10px]">Role</Label><Input className="mt-1 h-8" value={v('team_tech_role', 'Certified Laptop Engineers')} onChange={e => set('team_tech_role', e.target.value)} /></div>
                </div>
                <div className="mt-3"><Label className="text-[10px]">Description</Label><Input className="mt-1 h-8" value={v('team_tech_desc', 'Trained on Dell, HP, Lenovo, Apple, Asus, Acer. Screen, battery, motherboard, data recovery.')} onChange={e => set('team_tech_desc', e.target.value)} /></div>
              </div>

              <div className="p-4 rounded-lg border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase mb-3">Customer Support</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><Label className="text-[10px]">Team Name</Label><Input className="mt-1 h-8" value={v('team_support_name', 'Customer Support')} onChange={e => set('team_support_name', e.target.value)} /></div>
                  <div><Label className="text-[10px]">Role</Label><Input className="mt-1 h-8" value={v('team_support_role', 'Sales & After-Sales')} onChange={e => set('team_support_role', e.target.value)} /></div>
                </div>
                <div className="mt-3"><Label className="text-[10px]">Description</Label><Input className="mt-1 h-8" value={v('team_support_desc', 'Dedicated support Mon-Sat 10AM-8PM. WhatsApp always available.')} onChange={e => set('team_support_desc', e.target.value)} /></div>
              </div>
            </CardContent>
          </Card>

          {/* ─── BRANCHES (Read-only from DB) ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" /> Branches on About Page</CardTitle>
              <CardDescription>These are pulled from ERP Settings → Branch Manager</CardDescription>
            </CardHeader>
            <CardContent>
              {branches.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No branches found. <a href="/admin/settings/erp" className="text-primary underline">Add branches in ERP Settings</a></p>
              ) : (
                <div className="space-y-2">
                  {branches.filter(b => b.is_active).map(b => (
                    <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{b.name}</p>
                        <p className="text-xs text-muted-foreground">{b.address}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <a href="/admin/settings/erp" className="inline-block mt-3 text-xs text-primary underline">Manage branches in ERP Settings</a>
            </CardContent>
          </Card>

          {/* ─── SEO FOR ABOUT PAGE ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About Page SEO</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Meta Title</Label><Input className="mt-1" value={v('about_meta_title')} onChange={e => set('about_meta_title', e.target.value)} placeholder="About Us — AI Laptop Wala Indore" /></div>
              <div><Label className="text-xs">Meta Description</Label><Input className="mt-1" value={v('about_meta_desc')} onChange={e => set('about_meta_desc', e.target.value)} placeholder="Indore's trusted laptop store since 2011..." /></div>
            </CardContent>
          </Card>

          <Button onClick={save} disabled={saving} size="lg" className="w-full gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save About Page Settings'}</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
