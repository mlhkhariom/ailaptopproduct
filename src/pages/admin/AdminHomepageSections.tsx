import { useState, useEffect } from "react";
import { Layout, Plus, GripVertical, Trash2, Eye, EyeOff } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

const SECTION_TYPES = [
  { value: 'banner', label: 'Banner/Slider' },
  { value: 'featured_products', label: 'Featured Products' },
  { value: 'categories', label: 'Category Grid' },
  { value: 'deals', label: 'Deals / Flash Sale' },
  { value: 'testimonials', label: 'Testimonials' },
  { value: 'brands', label: 'Brand Logos' },
  { value: 'custom_html', label: 'Custom HTML' },
  { value: 'video', label: 'Video Section' },
  { value: 'cta', label: 'Call to Action' },
];

export default function AdminHomepageSections() {
  const [sections, setSections] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ type: 'featured_products', title: '', subtitle: '', sort_order: 0 });
  const token = localStorage.getItem('ailaptopwala_token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const load = () => fetch('/api/cms/homepage-sections', { headers }).then(r => r.json()).then(d => { if (Array.isArray(d)) setSections(d); });
  useEffect(() => { load(); }, []);

  const addSection = async () => {
    if (!form.type) return toast.error('Select type');
    await fetch('/api/cms/homepage-sections', { method: 'POST', headers, body: JSON.stringify(form) });
    toast.success('Section added');
    setShowAdd(false);
    setForm({ type: 'featured_products', title: '', subtitle: '', sort_order: sections.length });
    load();
  };

  const toggle = async (id: string, active: boolean) => {
    await fetch(`/api/cms/homepage-sections/${id}`, { method: 'PUT', headers, body: JSON.stringify({ is_active: active ? 1 : 0 }) });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this section?')) return;
    await fetch(`/api/cms/homepage-sections/${id}`, { method: 'DELETE', headers });
    toast.success('Deleted');
    load();
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2"><Layout className="h-6 w-6" /> Homepage Sections</h1>
            <p className="text-sm text-muted-foreground">Manage what appears on the homepage</p>
          </div>
          <Dialog open={showAdd} onOpenChange={setShowAdd}>
            <DialogTrigger asChild><Button className="gap-2"><Plus className="h-4 w-4" /> Add Section</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Homepage Section</DialogTitle></DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>Section Type</Label>
                  <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{SECTION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Title</Label><Input className="mt-1" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Section heading" /></div>
                <div><Label>Subtitle</Label><Input className="mt-1" value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Optional description" /></div>
                <div><Label>Sort Order</Label><Input type="number" className="mt-1" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} /></div>
                <Button onClick={addSection} className="w-full">Add Section</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {sections.length === 0 ? (
          <Card><CardContent className="p-10 text-center text-muted-foreground">No custom sections yet. The homepage uses default sections. Add custom ones to override.</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {sections.map((s: any, i: number) => (
              <Card key={s.id} className={!s.is_active ? 'opacity-50' : ''}>
                <CardContent className="p-4 flex items-center gap-4">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">{SECTION_TYPES.find(t => t.value === s.type)?.label || s.type}</Badge>
                      <span className="font-medium text-sm">{s.title || '(No title)'}</span>
                    </div>
                    {s.subtitle && <p className="text-xs text-muted-foreground">{s.subtitle}</p>}
                  </div>
                  <span className="text-xs text-muted-foreground">#{s.sort_order}</span>
                  <Button size="icon" variant="ghost" onClick={() => toggle(s.id, !s.is_active)}>
                    {s.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(s.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
