import { useState } from "react";
import { Plus, Search, Edit, Trash2, Eye, Copy, MoreHorizontal, Filter, Download, Package, Save, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/AdminLayout";
import { useProductStore } from "@/store/productStore";
import { toast } from "sonner";
import type { Product } from "@/data/mockData";

const emptyForm = {
  name: "", nameHi: "", price: 0, originalPrice: 0, image: "",
  category: "", description: "", ingredients: "", benefits: "", usage: "",
  precautions: "", sku: "", slug: "", stock: 10, inStock: true, status: "active" as const,
};

const AdminProducts = () => {
  const { products, categories, addProduct, updateProduct, deleteProduct, deleteProducts, duplicateProduct, updateStock, bulkUpdateStock } = useProductStore();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"all" | "active" | "out">("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  const filtered = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || (p.nameHi && p.nameHi.includes(search)))
    .filter((p) => view === "all" || (view === "active" ? p.inStock : !p.inStock));

  const toggleSelect = (id: string) => setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setDialogOpen(true); };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name, nameHi: p.nameHi || "", price: p.price, originalPrice: p.originalPrice || 0,
      image: p.image, category: p.category, description: p.description,
      ingredients: p.ingredients.join("\n"), benefits: p.benefits.join("\n"),
      usage: p.usage, precautions: p.precautions || "", sku: p.sku, slug: p.slug,
      stock: p.stock, inStock: p.inStock, status: p.status,
    });
    setEditingId(p.id);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.price || !form.category) {
      toast.error("Name, Price, and Category are required!");
      return;
    }
    const productData = {
      name: form.name, nameHi: form.nameHi || undefined, price: form.price,
      originalPrice: form.originalPrice || undefined, image: form.image || "https://images.unsplash.com/photo-1611241893603-3c359704e0ee?w=400&h=400&fit=crop",
      category: form.category, rating: 4.5, reviews: 0, stock: form.stock,
      sku: form.sku || `APC-${Date.now()}`, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      status: form.status, description: form.description,
      ingredients: form.ingredients.split("\n").filter(Boolean),
      benefits: form.benefits.split("\n").filter(Boolean),
      usage: form.usage, precautions: form.precautions || undefined,
      inStock: form.inStock, reels: [],
      metaTitle: form.name, metaDescription: form.description.slice(0, 160),
      focusKeywords: [form.name.toLowerCase()],
    };
    if (editingId) {
      updateProduct(editingId, productData);
      toast.success("Product updated!");
    } else {
      addProduct(productData as any);
      toast.success("Product added!");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteProduct(id);
    setDeleteConfirm(null);
    toast.success("Product deleted!");
  };

  const handleBulkDelete = () => {
    deleteProducts(selected);
    setSelected([]);
    toast.success(`${selected.length} products deleted!`);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{products.length} products, {products.filter(p => p.inStock).length} in stock</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8">
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
          <Button size="sm" className="gap-1.5 text-xs h-8" onClick={openAdd}>
            <Plus className="h-3.5 w-3.5" /> Add Product
          </Button>
        </div>
      </div>

      {selected.length > 0 && (
        <Card className="mb-4 border-primary/30 bg-primary/5">
          <CardContent className="p-3 flex items-center justify-between">
            <span className="text-sm font-medium">{selected.length} product(s) selected</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => { bulkUpdateStock(selected, true); setSelected([]); toast.success("Stock updated!"); }}>Mark In Stock</Button>
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => { bulkUpdateStock(selected, false); setSelected([]); toast.success("Marked out of stock!"); }}>Mark Out of Stock</Button>
              <Button size="sm" variant="destructive" className="text-xs h-7" onClick={handleBulkDelete}>Delete All</Button>
              <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => setSelected([])}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <Tabs defaultValue="all" className="w-auto">
              <TabsList className="h-8">
                <TabsTrigger value="all" className="text-xs h-7 px-3" onClick={() => setView("all")}>All ({products.length})</TabsTrigger>
                <TabsTrigger value="active" className="text-xs h-7 px-3" onClick={() => setView("active")}>In Stock ({products.filter(p => p.inStock).length})</TabsTrigger>
                <TabsTrigger value="out" className="text-xs h-7 px-3" onClick={() => setView("out")}>Out of Stock ({products.filter(p => !p.inStock).length})</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8 h-8 text-xs w-full sm:w-48" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-left">
                  <th className="p-3 w-10"><Checkbox checked={selected.length === filtered.length && filtered.length > 0} onCheckedChange={(c) => setSelected(c ? filtered.map(p => p.id) : [])} /></th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">Product</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">Category</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">Price</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">Rating</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">Stock</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs">Status</th>
                  <th className="p-3 font-medium text-muted-foreground text-xs w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className={`border-b last:border-0 hover:bg-muted/20 transition-colors ${selected.includes(p.id) ? 'bg-primary/5' : ''}`}>
                    <td className="p-3"><Checkbox checked={selected.includes(p.id)} onCheckedChange={() => toggleSelect(p.id)} /></td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg object-cover shadow-sm" />
                        <div>
                          <span className="font-medium text-sm block">{p.name}</span>
                          {p.nameHi && <span className="text-[10px] text-muted-foreground">{p.nameHi}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3"><Badge variant="secondary" className="text-[10px]">{p.category.split('(')[0].trim()}</Badge></td>
                    <td className="p-3">
                      <div>
                        <span className="font-bold">₹{p.price}</span>
                        {p.originalPrice && <span className="text-[10px] text-muted-foreground line-through ml-1">₹{p.originalPrice}</span>}
                      </div>
                    </td>
                    <td className="p-3"><span className="text-xs">{p.rating} ⭐ ({p.reviews})</span></td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          className="h-7 w-16 text-xs"
                          value={p.stock}
                          onChange={(e) => updateStock(p.id, parseInt(e.target.value) || 0)}
                          min={0}
                        />
                        <Badge variant={p.inStock ? "default" : "destructive"} className="text-[10px]">
                          {p.inStock ? "✓" : "✗"}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant={p.status === "active" ? "default" : "secondary"} className="text-[10px]">
                        {p.status}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem className="text-xs" onClick={() => setViewProduct(p)}><Eye className="h-3 w-3 mr-2" /> View</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs" onClick={() => openEdit(p)}><Edit className="h-3 w-3 mr-2" /> Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-xs" onClick={() => { duplicateProduct(p.id); toast.success("Product duplicated!"); }}><Copy className="h-3 w-3 mr-2" /> Duplicate</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-xs text-destructive" onClick={() => setDeleteConfirm(p.id)}><Trash2 className="h-3 w-3 mr-2" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t">
            <span className="text-xs text-muted-foreground">Showing {filtered.length} of {products.length} products</span>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs">Product Name *</Label><Input className="mt-1 h-9" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ashwagandha Powder" /></div>
              <div><Label className="text-xs">Hindi Name</Label><Input className="mt-1 h-9" value={form.nameHi} onChange={(e) => setForm({ ...form, nameHi: e.target.value })} placeholder="अश्वगंधा चूर्ण" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label className="text-xs">Price (₹) *</Label><Input type="number" className="mt-1 h-9" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
              <div><Label className="text-xs">Compare Price (₹)</Label><Input type="number" className="mt-1 h-9" value={form.originalPrice || ""} onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })} /></div>
              <div>
                <Label className="text-xs">Category *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{categories.filter(c => c !== "All").map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs">SKU</Label><Input className="mt-1 h-9" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
              <div><Label className="text-xs">Slug</Label><Input className="mt-1 h-9" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" /></div>
            </div>
            <div><Label className="text-xs">Description</Label><Textarea className="mt-1" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs">Ingredients (one per line)</Label><Textarea className="mt-1" rows={3} value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} /></div>
              <div><Label className="text-xs">Benefits (one per line)</Label><Textarea className="mt-1" rows={3} value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} /></div>
            </div>
            <div><Label className="text-xs">Usage / Dosage</Label><Textarea className="mt-1" rows={2} value={form.usage} onChange={(e) => setForm({ ...form, usage: e.target.value })} /></div>
            <div><Label className="text-xs">Precautions</Label><Textarea className="mt-1" rows={2} value={form.precautions} onChange={(e) => setForm({ ...form, precautions: e.target.value })} /></div>
            <div>
              <Label className="text-xs">Product Image URL</Label>
              <Input className="mt-1 h-9" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
              {form.image && (
                <div className="mt-2 flex items-center gap-3">
                  <img src={form.image} alt="Preview" className="h-16 w-16 rounded-lg object-cover border" onError={(e) => (e.currentTarget.style.display = "none")} />
                  <span className="text-xs text-muted-foreground">Image Preview</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Switch checked={form.inStock} onCheckedChange={(v) => setForm({ ...form, inStock: v })} /><Label className="text-xs">In Stock</Label>
              </div>
              <div>
                <Label className="text-xs">Stock Quantity</Label>
                <Input type="number" className="mt-1 h-9" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} min={0} />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="gap-1.5"><Save className="h-3.5 w-3.5" /> {editingId ? "Update" : "Save"} Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Product?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone. The product will be permanently removed.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Product */}
      <Dialog open={!!viewProduct} onOpenChange={() => setViewProduct(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {viewProduct && (
            <>
              <DialogHeader><DialogTitle className="font-serif">{viewProduct.name}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <img src={viewProduct.image} alt={viewProduct.name} className="w-full h-48 object-cover rounded-xl" />
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Price:</span> <strong>₹{viewProduct.price}</strong></div>
                  <div><span className="text-muted-foreground">Stock:</span> <strong>{viewProduct.stock}</strong></div>
                  <div><span className="text-muted-foreground">SKU:</span> {viewProduct.sku}</div>
                  <div><span className="text-muted-foreground">Category:</span> {viewProduct.category}</div>
                  <div><span className="text-muted-foreground">Rating:</span> {viewProduct.rating} ⭐</div>
                  <div><span className="text-muted-foreground">Reviews:</span> {viewProduct.reviews}</div>
                </div>
                <div><p className="text-xs font-medium mb-1">Description</p><p className="text-xs text-muted-foreground">{viewProduct.description}</p></div>
                <div><p className="text-xs font-medium mb-1">Ingredients</p><ul className="text-xs text-muted-foreground">{viewProduct.ingredients.map((i, idx) => <li key={idx}>• {i}</li>)}</ul></div>
                <div><p className="text-xs font-medium mb-1">Benefits</p><ul className="text-xs text-muted-foreground">{viewProduct.benefits.map((b, idx) => <li key={idx}>• {b}</li>)}</ul></div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminProducts;
