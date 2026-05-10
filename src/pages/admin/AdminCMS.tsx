import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Edit, Image, Star, HelpCircle, Settings, Layout, Award, RefreshCw, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";

// Generic CMS section manager
const useCMSSection = (section: string) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setItems(await api.getCMS(section + '?admin=1')); } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [section]);

  const save = async (id: string, content: any, sort_order?: number, is_active?: boolean) => {
    await api.updateCMS(id, { content, sort_order, is_active: is_active !== false });
    toast.success('Saved!'); load();
  };

  const add = async (content: any, sort_order = 0) => {
    await api.createCMS({ section, content, sort_order });
    toast.success('Added!'); load();
  };

  const remove = async (id: string) => {
    await api.deleteCMS(id);
    toast.success('Deleted!'); load();
  };

  const toggle = async (item: any) => {
    await api.updateCMS(item.id, { content: item.content, sort_order: item.sort_order, is_active: !item.is_active });
    load();
  };

  return { items, loading, load, save, add, remove, toggle };
};

// ── Banners ──────────────────────────────────────────────
const BannersTab = () => {
  const { items, loading, add, save, remove, toggle } = useCMSSection('banner');
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: '', subtitle: '', cta: 'Shop Now', link: '/products', image: '' });
  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  const openAdd = () => { setEditing(null); setForm({ title: '', subtitle: '', cta: 'Shop Now', link: '/products', image: '' }); setDialog(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ title: item.content.title || '', subtitle: item.content.subtitle || '', cta: item.content.cta || 'Shop Now', link: item.content.link || '/products', image: item.content.image || '' }); setDialog(true); };

  const submit = async () => {
    if (editing) await save(editing.id, form, editing.sort_order, editing.is_active);
    else await add(form, items.length);
    setDialog(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{items.length} banners</p>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={openAdd}><Plus className="h-3.5 w-3.5" /> Add Banner</Button>
      </div>
      {loading ? <div className="text-center py-8"><RefreshCw className="h-5 w-5 animate-spin mx-auto" /></div> : (
        <div className="space-y-3">
          {items.map(item => (
            <Card key={item.id}>
              <CardContent className="p-4 flex gap-4">
                {item.content.image && <img src={item.content.image} alt="" className="h-16 w-28 rounded-lg object-cover shrink-0" onError={e => (e.currentTarget.style.display='none')} />}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{item.content.title}</p>
                  <p className="text-xs text-muted-foreground">{item.content.subtitle}</p>
                  <Badge variant="outline" className="text-[10px] mt-1">{item.content.cta}</Badge>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Switch checked={!!item.is_active} onCheckedChange={() => toggle(item)} />
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(item)}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit Banner' : 'Add Banner'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Title *</Label><Input value={form.title} onChange={f('title')} className="mt-1 text-sm" /></div>
            <div><Label className="text-xs">Subtitle</Label><Input value={form.subtitle} onChange={f('subtitle')} className="mt-1 text-sm" /></div>
            <div><Label className="text-xs">CTA Button Text</Label><Input value={form.cta} onChange={f('cta')} className="mt-1 text-sm" /></div>
            <div><Label className="text-xs">CTA Link (URL path)</Label><Input value={form.link} onChange={f('link')} className="mt-1 text-sm" placeholder="/products or /services/laptop-repair" /></div>
            <div><Label className="text-xs">Image URL</Label><Input value={form.image} onChange={f('image')} className="mt-1 text-sm" placeholder="https://..." /></div>
            {form.image && <img src={form.image} alt="" className="w-full h-28 object-cover rounded-lg" onError={e => (e.currentTarget.style.display='none')} />}
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button><Button onClick={submit}>{editing ? 'Update' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── Benefits ─────────────────────────────────────────────
const BenefitsTab = () => {
  const { items, loading, add, save, remove, toggle } = useCMSSection('benefit');
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ icon: 'Leaf', title: '', description: '' });
  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));
  const ICONS = ['Laptop', 'Shield', 'Wrench', 'Truck', 'Award', 'Star', 'CheckCircle', 'Phone'];

  const openAdd = () => { setEditing(null); setForm({ icon: 'Leaf', title: '', description: '' }); setDialog(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ icon: item.content.icon || 'Leaf', title: item.content.title || '', description: item.content.description || '' }); setDialog(true); };
  const submit = async () => { if (editing) await save(editing.id, form, editing.sort_order, editing.is_active); else await add(form, items.length); setDialog(false); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{items.length} benefits</p>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={openAdd}><Plus className="h-3.5 w-3.5" /> Add</Button>
      </div>
      {loading ? <div className="text-center py-8"><RefreshCw className="h-5 w-5 animate-spin mx-auto" /></div> : (
        <div className="grid sm:grid-cols-2 gap-3">
          {items.map(item => (
            <Card key={item.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-lg shrink-0">💻</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.content.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{item.content.description}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Switch checked={!!item.is_active} onCheckedChange={() => toggle(item)} />
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(item)}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editing ? 'Edit Benefit' : 'Add Benefit'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Icon</Label><Input value={form.icon} onChange={f('icon')} className="mt-1 text-sm" placeholder="Leaf, Award, Truck..." /><p className="text-[10px] text-muted-foreground mt-1">Options: {ICONS.join(', ')}</p></div>
            <div><Label className="text-xs">Title *</Label><Input value={form.title} onChange={f('title')} className="mt-1 text-sm" /></div>
            <div><Label className="text-xs">Description</Label><Input value={form.description} onChange={f('description')} className="mt-1 text-sm" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button><Button onClick={submit}>{editing ? 'Update' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── Testimonials ─────────────────────────────────────────
const TestimonialsTab = () => {
  const { items, loading, add, save, remove, toggle } = useCMSSection('testimonial');
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: '', text: '', rating: 5, avatar: '', location: '' });
  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: k === 'rating' ? Number(e.target.value) : e.target.value }));

  const openAdd = () => { setEditing(null); setForm({ name: '', text: '', rating: 5, avatar: '', location: '' }); setDialog(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ name: item.content.name || '', text: item.content.text || '', rating: item.content.rating || 5, avatar: item.content.avatar || '', location: item.content.location || '' }); setDialog(true); };
  const submit = async () => { if (editing) await save(editing.id, form, editing.sort_order, editing.is_active); else await add(form, items.length); setDialog(false); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{items.length} testimonials</p>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={openAdd}><Plus className="h-3.5 w-3.5" /> Add</Button>
      </div>
      {loading ? <div className="text-center py-8"><RefreshCw className="h-5 w-5 animate-spin mx-auto" /></div> : (
        <div className="space-y-3">
          {items.map(item => (
            <Card key={item.id}>
              <CardContent className="p-4 flex gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">{item.content.avatar || item.content.name?.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><p className="text-sm font-medium">{item.content.name}</p><span className="text-xs text-muted-foreground">{item.content.location}</span></div>
                  <p className="text-xs text-muted-foreground mt-0.5">{'⭐'.repeat(item.content.rating)} ({item.content.rating}/5)</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">"{item.content.text}"</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Switch checked={!!item.is_active} onCheckedChange={() => toggle(item)} />
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(item)}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editing ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Name *</Label><Input value={form.name} onChange={f('name')} className="mt-1 text-sm" /></div>
            <div><Label className="text-xs">Location</Label><Input value={form.location} onChange={f('location')} className="mt-1 text-sm" placeholder="Mumbai" /></div>
            <div><Label className="text-xs">Avatar (initials)</Label><Input value={form.avatar} onChange={f('avatar')} className="mt-1 text-sm" placeholder="प्रि" /></div>
            <div><Label className="text-xs">Rating (1-5)</Label><Input type="number" min={1} max={5} value={form.rating} onChange={f('rating')} className="mt-1 text-sm" /></div>
            <div><Label className="text-xs">Review Text *</Label><Textarea value={form.text} onChange={f('text')} className="mt-1 text-sm resize-none" rows={3} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button><Button onClick={submit}>{editing ? 'Update' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── FAQs ─────────────────────────────────────────────────
const FAQsTab = () => {
  const { items, loading, add, save, remove, toggle } = useCMSSection('faq');
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ question: '', answer: '', category: 'General' });
  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  const openAdd = () => { setEditing(null); setForm({ question: '', answer: '', category: 'General' }); setDialog(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ question: item.content.question || '', answer: item.content.answer || '', category: item.content.category || 'General' }); setDialog(true); };
  const submit = async () => { if (editing) await save(editing.id, form, editing.sort_order, editing.is_active); else await add(form, items.length); setDialog(false); };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{items.length} FAQs</p>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={openAdd}><Plus className="h-3.5 w-3.5" /> Add FAQ</Button>
      </div>
      {loading ? <div className="text-center py-8"><RefreshCw className="h-5 w-5 animate-spin mx-auto" /></div> : (
        <div className="space-y-2">
          {items.map(item => (
            <Card key={item.id} className={!item.is_active ? 'opacity-50' : ''}>
              <CardContent className="p-3 flex gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{item.content.question}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.content.answer}</p>
                  <Badge variant="outline" className="text-[10px] mt-1">{item.content.category}</Badge>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Switch checked={!!item.is_active} onCheckedChange={() => toggle(item)} />
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(item)}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Question *</Label><Input value={form.question} onChange={f('question')} className="mt-1 text-sm" /></div>
            <div><Label className="text-xs">Answer *</Label><Textarea value={form.answer} onChange={f('answer')} className="mt-1 text-sm resize-none" rows={3} /></div>
            <div><Label className="text-xs">Category</Label><Input value={form.category} onChange={f('category')} className="mt-1 text-sm" placeholder="Products, Shipping, Payment..." /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button><Button onClick={submit}>{editing ? 'Update' : 'Add'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── Static Pages (About, Privacy, Terms, Refund) ─────────
const PagesTab = () => {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ slug: '', title: '', content: '', meta_title: '', meta_description: '', is_active: true });

  const load = async () => {
    setLoading(true);
    try { setPages(await api.listCMSPages()); } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ slug: '', title: '', content: '', meta_title: '', meta_description: '', is_active: true });
    setDialog(true);
  };

  const openEdit = async (p: any) => {
    const full = await api.getCMSPageAdmin(p.id);
    setEditing(full);
    setForm({
      slug: full.slug, title: full.title, content: full.content || '',
      meta_title: full.meta_title || '', meta_description: full.meta_description || '',
      is_active: !!full.is_active,
    });
    setDialog(true);
  };

  const save = async () => {
    if (!form.slug || !form.title) { toast.error('Slug + title required'); return; }
    try {
      if (editing) await api.updateCMSPage(editing.id, form);
      else await api.createCMSPage(form);
      toast.success('Saved!');
      setDialog(false);
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this page permanently?')) return;
    try { await api.deleteCMSPage(id); toast.success('Deleted'); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const QUICK_TEMPLATES = [
    { slug: 'about', title: 'About Us' },
    { slug: 'privacy', title: 'Privacy Policy' },
    { slug: 'terms', title: 'Terms & Conditions' },
    { slug: 'refund', title: 'Return & Refund Policy' },
    { slug: 'shipping', title: 'Shipping Policy' },
  ];

  const addTemplate = async (t: any) => {
    try {
      await api.createCMSPage({ slug: t.slug, title: t.title, content: `<h1>${t.title}</h1>\n<p>Edit this page content...</p>`, is_active: true });
      toast.success(`${t.title} created`);
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div>
          <p className="text-sm text-muted-foreground">{pages.length} pages — accessible at <code className="bg-muted px-1 rounded">yoursite.com/page/:slug</code></p>
        </div>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={openAdd}><Plus className="h-3.5 w-3.5" /> New Page</Button>
      </div>

      {pages.length === 0 && !loading && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">No pages yet. Quick add common pages:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_TEMPLATES.map(t => (
                <Button key={t.slug} size="sm" variant="outline" className="text-xs" onClick={() => addTemplate(t)}>
                  + {t.title}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? <div className="text-center py-8"><RefreshCw className="h-5 w-5 animate-spin mx-auto" /></div> : (
        <div className="space-y-2">
          {pages.map(p => (
            <Card key={p.id}>
              <CardContent className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{p.title}</p>
                    <Badge variant="outline" className="text-[9px]">/{p.slug}</Badge>
                    {!p.is_active && <Badge variant="secondary" className="text-[9px]">Draft</Badge>}
                  </div>
                  <p className="text-[10px] text-muted-foreground">Updated: {new Date(p.updated_at).toLocaleString()}</p>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(p)}><Edit className="h-3.5 w-3.5" /></Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? `Edit: ${editing.title}` : 'New Page'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Slug * (URL path)</Label><Input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') }))} className="mt-1 text-sm font-mono" placeholder="about" disabled={!!editing} /></div>
              <div><Label className="text-xs">Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="mt-1 text-sm" placeholder="About Us" /></div>
            </div>
            <div>
              <Label className="text-xs">Content (HTML supported)</Label>
              <Textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} className="mt-1 text-sm font-mono resize-none" rows={10} placeholder="<h1>About</h1>&#10;<p>Your content here. HTML allowed.</p>" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Meta Title (SEO)</Label><Input value={form.meta_title} onChange={e => setForm(p => ({ ...p, meta_title: e.target.value }))} className="mt-1 text-sm" /></div>
              <div><Label className="text-xs">Meta Description (SEO)</Label><Input value={form.meta_description} onChange={e => setForm(p => ({ ...p, meta_description: e.target.value }))} className="mt-1 text-sm" /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(p => ({ ...p, is_active: v }))} />
              <Label className="text-xs">Published (visible on site)</Label>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button><Button onClick={save}>{editing ? 'Update' : 'Create'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────
const AdminCMS = () => (
  <AdminLayout>
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold">Content Management</h1>
        <p className="text-sm text-muted-foreground">Manage homepage banners, benefits, testimonials, FAQs & static pages</p>
      </div>
      <Tabs defaultValue="banners">
        <TabsList className="h-9 mb-6">
          <TabsTrigger value="banners" className="text-xs gap-1.5"><Layout className="h-3.5 w-3.5" /> Banners</TabsTrigger>
          <TabsTrigger value="benefits" className="text-xs gap-1.5"><Award className="h-3.5 w-3.5" /> Benefits</TabsTrigger>
          <TabsTrigger value="testimonials" className="text-xs gap-1.5"><Star className="h-3.5 w-3.5" /> Testimonials</TabsTrigger>
          <TabsTrigger value="faqs" className="text-xs gap-1.5"><HelpCircle className="h-3.5 w-3.5" /> FAQs</TabsTrigger>
          <TabsTrigger value="pages" className="text-xs gap-1.5"><Layout className="h-3.5 w-3.5" /> Pages</TabsTrigger>
        </TabsList>
        <TabsContent value="banners"><BannersTab /></TabsContent>
        <TabsContent value="benefits"><BenefitsTab /></TabsContent>
        <TabsContent value="testimonials"><TestimonialsTab /></TabsContent>
        <TabsContent value="faqs"><FAQsTab /></TabsContent>
        <TabsContent value="pages"><PagesTab /></TabsContent>
      </Tabs>
    </div>
  </AdminLayout>
);

export default AdminCMS;
