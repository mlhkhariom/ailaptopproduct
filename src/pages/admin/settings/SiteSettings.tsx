import { useState, useEffect } from "react";
import { Save, Globe, Phone, Mail, MapPin, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";

export default function SiteSettings() {
  const [s, setS] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('ailaptopwala_token');

  useEffect(() => {
    fetch('/api/app-settings', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(d => setS(d || {})).catch(() => {});
  }, []);

  const save = async () => {
    setSaving(true);
    await fetch('/api/app-settings', { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(s) });
    toast.success('Site settings saved!'); setSaving(false);
  };

  const v = (key: string) => s[key] || '';
  const set = (key: string, val: string) => setS(p => ({ ...p, [key]: val }));

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-black flex items-center gap-2"><Globe className="h-6 w-6" /> Site & General Settings</h1><p className="text-sm text-muted-foreground">Company info, branding, contact details</p></div>
          <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save'}</Button>
        </div>

        <div className="space-y-6">
          <Card><CardHeader><CardTitle className="text-base">Company Info</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
            <div><Label>Company Name</Label><Input className="mt-1" value={v('site_name')} onChange={e => set('site_name', e.target.value)} placeholder="AI Laptop Wala" /></div>
            <div><Label>Tagline</Label><Input className="mt-1" value={v('site_tagline')} onChange={e => set('site_tagline', e.target.value)} placeholder="Indore's Trusted Laptop Store" /></div>
            <div><Label>Legal Name</Label><Input className="mt-1" value={v('legal_name')} onChange={e => set('legal_name', e.target.value)} placeholder="Asati Infotech" /></div>
            <div><Label>Founded Year</Label><Input className="mt-1" value={v('founded_year')} onChange={e => set('founded_year', e.target.value)} placeholder="2011" /></div>
            <div><Label>Logo URL</Label><Input className="mt-1" value={v('site_logo')} onChange={e => set('site_logo', e.target.value)} placeholder="/assets/logo.jpeg" /></div>
            <div><Label>Favicon URL</Label><Input className="mt-1" value={v('site_favicon')} onChange={e => set('site_favicon', e.target.value)} placeholder="/favicon.png" /></div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base">Contact</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
            <div><Label>Phone</Label><Input className="mt-1" value={v('store_phone')} onChange={e => set('store_phone', e.target.value)} placeholder="+91 98934 96163" /></div>
            <div><Label>WhatsApp</Label><Input className="mt-1" value={v('whatsapp_number')} onChange={e => set('whatsapp_number', e.target.value)} placeholder="919893496163" /></div>
            <div><Label>Email</Label><Input className="mt-1" value={v('store_email')} onChange={e => set('store_email', e.target.value)} placeholder="contact@ailaptopwala.com" /></div>
            <div><Label>Website</Label><Input className="mt-1" value={v('store_website')} onChange={e => set('store_website', e.target.value)} placeholder="https://ailaptopwala.com" /></div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base">Branches</CardTitle></CardHeader><CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div><Label>Branch 1 Name</Label><Input className="mt-1" value={v('branch1_name')} onChange={e => set('branch1_name', e.target.value)} placeholder="Silver Mall (Main)" /></div>
              <div><Label>Branch 1 Address</Label><Input className="mt-1" value={v('branch1_address')} onChange={e => set('branch1_address', e.target.value)} /></div>
              <div><Label>Branch 2 Name</Label><Input className="mt-1" value={v('branch2_name')} onChange={e => set('branch2_name', e.target.value)} placeholder="Bangali Chouraha" /></div>
              <div><Label>Branch 2 Address</Label><Input className="mt-1" value={v('branch2_address')} onChange={e => set('branch2_address', e.target.value)} /></div>
            </div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base">Social Media</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
            <div><Label>Instagram</Label><Input className="mt-1" value={v('social_instagram')} onChange={e => set('social_instagram', e.target.value)} /></div>
            <div><Label>YouTube</Label><Input className="mt-1" value={v('social_youtube')} onChange={e => set('social_youtube', e.target.value)} /></div>
            <div><Label>Facebook</Label><Input className="mt-1" value={v('social_facebook')} onChange={e => set('social_facebook', e.target.value)} /></div>
            <div><Label>Google Maps</Label><Input className="mt-1" value={v('social_google_maps')} onChange={e => set('social_google_maps', e.target.value)} /></div>
          </CardContent></Card>

          <Card><CardHeader><CardTitle className="text-base">Footer</CardTitle></CardHeader><CardContent className="grid md:grid-cols-2 gap-4">
            <div><Label>Copyright Text</Label><Input className="mt-1" value={v('footer_copyright')} onChange={e => set('footer_copyright', e.target.value)} /></div>
            <div><Label>Footer Tagline</Label><Input className="mt-1" value={v('footer_tagline')} onChange={e => set('footer_tagline', e.target.value)} /></div>
          </CardContent></Card>

          <Button onClick={save} disabled={saving} className="w-full gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All'}</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
