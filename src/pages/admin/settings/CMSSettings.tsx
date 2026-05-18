import { useState, useEffect } from "react";
import { Save, FileText, Image, MessageSquare, Layout, Globe, Video, ArrowRight, Upload, Newspaper, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";

export default function CMSSettings() {
  const [s, setS] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('ailaptopwala_token');
  const headers: any = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetch('/api/app-settings').then(r => r.json()).then(d => { if (d && typeof d === 'object') setS(d); }).catch(() => {}); }, []);
  const save = async () => { setSaving(true); await fetch('/api/app-settings', { method: 'PUT', headers, body: JSON.stringify(s) }); toast.success('CMS Settings saved!'); setSaving(false); };
  const v = (key: string, fallback = '') => s[key] || fallback;
  const set = (key: string, val: string) => setS(p => ({ ...p, [key]: val }));

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><FileText className="h-6 w-6" /> CMS Settings</h1>
            <p className="text-sm text-muted-foreground">Blog, banners, popups, SEO, homepage, media configuration</p>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All'}</Button>
        </div>

        <div className="space-y-6">

          {/* ─── BLOG ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Newspaper className="h-4 w-4" /> Blog Settings</CardTitle>
              <CardDescription>Posts display, comments, related content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Posts per page</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Slider value={[parseInt(v('blog_per_page', '10'))]} max={30} min={3} step={1} onValueChange={([val]) => set('blog_per_page', String(val))} className="flex-1" />
                    <span className="text-sm font-bold w-8 text-center">{v('blog_per_page', '10')}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Related posts count</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Slider value={[parseInt(v('blog_related_count', '3'))]} max={8} min={0} step={1} onValueChange={([val]) => set('blog_related_count', String(val))} className="flex-1" />
                    <span className="text-sm font-bold w-8 text-center">{v('blog_related_count', '3')}</span>
                  </div>
                </div>
                <div><Label className="text-xs">Default Author</Label><Input className="mt-1" value={v('blog_default_author', 'AI Laptop Wala')} onChange={e => set('blog_default_author', e.target.value)} /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div><p className="text-sm font-medium">Comments</p><p className="text-[10px] text-muted-foreground">Allow comments on blog posts</p></div>
                  <Switch checked={v('blog_comments', '1') !== '0'} onCheckedChange={c => set('blog_comments', c ? '1' : '0')} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div><p className="text-sm font-medium">Auto-publish</p><p className="text-[10px] text-muted-foreground">New posts go live immediately</p></div>
                  <Switch checked={v('blog_auto_publish') === '1'} onCheckedChange={c => set('blog_auto_publish', c ? '1' : '0')} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div><p className="text-sm font-medium">Show views count</p><p className="text-[10px] text-muted-foreground">Display view counter on posts</p></div>
                  <Switch checked={v('blog_show_views', '1') !== '0'} onCheckedChange={c => set('blog_show_views', c ? '1' : '0')} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <div><p className="text-sm font-medium">Reading time</p><p className="text-[10px] text-muted-foreground">Show estimated reading time</p></div>
                  <Switch checked={v('blog_reading_time', '1') !== '0'} onCheckedChange={c => set('blog_reading_time', c ? '1' : '0')} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ─── BANNERS ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Image className="h-4 w-4" /> Banner Settings</CardTitle>
              <CardDescription>Homepage slider/banner configuration</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Auto-rotate speed (seconds)</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Slider value={[parseInt(v('banner_speed', '5'))]} max={15} min={2} step={1} onValueChange={([val]) => set('banner_speed', String(val))} className="flex-1" />
                  <span className="text-sm font-bold w-8 text-center">{v('banner_speed', '5')}s</span>
                </div>
              </div>
              <div><Label className="text-xs">Max banners to show</Label><Input className="mt-1" type="number" value={v('banner_max', '5')} onChange={e => set('banner_max', e.target.value)} /></div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-sm font-medium">Auto-rotate</p><p className="text-[10px] text-muted-foreground">Slide banners automatically</p></div>
                <Switch checked={v('banner_autoplay', '1') !== '0'} onCheckedChange={c => set('banner_autoplay', c ? '1' : '0')} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-sm font-medium">Show dots/indicators</p><p className="text-[10px] text-muted-foreground">Navigation dots below banner</p></div>
                <Switch checked={v('banner_dots', '1') !== '0'} onCheckedChange={c => set('banner_dots', c ? '1' : '0')} />
              </div>
            </CardContent>
          </Card>

          {/* ─── POPUPS ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Popup Settings</CardTitle>
              <CardDescription>Global popup behavior</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-sm font-medium">Popups enabled</p><p className="text-[10px] text-muted-foreground">Master switch for all popups</p></div>
                <Switch checked={v('popups_enabled', '1') !== '0'} onCheckedChange={c => set('popups_enabled', c ? '1' : '0')} />
              </div>
              <div><Label className="text-xs">Default delay (seconds)</Label><Input className="mt-1" type="number" value={v('popup_delay', '5')} onChange={e => set('popup_delay', e.target.value)} /></div>
              <div>
                <Label className="text-xs">Show frequency</Label>
                <Select value={v('popup_frequency', 'once_per_session')} onValueChange={val => set('popup_frequency', val)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="every_visit">Every page visit</SelectItem>
                    <SelectItem value="once_per_session">Once per session</SelectItem>
                    <SelectItem value="once_per_day">Once per day</SelectItem>
                    <SelectItem value="once_ever">Once ever (cookie)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-sm font-medium">Exit-intent popup</p><p className="text-[10px] text-muted-foreground">Show when user tries to leave</p></div>
                <Switch checked={v('popup_exit_intent', '1') !== '0'} onCheckedChange={c => set('popup_exit_intent', c ? '1' : '0')} />
              </div>
            </CardContent>
          </Card>

          {/* ─── HOMEPAGE ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Layout className="h-4 w-4" /> Homepage Sections</CardTitle>
              <CardDescription>Control what shows on the homepage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><Label className="text-xs">Products per section</Label><Input className="mt-1" type="number" value={v('homepage_products_count', '8')} onChange={e => set('homepage_products_count', e.target.value)} /></div>
                <div><Label className="text-xs">Max homepage sections</Label><Input className="mt-1" type="number" value={v('homepage_max_sections', '10')} onChange={e => set('homepage_max_sections', e.target.value)} /></div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { key: 'show_featured', label: 'Featured Products', desc: 'Highlighted products section' },
                  { key: 'show_new_arrivals', label: 'New Arrivals', desc: 'Latest added products' },
                  { key: 'show_best_sellers', label: 'Best Sellers', desc: 'Top selling products' },
                  { key: 'show_deals', label: 'Deals & Offers', desc: 'Discounted products' },
                  { key: 'show_categories', label: 'Categories Grid', desc: 'Browse by category' },
                  { key: 'show_testimonials', label: 'Testimonials', desc: 'Customer reviews section' },
                  { key: 'show_brands', label: 'Brand Logos', desc: 'Trusted brands strip' },
                  { key: 'show_blog', label: 'Latest Blog Posts', desc: 'Recent articles' },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/30 transition-colors">
                    <div><p className="text-sm font-medium">{item.label}</p><p className="text-[10px] text-muted-foreground">{item.desc}</p></div>
                    <Switch checked={v(item.key, '1') !== '0'} onCheckedChange={c => set(item.key, c ? '1' : '0')} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* ─── TESTIMONIALS ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Video className="h-4 w-4" /> Testimonials</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-sm font-medium">Auto-approve</p><p className="text-[10px] text-muted-foreground">New testimonials go live without review</p></div>
                <Switch checked={v('testimonial_auto_approve') === '1'} onCheckedChange={c => set('testimonial_auto_approve', c ? '1' : '0')} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-sm font-medium">Video testimonials</p><p className="text-[10px] text-muted-foreground">Allow YouTube video embeds</p></div>
                <Switch checked={v('testimonial_video', '1') !== '0'} onCheckedChange={c => set('testimonial_video', c ? '1' : '0')} />
              </div>
              <div><Label className="text-xs">Max display on homepage</Label><Input className="mt-1" type="number" value={v('testimonial_homepage_count', '6')} onChange={e => set('testimonial_homepage_count', e.target.value)} /></div>
              <div><Label className="text-xs">Min rating to show</Label>
                <Select value={v('testimonial_min_rating', '4')} onValueChange={val => set('testimonial_min_rating', val)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3+ stars</SelectItem>
                    <SelectItem value="4">4+ stars</SelectItem>
                    <SelectItem value="5">5 stars only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* ─── SEO ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Globe className="h-4 w-4" /> SEO & Sitemap</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Title suffix</Label><Input className="mt-1" value={v('seo_title_suffix', '| AI Laptop Wala')} onChange={e => set('seo_title_suffix', e.target.value)} /></div>
              <div><Label className="text-xs">Default OG image</Label><Input className="mt-1" value={v('seo_og_image')} onChange={e => set('seo_og_image', e.target.value)} placeholder="/assets/og-image.jpg" /></div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-sm font-medium">Auto-generate sitemap</p><p className="text-[10px] text-muted-foreground">Rebuild sitemap.xml on content change</p></div>
                <Switch checked={v('sitemap_auto', '1') !== '0'} onCheckedChange={c => set('sitemap_auto', c ? '1' : '0')} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-sm font-medium">Schema markup</p><p className="text-[10px] text-muted-foreground">Auto-add JSON-LD structured data</p></div>
                <Switch checked={v('schema_enabled', '1') !== '0'} onCheckedChange={c => set('schema_enabled', c ? '1' : '0')} />
              </div>
              <div><Label className="text-xs">Robots.txt custom rules</Label><textarea className="mt-1 w-full border rounded-lg px-3 py-2 text-xs font-mono min-h-[60px] resize-none" value={v('robots_custom')} onChange={e => set('robots_custom', e.target.value)} placeholder="Disallow: /admin/&#10;Disallow: /api/" /></div>
              <div>
                <Label className="text-xs">Canonical URL format</Label>
                <Select value={v('canonical_format', 'with_trailing_slash')} onValueChange={val => set('canonical_format', val)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="with_trailing_slash">With trailing slash (/page/)</SelectItem>
                    <SelectItem value="without_trailing_slash">Without trailing slash (/page)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* ─── REDIRECTS ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><ArrowRight className="h-4 w-4" /> Redirects</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Default redirect type</Label>
                <Select value={v('redirect_default_type', '301')} onValueChange={val => set('redirect_default_type', val)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="301">301 (Permanent)</SelectItem>
                    <SelectItem value="302">302 (Temporary)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-sm font-medium">Log 404 errors</p><p className="text-[10px] text-muted-foreground">Track broken links for redirect suggestions</p></div>
                <Switch checked={v('log_404', '1') !== '0'} onCheckedChange={c => set('log_404', c ? '1' : '0')} />
              </div>
            </CardContent>
          </Card>

          {/* ─── MEDIA / UPLOADS ─── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Upload className="h-4 w-4" /> Media & Uploads</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div><Label className="text-xs">Max upload size (MB)</Label><Input className="mt-1" type="number" value={v('max_upload_mb', '50')} onChange={e => set('max_upload_mb', e.target.value)} /></div>
              <div><Label className="text-xs">Allowed image formats</Label><Input className="mt-1" value={v('allowed_image_formats', 'jpg,jpeg,png,webp,gif,svg')} onChange={e => set('allowed_image_formats', e.target.value)} /></div>
              <div>
                <Label className="text-xs">Image compression quality</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Slider value={[parseInt(v('image_quality', '80'))]} max={100} min={30} step={5} onValueChange={([val]) => set('image_quality', String(val))} className="flex-1" />
                  <span className="text-sm font-bold w-10 text-center">{v('image_quality', '80')}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-sm font-medium">Auto-convert to WebP</p><p className="text-[10px] text-muted-foreground">Convert uploads to WebP format</p></div>
                <Switch checked={v('auto_webp') === '1'} onCheckedChange={c => set('auto_webp', c ? '1' : '0')} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-sm font-medium">Lazy loading</p><p className="text-[10px] text-muted-foreground">Load images on scroll</p></div>
                <Switch checked={v('lazy_loading', '1') !== '0'} onCheckedChange={c => set('lazy_loading', c ? '1' : '0')} />
              </div>
              <div><Label className="text-xs">Image CDN URL (optional)</Label><Input className="mt-1" value={v('image_cdn_url')} onChange={e => set('image_cdn_url', e.target.value)} placeholder="https://cdn.ailaptopwala.com" /></div>
            </CardContent>
          </Card>

          <Button onClick={save} disabled={saving} size="lg" className="w-full gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save All CMS Settings'}</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
