import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Package, TrendingDown, AlertTriangle, Plus, Edit, Trash2, RefreshCw, ArrowUpDown, Truck, Users } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const req = (method: string, path: string, body?: any) =>
  fetch(`/api/inventory${path}`, {
    method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
    ...(body ? { body: JSON.stringify(body) } : {})
  }).then(r => r.json());

export default function AdminInventory() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'stock');
  const [stats, setStats] = useState<any>({});
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Dialogs
  const [supplierDialog, setSupplierDialog] = useState(false);
  const [poDialog, setPoDialog] = useState(false);
  const [movementDialog, setMovementDialog] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [editingPO, setEditingPO] = useState<any>(null);

  const [supplierForm, setSupplierForm] = useState({ name: '', contact_person: '', phone: '', email: '', address: '', gstin: '', payment_terms: 'net30', notes: '' });
  const [poForm, setPoForm] = useState({ supplier_id: '', items: [{ product_id: '', product_name: '', quantity: 1, unit_price: 0 }], expected_date: '', notes: '' });
  const [movForm, setMovForm] = useState({ product_id: '', type: 'purchase', quantity: 1, notes: '' });

  const loadAll = async () => {
    setLoading(true);
    const [s, sup, po, mov] = await Promise.all([
      req('GET', '/stats'), req('GET', '/suppliers'),
      req('GET', '/purchase-orders'), req('GET', '/stock-movements')
    ]);
    setStats(s); setSuppliers(Array.isArray(sup) ? sup : []);
    setPurchaseOrders(Array.isArray(po) ? po : []);
    setMovements(Array.isArray(mov) ? mov : []);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
    api.getProducts().then((p: any) => setProducts(Array.isArray(p) ? p : p?.products || []));
  }, []);

  const saveSupplier = async () => {
    if (!supplierForm.name) return toast.error('Name required');
    if (editingSupplier) await req('PUT', `/suppliers/${editingSupplier.id}`, { ...supplierForm, is_active: 1 });
    else await req('POST', '/suppliers', supplierForm);
    toast.success('Supplier saved!'); setSupplierDialog(false); loadAll();
  };

  const savePO = async () => {
    const subtotal = poForm.items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
    const tax = Math.round(subtotal * 0.18);
    await req('POST', '/purchase-orders', { ...poForm, subtotal, tax, total: subtotal + tax });
    toast.success('Purchase Order created!'); setPoDialog(false); loadAll();
  };

  const saveMovement = async () => {
    if (!movForm.product_id || !movForm.quantity) return toast.error('Product and quantity required');
    await req('POST', '/stock-movements', movForm);
    toast.success('Stock updated!'); setMovementDialog(false); loadAll();
  };

  const updatePOStatus = async (id: string, status: string) => {
    const po = purchaseOrders.find(p => p.id === id);
    await req('PUT', `/purchase-orders/${id}`, { ...po, status, received_date: status === 'received' ? new Date().toISOString().split('T')[0] : po.received_date });
    toast.success(`PO marked as ${status}`); loadAll();
  };

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Inventory Management</h1>
          <Button size="sm" variant="outline" onClick={loadAll} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Products', value: stats.totalProducts || 0, icon: Package, color: 'text-blue-600' },
            { label: 'In Stock', value: stats.inStock || 0, icon: Package, color: 'text-green-600' },
            { label: 'Out of Stock', value: stats.outOfStock || 0, icon: AlertTriangle, color: 'text-red-600' },
            { label: 'Low Stock (≤5)', value: stats.lowStock || 0, icon: TrendingDown, color: 'text-orange-600' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                  </div>
                  <s.icon className={`h-8 w-8 opacity-20 ${s.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="stock">📦 Stock Overview</TabsTrigger>
            <TabsTrigger value="movements">🔄 Stock Movements</TabsTrigger>
            <TabsTrigger value="suppliers">🏭 Suppliers</TabsTrigger>
            <TabsTrigger value="po">📋 Purchase Orders</TabsTrigger>
          </TabsList>

          {/* Stock Overview */}
          <TabsContent value="stock" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-sm">Low Stock Alert</h2>
              <Button size="sm" onClick={() => setMovementDialog(true)}><Plus className="h-4 w-4 mr-1" /> Adjust Stock</Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr>
                  <th className="text-left p-3 text-xs">Product</th>
                  <th className="text-left p-3 text-xs">Category</th>
                  <th className="text-center p-3 text-xs">Stock</th>
                  <th className="text-center p-3 text-xs">Status</th>
                </tr></thead>
                <tbody>
                  {(stats.lowStockProducts || []).map((p: any) => (
                    <tr key={p.id} className="border-t hover:bg-muted/30">
                      <td className="p-3 font-medium text-xs">{p.name}</td>
                      <td className="p-3 text-xs text-muted-foreground">{p.category}</td>
                      <td className="p-3 text-center font-bold text-orange-600">{p.stock}</td>
                      <td className="p-3 text-center">
                        <Badge variant={p.stock === 0 ? 'destructive' : 'secondary'} className="text-[10px]">
                          {p.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {!(stats.lowStockProducts?.length) && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground text-xs">✅ All products have sufficient stock</td></tr>}
                </tbody>
              </table>
            </div>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total Inventory Value</p>
                <p className="text-2xl font-black text-primary">₹{(stats.totalValue || 0).toLocaleString('en-IN')}</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stock Movements */}
          <TabsContent value="movements" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-sm">Stock Movement History</h2>
              <Button size="sm" onClick={() => setMovementDialog(true)}><Plus className="h-4 w-4 mr-1" /> Add Movement</Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr>
                  <th className="text-left p-3 text-xs">Product</th>
                  <th className="text-left p-3 text-xs">Type</th>
                  <th className="text-center p-3 text-xs">Qty</th>
                  <th className="text-left p-3 text-xs">Notes</th>
                  <th className="text-left p-3 text-xs">Date</th>
                </tr></thead>
                <tbody>
                  {movements.map((m: any) => (
                    <tr key={m.id} className="border-t hover:bg-muted/30">
                      <td className="p-3 text-xs font-medium">{m.product_name}</td>
                      <td className="p-3"><Badge variant={['sale','damage','return_to_supplier'].includes(m.type) ? 'destructive' : 'default'} className="text-[10px]">{m.type}</Badge></td>
                      <td className="p-3 text-center font-bold">{['sale','damage','return_to_supplier'].includes(m.type) ? '-' : '+'}{m.quantity}</td>
                      <td className="p-3 text-xs text-muted-foreground">{m.notes}</td>
                      <td className="p-3 text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                  {!movements.length && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground text-xs">No movements yet</td></tr>}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Suppliers */}
          <TabsContent value="suppliers" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-sm">Suppliers ({suppliers.length})</h2>
              <Button size="sm" onClick={() => { setEditingSupplier(null); setSupplierForm({ name:'',contact_person:'',phone:'',email:'',address:'',gstin:'',payment_terms:'net30',notes:'' }); setSupplierDialog(true); }}>
                <Plus className="h-4 w-4 mr-1" /> Add Supplier
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {suppliers.map((s: any) => (
                <Card key={s.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-sm">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.contact_person} • {s.phone}</p>
                        {s.gstin && <p className="text-xs text-muted-foreground">GST: {s.gstin}</p>}
                        <Badge variant="outline" className="text-[10px] mt-1">{s.payment_terms}</Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditingSupplier(s); setSupplierForm(s); setSupplierDialog(true); }}><Edit className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={async () => { await req('DELETE', `/suppliers/${s.id}`); loadAll(); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {!suppliers.length && <p className="text-sm text-muted-foreground col-span-2 text-center py-8">No suppliers added yet</p>}
            </div>
          </TabsContent>

          {/* Purchase Orders */}
          <TabsContent value="po" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-bold text-sm">Purchase Orders</h2>
              <Button size="sm" onClick={() => { setPoForm({ supplier_id:'', items:[{product_id:'',product_name:'',quantity:1,unit_price:0}], expected_date:'', notes:'' }); setPoDialog(true); }}>
                <Plus className="h-4 w-4 mr-1" /> New PO
              </Button>
            </div>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50"><tr>
                  <th className="text-left p-3 text-xs">PO #</th>
                  <th className="text-left p-3 text-xs">Supplier</th>
                  <th className="text-center p-3 text-xs">Items</th>
                  <th className="text-right p-3 text-xs">Total</th>
                  <th className="text-center p-3 text-xs">Status</th>
                  <th className="text-center p-3 text-xs">Actions</th>
                </tr></thead>
                <tbody>
                  {purchaseOrders.map((po: any) => (
                    <tr key={po.id} className="border-t hover:bg-muted/30">
                      <td className="p-3 font-mono text-xs font-bold">{po.po_number}</td>
                      <td className="p-3 text-xs">{po.supplier_name || 'N/A'}</td>
                      <td className="p-3 text-center text-xs">{po.items?.length || 0}</td>
                      <td className="p-3 text-right text-xs font-bold">₹{(po.total || 0).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-center">
                        <Badge variant={po.status === 'received' ? 'default' : po.status === 'ordered' ? 'secondary' : 'outline'} className="text-[10px]">{po.status}</Badge>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex gap-1 justify-center">
                          {po.status === 'draft' && <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => updatePOStatus(po.id, 'ordered')}>Order</Button>}
                          {po.status === 'ordered' && <Button size="sm" className="h-6 text-[10px] px-2" onClick={() => updatePOStatus(po.id, 'received')}>Receive</Button>}
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={async () => { await req('DELETE', `/purchase-orders/${po.id}`); loadAll(); }}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!purchaseOrders.length && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground text-xs">No purchase orders yet</td></tr>}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Supplier Dialog */}
        <Dialog open={supplierDialog} onOpenChange={setSupplierDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editingSupplier ? 'Edit' : 'Add'} Supplier</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Supplier Name *</Label><Input className="mt-1 h-9" value={supplierForm.name} onChange={e => setSupplierForm(f => ({...f, name: e.target.value}))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Contact Person</Label><Input className="mt-1 h-9" value={supplierForm.contact_person} onChange={e => setSupplierForm(f => ({...f, contact_person: e.target.value}))} /></div>
                <div><Label className="text-xs">Phone</Label><Input className="mt-1 h-9" value={supplierForm.phone} onChange={e => setSupplierForm(f => ({...f, phone: e.target.value}))} /></div>
              </div>
              <div><Label className="text-xs">Email</Label><Input className="mt-1 h-9" value={supplierForm.email} onChange={e => setSupplierForm(f => ({...f, email: e.target.value}))} /></div>
              <div><Label className="text-xs">Address</Label><Textarea className="mt-1" rows={2} value={supplierForm.address} onChange={e => setSupplierForm(f => ({...f, address: e.target.value}))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">GSTIN</Label><Input className="mt-1 h-9" value={supplierForm.gstin} onChange={e => setSupplierForm(f => ({...f, gstin: e.target.value}))} /></div>
                <div><Label className="text-xs">Payment Terms</Label>
                  <Select value={supplierForm.payment_terms} onValueChange={v => setSupplierForm(f => ({...f, payment_terms: v}))}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="net15">Net 15</SelectItem>
                      <SelectItem value="net30">Net 30</SelectItem>
                      <SelectItem value="net60">Net 60</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label className="text-xs">Notes</Label><Textarea className="mt-1" rows={2} value={supplierForm.notes} onChange={e => setSupplierForm(f => ({...f, notes: e.target.value}))} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setSupplierDialog(false)}>Cancel</Button><Button onClick={saveSupplier}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Purchase Order Dialog */}
        <Dialog open={poDialog} onOpenChange={setPoDialog}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New Purchase Order</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Supplier</Label>
                <Select value={poForm.supplier_id} onValueChange={v => setPoForm(f => ({...f, supplier_id: v}))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Expected Date</Label><Input type="date" className="mt-1 h-9" value={poForm.expected_date} onChange={e => setPoForm(f => ({...f, expected_date: e.target.value}))} /></div>
              <div>
                <Label className="text-xs">Items</Label>
                {poForm.items.map((item, i) => (
                  <div key={i} className="grid grid-cols-3 gap-2 mt-2">
                    <Select value={item.product_id} onValueChange={v => {
                      const p = products.find((pr: any) => pr.id === v);
                      const items = [...poForm.items]; items[i] = {...items[i], product_id: v, product_name: p?.name || '', unit_price: p?.price || 0};
                      setPoForm(f => ({...f, items}));
                    }}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Product" /></SelectTrigger>
                      <SelectContent>{products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input type="number" placeholder="Qty" className="h-8 text-xs" value={item.quantity} onChange={e => { const items = [...poForm.items]; items[i].quantity = Number(e.target.value); setPoForm(f => ({...f, items})); }} />
                    <Input type="number" placeholder="Price" className="h-8 text-xs" value={item.unit_price} onChange={e => { const items = [...poForm.items]; items[i].unit_price = Number(e.target.value); setPoForm(f => ({...f, items})); }} />
                  </div>
                ))}
                <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={() => setPoForm(f => ({...f, items: [...f.items, {product_id:'',product_name:'',quantity:1,unit_price:0}]}))}>+ Add Item</Button>
              </div>
              <div className="text-right text-sm font-bold">Total: ₹{poForm.items.reduce((s,i) => s + i.quantity*i.unit_price, 0).toLocaleString('en-IN')}</div>
              <div><Label className="text-xs">Notes</Label><Textarea className="mt-1" rows={2} value={poForm.notes} onChange={e => setPoForm(f => ({...f, notes: e.target.value}))} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setPoDialog(false)}>Cancel</Button><Button onClick={savePO}>Create PO</Button></DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stock Movement Dialog */}
        <Dialog open={movementDialog} onOpenChange={setMovementDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Adjust Stock</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Product *</Label>
                <Select value={movForm.product_id} onValueChange={v => setMovForm(f => ({...f, product_id: v}))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>{products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Movement Type *</Label>
                <Select value={movForm.type} onValueChange={v => setMovForm(f => ({...f, type: v}))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="purchase">📦 Purchase (Add)</SelectItem>
                    <SelectItem value="adjustment_add">➕ Adjustment (Add)</SelectItem>
                    <SelectItem value="adjustment_remove">➖ Adjustment (Remove)</SelectItem>
                    <SelectItem value="damage">💔 Damage/Loss</SelectItem>
                    <SelectItem value="return_to_supplier">🔄 Return to Supplier</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Quantity *</Label><Input type="number" className="mt-1 h-9" min={1} value={movForm.quantity} onChange={e => setMovForm(f => ({...f, quantity: Number(e.target.value)}))} /></div>
              <div><Label className="text-xs">Notes</Label><Input className="mt-1 h-9" value={movForm.notes} onChange={e => setMovForm(f => ({...f, notes: e.target.value}))} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setMovementDialog(false)}>Cancel</Button><Button onClick={saveMovement}>Save</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
