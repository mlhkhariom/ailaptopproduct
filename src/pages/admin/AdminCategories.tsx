import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, RefreshCw, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";

const emptyForm = { name: '', name_hi: '', slug: '', description: '', image: '', is_active: true };

const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialog, setDialog] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const load = async () => {
    setLoading(true);
    try { setCategories(await api.getCategories()); }
    catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm }); setDialog(true); };
  const openEdit = (c: any) => { setEditing(c); setForm({ name: c.name, name_hi: c.name_hi || '', slug: c.slug || '', description: c.description || '', image: c.image || '', is_active: !!c.is_active }); setDialog(true); };

  const save = async () => {
    if (!form.name) return toast.error('Name required');
    const payload = { ...form, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-') };
    try {
      if (editing) await api.updateCategory(editing.id, payload);
      else await api.createCategory(payload);
      toast.success(editing ? 'Updated!' : 'Category added!');
      setDialog(false); load();
    } catch (e: any) { toast.error(e.message); }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await api.deleteCategory(id); toast.success('Deleted'); load();
  };

  const filtered = categories.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.name_hi?.includes(search)
  );

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">{categories.length} categories</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={load}><RefreshCw className="h-3.5 w-3.5" /></Button>
          <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={openAdd}><Plus className="h-3.5 w-3.5" /> Add Category</Button>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search categories..." className="pl-8 h-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground"><RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />Loading...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {c.image
                    ? <img src={c.image} alt={c.name} className="h-12 w-12 rounded-lg object-cover shrink-0" />
                    : <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><Package className="h-6 w-6 text-primary" /></div>
                  }
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{c.name}</p>
                      <Badge className={`text-[10px] ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {c.is_active ? 'Active' : 'Hidden'}
                      </Badge>
                    </div>
                    {c.name_hi && <p className="text-xs text-muted-foreground">{c.name_hi}</p>}
                    <p className="text-xs text-primary mt-1">{c.product_count || 0} products</p>
                    {c.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{c.description}</p>}
                  </div>
                </div>
                <div className="flex gap-1 mt-3 justify-end">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(c)}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <div className="col-span-3 text-center py-12 text-muted-foreground">No categories found</div>}
        </div>
      )}

      <Dialog open={dialog} onOpenChange={setDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Name (Hindi) *</Label><Input value={form.name} onChange={f('name')} className="mt-1 text-sm" placeholder="जड़ी-बूटी (Herbs)" /></div>
            <div><Label className="text-xs">Name (English)</Label><Input value={form.name_hi} onChange={f('name_hi')} className="mt-1 text-sm" placeholder="Herbs" /></div>
            <div><Label className="text-xs">Slug</Label><Input value={form.slug} onChange={f('slug')} className="mt-1 text-sm font-mono" placeholder="herbs" /></div>
            <div><Label className="text-xs">Image URL</Label><Input value={form.image} onChange={f('image')} className="mt-1 text-sm" placeholder="https://..." /></div>
            <div><Label className="text-xs">Description</Label><Input value={form.description} onChange={f('description')} className="mt-1 text-sm" /></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={v => setForm(p => ({ ...p, is_active: v }))} /><Label className="text-xs">Active</Label></div>
            {form.image && <img src={form.image} alt="" className="w-full h-24 object-cover rounded-lg" onError={e => (e.currentTarget.style.display = 'none')} />}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCategories;
