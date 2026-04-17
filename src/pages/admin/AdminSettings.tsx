import { useState, useEffect } from "react";
import { Save, Eye, EyeOff, Globe, Phone, Mail, Shield, Key, Bell, Truck, CreditCard, Lock, Palette, Search, FileText, Users, Database, Webhook, AlertTriangle, CheckCircle, ExternalLink, Copy, RotateCcw, Download, Wrench, Star, Package, MessageCircle, Play, Cookie, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { SocialSettings } from "@/components/SocialSettings";

const AdminSettings = () => {
  const [showMetaSecret, setShowMetaSecret] = useState(false);
  const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
  const [siteFeatures, setSiteFeatures] = useState<Record<string, boolean>>({});
  const [appSettings, setAppSettings] = useState<Record<string, string>>({});
  const [savingFeatures, setSavingFeatures] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getSiteSettings().then(setSiteFeatures).catch(() => {});
    api.getAppSettings().then(setAppSettings).catch(() => {});
  }, []);

  const saveFeatures = async () => {
    setSavingFeatures(true);
    try { await api.updateSiteSettings(siteFeatures); toast.success('Features saved!'); }
    catch (e: any) { toast.error(e.message); }
    finally { setSavingFeatures(false); }
  };

  const saveAppSettings = async (category: string) => {
    setSaving(true);
    try { await api.updateAppSettings(appSettings); toast.success(`${category} settings saved!`); }
    catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const s = (key: string) => appSettings[key] || '';
  const setS = (key: string, value: string) => setAppSettings(p => ({ ...p, [key]: value }));

  const FEATURES = [
    { key: 'maintenance_mode', label: 'Maintenance Mode', desc: 'Show "Coming Soon" to visitors (admins bypass)', icon: Wrench, danger: true },
    { key: 'show_reviews', label: 'Show Product Reviews', desc: 'Display star ratings on product cards', icon: Star },
    { key: 'show_stock_count', label: 'Show Stock Count', desc: 'Show remaining stock to customers', icon: Package },
    { key: 'whatsapp_chat_button', label: 'WhatsApp Chat Button', desc: 'Floating chat button on frontend', icon: MessageCircle },
    { key: 'show_hindi_names', label: 'Show Hindi Names', desc: 'Display Hindi product names', icon: Globe },
    { key: 'enable_reels', label: 'Enable Reels on Products', desc: 'Show social reels on product pages', icon: Play },
    { key: 'cookie_consent', label: 'Cookie Consent Banner', desc: 'Show cookie consent popup', icon: Cookie },
  ];

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Store configuration, API keys, shipping, SEO & security — Super Admin only</p>
        </div>
        <Badge variant="default" className="gap-1 self-start"><Shield className="h-3 w-3" /> Super Admin</Badge>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="h-9 flex-wrap">
          <TabsTrigger value="general" className="text-xs gap-1"><Globe className="h-3 w-3" /> General</TabsTrigger>
          <TabsTrigger value="api" className="text-xs gap-1"><Key className="h-3 w-3" /> API Keys</TabsTrigger>
          <TabsTrigger value="shipping" className="text-xs gap-1"><Truck className="h-3 w-3" /> Shipping</TabsTrigger>
          <TabsTrigger value="payments" className="text-xs gap-1"><CreditCard className="h-3 w-3" /> Payments</TabsTrigger>
          <TabsTrigger value="seo" className="text-xs gap-1"><Search className="h-3 w-3" /> SEO</TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs gap-1"><Bell className="h-3 w-3" /> Alerts</TabsTrigger>
          <TabsTrigger value="security" className="text-xs gap-1"><Lock className="h-3 w-3" /> Security</TabsTrigger>
          <TabsTrigger value="features" className="text-xs gap-1"><Wrench className="h-3 w-3" /> Features</TabsTrigger>
        </TabsList>

        {/* GENERAL */}
        <TabsContent value="general">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Store Information</CardTitle>
                <CardDescription className="text-xs">Basic store details displayed across the website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label className="text-xs">Store Name *</Label><Input className="mt-1 h-9" value={s('store_name')} onChange={e => setS('store_name', e.target.value)} /></div>
                <div><Label className="text-xs">Tagline</Label><Input className="mt-1 h-9" value={s('store_tagline')} onChange={e => setS('store_tagline', e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs flex items-center gap-1"><Mail className="h-3 w-3" /> Email</Label><Input className="mt-1 h-9" value={s('store_email')} onChange={e => setS('store_email', e.target.value)} /></div>
                  <div><Label className="text-xs flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</Label><Input className="mt-1 h-9" value={s('store_phone')} onChange={e => setS('store_phone', e.target.value)} /></div>
                </div>
                <div><Label className="text-xs flex items-center gap-1"><Globe className="h-3 w-3" /> Website URL</Label><Input className="mt-1 h-9" value={s('store_website')} onChange={e => setS('store_website', e.target.value)} /></div>
                <div><Label className="text-xs">Address</Label><Textarea className="mt-1 text-xs" rows={2} value={s('store_address')} onChange={e => setS('store_address', e.target.value)} /></div>
                <div><Label className="text-xs">Store Logo URL</Label><Input className="mt-1 h-9" value={s('store_logo')} onChange={e => setS('store_logo', e.target.value)} placeholder="https://..." /></div>
                <Button className="gap-1.5 w-full" disabled={saving} onClick={() => saveAppSettings('General')}><Save className="h-4 w-4" /> Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Display Settings</CardTitle>
                <CardDescription className="text-xs">UI preferences & feature toggles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Dark Mode", desc: "Toggle admin panel dark mode", checked: false },
                  { label: "Maintenance Mode", desc: "Show 'Coming Soon' to visitors", checked: false },
                  { label: "Show Product Reviews", desc: "Display ratings on product cards", checked: true },
                  { label: "Show Stock Count", desc: "Show remaining stock to customers", checked: true },
                  { label: "WhatsApp Chat Button", desc: "Floating chat button on frontend", checked: true },
                  { label: "Show Hindi Names", desc: "Display Hindi product names", checked: true },
                  { label: "Enable Reels on Products", desc: "Show social reels on product pages", checked: true },
                  { label: "Cookie Consent Banner", desc: "Show cookie consent popup", checked: true },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-[10px] text-muted-foreground">{n.desc}</p>
                    </div>
                    <Switch defaultChecked={n.checked} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API KEYS */}
        <TabsContent value="api">
          <div className="space-y-4">
            <SocialSettings />

            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Key className="h-4 w-4" /> API Keys & Secrets</CardTitle>
                <CardDescription className="text-xs">⚠️ Keep these keys secure — never share with anyone</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-xl border bg-muted/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">💳</span>
                    <div>
                      <h3 className="font-medium text-sm">Razorpay Payment Gateway</h3>
                      <p className="text-[10px] text-muted-foreground">UPI, Card, Net Banking, Wallet payments</p>
                    </div>
                    <Badge variant="default" className="text-[9px] ml-auto gap-1">✓ Connected</Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><Label className="text-xs">Razorpay Key ID</Label><Input className="mt-1 h-9 text-xs" value={s('razorpay_key_id')} onChange={e => setS('razorpay_key_id', e.target.value)} placeholder="rzp_live_xxxxxxxxxx" /></div>
                    <div>
                      <Label className="text-xs">Razorpay Key Secret</Label>
                      <div className="relative mt-1">
                        <Input className="h-9 text-xs pr-8" type={showRazorpaySecret ? "text" : "password"} value={s('razorpay_key_secret')} onChange={e => setS('razorpay_key_secret', e.target.value)} placeholder="••••••••••••••••" />
                        <Button variant="ghost" size="icon" className="absolute right-0 top-0 h-9 w-9" onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}>
                          {showRazorpaySecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Switch checked={s('payment_razorpay') === 'true'} onCheckedChange={v => setS('payment_razorpay', String(v))} />
                    <Label className="text-xs">Enable Razorpay</Label>
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-muted/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">💙</span>
                    <div>
                      <h3 className="font-medium text-sm">Paytm Payment Gateway</h3>
                      <p className="text-[10px] text-muted-foreground">UPI, Wallet, Cards via Paytm</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] ml-auto">Optional</Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><Label className="text-xs">Merchant ID</Label><Input className="mt-1 h-9 text-xs" value={s('paytm_merchant_id')} onChange={e => setS('paytm_merchant_id', e.target.value)} placeholder="YourMerchantID" /></div>
                    <div><Label className="text-xs">Merchant Key</Label><Input className="mt-1 h-9 text-xs" type="password" value={s('paytm_merchant_key')} onChange={e => setS('paytm_merchant_key', e.target.value)} placeholder="••••••••" /></div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Switch checked={s('payment_paytm') === 'true'} onCheckedChange={v => setS('payment_paytm', String(v))} />
                    <Label className="text-xs">Enable Paytm</Label>
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-muted/20">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">📊</span>
                    <div>
                      <h3 className="font-medium text-sm">Google Analytics & Search Console</h3>
                      <p className="text-[10px] text-muted-foreground">Traffic tracking & SEO monitoring</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] ml-auto">Optional</Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><Label className="text-xs">GA4 Measurement ID</Label><Input className="mt-1 h-9 text-xs" value={s('ga4_measurement_id')} onChange={e => setS('ga4_measurement_id', e.target.value)} placeholder="G-XXXXXXXXXX" /></div>
                    <div><Label className="text-xs">GTM Container ID</Label><Input className="mt-1 h-9 text-xs" value={s('gtm_id')} onChange={e => setS('gtm_id', e.target.value)} placeholder="GTM-XXXXXXX" /></div>
                    <div className="sm:col-span-2"><Label className="text-xs">Search Console Verification</Label><Input className="mt-1 h-9 text-xs" value={s('search_console_verification')} onChange={e => setS('search_console_verification', e.target.value)} placeholder="google-site-verification=..." /></div>
                  </div>
                </div>

                <Button className="gap-1.5" disabled={saving} onClick={() => saveAppSettings('API Keys')}><Save className="h-4 w-4" /> Save API Keys</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SHIPPING */}
        <TabsContent value="shipping">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Shipping Configuration</CardTitle>
                <CardDescription className="text-xs">Delivery charges and courier settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Flat Rate Shipping (₹)</Label><Input type="number" className="mt-1 h-9" value={s('shipping_flat_rate')} onChange={e => setS('shipping_flat_rate', e.target.value)} /></div>
                  <div><Label className="text-xs">Free Shipping Above (₹)</Label><Input type="number" className="mt-1 h-9" value={s('shipping_free_above')} onChange={e => setS('shipping_free_above', e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Express Shipping (₹)</Label><Input type="number" className="mt-1 h-9" value={s('shipping_express')} onChange={e => setS('shipping_express', e.target.value)} /></div>
                  <div><Label className="text-xs">COD Extra Charge (₹)</Label><Input type="number" className="mt-1 h-9" value={s('shipping_cod_charge')} onChange={e => setS('shipping_cod_charge', e.target.value)} /></div>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs mb-2 block">Primary Courier Partner</Label>
                  <Select value={s('shipping_courier') || 'dtdc'} onValueChange={v => setS('shipping_courier', v)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dtdc">DTDC</SelectItem>
                      <SelectItem value="bluedart">BlueDart</SelectItem>
                      <SelectItem value="delhivery">Delhivery</SelectItem>
                      <SelectItem value="indiapost">India Post</SelectItem>
                      <SelectItem value="ecom">Ecom Express</SelectItem>
                      <SelectItem value="xpressbees">XpressBees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="gap-1.5 w-full" disabled={saving} onClick={() => saveAppSettings('Shipping')}><Save className="h-4 w-4" /> Save</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Tax Configuration</CardTitle>
                <CardDescription className="text-xs">GST & tax settings for invoicing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">GST Rate (%)</Label><Input type="number" className="mt-1 h-9" defaultValue="8" /></div>
                  <div><Label className="text-xs">GSTIN Number</Label><Input className="mt-1 h-9" placeholder="22AAAAA0000A1Z5" /></div>
                </div>
                <div><Label className="text-xs">Legal Business Name</Label><Input className="mt-1 h-9" defaultValue="AI Laptop Wala Store Pvt Ltd" /></div>
                <div><Label className="text-xs">PAN Number</Label><Input className="mt-1 h-9" placeholder="ABCDE1234F" /></div>
                <Separator />
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Include Tax in Price</p>
                    <p className="text-[10px] text-muted-foreground">Prices shown are inclusive of GST</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Auto-generate Invoice</p>
                    <p className="text-[10px] text-muted-foreground">PDF invoice sent to customer email</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button className="gap-1.5 w-full" onClick={() => toast.success("Tax settings saved!")}><Save className="h-4 w-4" /> Save</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* PAYMENTS */}
        <TabsContent value="payments">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Payment Methods</CardTitle>
                <CardDescription className="text-xs">Enable/disable payment gateways</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { key: 'payment_razorpay', label: "Razorpay", desc: "UPI, Card, Net Banking, Wallets", icon: "💳" },
                  { key: 'payment_paytm', label: "Paytm", desc: "UPI, Paytm Wallet, Cards", icon: "💙" },
                  { key: 'payment_cod', label: "Cash on Delivery (COD)", desc: `+₹${s('shipping_cod_charge') || 30} handling fee`, icon: "💵" },
                ].map((m) => (
                  <div key={m.key} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{m.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{m.label}</p>
                        <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                      </div>
                    </div>
                    <Switch checked={s(m.key) === 'true'} onCheckedChange={v => setS(m.key, String(v))} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Payment Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label className="text-xs">Currency</Label>
                  <Select value={s('currency') || 'INR'} onValueChange={v => setS('currency', v)}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">₹ INR (Indian Rupee)</SelectItem>
                      <SelectItem value="USD">$ USD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Min Order Amount (₹)</Label><Input type="number" className="mt-1 h-9" value={s('min_order') || '199'} onChange={e => setS('min_order', e.target.value)} /></div>
                <div><Label className="text-xs">Max COD Amount (₹)</Label><Input type="number" className="mt-1 h-9" value={s('max_cod') || '5000'} onChange={e => setS('max_cod', e.target.value)} /></div>
                <Button className="gap-1.5 w-full" disabled={saving} onClick={() => saveAppSettings('Payments')}><Save className="h-4 w-4" /> Save</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><Search className="h-4 w-4" /> Global SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label className="text-xs">Default Meta Title</Label><Input className="mt-1 h-9 text-xs" value={s('seo_title')} onChange={e => setS('seo_title', e.target.value)} /></div>
                <div><Label className="text-xs">Default Meta Description</Label><Textarea className="mt-1 text-xs" rows={3} value={s('seo_description')} onChange={e => setS('seo_description', e.target.value)} /></div>
                <div><Label className="text-xs">Focus Keywords</Label><Input className="mt-1 h-9 text-xs" value={s('seo_keywords')} onChange={e => setS('seo_keywords', e.target.value)} /></div>
                <Separator />
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div><p className="text-sm font-medium">Auto-generate Sitemap</p><p className="text-[10px] text-muted-foreground">sitemap.xml updated on changes</p></div>
                  <Switch defaultChecked />
                </div>
                <Button className="gap-1.5 w-full" disabled={saving} onClick={() => saveAppSettings('SEO')}><Save className="h-4 w-4" /> Save</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Social Media & OG Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label className="text-xs">OG Title</Label><Input className="mt-1 h-9 text-xs" defaultValue="AI Laptop Wala – Ancient Laptop Wisdom" /></div>
                <div><Label className="text-xs">OG Description</Label><Textarea className="mt-1 text-xs" rows={2} defaultValue="Authentic Laptop products for modern health. Shop now!" /></div>
                <div><Label className="text-xs">OG Image URL</Label><Input className="mt-1 h-9 text-xs" placeholder="https://ailaptopwala.com/og-image.jpg" /></div>
                <Separator />
                <div><Label className="text-xs">Twitter Card Type</Label>
                  <Select defaultValue="summary_large_image">
                    <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary</SelectItem>
                      <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Twitter Handle</Label><Input className="mt-1 h-9 text-xs" defaultValue="@ailaptopwala" /></div>
                <Separator />
                <div><Label className="text-xs">robots.txt Content</Label><Textarea className="mt-1 text-xs font-mono" rows={4} defaultValue={"User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://ailaptopwala.com/sitemap.xml"} /></div>
                <Button className="gap-1.5 w-full" onClick={() => toast.success("OG settings saved!")}><Save className="h-4 w-4" /> Save</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* NOTIFICATIONS */}
        <TabsContent value="notifications">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Admin Notifications</CardTitle>
                <CardDescription className="text-xs">Alerts sent to admin email/WhatsApp</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "New Order Alert", desc: "Email + WhatsApp on every new order", checked: true, icon: "🛒" },
                  { label: "Low Stock Alert", desc: "When product stock drops below 5", checked: true, icon: "📦" },
                  { label: "Payment Failure", desc: "When Razorpay payment fails", checked: true, icon: "❌" },
                  { label: "Social Post Failure", desc: "When auto-post to Instagram/FB fails", checked: true, icon: "📸" },
                  { label: "New Customer Signup", desc: "When a new customer registers", checked: false, icon: "👤" },
                  { label: "Daily Sales Summary", desc: "End-of-day revenue summary", checked: true, icon: "📊" },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <span>{n.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{n.label}</p>
                        <p className="text-[10px] text-muted-foreground">{n.desc}</p>
                      </div>
                    </div>
                    <Switch defaultChecked={n.checked} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Customer Notifications</CardTitle>
                <CardDescription className="text-xs">Automated messages to customers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Order Confirmation", desc: "Email + WhatsApp on order placed", checked: true, icon: "✅" },
                  { label: "Shipping Update", desc: "Tracking ID via WhatsApp + SMS", checked: true, icon: "🚚" },
                  { label: "Delivery Confirmation", desc: "Ask for review after delivery", checked: true, icon: "📬" },
                  { label: "Abandoned Cart Reminder", desc: "WhatsApp reminder after 1 hour", checked: false, icon: "🛒" },
                  { label: "Promotional Messages", desc: "New product & offer announcements", checked: false, icon: "📢" },
                  { label: "Birthday Wishes", desc: "Special discount on birthday", checked: false, icon: "🎂" },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <span>{n.icon}</span>
                      <div>
                        <p className="text-sm font-medium">{n.label}</p>
                        <p className="text-[10px] text-muted-foreground">{n.desc}</p>
                      </div>
                    </div>
                    <Switch defaultChecked={n.checked} />
                  </div>
                ))}
                <Button className="gap-1.5 w-full" onClick={() => toast.success("Notification settings saved!")}><Save className="h-4 w-4" /> Save All</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SECURITY */}
        <TabsContent value="security">
          <div className="grid lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" /> Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Two-Factor Authentication", desc: "Require 2FA for admin login", checked: false },
                  { label: "Rate Limiting", desc: "Limit API requests per IP", checked: true },
                  { label: "CSRF Protection", desc: "Cross-site request forgery protection", checked: true },
                  { label: "SSL Force Redirect", desc: "Force HTTPS on all pages", checked: true },
                  { label: "Login IP Whitelist", desc: "Restrict admin access to specific IPs", checked: false },
                  { label: "Session Timeout", desc: "Auto-logout after 30 min of inactivity", checked: true },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-[10px] text-muted-foreground">{n.desc}</p>
                    </div>
                    <Switch defaultChecked={n.checked} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Backup & Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl border bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Last Backup</p>
                    <Badge variant="default" className="text-[9px] gap-1"><CheckCircle className="h-3 w-3" /> Healthy</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">January 22, 2024 at 3:00 AM</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="text-xs h-7 gap-1"><Download className="h-3 w-3" /> Download</Button>
                    <Button variant="outline" size="sm" className="text-xs h-7 gap-1"><RotateCcw className="h-3 w-3" /> Restore</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Auto Daily Backup</p>
                    <p className="text-[10px] text-muted-foreground">Backup at 3:00 AM daily</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                  <p className="text-sm font-medium text-destructive">Danger Zone</p>
                  <p className="text-[10px] text-muted-foreground mt-1">These actions are irreversible. Proceed with caution.</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="text-xs h-7 text-destructive border-destructive/30">Clear Cache</Button>
                    <Button variant="outline" size="sm" className="text-xs h-7 text-destructive border-destructive/30">Reset Settings</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* FEATURES */}
        <TabsContent value="features">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Toggle site features on/off instantly</p>
              <Button size="sm" onClick={saveFeatures} disabled={savingFeatures} className="gap-1.5 h-8 text-xs">
                {savingFeatures ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                Save Features
              </Button>
            </div>
            {FEATURES.map(f => (
              <Card key={f.key} className={siteFeatures[f.key] && f.danger ? 'border-red-300 bg-red-50/30' : ''}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${f.danger ? 'bg-red-100' : 'bg-primary/10'}`}>
                    <f.icon className={`h-5 w-5 ${f.danger ? 'text-red-500' : 'text-primary'}`} />
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
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default AdminSettings;
