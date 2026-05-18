import { useState, useEffect } from "react";
import { Save, Globe, Phone, Mail, Image, Share2, Clock, MapPin, FileText, Link, Webhook, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";

export default function SiteSettings() {
  const [s, setS] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('ailaptopwala_token');
  const headers: any = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetch('/api/app-settings').then(r => r.json()).then(d => { if (d && typeof d === 'object') setS(d); }).catch(() => {}); }, []);
  const save = async () => { setSaving(true); await fetch('/api/app-settings', { method: 'PUT', headers, body: JSON.stringify(s) }); toast.success('Site settings saved!'); setSaving(false); };
  const v = (key: string, fallback = '') => s[key] || fallback;
  const set = (key: string, val: string) => setS(p => ({ ...p, [key]: val }));

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><Store className="h-6 w-6" /> Site & General Settings</h1>
            <p className="text-sm text-muted-foreground">Store info, branding, contact, URLs, social, footer, E-Invoice</p>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All'}</Button>
        </div>

        <div className="space-y-6">

          {/* ─── STORE INFORMATION ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Store className="h-4 w-4" /> Store Information</CardTitle>
              <CardDescription>Basic details displayed across the website</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Store Name *</Label><Input className="mt-1" value={v('store_name', 'AI Laptop Wala')} onChange={e => set('store_name', e.target.value)} /></div>
              <div><Label className="text-xs">Tagline</Label><Input className="mt-1" value={v('store_tagline')} onChange={e => set('store_tagline', e.target.value)} placeholder="Indore's Trusted Laptop Store" /></div>
              <div><Label className="text-xs">Legal / Company Name</Label><Input className="mt-1" value={v('legal_name')} onChange={e => set('legal_name', e.target.value)} placeholder="Asati Infotech" /></div>
              <div><Label className="text-xs">Founded Year</Label><Input className="mt-1" value={v('founded_year', '2011')} onChange={e => set('founded_year', e.target.value)} /></div>
              <div><Label className="text-xs">Currency</Label>
                <Select value={v('currency', 'INR')} onValueChange={val => set('currency', val)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INR">INR (Indian Rupee)</SelectItem>
                    <SelectItem value="USD">USD (US Dollar)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Timezone</Label>
                <Select value={v('timezone', 'Asia/Kolkata')} onValueChange={val => set('timezone', val)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2"><Label className="text-xs">Store Address</Label><textarea className="mt-1 w-full border rounded-lg px-3 py-2 text-sm min-h-[60px] resize-none" value={v('store_address')} onChange={e => set('store_address', e.target.value)} placeholder="Silver Mall, RNT Marg, Indore 452001" /></div>
            </CardContent>
          </Card>

          {/* ─── CONTACT ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Phone className="h-4 w-4" /> Contact Details</CardTitle>
              <CardDescription>Used in header, footer, WhatsApp widget, invoices</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Store Phone</Label><Input className="mt-1" value={v('store_phone')} onChange={e => set('store_phone', e.target.value)} placeholder="+91 98934 96163" /></div>
              <div><Label className="text-xs">Support Phone</Label><Input className="mt-1" value={v('support_phone')} onChange={e => set('support_phone', e.target.value)} /></div>
              <div><Label className="text-xs">Store Email</Label><Input className="mt-1" value={v('store_email')} onChange={e => set('store_email', e.target.value)} placeholder="contact@ailaptopwala.com" /></div>
              <div><Label className="text-xs">Support Email</Label><Input className="mt-1" value={v('support_email')} onChange={e => set('support_email', e.target.value)} /></div>
              <div><Label className="text-xs">WhatsApp Number (with country code)</Label><Input className="mt-1" value={v('whatsapp_number')} onChange={e => set('whatsapp_number', e.target.value)} placeholder="919893496163" /></div>
              <div><Label className="text-xs">Owner Phone (for alerts)</Label><Input className="mt-1" value={v('owner_phone')} onChange={e => set('owner_phone', e.target.value)} placeholder="9893496163" /></div>
            </CardContent>
          </Card>

          {/* ─── BUSINESS HOURS ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Business Hours</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Business Hours (display text)</Label><Input className="mt-1" value={v('business_hours')} onChange={e => set('business_hours', e.target.value)} placeholder="Mon-Sat 10:00 AM - 9:00 PM" /></div>
              <div><Label className="text-xs">Closed on</Label><Input className="mt-1" value={v('closed_on', 'Sunday')} onChange={e => set('closed_on', e.target.value)} /></div>
              <div><Label className="text-xs">Opening Time</Label><Input className="mt-1" type="time" value={v('opening_time', '10:00')} onChange={e => set('opening_time', e.target.value)} /></div>
              <div><Label className="text-xs">Closing Time</Label><Input className="mt-1" type="time" value={v('closing_time', '21:00')} onChange={e => set('closing_time', e.target.value)} /></div>
            </CardContent>
          </Card>

          {/* ─── BRANDING ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Image className="h-4 w-4" /> Branding & SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Store Logo URL</Label>
                  <Input className="mt-1" value={v('store_logo')} onChange={e => set('store_logo', e.target.value)} placeholder="/assets/logo.jpeg" />
                  {v('store_logo') && <img src={v('store_logo')} alt="Logo" className="mt-2 h-10 w-auto rounded border" />}
                </div>
                <div>
                  <Label className="text-xs">Favicon URL</Label>
                  <Input className="mt-1" value={v('store_favicon')} onChange={e => set('store_favicon', e.target.value)} placeholder="/favicon.png" />
                </div>
                <div><Label className="text-xs">OG Image (social share)</Label><Input className="mt-1" value={v('seo_og_image')} onChange={e => set('seo_og_image', e.target.value)} /></div>
                <div><Label className="text-xs">SEO Title Suffix</Label><Input className="mt-1" value={v('seo_title_suffix', '| AI Laptop Wala')} onChange={e => set('seo_title_suffix', e.target.value)} /></div>
                <div><Label className="text-xs">Meta Description</Label><Input className="mt-1" value={v('seo_description')} onChange={e => set('seo_description', e.target.value)} placeholder="Buy laptops in Indore..." /></div>
                <div><Label className="text-xs">Meta Keywords</Label><Input className="mt-1" value={v('seo_keywords')} onChange={e => set('seo_keywords', e.target.value)} placeholder="laptop indore, second hand laptop" /></div>
              </div>
            </CardContent>
          </Card>

          {/* ─── SYSTEM URLs ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Link className="h-4 w-4" /> System URLs & Webhooks</CardTitle>
              <CardDescription>Used in emails, payment callbacks, WhatsApp links</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Frontend URL (public website)</Label><Input className="mt-1 font-mono text-xs" value={v('site_url')} onChange={e => set('site_url', e.target.value)} placeholder="https://ailaptopwala.com" /></div>
              <div><Label className="text-xs">Backend URL (API server)</Label><Input className="mt-1 font-mono text-xs" value={v('backend_url')} onChange={e => set('backend_url', e.target.value)} placeholder="https://api.ailaptopwala.com" /></div>
              <div><Label className="text-xs">Google Maps Embed URL</Label><Input className="mt-1 text-xs" value={v('google_maps_url')} onChange={e => set('google_maps_url', e.target.value)} placeholder="https://maps.google.com/..." /></div>
              <div><Label className="text-xs">Google Maps Link (for directions)</Label><Input className="mt-1 text-xs" value={v('social_google_maps')} onChange={e => set('social_google_maps', e.target.value)} /></div>
            </CardContent>
          </Card>

          {/* ─── SOCIAL MEDIA ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Share2 className="h-4 w-4" /> Social Media Links</CardTitle>
              <CardDescription>Shown in footer and social sharing</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Instagram</Label><Input className="mt-1" value={v('social_instagram')} onChange={e => set('social_instagram', e.target.value)} placeholder="https://instagram.com/ailaptopwala" /></div>
              <div><Label className="text-xs">YouTube</Label><Input className="mt-1" value={v('social_youtube')} onChange={e => set('social_youtube', e.target.value)} placeholder="https://youtube.com/@ailaptopwala" /></div>
              <div><Label className="text-xs">Facebook</Label><Input className="mt-1" value={v('social_facebook')} onChange={e => set('social_facebook', e.target.value)} /></div>
              <div><Label className="text-xs">Twitter / X</Label><Input className="mt-1" value={v('social_twitter')} onChange={e => set('social_twitter', e.target.value)} /></div>
              <div><Label className="text-xs">JustDial</Label><Input className="mt-1" value={v('social_justdial')} onChange={e => set('social_justdial', e.target.value)} /></div>
              <div><Label className="text-xs">IndiaMart</Label><Input className="mt-1" value={v('social_indiamart')} onChange={e => set('social_indiamart', e.target.value)} /></div>
              <div><Label className="text-xs">LinkedIn</Label><Input className="mt-1" value={v('social_linkedin')} onChange={e => set('social_linkedin', e.target.value)} /></div>
              <div><Label className="text-xs">Telegram</Label><Input className="mt-1" value={v('social_telegram')} onChange={e => set('social_telegram', e.target.value)} /></div>
            </CardContent>
          </Card>

          {/* ─── E-INVOICE ─── */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> E-Invoice (GST IRN)</CardTitle>
                  <CardDescription>NIC IRP integration for GST e-invoicing</CardDescription>
                </div>
                <Badge variant={v('einvoice_enabled') === 'true' ? 'default' : 'secondary'} className="text-[9px]">{v('einvoice_enabled') === 'true' ? 'Enabled' : 'Disabled'}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">NIC Environment</Label>
                  <Select value={v('einvoice_base', 'https://einv-apisandbox.nic.in')} onValueChange={val => set('einvoice_base', val)}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="https://einv-apisandbox.nic.in">Sandbox (Testing)</SelectItem>
                      <SelectItem value="https://einvoice1.gst.gov.in">Production (Live)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Business GSTIN</Label><Input className="mt-1" value={v('einvoice_gstin')} onChange={e => set('einvoice_gstin', e.target.value)} placeholder="23ATNPA4415H1Z2" /></div>
                <div><Label className="text-xs">NIC Username</Label><Input className="mt-1" value={v('einvoice_username')} onChange={e => set('einvoice_username', e.target.value)} /></div>
                <div><Label className="text-xs">NIC Password</Label><Input className="mt-1" type="password" value={v('einvoice_password')} onChange={e => set('einvoice_password', e.target.value)} /></div>
                <div className="sm:col-span-2"><Label className="text-xs">AppKey (32-char from NIC portal)</Label><Input className="mt-1 font-mono text-xs" value={v('einvoice_appkey')} onChange={e => set('einvoice_appkey', e.target.value)} maxLength={32} /></div>
              </div>
              <div className="flex items-center gap-3 pt-3 border-t">
                <Switch checked={v('einvoice_enabled') === 'true'} onCheckedChange={c => set('einvoice_enabled', String(c))} />
                <Label className="text-xs">Enable E-Invoice IRN Generation</Label>
              </div>
            </CardContent>
          </Card>

          {/* ─── FOOTER ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Footer Content</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Copyright Text</Label><Input className="mt-1" value={v('footer_copyright')} onChange={e => set('footer_copyright', e.target.value)} placeholder="AI Laptop Wala | Asati Infotech" /></div>
              <div><Label className="text-xs">Footer Tagline</Label><Input className="mt-1" value={v('footer_tagline')} onChange={e => set('footer_tagline', e.target.value)} /></div>
              <div><Label className="text-xs">Footer About Text</Label><textarea className="mt-1 w-full border rounded-lg px-3 py-2 text-sm min-h-[60px] resize-none" value={v('footer_about')} onChange={e => set('footer_about', e.target.value)} placeholder="Short description for footer..." /></div>
              <div><Label className="text-xs">Footer CTA Text</Label><Input className="mt-1" value={v('footer_cta')} onChange={e => set('footer_cta', e.target.value)} placeholder="Visit our store today!" /></div>
            </CardContent>
          </Card>

          {/* ─── FEATURE TOGGLES ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Site Feature Toggles</CardTitle>
              <CardDescription>Enable/disable features across the website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { key: 'feature_reviews', label: 'Product Reviews', desc: 'Allow customers to review products' },
                  { key: 'feature_wishlist', label: 'Wishlist', desc: 'Save products for later' },
                  { key: 'feature_compare', label: 'Compare Products', desc: 'Side-by-side comparison' },
                  { key: 'feature_chat', label: 'Live Chat Widget', desc: 'WhatsApp/chat button' },
                  { key: 'feature_blog', label: 'Blog Section', desc: 'Show blog on website' },
                  { key: 'feature_deals', label: 'Deals Page', desc: 'Show deals/offers page' },
                  { key: 'feature_store_locator', label: 'Store Locator', desc: 'Branch finder page' },
                  { key: 'feature_pwa', label: 'PWA (Install App)', desc: 'Progressive Web App' },
                ].map(f => (
                  <div key={f.key} className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/30 transition-colors">
                    <div><p className="text-sm font-medium">{f.label}</p><p className="text-[10px] text-muted-foreground">{f.desc}</p></div>
                    <Switch checked={v(f.key, '1') !== '0' && v(f.key, '1') !== 'false'} onCheckedChange={c => set(f.key, c ? '1' : '0')} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button onClick={save} disabled={saving} size="lg" className="w-full gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All Site Settings'}</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
