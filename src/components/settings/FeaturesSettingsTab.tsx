import { Save, RefreshCw, Wrench, Star, Package, MessageCircle, Globe, Play, Cookie, Palette, Users, Search, CreditCard, RotateCcw, FileText, Truck, AlertTriangle, Mail, Bell, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  siteFeatures: Record<string, boolean>;
  setSiteFeatures: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  saveFeatures: () => void;
  savingFeatures: boolean;
}

const FEATURES = [
  { key: 'maintenance_mode', label: 'Maintenance Mode', desc: 'Show "Coming Soon" to visitors (admins bypass)', icon: Wrench, danger: true, category: 'System' },
  { key: 'dark_mode_toggle', label: 'Dark Mode Toggle', desc: 'Show theme switcher in header (auto-detects user preference)', icon: Palette, category: 'System' },
  { key: 'guest_checkout', label: 'Guest Checkout', desc: 'Allow purchases without signup (phone + email only)', icon: Users, category: 'System' },

  { key: 'show_reviews', label: 'Show Product Reviews', desc: 'Display star ratings on product cards', icon: Star, category: 'Product' },
  { key: 'show_stock_count', label: 'Show Stock Count', desc: 'Show remaining stock to customers', icon: Package, category: 'Product' },
  { key: 'show_hindi_names', label: 'Show Hindi Names', desc: 'Display Hindi product names', icon: Globe, category: 'Product' },
  { key: 'product_zoom', label: 'Product Image Zoom', desc: 'Hover-to-zoom on product images', icon: Search, category: 'Product' },
  { key: 'emi_calculator', label: 'EMI Calculator', desc: 'Show EMI options on product pages', icon: CreditCard, category: 'Product' },
  { key: 'recently_viewed', label: 'Recently Viewed Products', desc: 'Track & show last 6 viewed products', icon: RotateCcw, category: 'Product' },

  { key: 'wishlist_enabled', label: 'Wishlist Feature', desc: 'Allow users to save products to wishlist', icon: Star, category: 'Shopping' },
  { key: 'compare_enabled', label: 'Compare Products', desc: 'Side-by-side product comparison', icon: FileText, category: 'Shopping' },
  { key: 'free_shipping_banner', label: 'Free Shipping Banner', desc: 'Top banner: "Free shipping above ₹999"', icon: Truck, category: 'Shopping' },

  { key: 'whatsapp_chat_button', label: 'WhatsApp Chat Button', desc: 'Floating chat button on frontend', icon: MessageCircle, category: 'Widgets' },
  { key: 'back_to_top', label: 'Back-to-Top Button', desc: 'Floating scroll-to-top button', icon: RotateCcw, category: 'Widgets' },
  { key: 'sticky_header', label: 'Sticky Header', desc: 'Header stays visible on scroll', icon: Globe, category: 'Widgets' },
  { key: 'cookie_consent', label: 'Cookie Consent Banner', desc: 'Show cookie consent popup', icon: Cookie, category: 'Widgets' },

  { key: 'enable_reels', label: 'Enable Reels on Products', desc: 'Show video reels on product pages', icon: Play, category: 'Marketing' },
  { key: 'sale_countdown', label: 'Sale Countdown Timer', desc: 'Show deal expiry countdown on homepage', icon: AlertTriangle, category: 'Marketing' },
  { key: 'newsletter_popup', label: 'Newsletter Signup Popup', desc: 'Show exit-intent newsletter popup', icon: Mail, category: 'Marketing' },
  { key: 'new_arrivals_badge', label: 'New Arrivals Badge', desc: 'Show "NEW" badge on products <30 days old', icon: Star, category: 'Marketing' },
];

const FEATURES_BY_CATEGORY = FEATURES.reduce((acc, f) => {
  (acc[f.category] = acc[f.category] || []).push(f);
  return acc;
}, {} as Record<string, typeof FEATURES>);

export default function FeaturesSettingsTab({ siteFeatures, setSiteFeatures, saveFeatures, savingFeatures }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">Toggle site features on/off instantly</p>
        <Button size="sm" onClick={saveFeatures} disabled={savingFeatures} className="gap-1.5 h-8 text-xs">
          {savingFeatures ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save Features
        </Button>
      </div>
      {Object.entries(FEATURES_BY_CATEGORY).map(([cat, feats]) => (
        <div key={cat} className="space-y-2">
          <h3 className="text-sm font-semibold text-primary flex items-center gap-2 mt-4 mb-2 pb-1 border-b">
            {cat}
            <span className="text-[10px] font-normal text-muted-foreground">({feats.filter(f => siteFeatures[f.key]).length} of {feats.length} enabled)</span>
          </h3>
          {feats.map(f => (
            <Card key={f.key} className={siteFeatures[f.key] && f.danger ? 'border-red-300 bg-red-50/30' : ''}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${f.danger ? 'bg-red-100' : siteFeatures[f.key] ? 'bg-primary/10' : 'bg-muted'}`}>
                  <f.icon className={`h-5 w-5 ${f.danger ? 'text-red-500' : siteFeatures[f.key] ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-semibold cursor-pointer" htmlFor={f.key}>{f.label}</Label>
                    {f.danger && siteFeatures[f.key] && <Badge className="bg-red-100 text-red-700 text-[10px]">⚠ Active</Badge>}
                    <Badge className={`text-[10px] ${siteFeatures[f.key] ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{siteFeatures[f.key] ? 'ON' : 'OFF'}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
                <Switch id={f.key} checked={!!siteFeatures[f.key]} onCheckedChange={() => setSiteFeatures(s => ({ ...s, [f.key]: !s[f.key] }))} />
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  );
}
