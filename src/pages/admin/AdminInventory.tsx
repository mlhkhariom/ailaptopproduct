import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ERPLayout from "@/components/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Package, TrendingDown, AlertTriangle, Plus, Edit, Trash2, RefreshCw, ArrowUpDown, Truck, Search, IndianRupee, CheckCircle, Clock, XCircle, BarChart3, Printer } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { api } from "@/lib/api";
import InventoryStockChart from "@/components/InventoryStockChart";
import SupplierCard from "@/components/SupplierCard";
import { printPurchaseOrder } from "@/lib/poPrint";

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
  const [stockSearch, setStockSearch] = useState('');
  const [movSearch, setMovSearch] = useState('');
  const [supplierSearch, setSupplierSearch] = useState('');
  const [showInactiveSuppliers, setShowInactiveSuppliers] = useState(false);
  const [poStatusFilter, setPoStatusFilter] = useState('all');
  const [poSearch, setPoSearch] = useState('');
  const [editStockId, setEditStockId] = useState<string | null>(null);
  const [editStockVal, setEditStockVal] = useState(0);

  // Dialogs
  const [supplierDialog, setSupplierDialog] = useState(false);
  const [poDialog, setPoDialog] = useState(false);
  const [movementDialog, setMovementDialog] = useState(false);
  const [transferDialog, setTransferDialog] = useState(false);
  const [transferForm, setTransferForm] = useState({ product_id: '', from_branch: '', to_branch: '', quantity: 1, notes: '' });
  const [branches, setBranches] = useState<any[]>([]);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [editingPO, setEditingPO] = useState<any>(null);

  const [supplierForm, setSupplierForm] = useState({ name: '', contact_person: '', phone: '', email: '', address: '', gstin: '', payment_terms: 'net30', notes: '' });
  const [poForm, setPoForm] = useState({ supplier_id: '', items: [{ product_id: '', product_name: '', quantity: 1, unit_price: 0 }], expected_date: '', notes: '' });
  const [movForm, setMovForm] = useState({ product_id: '', type: 'purchase', quantity: 1, notes: '' });

  const loadAll = async () => {
    setLoading(true);
    const supParams = new URLSearchParams();
    if (showInactiveSuppliers) supParams.set('include_inactive', '1');
    if (supplierSearch) supParams.set('search', supplierSearch);
    const poParams = new URLSearchParams();
    if (poStatusFilter !== 'all') poParams.set('status', poStatusFilter);
    if (poSearch) poParams.set('search', poSearch);
    const [s, sup, po, mov, br] = await Promise.all([
      req('GET', '/stats'),
      req('GET', `/suppliers?${supParams}`),
      req('GET', `/purchase-orders?${poParams}`),
      req('GET', '/stock-movements'),
      fetch('/api/erp/branches', { headers: { Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` } }).then(r => r.json()),
    ]);
    setStats(s); setSuppliers(Array.isArray(sup) ? sup : []);
    setPurchaseOrders(Array.isArray(po) ? po : []);
    setMovements(Array.isArray(mov) ? mov : []);
    setBranches(Array.isArray(br) ? br : []);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, [showInactiveSuppliers, poStatusFilter]);

  useEffect(() => {
    loadAll();
    api.getProducts().then((p: any) => setProducts(Array.isArray(p) ? p : p?.products || []));
  }, []);

  const toggleSupplierActive = async (s: any) => {
    await req('PUT', `/suppliers/${s.id}`, { ...s, is_active: s.is_active ? 0 : 1 });
    toast.success(s.is_active ? 'Supplier deactivated' : 'Supplier activated');
    loadAll();
  };

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

  const saveTransfer = async () => {
    if (!transferForm.product_id || !transferForm.from_branch || !transferForm.to_branch || !transferForm.quantity)
      return toast.error('All fields required');
    try {
      const res = await fetch('/api/erp/stock-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
        body: JSON.stringify(transferForm),
      }).then(r => r.json());
      if (res.error) return toast.error(res.error);
      toast.success(res.message); setTransferDialog(false); loadAll();
      api.getProducts().then((p: any) => setProducts(Array.isArray(p) ? p : p?.products || []));
    } catch { toast.error('Transfer failed'); }
  };

  const saveStockEdit = async (productId: string) => {    await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
      body: JSON.stringify({ stock: editStockVal, in_stock: editStockVal > 0 ? 1 : 0 }),
    });
    toast.success('Stock updated!'); setEditStockId(null);
    api.getProducts().then((p: any) => setProducts(Array.isArray(p) ? p : p?.products || []));
    loadAll();
  };

  const updatePOStatus = async (id: string, status: string) => {
    const po = purchaseOrders.find(p => p.id === id);
    await req('PUT', `/purchase-orders/${id}`, { ...po, status, received_date: status === 'received' ? new Date().toISOString().split('T')[0] : po.received_date });
    toast.success(`PO marked as ${status}`); loadAll();
  };

  return (
    <ERPLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Inventory Management</h1>
          <Button size="sm" variant="outline" onClick={loadAll} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Total Products', value: stats.totalProducts || 0, icon: Package, color: 'text-blue-600' },
            { label: 'In Stock', value: stats.inStock || 0, icon: CheckCircle, color: 'text-green-600' },
            { label: 'Out of Stock', value: stats.outOfStock || 0, icon: XCircle, color: 'text-red-600' },
            { label: 'Low Stock (≤5)', value: stats.lowStock || 0, icon: AlertTriangle, color: 'text-orange-600' },
            { label: 'Inventory Value', value: `₹${(stats.totalValue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-primary' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className={`text-2xl font-black mt-0.5 ${s.color}`}>{s.value}</p>
                  </div>
                  <s.icon className={`h-8 w-8 opacity-15 ${s.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="stock" className="gap-1.5"><Package className="h-3.5 w-3.5" /> Stock</TabsTrigger>
            <TabsTrigger value="movements" className="gap-1.5"><ArrowUpDown className="h-3.5 w-3.5" /> Movements</TabsTrigger>
            <TabsTrigger value="suppliers" className="gap-1.5"><Truck className="h-3.5 w-3.5" /> Suppliers</TabsTrigger>
            <TabsTrigger value="po" className="gap-1.5"><BarChart3 className="h-3.5 w-3.5" /> Purchase Orders</TabsTrigger>
          </TabsList>

          {/* Stock Overview */}
          <TabsContent value="stock" className="space-y-4">
            <div className="flex gap-2 items-center flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search products..." className="pl-8 h-9" value={stockSearch} onChange={e => setStockSearch(e.target.value)} />
              </div>
              <Button size="sm" onClick={() => setMovementDialog(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Adjust Stock</Button>
              <Button size="sm" variant="outline" onClick={() => setTransferDialog(true)} className="gap-1.5"><ArrowUpDown className="h-4 w-4" /> Transfer</Button>
            </div>

            {/* Stock chart */}
            <InventoryStockChart products={products} />

            {/* Low stock alert banner */}
            {stats.lowStock > 0 && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-xl text-sm">
                <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0" />
                <span><strong>{stats.lowStock}</strong> products have low stock (≤5 units)</span>
              </div>
            )}

            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-xs font-semibold">Product</th>
                    <th className="text-left p-3 text-xs font-semibold">Category</th>
                    <th className="text-right p-3 text-xs font-semibold">Price</th>
                    <th className="text-center p-3 text-xs font-semibold">Stock</th>
                    <th className="text-center p-3 text-xs font-semibold">Reorder</th>
                    <th className="text-center p-3 text-xs font-semibold">Status</th>
                    <th className="text-center p-3 text-xs font-semibold">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {products
                    .filter(p => !stockSearch || p.name?.toLowerCase().includes(stockSearch.toLowerCase()) || p.category?.toLowerCase().includes(stockSearch.toLowerCase()))
                    .map((p: any) => (
                    <tr key={p.id} className={`border-t hover:bg-muted/30 ${p.stock <= 5 && p.stock > 0 ? 'bg-orange-50/50' : ''} ${p.stock === 0 ? 'bg-red-50/50' : ''}`}>
                      <td className="p-3">
                        <p className="font-medium text-sm">{p.name}</p>
                        {p.sku && <p className="text-xs text-muted-foreground">SKU: {p.sku}</p>}
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{p.category || '—'}</td>
                      <td className="p-3 text-right text-sm font-medium">₹{(p.price || 0).toLocaleString('en-IN')}</td>
                      <td className="p-3 text-center">
                        {editStockId === p.id ? (
                          <div className="flex items-center gap-1 justify-center">
                            <Input type="number" className="h-7 w-16 text-xs text-center" value={editStockVal} onChange={e => setEditStockVal(Number(e.target.value))} min={0} />
                            <Button size="sm" className="h-7 text-xs px-2" onClick={() => saveStockEdit(p.id)}>Save</Button>
                            <Button size="sm" variant="ghost" className="h-7 text-xs px-1" onClick={() => setEditStockId(null)}>✕</Button>
                          </div>
                        ) : (
                          <span className={`font-bold text-sm ${p.stock === 0 ? 'text-red-600' : p.stock <= 5 ? 'text-orange-600' : 'text-green-600'}`}>{p.stock}</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-xs font-medium ${p.stock <= (p.reorder_level || 5) && p.stock > 0 ? 'text-orange-600' : 'text-muted-foreground'}`}>
                          {p.reorder_level || 5}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={p.stock === 0 ? 'destructive' : p.stock <= (p.reorder_level || 5) ? 'secondary' : 'default'} className="text-xs">
                          {p.stock === 0 ? 'Out of Stock' : p.stock <= (p.reorder_level || 5) ? 'Low Stock' : 'In Stock'}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditStockId(p.id); setEditStockVal(p.stock); }}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!products.filter(p => !stockSearch || p.name?.toLowerCase().includes(stockSearch.toLowerCase())).length && (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No products found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Stock Movements */}
          <TabsContent value="movements" className="space-y-4">
            <div className="flex gap-2 items-center flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search product..." className="pl-8 h-9" value={movSearch} onChange={e => setMovSearch(e.target.value)} />
              </div>
              <Button size="sm" onClick={() => setMovementDialog(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Add Movement</Button>
            </div>
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-xs font-semibold">Product</th>
                    <th className="text-left p-3 text-xs font-semibold">Type</th>
                    <th className="text-center p-3 text-xs font-semibold">Qty Change</th>
                    <th className="text-left p-3 text-xs font-semibold">Notes</th>
                    <th className="text-left p-3 text-xs font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {movements
                    .filter(m => !movSearch || m.product_name?.toLowerCase().includes(movSearch.toLowerCase()))
                    .map((m: any) => {
                    const isOut = ['sale','damage','return_to_supplier','adjustment_remove'].includes(m.type);
                    return (
                      <tr key={m.id} className="border-t hover:bg-muted/30">
                        <td className="p-3 font-medium text-sm">{m.product_name}</td>
                        <td className="p-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${isOut ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {m.type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`font-bold text-base ${isOut ? 'text-red-600' : 'text-green-600'}`}>
                            {isOut ? '−' : '+'}{m.quantity}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{m.notes || '—'}</td>
                        <td className="p-3 text-sm text-muted-foreground">{new Date(m.created_at).toLocaleDateString('en-IN')}</td>
                      </tr>
                    );
                  })}
                  {!movements.filter(m => !movSearch || m.product_name?.toLowerCase().includes(movSearch.toLowerCase())).length && (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No movements yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Suppliers */}
          <TabsContent value="suppliers" className="space-y-4">
            <div className="flex gap-2 items-center flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search suppliers..." className="pl-8 h-9"
                  value={supplierSearch} onChange={e => setSupplierSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadAll()} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={showInactiveSuppliers} onCheckedChange={setShowInactiveSuppliers} />
                <span className="text-sm text-muted-foreground">Show Inactive</span>
              </div>
              <Button size="sm" onClick={() => { setEditingSupplier(null); setSupplierForm({ name:'',contact_person:'',phone:'',email:'',address:'',gstin:'',payment_terms:'net30',notes:'' }); setSupplierDialog(true); }} className="gap-1.5">
                <Plus className="h-4 w-4" /> Add Supplier
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {suppliers.map((s: any) => (
                <SupplierCard
                  key={s.id}
                  supplier={s}
                  onEdit={() => { setEditingSupplier(s); setSupplierForm(s); setSupplierDialog(true); }}
                  onDelete={async () => { if (!confirm('Delete supplier?')) return; await req('DELETE', `/suppliers/${s.id}`); loadAll(); }}
                  onNewPO={() => { setPoForm({ supplier_id: s.id, items:[{product_id:'',product_name:'',quantity:1,unit_price:0}], expected_date:'', notes:'' }); setPoDialog(true); }}
                  onToggleActive={() => toggleSupplierActive(s)}
                />
              ))}
              {!suppliers.length && <p className="text-sm text-muted-foreground col-span-2 text-center py-8">No suppliers found</p>}
            </div>
          </TabsContent>

          {/* Purchase Orders */}
          <TabsContent value="po" className="space-y-4">
            <div className="flex gap-2 items-center flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search PO # or supplier..." className="pl-8 h-9"
                  value={poSearch} onChange={e => setPoSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadAll()} />
              </div>
              {['all','draft','ordered','received','cancelled'].map(s => (
                <button key={s} onClick={() => setPoStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all capitalize ${poStatusFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/40'}`}>
                  {s}
                </button>
              ))}
              <Button size="sm" onClick={() => { setPoForm({ supplier_id:'', items:[{product_id:'',product_name:'',quantity:1,unit_price:0}], expected_date:'', notes:'' }); setPoDialog(true); }} className="gap-1.5 ml-auto">
                <Plus className="h-4 w-4" /> New PO
              </Button>
            </div>
            <div className="space-y-3">
              {purchaseOrders.map((po: any) => {
                const items = Array.isArray(po.items) ? po.items : [];
                const statusColor = po.status === 'received' ? 'bg-green-100 text-green-700' : po.status === 'ordered' ? 'bg-blue-100 text-blue-700' : po.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700';
                return (
                  <div key={po.id} className="border rounded-xl p-4 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold font-mono">{po.po_number}</p>
                        <p className="text-sm text-muted-foreground">{po.supplier_name || 'No supplier'}</p>
                        {po.expected_date && <p className="text-xs text-muted-foreground">Expected: {po.expected_date}</p>}
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor}`}>{po.status}</span>
                        <p className="text-lg font-black mt-1">₹{(po.total || 0).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    {items.length > 0 && (
                      <div className="border rounded-lg overflow-hidden mb-3">
                        <table className="w-full text-xs">
                          <thead className="bg-muted/30"><tr>
                            <th className="text-left p-2">Product</th>
                            <th className="text-center p-2">Qty</th>
                            <th className="text-right p-2">Unit Price</th>
                            <th className="text-right p-2">Total</th>
                          </tr></thead>
                          <tbody>
                            {items.map((item: any, i: number) => (
                              <tr key={i} className="border-t">
                                <td className="p-2">{item.product_name || 'Product'}</td>
                                <td className="p-2 text-center">{item.quantity}</td>
                                <td className="p-2 text-right">₹{(item.unit_price || 0).toLocaleString('en-IN')}</td>
                                <td className="p-2 text-right font-medium">₹{((item.quantity || 0) * (item.unit_price || 0)).toLocaleString('en-IN')}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      {po.status === 'draft' && <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => updatePOStatus(po.id, 'ordered')}><Clock className="h-3.5 w-3.5" /> Mark Ordered</Button>}
                      {po.status === 'ordered' && <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={() => updatePOStatus(po.id, 'received')}><CheckCircle className="h-3.5 w-3.5" /> Mark Received</Button>}
                      {!['received','cancelled'].includes(po.status) && <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs text-red-600 border-red-200" onClick={() => updatePOStatus(po.id, 'cancelled')}><XCircle className="h-3.5 w-3.5" /> Cancel</Button>}
                      <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs" onClick={() => printPurchaseOrder(po)}><Printer className="h-3.5 w-3.5" /> Print</Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive ml-auto" onClick={async () => { if (!confirm('Delete PO?')) return; await req('DELETE', `/purchase-orders/${po.id}`); loadAll(); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                );
              })}
              {!purchaseOrders.length && <p className="text-center text-muted-foreground py-10">No purchase orders yet</p>}
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

        {/* Stock Transfer Dialog */}
        <Dialog open={transferDialog} onOpenChange={setTransferDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Inter-Branch Stock Transfer</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label className="text-xs">Product *</Label>
                <Select value={transferForm.product_id} onValueChange={v => setTransferForm(f => ({...f, product_id: v}))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>{products.map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">From Branch *</Label>
                  <Select value={transferForm.from_branch} onValueChange={v => setTransferForm(f => ({...f, from_branch: v}))}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="From" /></SelectTrigger>
                    <SelectContent>{branches.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label className="text-xs">To Branch *</Label>
                  <Select value={transferForm.to_branch} onValueChange={v => setTransferForm(f => ({...f, to_branch: v}))}>
                    <SelectTrigger className="mt-1 h-9"><SelectValue placeholder="To" /></SelectTrigger>
                    <SelectContent>{branches.map((b: any) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label className="text-xs">Quantity *</Label><Input type="number" min={1} className="mt-1 h-9" value={transferForm.quantity} onChange={e => setTransferForm(f => ({...f, quantity: Number(e.target.value)}))} /></div>
              <div><Label className="text-xs">Notes</Label><Input className="mt-1 h-9" value={transferForm.notes} onChange={e => setTransferForm(f => ({...f, notes: e.target.value}))} /></div>
            </div>
            <DialogFooter><Button variant="outline" onClick={() => setTransferDialog(false)}>Cancel</Button><Button onClick={saveTransfer}>Transfer</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
}
