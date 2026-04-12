import { useState, useEffect } from "react";
import { Search, Eye, Download, Truck, CheckCircle, Clock, Package, XCircle, RefreshCw, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";

const STATUS: Record<string, { label: string; color: string; icon: any }> = {
  placed:     { label: "Placed",      color: "bg-blue-100 text-blue-700",    icon: Package },
  processing: { label: "Processing",  color: "bg-yellow-100 text-yellow-700", icon: Clock },
  shipped:    { label: "Shipped",     color: "bg-purple-100 text-purple-700", icon: Truck },
  delivered:  { label: "Delivered",   color: "bg-green-100 text-green-700",   icon: CheckCircle },
  cancelled:  { label: "Cancelled",   color: "bg-red-100 text-red-700",       icon: XCircle },
};

const PAYMENT: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-gray-100 text-gray-700",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [updateDialog, setUpdateDialog] = useState<any>(null);
  const [updateForm, setUpdateForm] = useState({ status: '', tracking_id: '', courier: '' });

  const load = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      const data = await api.getOrders(params);
      setOrders(data);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const filtered = orders.filter(o =>
    o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_email?.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    all: orders.length,
    placed: orders.filter(o => o.status === 'placed').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  };

  const openUpdate = (o: any) => {
    setUpdateForm({ status: o.status, tracking_id: o.tracking_id || '', courier: o.courier || '' });
    setUpdateDialog(o);
  };

  const saveUpdate = async () => {
    try {
      await api.updateOrderStatus(updateDialog.id, updateForm);
      toast.success('Order updated!');
      setUpdateDialog(null);
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">{counts.placed} new · {counts.shipped} shipped · {counts.delivered} delivered</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={load}>
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="mb-4">
        <TabsList className="h-8">
          {Object.entries(counts).map(([k, v]) => (
            <TabsTrigger key={k} value={k} className="text-xs h-7 px-3 capitalize">{k === 'all' ? 'All' : k} ({v})</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by order ID, customer..." className="pl-8 h-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground"><RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />Loading orders...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground"><Package className="h-10 w-10 mx-auto mb-2 opacity-30" />No orders found</div>
          ) : (
            <div className="divide-y">
              {filtered.map(o => {
                const st = STATUS[o.status] || STATUS.placed;
                const Icon = st.icon;
                return (
                  <div key={o.id} className="p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{o.order_number}</span>
                          <Badge className={`text-[10px] ${st.color}`}><Icon className="h-3 w-3 mr-1" />{st.label}</Badge>
                          <Badge className={`text-[10px] ${PAYMENT[o.payment_status] || PAYMENT.pending}`}>{o.payment_status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{o.customer_name || 'Guest'} · {o.customer_email}</p>
                        <p className="text-xs text-muted-foreground">{o.payment_method} · {new Date(o.created_at).toLocaleDateString('en-IN')}</p>
                        {o.tracking_id && <p className="text-xs text-primary mt-0.5">🚚 {o.courier}: {o.tracking_id}</p>}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="font-bold">₹{o.total}</p>
                          <p className="text-xs text-muted-foreground">{Array.isArray(o.items) ? o.items.length : 0} items</p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setViewOrder(o)}><Eye className="h-3.5 w-3.5" /></Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openUpdate(o)}><Edit className="h-3.5 w-3.5" /></Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Order {viewOrder?.order_number}</DialogTitle></DialogHeader>
          {viewOrder && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Customer</p><p className="font-medium">{viewOrder.customer_name || 'Guest'}</p></div>
                <div><p className="text-xs text-muted-foreground">Email</p><p>{viewOrder.customer_email}</p></div>
                <div><p className="text-xs text-muted-foreground">Payment</p><p>{viewOrder.payment_method} · <span className={`px-1.5 py-0.5 rounded text-[10px] ${PAYMENT[viewOrder.payment_status]}`}>{viewOrder.payment_status}</span></p></div>
                <div><p className="text-xs text-muted-foreground">Date</p><p>{new Date(viewOrder.created_at).toLocaleString('en-IN')}</p></div>
              </div>
              {viewOrder.address && (
                <div><p className="text-xs text-muted-foreground mb-1">Shipping Address</p>
                  <p className="bg-muted/50 rounded-lg p-2 text-xs">{typeof viewOrder.address === 'object' ? `${viewOrder.address.name}, ${viewOrder.address.line}, ${viewOrder.address.city}, ${viewOrder.address.state} - ${viewOrder.address.pin}` : viewOrder.address}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Items</p>
                <div className="space-y-1.5">
                  {(Array.isArray(viewOrder.items) ? viewOrder.items : []).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between bg-muted/30 rounded px-3 py-2">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-between font-bold border-t pt-2"><span>Total</span><span>₹{viewOrder.total}</span></div>
              {viewOrder.tracking_id && <p className="text-xs text-primary">Tracking: {viewOrder.courier} — {viewOrder.tracking_id}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={!!updateDialog} onOpenChange={() => setUpdateDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Update Order {updateDialog?.order_number}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={updateForm.status} onValueChange={v => setUpdateForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Tracking ID</Label>
              <Input className="mt-1 text-sm" value={updateForm.tracking_id} onChange={e => setUpdateForm(f => ({ ...f, tracking_id: e.target.value }))} placeholder="DTDC123456" />
            </div>
            <div>
              <Label className="text-xs">Courier Partner</Label>
              <Input className="mt-1 text-sm" value={updateForm.courier} onChange={e => setUpdateForm(f => ({ ...f, courier: e.target.value }))} placeholder="DTDC, BlueDart, Delhivery..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialog(null)}>Cancel</Button>
            <Button onClick={saveUpdate}>Update Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminOrders;
