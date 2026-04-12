import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Search, RefreshCw, FileText, Globe, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";

const emptyForm = { title: '', slug: '', excerpt: '', content: '', image: '', category: '', author: 'Dr. Prachi', status: 'draft', tags: '', seo_title: '', seo_description: '' };

const AdminBlog = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      else params.status = 'all';
      // fetch both published and draft
      const [pub, draft] = await Promise.all([
        api.getPosts({ status: 'published' }),
        api.getPosts({ status: 'draft' }),
      ]);
      setPosts(statusFilter === 'all' ? [...pub, ...draft] : statusFilter === 'published' ? pub : draft);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm }); setDialog(true); };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ title: p.title, slug: p.slug || '', excerpt: p.excerpt || '', content: p.content || '', image: p.image || '', category: p.category || '', author: p.author || 'Dr. Prachi', status: p.status, tags: Array.isArray(p.tags) ? p.tags.join(', ') : p.tags || '', seo_title: p.seo_title || '', seo_description: p.seo_description || '' });
    setDialog(true);
  };

  const save = async () => {
    if (!form.title) return toast.error('Title required');
    const payload = { ...form, slug: form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''), tags: form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) };
    try {
      if (editing) await api.updatePost(editing.id, payload);
      else await api.createPost(payload);
      toast.success(editing ? 'Post updated!' : 'Post created!');
      setDialog(false); load();
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    await api.deletePost(id); toast.success('Deleted'); load();
  };

  const toggleStatus = async (p: any) => {
    const newStatus = p.status === 'published' ? 'draft' : 'published';
    await api.updatePost(p.id, { ...p, status: newStatus, tags: Array.isArray(p.tags) ? p.tags : [] });
    toast.success(newStatus === 'published' ? 'Published!' : 'Moved to draft');
    load();
  };

  const filtered = posts.filter(p => p.title?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Blog</h1>
          <p className="text-sm text-muted-foreground">{posts.filter(p => p.status === 'published').length} published · {posts.filter(p => p.status === 'draft').length} drafts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={load}><RefreshCw className="h-3.5 w-3.5" /></Button>
          <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={openAdd}><Plus className="h-3.5 w-3.5" /> New Post</Button>
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-4">
        <TabsList className="h-8">
          <TabsTrigger value="all" className="text-xs h-7 px-3">All ({posts.length})</TabsTrigger>
          <TabsTrigger value="published" className="text-xs h-7 px-3">Published ({posts.filter(p => p.status === 'published').length})</TabsTrigger>
          <TabsTrigger value="draft" className="text-xs h-7 px-3">Drafts ({posts.filter(p => p.status === 'draft').length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search posts..." className="pl-8 h-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground"><RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />Loading...</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(p => (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {p.image && <img src={p.image} alt={p.title} className="h-16 w-24 rounded-lg object-cover shrink-0 hidden sm:block" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-semibold text-sm line-clamp-1">{p.title}</h3>
                          <Badge className={`text-[10px] ${p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.status}</Badge>
                          {p.category && <Badge variant="outline" className="text-[10px]">{p.category}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">{p.excerpt}</p>
                        <p className="text-xs text-muted-foreground mt-1">{p.author} · {p.published_at ? new Date(p.published_at).toLocaleDateString('en-IN') : 'Not published'}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggleStatus(p)} title={p.status === 'published' ? 'Unpublish' : 'Publish'}>
                          {p.status === 'published' ? <EyeOff className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5 text-green-600" />}
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(p)}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground"><FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />No posts found</div>}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Post' : 'New Post'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Title *</Label><Input value={form.title} onChange={f('title')} className="mt-1 text-sm" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Slug</Label><Input value={form.slug} onChange={f('slug')} className="mt-1 text-sm font-mono" placeholder="auto-generated" /></div>
              <div><Label className="text-xs">Category</Label><Input value={form.category} onChange={f('category')} className="mt-1 text-sm" placeholder="जड़ी-बूटी" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Author</Label><Input value={form.author} onChange={f('author')} className="mt-1 text-sm" /></div>
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="mt-1 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-xs">Featured Image URL</Label><Input value={form.image} onChange={f('image')} className="mt-1 text-sm" placeholder="https://..." /></div>
            {form.image && <img src={form.image} alt="" className="w-full h-32 object-cover rounded-lg" onError={e => (e.currentTarget.style.display = 'none')} />}
            <div><Label className="text-xs">Excerpt</Label><Textarea value={form.excerpt} onChange={f('excerpt')} className="mt-1 text-sm resize-none" rows={2} /></div>
            <div><Label className="text-xs">Content</Label><Textarea value={form.content} onChange={f('content')} className="mt-1 text-sm resize-none font-mono" rows={8} placeholder="Write your article here..." /></div>
            <div><Label className="text-xs">Tags (comma separated)</Label><Input value={form.tags} onChange={f('tags')} className="mt-1 text-sm" placeholder="ayurveda, health, herbs" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">SEO Title</Label><Input value={form.seo_title} onChange={f('seo_title')} className="mt-1 text-sm" /></div>
              <div><Label className="text-xs">SEO Description</Label><Input value={form.seo_description} onChange={f('seo_description')} className="mt-1 text-sm" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Update' : 'Create Post'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminBlog;
