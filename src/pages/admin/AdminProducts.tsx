import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye, Copy, MoreHorizontal, Filter, Download, Upload, Package, Save, X, ImageIcon } from "lucide-react";
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
import ProductFormDialog from "@/components/products/ProductFormDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useProductStore } from "@/store/productStore";
import { api } from "@/lib/api";
import { toast } from "sonner";

const emptyForm = {
  name: "", name_hi: "", price: 0, original_price: 0, image: "",
  category: "", description: "", ingredients: "", benefits: "", usage: "",
  sku: "", slug: "", stock: 10, in_stock: true, status: "active", badge: "",
  meta_title: "", meta_description: "", focus_keywords: "",
  show_public: true,
};

const AdminProducts = () => {
  const { products, fetchProducts, addProduct, updateProduct, deleteProduct, deleteProducts, duplicateProduct, updateStock } = useProductStore();
  const { user } = useAuth();
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"all" | "active" | "out">("all");
  const [catFilter, setCatFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts({ all: '1' });
    api.getCategories().then((cats: any[]) => {
      setCategories(cats.map((c: any) => c.name));
    }).catch(() => {});
  }, []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewProduct, setViewProduct] = useState<any | null>(null);

  const filtered = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || (p.name_hi && p.name_hi.includes(search)))
    .filter((p) => view === "all" || (view === "active" ? p.in_stock : !p.in_stock))
    .filter((p) => catFilter === "all" || p.category === catFilter);

  const toggleSelect = (id: string) => setSelected((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);

  const handleExport = () => {
    const token = localStorage.getItem('ailaptopwala_token');
    const url = api.exportProducts();
    const a = document.createElement('a');
    a.href = url + (token ? `?token=${token}` : '');
    // Use fetch with auth header instead
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `ailaptopwala-products-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        toast.success('Products exported!');
      }).catch(() => toast.error('Export failed'));
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      toast.error('Please save as .csv first (File → Save As → CSV). Excel files not supported directly.');
      e.target.value = '';
      return;
    }

    const text = await file.text();
    try {
      const result = await api.importProducts(text);
      toast.success(`Import done! Added: ${result.added}, Updated: ${result.updated}`);
      if (result.errors?.length) toast.error(`${result.errors.length} rows had errors`);
      fetchProducts({ all: '1' });
    } catch (err: any) { toast.error(err.message); }
    e.target.value = '';
  };

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setDialogOpen(true); };

  const openEdit = (p: any) => {
    setForm({
      name: p.name, name_hi: p.name_hi || "", price: p.price, original_price: p.original_price || 0,
      image: p.image, category: p.category, description: p.description,
      ingredients: Array.isArray(p.ingredients) ? p.ingredients.join("\n") : p.ingredients || "",
      benefits: Array.isArray(p.benefits) ? p.benefits.join("\n") : p.benefits || "",
      usage: p.usage || "", sku: p.sku, slug: p.slug,
      stock: p.stock, in_stock: p.in_stock, status: p.status, badge: p.badge || "",
      show_public: p.show_public !== 0 && p.show_public !== false,
      meta_title: p.meta_title || "", meta_description: p.meta_description || "",
      focus_keywords: (() => {
        if (Array.isArray(p.focus_keywords)) return p.focus_keywords.join(', ');
        if (typeof p.focus_keywords === 'string') {
          try { const arr = JSON.parse(p.focus_keywords); return Array.isArray(arr) ? arr.join(', ') : p.focus_keywords; } catch { return p.focus_keywords; }
        }
        return '';
      })(),
    });
    setEditingId(p.id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category) return toast.error("Name, Price, Category required!");
    const payload = {
      name: form.name, name_hi: form.name_hi || null, price: Number(form.price),
      original_price: Number(form.original_price) || null,
      image: form.image || "https://images.unsplash.com/photo-1611241893603-3c359704e0ee?w=400&h=400&fit=crop",
      category: form.category, rating: 4.5, reviews: 0, stock: Number(form.stock),
      in_stock: form.in_stock, status: form.status,
      sku: form.sku ? (form.sku.startsWith('ALW-') ? form.sku : `ALW-${form.sku}`) : `ALW-${Date.now().toString().slice(-6)}`,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      badge: form.badge || null,
      description: form.description,
      ingredients: typeof form.ingredients === 'string' ? form.ingredients.split("\n").filter(Boolean) : (form.ingredients || []),
      benefits: typeof form.benefits === 'string' ? form.benefits.split("\n").filter(Boolean) : (form.benefits || []),
      usage: form.usage,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      focus_keywords: form.focus_keywords ? form.focus_keywords.split(',').map((k: string) => k.trim()).filter(Boolean) : [],
    };
    try {
      if (editingId) { await updateProduct(editingId, payload); toast.success("Product updated!"); }
      else { await addProduct(payload as any); toast.success("Product added!"); }
      setDialogOpen(false);
      fetchProducts({ all: '1' });
      fetchProducts({ all: '1' });
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    setDeleteConfirm(null);
    toast.success("Product deleted!");
  };

  const handleBulkDelete = async () => {
    if (user?.role !== 'superadmin') { toast.error('Only Super Admin can bulk delete products'); return; }
    if (!confirm(`Permanently delete ${selected.length} products? This cannot be undone.`)) return;
    try {
      const token = localStorage.getItem('ailaptopwala_token');
      await fetch('/api/products/bulk/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids: selected }),
      }).then(r => r.json());
      setSelected([]);
      fetchProducts({ all: '1' });
      toast.success(`${selected.length} products deleted!`);
    } catch { toast.error('Bulk delete failed'); }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{products.length} products, {products.filter(p => p.in_stock).length} in stock</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={handleExport}>
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
          <label>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" asChild>
              <span><Upload className="h-3.5 w-3.5" /> Import CSV</span>
            </Button>
            <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
          </label>
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
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={async () => { for (const id of selected) { await api.updateProduct(id, { in_stock: true }); } setSelected([]); fetchProducts({ all: '1' }); toast.success("Marked in stock!"); }}>Mark In Stock</Button>
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={async () => { for (const id of selected) { await updateStock(id, 0); } setSelected([]); fetchProducts({ all: '1' }); toast.success("Marked out of stock!"); }}>Mark Out of Stock</Button>
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
                <TabsTrigger value="active" className="text-xs h-7 px-3" onClick={() => setView("active")}>In Stock ({products.filter(p => p.in_stock).length})</TabsTrigger>
                <TabsTrigger value="out" className="text-xs h-7 px-3" onClick={() => setView("out")}>Out of Stock ({products.filter(p => !p.in_stock).length})</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex gap-2 items-center flex-1 sm:flex-initial">
              <div className="relative flex-1 sm:w-48">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8 h-8 text-xs w-full" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={catFilter} onValueChange={setCatFilter}>
                <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.filter(c => c !== "All").map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
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
                  <th className="p-3 font-medium text-muted-foreground text-xs">Public</th>
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
                          {p.name_hi && <span className="text-[10px] text-muted-foreground">{p.name_hi}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3"><Badge variant="secondary" className="text-[10px]">{p.category.split('(')[0].trim()}</Badge></td>
                    <td className="p-3">
                      <div>
                        <span className="font-bold">₹{p.price}</span>
                        {p.original_price && <span className="text-[10px] text-muted-foreground line-through ml-1">₹{p.original_price}</span>}
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
                        <Badge variant={p.in_stock ? "default" : "destructive"} className="text-[10px]">
                          {p.in_stock ? "✓" : "✗"}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={p.show_public !== 0 && p.show_public !== false}
                          onCheckedChange={async (v) => {
                            await updateProduct(p.id, { ...p, show_public: v });
                            fetchProducts({ all: '1' });
                            toast.success(v ? 'Product visible to public' : 'Product hidden from public');
                          }}
                        />
                        <span className={`text-[10px] font-medium ${p.show_public === 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          {p.show_public === 0 ? 'Hidden' : 'Public'}
                        </span>
                      </div>
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
      <ProductFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        form={form}
        setForm={setForm}
        editingId={editingId}
        onSave={handleSave}
        categories={categories}
      />

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
