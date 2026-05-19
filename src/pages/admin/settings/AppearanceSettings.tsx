import { useState, useEffect } from "react";
import { Save, Palette, Type, Sun, Moon, Code, Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/button";
import { themes, ThemeName, applyTheme } from "@/lib/themes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";

export default function AppearanceSettings() {
  const [s, setS] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem('ailaptopwala_token');
  const headers: any = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => { fetch('/api/app-settings').then(r => r.json()).then(d => { if (d && typeof d === 'object') setS(d); }).catch(() => {}); }, []);
  const save = async () => { setSaving(true); await fetch('/api/app-settings', { method: 'PUT', headers, body: JSON.stringify(s) }); toast.success('Appearance saved!'); setSaving(false); };
  const v = (key: string, fallback = '') => s[key] || fallback;
  const set = (key: string, val: string) => setS(p => ({ ...p, [key]: val }));

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><Palette className="h-6 w-6" /> Appearance & Theme</h1>
            <p className="text-sm text-muted-foreground">Colors, fonts, layout, custom code</p>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save'}</Button>
        </div>

        <div className="space-y-6">

          {/* THEME PRESETS */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Theme Presets</CardTitle>
              <CardDescription>Quick-apply a complete theme or customize below</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(Object.keys(themes) as ThemeName[]).map(name => {
                  const t = themes[name];
                  const active = v('active_theme') === name;
                  return (
                    <button key={name} onClick={() => { set('active_theme', name); set('color_primary', t.primary); set('color_secondary', t.secondary); set('color_accent', t.accent); set('border_radius', parseInt(t.radius).toString()); set('font_heading', t.font); applyTheme(name); toast.success(`${name} theme applied`); }} className={`p-4 rounded-xl border-2 text-center transition-all ${active ? 'border-primary shadow-md scale-[1.02]' : 'border-muted hover:border-primary/40'}`}>
                      <div className="flex justify-center gap-1 mb-2">
                        <span className="w-5 h-5 rounded-full" style={{ background: t.primary }} />
                        <span className="w-5 h-5 rounded-full" style={{ background: t.secondary }} />
                        <span className="w-5 h-5 rounded-full" style={{ background: t.accent }} />
                      </div>
                      <p className="text-xs font-bold capitalize">{name}</p>
                      <p className="text-[9px] text-muted-foreground">{t.font}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* COLORS */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Paintbrush className="h-4 w-4" /> Colors</CardTitle>
              <CardDescription>Brand colors used across the site</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs">Primary Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={v('color_primary', '#2563eb')} onChange={e => set('color_primary', e.target.value)} className="w-10 h-10 rounded-lg border cursor-pointer" />
                  <Input className="flex-1 h-8 font-mono text-xs" value={v('color_primary', '#2563eb')} onChange={e => set('color_primary', e.target.value)} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Secondary Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={v('color_secondary', '#64748b')} onChange={e => set('color_secondary', e.target.value)} className="w-10 h-10 rounded-lg border cursor-pointer" />
                  <Input className="flex-1 h-8 font-mono text-xs" value={v('color_secondary', '#64748b')} onChange={e => set('color_secondary', e.target.value)} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Accent Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={v('color_accent', '#f59e0b')} onChange={e => set('color_accent', e.target.value)} className="w-10 h-10 rounded-lg border cursor-pointer" />
                  <Input className="flex-1 h-8 font-mono text-xs" value={v('color_accent', '#f59e0b')} onChange={e => set('color_accent', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TYPOGRAPHY */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Type className="h-4 w-4" /> Typography</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Heading Font</Label>
                <Select value={v('font_heading', 'Inter')} onValueChange={val => set('font_heading', val)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                    <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="DM Sans">DM Sans</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Body Font</Label>
                <Select value={v('font_body', 'Inter')} onValueChange={val => set('font_body', val)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Lato">Lato</SelectItem>
                    <SelectItem value="Nunito">Nunito</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="DM Sans">DM Sans</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Base font size (px)</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Slider value={[parseInt(v('font_size', '16'))]} min={12} max={20} step={1} onValueChange={([val]) => set('font_size', String(val))} className="flex-1" />
                  <span className="text-sm font-bold w-8">{v('font_size', '16')}px</span>
                </div>
              </div>
              <div>
                <Label className="text-xs">Border radius (px)</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Slider value={[parseInt(v('border_radius', '8'))]} min={0} max={20} step={2} onValueChange={([val]) => set('border_radius', String(val))} className="flex-1" />
                  <span className="text-sm font-bold w-8">{v('border_radius', '8')}px</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DARK MODE */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Moon className="h-4 w-4" /> Dark Mode</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-sm font-medium">Dark mode toggle visible</p><p className="text-[10px] text-muted-foreground">Show sun/moon toggle in header</p></div>
                <Switch checked={v('dark_mode_toggle', '1') !== '0'} onCheckedChange={c => set('dark_mode_toggle', c ? '1' : '0')} />
              </div>
              <div>
                <Label className="text-xs">Default theme</Label>
                <Select value={v('default_theme', 'light')} onValueChange={val => set('default_theme', val)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System (auto)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* HEADER */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Header & Navigation</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-sm font-medium">Sticky header</p><p className="text-[10px] text-muted-foreground">Header stays on scroll</p></div>
                <Switch checked={v('sticky_header', '1') !== '0'} onCheckedChange={c => set('sticky_header', c ? '1' : '0')} />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><p className="text-sm font-medium">Top announcement bar</p><p className="text-[10px] text-muted-foreground">Show bar above header</p></div>
                <Switch checked={v('show_announcement', '1') !== '0'} onCheckedChange={c => set('show_announcement', c ? '1' : '0')} />
              </div>
              <div className="sm:col-span-2"><Label className="text-xs">Announcement text</Label><Input className="mt-1" value={v('announcement_text')} onChange={e => set('announcement_text', e.target.value)} placeholder="Free delivery on orders above Rs 999!" /></div>
              <div><Label className="text-xs">Announcement link (optional)</Label><Input className="mt-1" value={v('announcement_link')} onChange={e => set('announcement_link', e.target.value)} placeholder="/deals" /></div>
              <div><Label className="text-xs">Announcement BG color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="color" value={v('announcement_bg', '#2563eb')} onChange={e => set('announcement_bg', e.target.value)} className="w-8 h-8 rounded border cursor-pointer" />
                  <Input className="flex-1 h-8 font-mono text-xs" value={v('announcement_bg', '#2563eb')} onChange={e => set('announcement_bg', e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CUSTOM CODE */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2"><Code className="h-4 w-4" /> Custom Code Injection</CardTitle>
              <CardDescription>Add custom CSS/JS — injected on every page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs">Custom CSS (injected in &lt;head&gt;)</Label>
                <textarea className="mt-1 w-full border rounded-lg px-3 py-2 text-xs font-mono min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 bg-muted/30" value={v('custom_css')} onChange={e => set('custom_css', e.target.value)} placeholder={"/* Custom styles */\n.hero { background: linear-gradient(...); }"} />
              </div>
              <div>
                <Label className="text-xs">Custom JS (injected before &lt;/body&gt;)</Label>
                <textarea className="mt-1 w-full border rounded-lg px-3 py-2 text-xs font-mono min-h-[100px] resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 bg-muted/30" value={v('custom_js')} onChange={e => set('custom_js', e.target.value)} placeholder={"// Custom scripts\nconsole.log('Site loaded');"} />
              </div>
              <div>
                <Label className="text-xs">Head tags (analytics, meta, etc.)</Label>
                <textarea className="mt-1 w-full border rounded-lg px-3 py-2 text-xs font-mono min-h-[80px] resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 bg-muted/30" value={v('custom_head_tags')} onChange={e => set('custom_head_tags', e.target.value)} placeholder={'<!-- Google Analytics -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXX"></script>'} />
              </div>
            </CardContent>
          </Card>

          <Button onClick={save} disabled={saving} size="lg" className="w-full gap-2"><Save className="h-4 w-4" />{saving ? 'Saving...' : 'Save Appearance'}</Button>
        </div>
      </div>
    </AdminLayout>
  );
}
