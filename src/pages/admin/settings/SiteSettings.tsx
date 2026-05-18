import { useState, useEffect } from "react";
import { Save, Globe, Phone, Mail, Image, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";

export default function SiteSettings() {
  const [s, setS] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('ailaptopwala_token');

  useEffect(() => {
    fetch('/api/app-settings').then(r => r.json()).then(d => { if (d && typeof d === 'object') setS(d); }).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      await fetch('/api/app-settings', { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(s) });
      toast.success('Site settings saved!');
    } catch { toast.error('Failed'); }
    setSaving(false);
  };

  const v = (key: string, fallback = '') => s[key] || fallback;
  const set = (key: string, val: string) => setS(p => ({ ...p, [key]: val }));

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><Globe className="h-6 w-6" /> Site & General Settings</h1>
            <p className="text-sm text-muted-foreground">Company info, branding, contact, social media</p>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All'}</Button>
        </div>

        <div className="space-y-6">

          {/* Company */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Company Information</CardTitle>
              <CardDescription>Basic business details shown across the site</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div><Label className="text-xs">Store Name</Label><Input className="mt-1" value={v('site_name', 'AI Laptop Wala')} onChange={e => set('site_name', e.target.value)} /></div>
              <div><Label className="text-xs">Tagline</Label><Input className="mt-1" value={v('site_tagline')} onChange={e => set('site_tagline', e.target.value)} placeholder="Indore's Trusted Laptop Store" /></div>
              <div><Label className="text-xs">Legal Name</Label><Input className="mt-1" value={v('legal_name')} onChange={e => set('legal_name', e.target.value)} placeholder="Asati Infotech" /></div>
              <div><Label className="text-xs">Founded Year</Label><Input className="mt-1" value={v('founded_year', '2011')} onChange={e => set('founded_year', e.target.value)} /></div>
              <div><Label className="text-xs">Currency</Label><Input className="mt-1" value={v('currency', 'INR')} onChange={e => set('currency', e.target.value)} /></div>
              <div><Label className="text-xs">Timezone</Label><Input className="mt-1" value={v('timezone', 'Asia/Kolkata')} onChange={e => set('timezone', e.target.value)} /></div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Phone className="h-4 w-4" /> Contact Details</CardTitle>
              <CardDescription>Phone, email, WhatsApp — used in header, footer, WhatsApp widget</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div><Label className="text-xs">Store Phone</Label><Input className="mt-1" value={v('store_phone')} onChange={e => set('store_phone', e.target.value)} placeholder="+91 98934 96163" /></div>
              <div><Label className="text-xs">WhatsApp Number (without +)</Label><Input className="mt-1" value={v('whatsapp_number')} onChange={e => set('whatsapp_number', e.target.value)} placeholder="919893496163" /></div>
              <div><Label className="text-xs">Store Email</Label><Input className="mt-1" value={v('store_email')} onChange={e => set('store_email', e.target.value)} placeholder="contact@ailaptopwala.com" /></div>
              <div><Label className="text-xs">Support Email</Label><Input className="mt-1" value={v('support_email')} onChange={e => set('support_email', e.target.value)} /></div>
              <div><Label className="text-xs">Admin Phone (for alerts)</Label><Input className="mt-1" value={v('admin_phone')} onChange={e => set('admin_phone', e.target.value)} placeholder="9893496163" /></div>
              <div><Label className="text-xs">Website URL</Label><Input className="mt-1" value={v('frontend_url')} onChange={e => set('frontend_url', e.target.value)} placeholder="https://ailaptopwala.com" /></div>
            </CardContent>
          </Card>

          {/* Branding */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Image className="h-4 w-4" /> Branding</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div><Label className="text-xs">Logo URL</Label><Input className="mt-1" value={v('site_logo')} onChange={e => set('site_logo', e.target.value)} placeholder="/assets/logo.jpeg" /></div>
              <div><Label className="text-xs">Favicon URL</Label><Input className="mt-1" value={v('site_favicon')} onChange={e => set('site_favicon', e.target.value)} placeholder="/favicon.png" /></div>
              <div><Label className="text-xs">OG Image (social share)</Label><Input className="mt-1" value={v('seo_og_image')} onChange={e => set('seo_og_image', e.target.value)} /></div>
              <div><Label className="text-xs">SEO Title Suffix</Label><Input className="mt-1" value={v('seo_title_suffix', '| AI Laptop Wala')} onChange={e => set('seo_title_suffix', e.target.value)} /></div>
            </CardContent>
          </Card>

          {/* Social */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Share2 className="h-4 w-4" /> Social Media</CardTitle>
              <CardDescription>Links shown in footer and social sharing</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div><Label className="text-xs">Instagram URL</Label><Input className="mt-1" value={v('social_instagram')} onChange={e => set('social_instagram', e.target.value)} placeholder="https://instagram.com/ailaptopwala" /></div>
              <div><Label className="text-xs">YouTube URL</Label><Input className="mt-1" value={v('social_youtube')} onChange={e => set('social_youtube', e.target.value)} placeholder="https://youtube.com/@ailaptopwala" /></div>
              <div><Label className="text-xs">Facebook URL</Label><Input className="mt-1" value={v('social_facebook')} onChange={e => set('social_facebook', e.target.value)} /></div>
              <div><Label className="text-xs">Google Maps URL</Label><Input className="mt-1" value={v('social_google_maps')} onChange={e => set('social_google_maps', e.target.value)} /></div>
              <div><Label className="text-xs">JustDial URL</Label><Input className="mt-1" value={v('social_justdial')} onChange={e => set('social_justdial', e.target.value)} /></div>
              <div><Label className="text-xs">IndiaMart URL</Label><Input className="mt-1" value={v('social_indiamart')} onChange={e => set('social_indiamart', e.target.value)} /></div>
            </CardContent>
          </Card>

          {/* Footer */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Footer Content</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div><Label className="text-xs">Copyright Text</Label><Input className="mt-1" value={v('footer_copyright')} onChange={e => set('footer_copyright', e.target.value)} placeholder="AI Laptop Wala | Asati Infotech" /></div>
              <div><Label className="text-xs">Footer Tagline</Label><Input className="mt-1" value={v('footer_tagline')} onChange={e => set('footer_tagline', e.target.value)} /></div>
            </CardContent>
          </Card>

          <Button onClick={save} disabled={saving} className="w-full gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All Site Settings'}</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
