import { useState, useEffect } from "react";
import { Save, Layout, Image, Type, MousePointer, GripVertical, Plus, X, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";

export default function HomepageEditor() {
  const [s, setS] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('ailaptopwala_token');
  const headers: any = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetch('/api/app-settings').then(r => r.json()).then(d => { if (d && typeof d === 'object') setS(d); }).catch(() => {}); }, []);
  const save = async () => { setSaving(true); await fetch('/api/app-settings', { method: 'PUT', headers, body: JSON.stringify(s) }); toast.success('Homepage saved!'); setSaving(false); };
  const v = (key: string, fallback = '') => s[key] || fallback;
  const set = (key: string, val: string) => setS(p => ({ ...p, [key]: val }));

  const sections = [
    { key: 'show_featured', label: 'Featured Products', desc: 'Hand-picked products' },
    { key: 'show_new_arrivals', label: 'New Arrivals', desc: 'Latest added' },
    { key: 'show_best_sellers', label: 'Best Sellers', desc: 'Top selling' },
    { key: 'show_deals', label: 'Deals & Offers', desc: 'Discounted items' },
    { key: 'show_categories', label: 'Categories Grid', desc: 'Browse by category' },
    { key: 'show_testimonials', label: 'Testimonials', desc: 'Customer reviews' },
    { key: 'show_brands', label: 'Brand Logos', desc: 'Trusted brands' },
    { key: 'show_blog', label: 'Latest Blog', desc: 'Recent articles' },
    { key: 'show_repair_section', label: 'Repair Service', desc: 'Home repair CTA' },
    { key: 'show_why_us', label: 'Why Choose Us', desc: 'Benefits section' },
  ];

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><Layout className="h-6 w-6" /> Homepage Editor</h1>
            <p className="text-sm text-muted-foreground">Hero, sections, layout — all editable</p>
          </div>
          <div className="flex gap-2">
            <a href="/" target="_blank"><Button variant="outline" size="sm" className="gap-1"><Eye className="h-3 w-3" /> Preview</Button></a>
            <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>

        <div className="space-y-6">

          {/* HERO */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Image className="h-4 w-4" /> Hero Section</CardTitle>
              <CardDescription>Main banner area at top of homepage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label className="text-xs">Hero Title (Line 1)</Label><Input className="mt-1" value={v('hero_title', 'Best Laptops')} onChange={e => set('hero_title', e.target.value)} /></div>
                <div><Label className="text-xs">Hero Title (Line 2)</Label><Input className="mt-1" value={v('hero_title2', 'in Indore')} onChange={e => set('hero_title2', e.target.value)} /></div>
                <div><Label className="text-xs">Hero Subtitle</Label><Input className="mt-1" value={v('hero_subtitle')} onChange={e => set('hero_subtitle', e.target.value)} placeholder="Buy certified refurbished laptops..." /></div>
                <div><Label className="text-xs">Hero Badge Text</Label><Input className="mt-1" value={v('hero_badge', 'Trusted by 5000+')} onChange={e => set('hero_badge', e.target.value)} /></div>
                <div><Label className="text-xs">CTA Button Text</Label><Input className="mt-1" value={v('hero_cta_text', 'Shop Now')} onChange={e => set('hero_cta_text', e.target.value)} /></div>
                <div><Label className="text-xs">CTA Button Link</Label><Input className="mt-1" value={v('hero_cta_link', '/products')} onChange={e => set('hero_cta_link', e.target.value)} /></div>
                <div><Label className="text-xs">Secondary CTA Text</Label><Input className="mt-1" value={v('hero_cta2_text', 'WhatsApp Us')} onChange={e => set('hero_cta2_text', e.target.value)} /></div>
                <div><Label className="text-xs">Secondary CTA Link</Label><Input className="mt-1" value={v('hero_cta2_link')} onChange={e => set('hero_cta2_link', e.target.value)} placeholder="https://wa.me/919893496163" /></div>
              </div>
              <div><Label className="text-xs">Hero Background Image URL</Label><Input className="mt-1" value={v('hero_bg_image')} onChange={e => set('hero_bg_image', e.target.value)} placeholder="/assets/hero-bg.jpg" /></div>
            </CardContent>
          </Card>

          {/* SECTIONS TOGGLE */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><GripVertical className="h-4 w-4" /> Homepage Sections</CardTitle>
              <CardDescription>Enable/disable and configure each section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {sections.map((sec, i) => (
                <div key={sec.key} className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded bg-muted flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                    <div><p className="text-sm font-medium">{sec.label}</p><p className="text-[10px] text-muted-foreground">{sec.desc}</p></div>
                  </div>
                  <Switch checked={v(sec.key, '1') !== '0'} onCheckedChange={c => set(sec.key, c ? '1' : '0')} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* SECTION CONFIG */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Section Configuration</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Products per section</Label><Input className="mt-1" type="number" value={v('homepage_products_count', '8')} onChange={e => set('homepage_products_count', e.target.value)} /></div>
              <div><Label className="text-xs">Testimonials count</Label><Input className="mt-1" type="number" value={v('testimonial_homepage_count', '6')} onChange={e => set('testimonial_homepage_count', e.target.value)} /></div>
              <div><Label className="text-xs">Blog posts count</Label><Input className="mt-1" type="number" value={v('homepage_blog_count', '3')} onChange={e => set('homepage_blog_count', e.target.value)} /></div>
              <div><Label className="text-xs">Categories to show</Label><Input className="mt-1" type="number" value={v('homepage_categories_count', '6')} onChange={e => set('homepage_categories_count', e.target.value)} /></div>
            </CardContent>
          </Card>

          <Button onClick={save} disabled={saving} size="lg" className="w-full gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save Homepage'}</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
