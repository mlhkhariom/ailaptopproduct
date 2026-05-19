import { useState, useEffect } from "react";
import { Save, Menu, Plus, GripVertical, Trash2, Eye, EyeOff, ExternalLink, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/layout/AdminLayout";
import { toast } from "sonner";

export default function MenuEditor() {
  const [items, setItems] = useState<any[]>([]);
  const [location, setLocation] = useState('header');
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ label: '', url: '', icon: '', open_new_tab: false });
  const token = localStorage.getItem('ailaptopwala_token');
  const headers: any = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const load = () => fetch(`/api/menus/${location}`, { headers }).then(r => r.json()).then(d => { if (Array.isArray(d)) setItems(d); }).catch(() => {});
  useEffect(() => { load(); }, [location]);

  const add = async () => {
    if (!form.label || !form.url) return toast.error('Label and URL required');
    await fetch('/api/menus', { method: 'POST', headers, body: JSON.stringify({ ...form, location, sort_order: items.length, is_visible: true, open_new_tab: form.open_new_tab }) });
    toast.success('Menu item added'); setAdding(false); setForm({ label: '', url: '', icon: '', open_new_tab: false }); load();
  };

  const update = async (id: string) => {
    await fetch(`/api/menus/${id}`, { method: 'PUT', headers, body: JSON.stringify({ ...form, is_visible: true, sort_order: items.findIndex(i => i.id === id), open_new_tab: form.open_new_tab }) });
    toast.success('Updated'); setEditing(null); setForm({ label: '', url: '', icon: '', open_new_tab: false }); load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this menu item?')) return;
    await fetch(`/api/menus/${id}`, { method: 'DELETE', headers });
    toast.success('Deleted'); load();
  };

  const toggleVisibility = async (item: any) => {
    await fetch(`/api/menus/${item.id}`, { method: 'PUT', headers, body: JSON.stringify({ ...item, is_visible: item.is_visible ? 0 : 1 }) });
    load();
  };

  const moveItem = async (index: number, dir: number) => {
    const newItems = [...items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(index + dir, 0, moved);
    const reordered = newItems.map((item, i) => ({ id: item.id, sort_order: i }));
    await fetch('/api/menus/reorder/bulk', { method: 'PUT', headers, body: JSON.stringify({ items: reordered }) });
    load();
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-3">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><Menu className="h-6 w-6" /> Menu Editor</h1>
            <p className="text-sm text-muted-foreground">Manage navigation items — header, footer, mobile</p>
          </div>
        </div>

        {/* Location Tabs */}
        <div className="flex gap-2 mb-6">
          {['header', 'footer', 'mobile'].map(loc => (
            <Button key={loc} variant={location === loc ? 'default' : 'outline'} size="sm" onClick={() => setLocation(loc)} className="capitalize">{loc} Menu</Button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base capitalize">{location} Navigation Items</CardTitle>
                <CardDescription>{items.length} items — drag to reorder</CardDescription>
              </div>
              <Button size="sm" className="gap-1" onClick={() => setAdding(true)}><Plus className="h-3 w-3" /> Add Item</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.length === 0 && !adding && (
              <p className="text-center py-8 text-muted-foreground text-sm">No menu items. Click "Add Item" to start.</p>
            )}

            {items.map((item, i) => (
              <div key={item.id}>
                {editing === item.id ? (
                  <div className="p-3 rounded-lg border-2 border-primary/30 bg-primary/5 space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div><Label className="text-[10px]">Label</Label><Input className="mt-1 h-8" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} /></div>
                      <div><Label className="text-[10px]">URL</Label><Input className="mt-1 h-8" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} /></div>
                      <div><Label className="text-[10px]">Icon (Lucide name)</Label><Input className="mt-1 h-8" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} placeholder="e.g., ShoppingBag" /></div>
                      <div className="flex items-center gap-2 pt-5"><Switch checked={form.open_new_tab} onCheckedChange={c => setForm(f => ({ ...f, open_new_tab: c }))} /><Label className="text-xs">Open in new tab</Label></div>
                    </div>
                    <div className="flex gap-2"><Button size="sm" onClick={() => update(item.id)}>Save</Button><Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button></div>
                  </div>
                ) : (
                  <div className={`flex items-center justify-between p-3 rounded-lg border ${!item.is_visible ? 'opacity-50' : ''}`}>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => i > 0 && moveItem(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-20 text-[10px]">▲</button>
                        <button onClick={() => i < items.length - 1 && moveItem(i, 1)} disabled={i === items.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-20 text-[10px]">▼</button>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">{item.url}</p>
                      </div>
                      {item.open_new_tab === 1 && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => toggleVisibility(item)}>{item.is_visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}</Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => { setEditing(item.id); setForm({ label: item.label, url: item.url, icon: item.icon || '', open_new_tab: !!item.open_new_tab }); }}><Edit2 className="h-3 w-3" /></Button>
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive" onClick={() => remove(item.id)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {adding && (
              <div className="p-3 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 space-y-3">
                <p className="text-xs font-bold text-primary">New Menu Item</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div><Label className="text-[10px]">Label *</Label><Input className="mt-1 h-8" placeholder="e.g., Products" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} /></div>
                  <div><Label className="text-[10px]">URL *</Label><Input className="mt-1 h-8" placeholder="/products" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} /></div>
                  <div><Label className="text-[10px]">Icon (optional)</Label><Input className="mt-1 h-8" placeholder="ShoppingBag" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} /></div>
                  <div className="flex items-center gap-2 pt-5"><Switch checked={form.open_new_tab} onCheckedChange={c => setForm(f => ({ ...f, open_new_tab: c }))} /><Label className="text-xs">Open in new tab</Label></div>
                </div>
                <div className="flex gap-2"><Button size="sm" onClick={add}>Add</Button><Button size="sm" variant="ghost" onClick={() => setAdding(false)}>Cancel</Button></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
