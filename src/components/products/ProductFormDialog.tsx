// ProductFormDialog — Add/Edit product form (separate file)
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  form: any;
  setForm: (f: any) => void;
  editingId: string | null;
  onSave: () => void;
  categories: string[];
}

export default function ProductFormDialog({ open, onClose, form, setForm, editingId, onSave, categories }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif">{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><Label className="text-xs">Product Name *</Label><Input className="mt-1 h-9" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dell Latitude E7470" /></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label className="text-xs">Price (₹) *</Label><Input type="number" className="mt-1 h-9" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
            <div><Label className="text-xs">Compare Price (₹)</Label><Input type="number" className="mt-1 h-9" value={form.original_price || ""} onChange={(e) => setForm({ ...form, original_price: Number(e.target.value) })} /></div>
            <div>
              <Label className="text-xs">Category *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{categories.filter(c => c !== "All").map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-xs">SKU</Label>
              <div className="flex mt-1">
                <span className="inline-flex items-center px-2 border border-r-0 rounded-l-md bg-muted text-xs text-muted-foreground">ALW-</span>
                <Input className="h-9 rounded-l-none" value={form.sku?.replace(/^ALW-/i, '') || ''} onChange={(e) => setForm({ ...form, sku: `ALW-${e.target.value.toUpperCase()}` })} placeholder="DELL-001" />
              </div>
            </div>
            <div><Label className="text-xs">Slug</Label>
              <div className="flex gap-1 mt-1">
                <Input className="h-9 flex-1" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" />
                <Button type="button" size="sm" variant="outline" className="h-9 px-2 text-xs shrink-0" onClick={() => setForm((f: any) => ({ ...f, slug: f.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + (f.sku?.replace(/^ALW-/i,'').toLowerCase() || Date.now().toString().slice(-4)) }))}>Auto</Button>
              </div>
            </div>
          </div>

          {/* Status + Public + Badge */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Badge</Label>
              <Select value={form.badge || 'none'} onValueChange={(v) => setForm({ ...form, badge: v === 'none' ? null : v })}>
                <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="Best Seller">Best Seller</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Premium">Premium</SelectItem>
                  <SelectItem value="Open Box">Open Box</SelectItem>
                  <SelectItem value="Refurbished">Refurbished</SelectItem>
                  <SelectItem value="Gaming">Gaming</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
            <Switch checked={!!form.show_public} onCheckedChange={(v) => setForm({ ...form, show_public: v })} />
            <div>
              <Label className="text-sm font-medium">Show to Public</Label>
              <p className="text-[10px] text-muted-foreground">{form.show_public ? 'Visible on website to customers' : 'Hidden from website (internal/ERP only)'}</p>
            </div>
          </div>

          <div><Label className="text-xs">Description</Label><Textarea className="mt-1" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>

          {/* Brand + Warranty */}
          <div className="grid grid-cols-3 gap-4">
            <div><Label className="text-xs">Brand</Label><Input className="mt-1" value={form.brand || ''} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Dell, HP, Lenovo..." /></div>
            <div><Label className="text-xs">Warranty</Label><Input className="mt-1" value={form.warranty || ''} onChange={(e) => setForm({ ...form, warranty: e.target.value })} placeholder="6 Months" /></div>
            <div><Label className="text-xs">Badge</Label><Input className="mt-1" value={form.badge || ''} onChange={(e) => setForm({ ...form, badge: e.target.value })} placeholder="Deal, New, Hot" /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><Label className="text-xs">Specifications (one per line: Key: Value)</Label><Textarea className="mt-1" rows={3} value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} placeholder="Processor: Intel Core i5 6th Gen&#10;RAM: 8GB DDR4&#10;Storage: 256GB SSD" /></div>
            <div><Label className="text-xs">Key Features (one per line)</Label><Textarea className="mt-1" rows={3} value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} placeholder="6 Month Warranty&#10;Windows 11 Pro&#10;Certified Refurbished" /></div>
          </div>
          <div><Label className="text-xs">Condition / Grade</Label><Input className="mt-1 h-9" value={form.usage} onChange={(e) => setForm({ ...form, usage: e.target.value })} placeholder="Excellent / Good / Used" /></div>

          {/* Image Upload */}
          <div>
            <Label className="text-xs">Product Image (Primary)</Label>
            <div className="mt-1 space-y-2">
              <Input className="h-9" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://... or upload below" />
              {form.image && <img src={form.image} alt="Preview" className="h-16 w-16 object-cover rounded border" />}
              <div className="flex gap-2">
                <label className="flex-1 cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setForm((f: any) => ({ ...f, _uploading: true }));
                    const fd = new FormData();
                    fd.append('files', file);
                    fd.append('folder', 'products');
                    try {
                      const res = await fetch('/api/media/upload', { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` }, body: fd });
                      const data = await res.json();
                      if (data[0]?.url) setForm((f: any) => ({ ...f, image: data[0].url, _uploading: false }));
                      else { toast.error('Upload failed'); setForm((f: any) => ({ ...f, _uploading: false })); }
                    } catch { toast.error('Upload error'); setForm((f: any) => ({ ...f, _uploading: false })); }
                  }} />
                  <span className="flex items-center justify-center gap-2 h-10 rounded-md border text-xs font-medium w-full bg-muted hover:bg-accent cursor-pointer">
                    {form._uploading ? 'Uploading...' : 'Upload Image'}
                  </span>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setForm((f: any) => ({ ...f, _uploading: true }));
                    const fd = new FormData();
                    fd.append('files', file);
                    fd.append('folder', 'products');
                    try {
                      const res = await fetch('/api/media/upload', { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` }, body: fd });
                      const data = await res.json();
                      if (data[0]?.url) setForm((f: any) => ({ ...f, image: data[0].url, _uploading: false }));
                      else { toast.error('Upload failed'); setForm((f: any) => ({ ...f, _uploading: false })); }
                    } catch { toast.error('Upload error'); setForm((f: any) => ({ ...f, _uploading: false })); }
                  }} />
                  <span className="flex items-center justify-center gap-2 h-10 rounded-md border text-xs font-medium w-full bg-muted hover:bg-accent cursor-pointer">Camera</span>
                </label>
              </div>
              {form.image && !form._uploading && (
                <div className="flex items-center gap-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <img src={form.image} alt="Preview" className="h-14 w-14 rounded-lg object-cover border shrink-0" onError={(e) => (e.currentTarget.style.display = "none")} />
                  <p className="text-xs font-medium text-green-700">Image ready</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Images */}
          <div>
            <Label className="text-xs">Additional Images (comma-separated URLs)</Label>
            <Input className="mt-1 h-9 text-xs" value={form.images || ''} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="https://img1.jpg, https://img2.jpg, https://img3.jpg" />
            <p className="text-[10px] text-muted-foreground mt-0.5">Or manage via ⋮ → Variants after saving</p>
          </div>

          {/* Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={form.in_stock} onCheckedChange={(v) => setForm({ ...form, in_stock: v })} /><Label className="text-xs">In Stock</Label>
            </div>
            <div>
              <Label className="text-xs">Stock Quantity</Label>
              <Input type="number" className="mt-1 h-9" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} min={0} />
            </div>
          </div>

          {/* SEO */}
          <div className="border-t pt-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">SEO Settings (optional)</p>
            <div><Label className="text-xs">Meta Title</Label><Input className="mt-1 h-9 text-sm" value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} placeholder={`${form.name || 'Product'} | AI Laptop Wala`} /></div>
            <div><Label className="text-xs">Meta Description</Label><Textarea className="mt-1 text-sm" rows={2} value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} placeholder="150-160 chars for Google" /></div>
            <div><Label className="text-xs">Focus Keywords (comma separated)</Label><Input className="mt-1 h-9 text-sm" value={form.focus_keywords} onChange={(e) => setForm({ ...form, focus_keywords: e.target.value })} placeholder="dell laptop indore, refurbished laptop" /></div>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSave} className="gap-1.5"><Save className="h-3.5 w-3.5" /> {editingId ? "Update" : "Save"} Product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
