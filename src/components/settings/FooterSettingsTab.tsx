import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Save, Phone, Mail, MapPin, Globe, Instagram, Youtube, Facebook } from "lucide-react";

interface Props {
  settings: Record<string, string>;
  setSettings: (fn: (s: any) => any) => void;
  save: () => void;
  saving: boolean;
}

export default function FooterSettingsTab({ settings, setSettings, save, saving }: Props) {
  const s = (key: string) => settings[key] || '';
  const set = (key: string, value: string) => setSettings((prev: any) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Footer Settings</h2>
          <p className="text-sm text-muted-foreground">Manage footer content — phone, email, addresses, social links</p>
        </div>
        <Button onClick={save} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Footer'}
        </Button>
      </div>

      {/* Contact Info */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Phone className="h-4 w-4" /> Contact Information</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div><Label className="text-xs">Store Phone</Label><Input className="mt-1" value={s('store_phone')} onChange={e => set('store_phone', e.target.value)} placeholder="+91 98934 96163" /></div>
          <div><Label className="text-xs">WhatsApp Number</Label><Input className="mt-1" value={s('whatsapp_number')} onChange={e => set('whatsapp_number', e.target.value)} placeholder="919893496163 (without +)" /></div>
          <div><Label className="text-xs">Store Email</Label><Input className="mt-1" value={s('store_email')} onChange={e => set('store_email', e.target.value)} placeholder="contact@ailaptopwala.com" /></div>
          <div><Label className="text-xs">Support Email</Label><Input className="mt-1" value={s('support_email')} onChange={e => set('support_email', e.target.value)} placeholder="support@ailaptopwala.com" /></div>
        </CardContent>
      </Card>

      {/* Addresses */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" /> Branch Addresses</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-xs font-semibold">Branch 1 (Main)</Label>
            <div className="grid md:grid-cols-2 gap-3 mt-2">
              <Input value={s('branch1_name')} onChange={e => set('branch1_name', e.target.value)} placeholder="Silver Mall (Main)" />
              <Input value={s('branch1_address')} onChange={e => set('branch1_address', e.target.value)} placeholder="LB-21, Block-B, Silver Mall, RNT Marg, Indore 452001" />
              <Input value={s('branch1_hours')} onChange={e => set('branch1_hours', e.target.value)} placeholder="Mon-Sat: 11AM - 9PM" />
              <Input value={s('branch1_map_url')} onChange={e => set('branch1_map_url', e.target.value)} placeholder="https://maps.app.goo.gl/..." />
            </div>
          </div>
          <div>
            <Label className="text-xs font-semibold">Branch 2</Label>
            <div className="grid md:grid-cols-2 gap-3 mt-2">
              <Input value={s('branch2_name')} onChange={e => set('branch2_name', e.target.value)} placeholder="Bangali Chouraha" />
              <Input value={s('branch2_address')} onChange={e => set('branch2_address', e.target.value)} placeholder="21, G3, Sai Residency, Ashish Nagar, Indore 452016" />
              <Input value={s('branch2_hours')} onChange={e => set('branch2_hours', e.target.value)} placeholder="Mon-Sat: 11AM - 9PM" />
              <Input value={s('branch2_map_url')} onChange={e => set('branch2_map_url', e.target.value)} placeholder="https://maps.app.goo.gl/..." />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> Social Media Links</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2"><Instagram className="h-4 w-4 text-pink-500 shrink-0" /><Input value={s('social_instagram')} onChange={e => set('social_instagram', e.target.value)} placeholder="https://instagram.com/ailaptopwala" /></div>
          <div className="flex items-center gap-2"><Youtube className="h-4 w-4 text-red-500 shrink-0" /><Input value={s('social_youtube')} onChange={e => set('social_youtube', e.target.value)} placeholder="https://youtube.com/@ailaptopwala" /></div>
          <div className="flex items-center gap-2"><Facebook className="h-4 w-4 text-blue-500 shrink-0" /><Input value={s('social_facebook')} onChange={e => set('social_facebook', e.target.value)} placeholder="https://facebook.com/ailaptopwala" /></div>
          <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-green-500 shrink-0" /><Input value={s('social_google_maps')} onChange={e => set('social_google_maps', e.target.value)} placeholder="https://maps.app.goo.gl/..." /></div>
        </CardContent>
      </Card>

      {/* Footer Text */}
      <Card>
        <CardHeader><CardTitle className="text-base">Footer Content</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label className="text-xs">Copyright Text</Label><Input className="mt-1" value={s('footer_copyright')} onChange={e => set('footer_copyright', e.target.value)} placeholder="© 2026 AI Laptop Wala | Asati Infotech. All Rights Reserved." /></div>
          <div><Label className="text-xs">Footer Tagline</Label><Input className="mt-1" value={s('footer_tagline')} onChange={e => set('footer_tagline', e.target.value)} placeholder="Indore's Most Trusted Laptop Store Since 2011" /></div>
          <div><Label className="text-xs">Payment Methods Text</Label><Input className="mt-1" value={s('footer_payments')} onChange={e => set('footer_payments', e.target.value)} placeholder="Razorpay, PhonePe, Paytm, UPI, COD, EMI" /></div>
          <div><Label className="text-xs">Trust Badges Text</Label><Input className="mt-1" value={s('footer_trust')} onChange={e => set('footer_trust', e.target.value)} placeholder="Secure Payments | Verified Seller | 90-Day Warranty | Free Delivery | 7-Day Returns" /></div>
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving} className="w-full gap-2">
        <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save All Footer Settings'}
      </Button>
    </div>
  );
}
