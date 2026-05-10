import { useState, useEffect } from "react";
import { Save, Eye, EyeOff, Globe, Phone, Mail, Shield, Key, Bell, Truck, CreditCard, Lock, Palette, Search, FileText, Users, Database, Webhook, AlertTriangle, CheckCircle, ExternalLink, Copy, RotateCcw, Download, Wrench, Star, Package, MessageCircle, Play, Cookie, RefreshCw, BarChart3 } from "lucide-react";
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
  const [lastBackup, setLastBackup] = useState<string | null>(null);

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
                <div>
                  <Label className="text-xs">Store Logo URL</Label>
                  <Input className="mt-1 h-9" value={s('store_logo')} onChange={e => setS('store_logo', e.target.value)} placeholder="https://... or /assets/logo.jpeg" />
                  {s('store_logo') && <img src={s('store_logo')} alt="Logo preview" className="mt-2 h-12 w-auto rounded-lg border" />}
                  <p className="text-[10px] text-muted-foreground mt-1">Default: <code>/assets/logo.jpeg</code> (already uploaded)</p>
                </div>
                <div>
                  <Label className="text-xs">Favicon URL</Label>
                  <Input className="mt-1 h-9" value={s('store_favicon')} onChange={e => setS('store_favicon', e.target.value)} placeholder="/favicon.png" />
                  <p className="text-[10px] text-muted-foreground mt-1">Default favicon already set. Change URL to update.</p>
                </div>
                <Button className="gap-1.5 w-full" disabled={saving} onClick={() => saveAppSettings('General')}><Save className="h-4 w-4" /> Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Business Hours & Info</CardTitle>
                <CardDescription className="text-xs">Additional store details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label className="text-xs">Business Hours</Label><Input className="mt-1 h-9" value={s('business_hours')} onChange={e => setS('business_hours', e.target.value)} placeholder="Mon-Sat 10:00 AM - 9:00 PM" /></div>
                <div><Label className="text-xs">GSTIN</Label><Input className="mt-1 h-9" value={s('gstin')} onChange={e => setS('gstin', e.target.value)} placeholder="23ATNPA4415H1Z2" /></div>
                <div><Label className="text-xs">Support Email</Label><Input className="mt-1 h-9" value={s('support_email')} onChange={e => setS('support_email', e.target.value)} placeholder="support@example.com" /></div>
                <div><Label className="text-xs">Support Phone</Label><Input className="mt-1 h-9" value={s('support_phone')} onChange={e => setS('support_phone', e.target.value)} placeholder="+91 98934 96163" /></div>
                <div><Label className="text-xs">Google Maps Embed URL</Label><Input className="mt-1 h-9" value={s('google_maps_url')} onChange={e => setS('google_maps_url', e.target.value)} /></div>
                <p className="text-xs text-muted-foreground pt-1 border-t">Feature toggles moved to <b>Features</b> tab →</p>
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
                <CardDescription className="text-xs flex items-center gap-1"><Lock className="h-3 w-3" /> Keep these keys secure — never share with anyone</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 rounded-xl border bg-muted/20">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <h3 className="font-medium text-sm">Razorpay Payment Gateway</h3>
                      <p className="text-[10px] text-muted-foreground">UPI, Card, Net Banking, Wallet payments</p>
                    </div>
                    {s('razorpay_key_id') && s('razorpay_key_id').startsWith('rzp_') ? (
                      <Badge variant="default" className="text-[9px] ml-auto gap-1 bg-green-600">✓ Configured</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] ml-auto">Not configured</Badge>
                    )}
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
                    <CreditCard className="h-5 w-5 text-blue-500" />
                    <div>
                      <h3 className="font-medium text-sm">Paytm Payment Gateway</h3>
                      <p className="text-[10px] text-muted-foreground">UPI, Wallet, Cards via Paytm</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] ml-auto">Optional</Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><Label className="text-xs">Merchant ID (MID)</Label><Input className="mt-1 h-9 text-xs" value={s('paytm_merchant_id')} onChange={e => setS('paytm_merchant_id', e.target.value)} placeholder="YourMerchantID" /></div>
                    <div><Label className="text-xs">Merchant Key</Label><Input className="mt-1 h-9 text-xs" type="password" value={s('paytm_merchant_key')} onChange={e => setS('paytm_merchant_key', e.target.value)} placeholder="••••••••" /></div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 mt-3">
                    <div><Label className="text-xs">Website</Label>
                      <Select value={s('paytm_website') || 'WEBSTAGING'} onValueChange={v => setS('paytm_website', v)}>
                        <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="WEBSTAGING">WEBSTAGING (Test)</SelectItem>
                          <SelectItem value="DEFAULT">DEFAULT (Production)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2 mt-5">
                      <Switch checked={s('paytm_production') === 'true'} onCheckedChange={v => setS('paytm_production', String(v))} />
                      <Label className="text-xs">Production Mode</Label>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 border-t pt-3">
                    <Switch checked={s('payment_paytm') === 'true'} onCheckedChange={v => setS('payment_paytm', String(v))} />
                    <Label className="text-xs font-medium">Enable Paytm Gateway</Label>
                    {s('paytm_merchant_id') && s('paytm_merchant_key') ? (
                      <Badge variant="default" className="text-[9px] ml-auto bg-green-600">✓ Ready</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] ml-auto">Add keys first</Badge>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-muted/20">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="h-5 w-5 text-green-500" />
                    <div>
                      <h3 className="font-medium text-sm">Cashfree Payment Gateway</h3>
                      <p className="text-[10px] text-muted-foreground">Instant settlements, UPI, Cards, NetBanking, Wallets</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] ml-auto">Optional</Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><Label className="text-xs">App ID</Label><Input className="mt-1 h-9 text-xs" value={s('cashfree_app_id')} onChange={e => setS('cashfree_app_id', e.target.value)} placeholder="TEST123abc..." /></div>
                    <div><Label className="text-xs">Secret Key</Label><Input className="mt-1 h-9 text-xs" type="password" value={s('cashfree_secret_key')} onChange={e => setS('cashfree_secret_key', e.target.value)} placeholder="••••••••" /></div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 border-t pt-3">
                    <Switch checked={s('cashfree_production') === 'true'} onCheckedChange={v => setS('cashfree_production', String(v))} />
                    <Label className="text-xs">Production Mode</Label>
                    <div className="ml-auto flex items-center gap-2">
                      <Switch checked={s('payment_cashfree') === 'true'} onCheckedChange={v => setS('payment_cashfree', String(v))} />
                      <Label className="text-xs font-medium">Enable Cashfree</Label>
                    </div>
                  </div>
                  <div className="mt-2">
                    {s('cashfree_app_id') && s('cashfree_secret_key') ? (
                      <Badge variant="default" className="text-[9px] bg-green-600">✓ Ready</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px]">Add App ID + Secret</Badge>
                    )}
                    {s('cashfree_production') === 'true' ? <Badge className="text-[9px] ml-2 bg-red-600">LIVE</Badge> : <Badge variant="outline" className="text-[9px] ml-2">SANDBOX</Badge>}
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-muted/20">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="h-5 w-5 text-purple-500" />
                    <div>
                      <h3 className="font-medium text-sm">PhonePe Payment Gateway</h3>
                      <p className="text-[10px] text-muted-foreground">India's #1 UPI app — direct PG integration</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] ml-auto">Optional</Badge>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div><Label className="text-xs">Merchant ID</Label><Input className="mt-1 h-9 text-xs" value={s('phonepe_merchant_id')} onChange={e => setS('phonepe_merchant_id', e.target.value)} placeholder="PGTESTPAYUAT" /></div>
                    <div><Label className="text-xs">Salt Key</Label><Input className="mt-1 h-9 text-xs" type="password" value={s('phonepe_salt_key')} onChange={e => setS('phonepe_salt_key', e.target.value)} placeholder="••••••••" /></div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 mt-3">
                    <div><Label className="text-xs">Salt Index</Label><Input className="mt-1 h-9 text-xs" value={s('phonepe_salt_index') || '1'} onChange={e => setS('phonepe_salt_index', e.target.value)} placeholder="1" /></div>
                    <div className="flex items-center gap-2 mt-5">
                      <Switch checked={s('phonepe_production') === 'true'} onCheckedChange={v => setS('phonepe_production', String(v))} />
                      <Label className="text-xs">Production Mode</Label>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3 border-t pt-3">
                    <Switch checked={s('payment_phonepe') === 'true'} onCheckedChange={v => setS('payment_phonepe', String(v))} />
                    <Label className="text-xs font-medium">Enable PhonePe</Label>
                    <div className="ml-auto flex gap-1">
                      {s('phonepe_merchant_id') && s('phonepe_salt_key') ? (
                        <Badge variant="default" className="text-[9px] bg-green-600">✓ Ready</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px]">Add Merchant + Salt</Badge>
                      )}
                      {s('phonepe_production') === 'true' ? <Badge className="text-[9px] bg-red-600">LIVE</Badge> : <Badge variant="outline" className="text-[9px]">SANDBOX</Badge>}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border bg-muted/20">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="h-5 w-5 text-orange-500" />
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
                <CardTitle className="text-base">Basic Shipping Rates</CardTitle>
                <CardDescription className="text-xs">Default delivery charges</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Flat Rate (₹)</Label><Input type="number" className="mt-1 h-9" value={s('shipping_flat_rate')} onChange={e => setS('shipping_flat_rate', e.target.value)} placeholder="50" /></div>
                  <div><Label className="text-xs">Free Shipping Above (₹)</Label><Input type="number" className="mt-1 h-9" value={s('shipping_free_above')} onChange={e => setS('shipping_free_above', e.target.value)} placeholder="499" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Express (₹)</Label><Input type="number" className="mt-1 h-9" value={s('shipping_express')} onChange={e => setS('shipping_express', e.target.value)} placeholder="150" /></div>
                  <div><Label className="text-xs">COD Extra (₹)</Label><Input type="number" className="mt-1 h-9" value={s('shipping_cod_charge')} onChange={e => setS('shipping_cod_charge', e.target.value)} placeholder="30" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Local Delivery (Indore)</Label><Input type="number" className="mt-1 h-9" value={s('shipping_local_rate')} onChange={e => setS('shipping_local_rate', e.target.value)} placeholder="0 (free)" /></div>
                  <div><Label className="text-xs">Local Pincode Prefix</Label><Input className="mt-1 h-9" value={s('shipping_local_pincode')} onChange={e => setS('shipping_local_pincode', e.target.value)} placeholder="452 (Indore)" /></div>
                </div>
                <Separator />
                <div>
                  <Label className="text-xs mb-2 block">Estimated Delivery Time</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-[10px] text-muted-foreground">Local (days)</Label><Input type="number" className="mt-1 h-8" value={s('shipping_days_local')} onChange={e => setS('shipping_days_local', e.target.value)} placeholder="1-2" /></div>
                    <div><Label className="text-[10px] text-muted-foreground">National (days)</Label><Input type="number" className="mt-1 h-8" value={s('shipping_days_national')} onChange={e => setS('shipping_days_national', e.target.value)} placeholder="3-5" /></div>
                  </div>
                </div>
                <Button className="gap-1.5 w-full" disabled={saving} onClick={() => saveAppSettings('Shipping')}><Save className="h-4 w-4" /> Save</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Courier & Tracking</CardTitle>
                <CardDescription className="text-xs">Courier API integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs mb-2 block">Primary Courier Partner</Label>
                  <Select value={s('shipping_courier') || 'dtdc'} onValueChange={v => setS('shipping_courier', v)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dtdc">DTDC</SelectItem>
                      <SelectItem value="bluedart">BlueDart</SelectItem>
                      <SelectItem value="delhivery">Delhivery</SelectItem>
                      <SelectItem value="shiprocket">Shiprocket</SelectItem>
                      <SelectItem value="indiapost">India Post</SelectItem>
                      <SelectItem value="ecom">Ecom Express</SelectItem>
                      <SelectItem value="xpressbees">XpressBees</SelectItem>
                      <SelectItem value="nimbuspost">NimbusPost</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Shiprocket API Email</Label><Input className="mt-1 h-9 text-xs" value={s('shiprocket_email')} onChange={e => setS('shiprocket_email', e.target.value)} placeholder="account@email.com" /></div>
                <div><Label className="text-xs">Shiprocket API Password</Label><Input type="password" className="mt-1 h-9 text-xs" value={s('shiprocket_password')} onChange={e => setS('shiprocket_password', e.target.value)} placeholder="••••••••" /></div>
                <div><Label className="text-xs">Pickup Pincode (Warehouse)</Label><Input className="mt-1 h-9" value={s('pickup_pincode') || '452010'} onChange={e => setS('pickup_pincode', e.target.value)} /></div>
                <Separator />
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Auto Create Shipment</p>
                    <p className="text-[10px] text-muted-foreground">Auto-push orders to courier on confirmed</p>
                  </div>
                  <Switch checked={s('auto_shipment') === 'true'} onCheckedChange={v => setS('auto_shipment', String(v))} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Send Tracking SMS</p>
                    <p className="text-[10px] text-muted-foreground">SMS + WhatsApp with tracking link</p>
                  </div>
                  <Switch checked={s('tracking_sms') === 'true'} onCheckedChange={v => setS('tracking_sms', String(v))} />
                </div>
                <Button className="gap-1.5 w-full" disabled={saving} onClick={() => saveAppSettings('Courier')}><Save className="h-4 w-4" /> Save</Button>
              </CardContent>
            </Card>

          </div>

          {/* Shipping Zones (optional advanced) */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Return & Refund Policy</CardTitle>
              <CardDescription className="text-xs">Return period and conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div><Label className="text-xs">Return Period (days)</Label><Input type="number" className="mt-1 h-9" value={s('return_days') || 7} onChange={e => setS('return_days', e.target.value)} /></div>
                <div><Label className="text-xs">Refund Period (days)</Label><Input type="number" className="mt-1 h-9" value={s('refund_days') || 5} onChange={e => setS('refund_days', e.target.value)} /></div>
                <div><Label className="text-xs">Restocking Fee (%)</Label><Input type="number" className="mt-1 h-9" value={s('restocking_fee') || 0} onChange={e => setS('restocking_fee', e.target.value)} /></div>
              </div>
              <div><Label className="text-xs">Return Policy Text (shown on product pages)</Label><Textarea className="mt-1 text-xs" rows={3} value={s('return_policy')} onChange={e => setS('return_policy', e.target.value)} placeholder="7-day easy returns. Original packaging required." /></div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="text-sm font-medium">Allow Returns</p>
                  <p className="text-[10px] text-muted-foreground">Customers can request returns</p>
                </div>
                <Switch checked={s('allow_returns') !== 'false'} onCheckedChange={v => setS('allow_returns', String(v))} />
              </div>
              <Button className="gap-1.5 w-full" disabled={saving} onClick={() => saveAppSettings('Returns')}><Save className="h-4 w-4" /> Save</Button>
            </CardContent>
          </Card>
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
                {/* MAIN GATEWAYS */}
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mt-1">Main Gateways</p>
                {[
                  { key: 'payment_razorpay', label: "Razorpay (Recommended)", desc: "One gateway — accepts UPI, Card, NetBanking, Wallets, EMI automatically. Configure sub-methods in Razorpay dashboard.", highlight: true },
                  { key: 'payment_cashfree', label: "Cashfree", desc: "Instant settlements, low fees, UPI-first" },
                  { key: 'payment_phonepe', label: "PhonePe PG", desc: "India's #1 UPI — direct integration" },
                  { key: 'payment_paytm', label: "Paytm Gateway", desc: "Alternative — separate merchant account required" },
                  { key: 'payment_cod', label: "Cash on Delivery", desc: `+₹${s('shipping_cod_charge') || 30} handling fee (no gateway)` },
                ].map((m) => (
                  <div key={m.key} className={`flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 transition-colors ${m.highlight ? 'bg-primary/5 border-primary/30' : ''}`}>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{m.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{m.desc}</p>
                    </div>
                    <Switch checked={s(m.key) === 'true'} onCheckedChange={v => setS(m.key, String(v))} />
                  </div>
                ))}

                {/* Razorpay sub-methods (only visible + relevant when Razorpay is ON) */}
                {s('payment_razorpay') === 'true' && (
                  <div className="border rounded-lg p-3 bg-muted/30 space-y-2 mt-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Razorpay Sub-methods (show to customer)</p>
                    <p className="text-[10px] text-muted-foreground">Toggle which options customer sees at checkout. Disable unwanted methods here. All settled via Razorpay.</p>
                    {[
                      { key: 'payment_upi', label: "UPI (PhonePe, GPay, Paytm)" },
                      { key: 'payment_card', label: "Credit / Debit Card" },
                      { key: 'payment_netbanking', label: "Net Banking" },
                      { key: 'payment_wallet', label: "Wallets" },
                      { key: 'payment_emi', label: "EMI (No-cost)" },
                    ].map(m => (
                      <div key={m.key} className="flex items-center justify-between py-1">
                        <span className="text-xs">{m.label}</span>
                        <Switch checked={s(m.key) !== 'false'} onCheckedChange={v => setS(m.key, String(v))} />
                      </div>
                    ))}
                  </div>
                )}

                <Button className="gap-1.5 w-full mt-2" disabled={saving} onClick={() => saveAppSettings('Payment Methods')}><Save className="h-4 w-4" /> Save Methods</Button>
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
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs">Min Order (₹)</Label><Input type="number" className="mt-1 h-9" value={s('min_order') || '199'} onChange={e => setS('min_order', e.target.value)} /></div>
                  <div><Label className="text-xs">Max COD (₹)</Label><Input type="number" className="mt-1 h-9" value={s('max_cod') || '5000'} onChange={e => setS('max_cod', e.target.value)} /></div>
                </div>
                <div><Label className="text-xs">Merchant UPI ID (for QR)</Label><Input className="mt-1 h-9" value={s('merchant_upi')} onChange={e => setS('merchant_upi', e.target.value)} placeholder="yourshop@ybl" /></div>
                <div><Label className="text-xs">Merchant Name (on QR)</Label><Input className="mt-1 h-9" value={s('merchant_name')} onChange={e => setS('merchant_name', e.target.value)} placeholder="AI Laptop Wala" /></div>
                <div>
                  <Label className="text-xs">Default Gateway for Invoice Links (WhatsApp)</Label>
                  <Select value={s('default_invoice_gateway') || 'razorpay'} onValueChange={v => setS('default_invoice_gateway', v)}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="razorpay">Razorpay</SelectItem>
                      <SelectItem value="cashfree">Cashfree</SelectItem>
                      <SelectItem value="phonepe">PhonePe</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] text-muted-foreground mt-1">Used when admin clicks 'Send Invoice on WhatsApp' in Billing. Customer gets payment link from this gateway.</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Prepaid Discount</p>
                    <p className="text-[10px] text-muted-foreground">Extra discount on online payment</p>
                  </div>
                  <Switch checked={s('prepaid_discount_enabled') === 'true'} onCheckedChange={v => setS('prepaid_discount_enabled', String(v))} />
                </div>
                {s('prepaid_discount_enabled') === 'true' && (
                  <div><Label className="text-xs">Prepaid Discount (%)</Label><Input type="number" className="mt-1 h-9" value={s('prepaid_discount_percent') || '2'} onChange={e => setS('prepaid_discount_percent', e.target.value)} /></div>
                )}
                <Button className="gap-1.5 w-full" disabled={saving} onClick={() => saveAppSettings('Payments')}><Save className="h-4 w-4" /> Save Settings</Button>
              </CardContent>
            </Card>
          </div>

          {/* Tax & Invoice */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tax & Invoice Configuration</CardTitle>
              <CardDescription className="text-xs">GST & invoice settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div><Label className="text-xs">GST Rate (%)</Label><Input type="number" className="mt-1 h-9" value={s('gst_rate') || '18'} onChange={e => setS('gst_rate', e.target.value)} /></div>
                <div><Label className="text-xs">GSTIN Number</Label><Input className="mt-1 h-9" value={s('gstin')} onChange={e => setS('gstin', e.target.value)} placeholder="22AAAAA0000A1Z5" /></div>
                <div><Label className="text-xs">PAN Number</Label><Input className="mt-1 h-9" value={s('pan_number')} onChange={e => setS('pan_number', e.target.value)} placeholder="ABCDE1234F" /></div>
              </div>
              <div><Label className="text-xs">Legal Business Name</Label><Input className="mt-1 h-9" value={s('legal_name')} onChange={e => setS('legal_name', e.target.value)} placeholder="AI Laptop Wala Pvt Ltd" /></div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Include Tax in Price</p>
                    <p className="text-[10px] text-muted-foreground">Inclusive pricing</p>
                  </div>
                  <Switch checked={s('tax_inclusive') === 'true'} onCheckedChange={v => setS('tax_inclusive', String(v))} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Auto-generate Invoice</p>
                    <p className="text-[10px] text-muted-foreground">PDF emailed to customer</p>
                  </div>
                  <Switch checked={s('auto_invoice') === 'true'} onCheckedChange={v => setS('auto_invoice', String(v))} />
                </div>
              </div>
              <Button className="gap-1.5 w-full" disabled={saving} onClick={() => saveAppSettings('Tax')}><Save className="h-4 w-4" /> Save</Button>
            </CardContent>
          </Card>
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
                  <Switch checked={s('auto_sitemap') === 'true'} onCheckedChange={v => setS('auto_sitemap', String(v))} />
                </div>
                <Button className="gap-1.5 w-full" disabled={saving} onClick={() => saveAppSettings('SEO')}><Save className="h-4 w-4" /> Save</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Social Media & OG Tags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div><Label className="text-xs">OG Title</Label><Input className="mt-1 h-9 text-xs" value={s('og_title')} onChange={e => setS('og_title', e.target.value)} /></div>
                <div><Label className="text-xs">OG Description</Label><Textarea className="mt-1 text-xs" rows={2} value={s('og_description')} onChange={e => setS('og_description', e.target.value)} /></div>
                <div><Label className="text-xs">OG Image URL</Label><Input className="mt-1 h-9 text-xs" value={s('og_image')} onChange={e => setS('og_image', e.target.value)} placeholder="https://ailaptopwala.com/og-image.jpg" /></div>
                <Separator />
                <div><Label className="text-xs">Twitter Card Type</Label>
                  <Select value={s('twitter_card') || 'summary_large_image'} onValueChange={v => setS('twitter_card', v)}>
                    <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summary">Summary</SelectItem>
                      <SelectItem value="summary_large_image">Summary Large Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">Twitter Handle</Label><Input className="mt-1 h-9 text-xs" value={s('twitter_handle')} onChange={e => setS('twitter_handle', e.target.value)} placeholder="@ailaptopwala" /></div>
                <Separator />
                <div><Label className="text-xs">robots.txt Content</Label><Textarea className="mt-1 text-xs font-mono" rows={4} value={s('robots_txt') || "User-agent: *\nAllow: /\nDisallow: /admin/\nSitemap: https://ailaptopwala.com/sitemap.xml"} onChange={e => setS('robots_txt', e.target.value)} /></div>
                <Button className="gap-1.5 w-full" disabled={saving} onClick={() => saveAppSettings('Social & OG')}><Save className="h-4 w-4" /> Save</Button>
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
                  { key: "notif_new_order", label: "New Order Alert", desc: "Email + WhatsApp on every new order" },
                  { key: "notif_low_stock", label: "Low Stock Alert", desc: "When product stock drops below 5" },
                  { key: "notif_payment_fail", label: "Payment Failure", desc: "When Razorpay payment fails" },
                  { key: "notif_social_fail", label: "Social Post Failure", desc: "When auto-post to Instagram/FB fails" },
                  { key: "notif_new_user", label: "New Customer Signup", desc: "When a new customer registers" },
                  { key: "notif_daily_summary", label: "Daily Sales Summary", desc: "End-of-day revenue summary" },
                ].map((n) => (
                  <div key={n.key} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-[10px] text-muted-foreground">{n.desc}</p>
                    </div>
                    <Switch checked={s(n.key) === 'true'} onCheckedChange={v => setS(n.key, String(v))} />
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
                  { key: "cnotif_order_confirm", label: "Order Confirmation", desc: "Email + WhatsApp on order placed" },
                  { key: "cnotif_shipping", label: "Shipping Update", desc: "Tracking ID via WhatsApp + SMS" },
                  { key: "cnotif_delivery", label: "Delivery Confirmation", desc: "Ask for review after delivery" },
                  { key: "cnotif_abandoned", label: "Abandoned Cart Reminder", desc: "WhatsApp reminder after 1 hour" },
                  { key: "cnotif_promo", label: "Promotional Messages", desc: "New product & offer announcements" },
                  { key: "cnotif_birthday", label: "Birthday Wishes", desc: "Special discount on birthday" },
                ].map((n) => (
                  <div key={n.key} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-[10px] text-muted-foreground">{n.desc}</p>
                    </div>
                    <Switch checked={s(n.key) === 'true'} onCheckedChange={v => setS(n.key, String(v))} />
                  </div>
                ))}
                <Button className="gap-1.5 w-full" disabled={saving} onClick={() => saveAppSettings('Notifications')}><Save className="h-4 w-4" /> Save Notifications</Button>
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
                  { key: "sec_2fa", label: "Two-Factor Authentication", desc: "Require 2FA for admin login" },
                  { key: "sec_rate_limit", label: "Rate Limiting", desc: "Limit API requests per IP" },
                  { key: "sec_csrf", label: "CSRF Protection", desc: "Cross-site request forgery protection" },
                  { key: "sec_ssl_force", label: "SSL Force Redirect", desc: "Force HTTPS on all pages" },
                  { key: "sec_ip_whitelist", label: "Login IP Whitelist", desc: "Restrict admin access to specific IPs" },
                  { key: "sec_session_timeout", label: "Session Timeout 30min", desc: "Auto-logout after 30 min of inactivity" },
                ].map((n) => (
                  <div key={n.key} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="text-sm font-medium">{n.label}</p>
                      <p className="text-[10px] text-muted-foreground">{n.desc}</p>
                    </div>
                    <Switch checked={s(n.key) === 'true'} onCheckedChange={v => setS(n.key, String(v))} />
                  </div>
                ))}
                <Button className="gap-1.5 w-full mt-2" disabled={saving} onClick={() => saveAppSettings('Security')}><Save className="h-4 w-4" /> Save Security</Button>
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
                    <Badge variant={lastBackup ? 'default' : 'secondary'} className="text-[9px] gap-1">
                      <CheckCircle className="h-3 w-3" /> {lastBackup ? 'Healthy' : 'Never'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {lastBackup ? new Date(lastBackup).toLocaleString('en-IN') : 'No backup yet. Click Download to create first backup.'}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={async () => {
                      const token = localStorage.getItem('ailaptopwala_token');
                      const res = await fetch('/api/erp/backup/download', { headers: { Authorization: `Bearer ${token}` } });
                      if (!res.ok) { toast.error('Backup failed'); return; }
                      const blob = await res.blob();
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a'); a.href = url; a.download = `ailaptopwala-backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
                      URL.revokeObjectURL(url);
                      // Mark backup time
                      await fetch('/api/erp/backup/run', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
                      const status = await fetch('/api/erp/backup/status', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json());
                      setLastBackup(status.last_backup);
                      toast.success('Backup downloaded!');
                    }}><Download className="h-3 w-3" /> Download</Button>
                    <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={() => {
                      toast.info('Restore: Upload backup JSON file manually via DB admin. Direct restore not yet supported for safety.');
                    }}><RotateCcw className="h-3 w-3" /> Restore</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">Auto Daily Backup</p>
                    <p className="text-[10px] text-muted-foreground">Backup at 3:00 AM daily</p>
                  </div>
                  <Switch checked={s('auto_backup') === 'true'} onCheckedChange={v => setS('auto_backup', String(v))} />
                </div>
                <Separator />
                <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                  <p className="text-sm font-medium text-destructive">Danger Zone</p>
                  <p className="text-[10px] text-muted-foreground mt-1">These actions are irreversible. Proceed with caution.</p>
                  <div className="flex gap-2 mt-3">
                    <Button variant="outline" size="sm" className="text-xs h-7 text-destructive border-destructive/30" onClick={async () => {
                      if (!confirm('Clear old notifications (30+ days) and audit logs (90+ days)?')) return;
                      const res = await fetch('/api/erp/cache/clear', { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` } }).then(r => r.json());
                      toast.success(res.message || 'Cache cleared');
                    }}>Clear Cache</Button>
                    <Button variant="outline" size="sm" className="text-xs h-7 text-destructive border-destructive/30" onClick={async () => {
                      if (!confirm('⚠️ This will delete ALL app settings (except API keys). Continue?')) return;
                      const res = await fetch('/api/erp/settings/reset', { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` } }).then(r => r.json());
                      if (res.error) toast.error(res.error);
                      else { toast.success(res.message); window.location.reload(); }
                    }}>Reset Settings</Button>
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
