import SEOHead from "@/components/common/SEOHead";
import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, ShoppingBag, Heart, LogOut, Save, Loader2, Lock, FileText, Package, Truck, CheckCircle, Clock, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import CustomerLayout from "@/components/layout/CustomerLayout";
import ProductCard from "@/components/ecommerce/ProductCard";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlistStore } from "@/store/wishlistStore";
import { useProductStore } from "@/store/productStore";
import { api } from "@/lib/api";

const STATUS_ICON: Record<string, any> = {
  placed: Package, processing: Clock, shipped: Truck, delivered: CheckCircle, cancelled: Package,
};
const STATUS_COLOR: Record<string, string> = {
  placed: 'bg-blue-100 text-blue-700', processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const Account = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const wishlistItems = useWishlistStore((s) => s.items);
  const { products, fetchProducts } = useProductStore();
  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [myRepairs, setMyRepairs] = useState<any[]>([]);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: (user as any)?.phone || '', address: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    fetchProducts();
    api.myOrders().then(setMyOrders).catch(() => {});
    // Fetch repairs by phone
    if (user?.phone) {
      fetch(`/api/erp/job-cards?customer_phone=${user.phone}`, { headers: { Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` } }).then(r => r.json()).then(d => setMyRepairs(Array.isArray(d) ? d : [])).catch(() => {});
    }
  }, [user]);

  const wishlistProducts = products.filter(p => wishlistItems.includes(p.id));

  const saveProfile = async () => {
    setSaving(true);
    try { await api.updateProfile(profileForm); toast.success('Profile updated!'); }
    catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (!pwForm.currentPassword || !pwForm.newPassword) return toast.error('Fill all fields');
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Min 6 characters');
    setSavingPw(true);
    try { await api.changePassword(pwForm.currentPassword, pwForm.newPassword); toast.success('Password changed!'); setPwForm({ currentPassword: '', newPassword: '', confirm: '' }); }
    catch (e: any) { toast.error(e.message); }
    finally { setSavingPw(false); }
  };

  const printInvoice = (order: any) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const items = Array.isArray(order.items) ? order.items : [];
    win.document.write(`
      <html><head><title>Invoice ${order.order_number}</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;max-width:600px;margin:0 auto}
      h1{color:#2d6a4f}table{width:100%;border-collapse:collapse;margin:20px 0}
      th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}
      .total{font-size:18px;font-weight:bold}.header{display:flex;justify-content:space-between}
      @media print{button{display:none}}</style></head>
      <body>
        <div class="header">
          <div><h1>🌿 AI Laptop Wala</h1><p>AI Laptop Wala Store</p></div>
          <div style="text-align:right"><h2>INVOICE</h2><p>#${order.order_number}</p><p>${new Date(order.created_at).toLocaleDateString('en-IN')}</p></div>
        </div>
        <hr/>
        <p><strong>Bill To:</strong><br/>${order.address?.name || ''}<br/>${order.address?.line || ''}<br/>${order.address?.city || ''}, ${order.address?.state || ''} - ${order.address?.pin || ''}<br/>${order.address?.phone || ''}</p>
        <table>
          <tr><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr>
          ${items.map((i: any) => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>₹${i.price}</td><td>₹${i.price * i.quantity}</td></tr>`).join('')}
        </table>
        <div style="text-align:right">
          <p>Subtotal: ₹${order.subtotal}</p>
          ${order.discount > 0 ? `<p>Discount: -₹${order.discount}</p>` : ''}
          <p class="total">Total: ₹${order.total}</p>
          <p>Payment: ${order.payment_method} | ${order.payment_status}</p>
        </div>
        <hr/><p style="text-align:center;color:#666;font-size:12px">Thank you for shopping with AI Laptop Wala 🙏</p>
        <button onclick="window.print()" style="margin-top:20px;padding:10px 20px;background:#2d6a4f;color:white;border:none;cursor:pointer;border-radius:4px">Print Invoice</button>
      </body></html>
    `);
    win.document.close();
  };

  if (!user) { navigate("/login"); return null; }

  return (
    <CustomerLayout>
      <SEOHead title="My Account — AI Laptop Wala" canonical="/account" noindex={true} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-serif font-bold">My Account</h1>
          <Button variant="outline" className="gap-2 text-destructive" onClick={() => { logout(); navigate("/"); }}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <Card className="md:col-span-1 h-fit">
            <CardContent className="p-6 text-center">
              <Avatar className="h-20 w-20 mx-auto mb-4">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-serif">
                  {user.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                </AvatarFallback>
              </Avatar>
              <h2 className="font-semibold text-lg">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge variant={(user as any).role === "admin" ? "default" : "secondary"} className="mt-2 capitalize">{(user as any).role || 'customer'}</Badge>
              <Separator className="my-4" />
              <div className="text-left space-y-2 text-sm">
                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground shrink-0" /><span className="truncate">{user.email}</span></div>
                {(user as any).phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{(user as any).phone}</div>}
                <div className="flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-muted-foreground" />{myOrders.length} orders</div>
                <div className="flex items-center gap-2"><Heart className="h-4 w-4 text-muted-foreground" />{wishlistProducts.length} wishlist items</div>
              </div>
              {((user as any).role === "admin" || (user as any).role === "superadmin") && (
                <Button className="w-full mt-4 gap-2" onClick={() => navigate("/admin")}>Go to Admin Panel</Button>
              )}
            </CardContent>
          </Card>

          {/* Main */}
          <div className="md:col-span-2">
            <Tabs defaultValue="orders">
              <TabsList className="flex-wrap h-auto gap-1">
                <TabsTrigger value="orders" className="gap-1 text-xs"><ShoppingBag className="h-3 w-3" /> Orders ({myOrders.length})</TabsTrigger>
                <TabsTrigger value="repairs" className="gap-1 text-xs">🔧 Repairs ({myRepairs.length})</TabsTrigger>
                <TabsTrigger value="profile" className="gap-1 text-xs"><User className="h-3 w-3" /> Profile</TabsTrigger>
                <TabsTrigger value="wishlist" className="gap-1 text-xs"><Heart className="h-3 w-3" /> Wishlist ({wishlistProducts.length})</TabsTrigger>
                <TabsTrigger value="password" className="gap-1 text-xs"><Lock className="h-3 w-3" /> Password</TabsTrigger>
                <TabsTrigger value="addresses" className="gap-1 text-xs"><MapPin className="h-3 w-3" /> Addresses</TabsTrigger>
                <TabsTrigger value="returns" className="gap-1 text-xs"><Package className="h-3 w-3" /> Returns</TabsTrigger>
                <TabsTrigger value="wallet" className="gap-1 text-xs">💰 Wallet</TabsTrigger>
              </TabsList>

              {/* ORDERS */}
              <TabsContent value="orders" className="mt-4 space-y-3">
                {myOrders.length === 0 ? (
                  <Card><CardContent className="p-8 text-center">
                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="font-medium">No orders yet</p>
                    <Button className="mt-4" onClick={() => navigate("/products")}>Start Shopping</Button>
                  </CardContent></Card>
                ) : myOrders.map(order => {
                  const Icon = STATUS_ICON[order.status] || Package;
                  return (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-sm">#{order.order_number}</p>
                            <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                            <p className="text-xs text-muted-foreground">{order.payment_method}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={`text-[10px] capitalize ${STATUS_COLOR[order.status] || STATUS_COLOR.placed}`}>
                              <Icon className="h-3 w-3 mr-1" />{order.status}
                            </Badge>
                            <p className="font-bold text-sm mt-1">₹{order.total}</p>
                          </div>
                        </div>
                        <div className="space-y-0.5 mb-3">
                          {(Array.isArray(order.items) ? order.items : []).map((item: any, i: number) => (
                            <p key={i} className="text-xs text-muted-foreground">{item.name} × {item.quantity} — ₹{item.price * item.quantity}</p>
                          ))}
                        </div>
                        {order.tracking_id && (
                          <p className="text-xs text-primary mb-2">🚚 {order.courier}: {order.tracking_id}</p>
                        )}
                        <div className="flex gap-2">
                          <Link to={`/track-order?order=${order.order_number}`}>
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><Eye className="h-3 w-3" /> Track</Button>
                          </Link>
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => window.open(api.getInvoiceUrl(order.order_number), '_blank')}>
                            <FileText className="h-3 w-3" /> Invoice
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </TabsContent>

              <TabsContent value="repairs" className="space-y-3">
                {myRepairs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No repair records yet</p>
                  </div>
                ) : (
                  myRepairs.map((r: any) => (
                    <div key={r.id} className="border rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-muted-foreground">{r.booking_number}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.status === 'completed' ? 'bg-green-100 text-green-700' : r.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status?.replace('_', ' ')}</span>
                      </div>
                      <p className="font-semibold text-sm">{r.device_brand} {r.device_model}</p>
                      <p className="text-xs text-muted-foreground">{r.service_name}</p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">{new Date(r.created_at).toLocaleDateString('en-IN')}</span>
                        <span className="font-bold text-green-600">₹{(r.total_charge || 0).toLocaleString('en-IN')}</span>
                      </div>
                      {r.warranty_days > 0 && r.status === 'completed' && <p className="text-xs text-green-600 font-medium">✓ {r.warranty_days} days warranty</p>}
                    </div>
                  ))
                )}
              </TabsContent>

              {/* PROFILE */}
              <TabsContent value="profile" className="mt-4">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base">Edit Profile</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label className="text-xs">Full Name</Label><Input className="mt-1 h-9" value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} /></div>
                      <div><Label className="text-xs">Email</Label><Input className="mt-1 h-9" value={user.email} disabled /></div>
                    </div>
                    <div><Label className="text-xs">Phone</Label><Input className="mt-1 h-9" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" /></div>
                    <div><Label className="text-xs">Default Address</Label><Input className="mt-1 h-9" value={profileForm.address} onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))} placeholder="House no, Street, City, PIN" /></div>
                    <Button className="gap-2" onClick={saveProfile} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* WISHLIST */}
              <TabsContent value="wishlist" className="mt-4">
                {wishlistProducts.length === 0 ? (
                  <Card><CardContent className="p-8 text-center">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="font-medium">Wishlist is empty</p>
                    <Button className="mt-4" onClick={() => navigate("/products")}>Browse Products</Button>
                  </CardContent></Card>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {wishlistProducts.map(p => <ProductCard key={p.id} product={p} />)}
                  </div>
                )}
              </TabsContent>

              {/* PASSWORD */}
              <TabsContent value="password" className="mt-4">
                <Card>
                  <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Lock className="h-4 w-4" /> Change Password</CardTitle></CardHeader>
                  <CardContent className="space-y-4 max-w-sm">
                    <div><Label className="text-xs">Current Password</Label><Input type="password" className="mt-1 h-9" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} /></div>
                    <div><Label className="text-xs">New Password</Label><Input type="password" className="mt-1 h-9" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} /></div>
                    <div><Label className="text-xs">Confirm New Password</Label><Input type="password" className="mt-1 h-9" value={pwForm.confirm} onChange={e => setPwForm(p => ({ ...p, confirm: e.target.value }))} /></div>
                    <Button className="gap-2" onClick={changePassword} disabled={savingPw}>
                      {savingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                      {savingPw ? 'Changing...' : 'Change Password'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* ADDRESSES */}
              <TabsContent value="addresses" className="mt-4 space-y-3">
                <AddressesTab />
              </TabsContent>

              {/* RETURNS */}
              <TabsContent value="returns" className="mt-4 space-y-3">
                <ReturnsTab orders={myOrders} />
              </TabsContent>

              {/* WALLET */}
              <TabsContent value="wallet" className="mt-4 space-y-3">
                <WalletTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

// ── Addresses Tab ─────────────────────────────────────────
function AddressesTab() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: 'Home', name: '', phone: '', address: '', city: '', state: 'Madhya Pradesh', pin: '' });
  const token = localStorage.getItem('ailaptopwala_token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const load = () => fetch('/api/addresses', { headers }).then(r => r.json()).then(d => { if (Array.isArray(d)) setAddresses(d); });
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name || !form.phone || !form.address || !form.city || !form.pin) return toast.error('Fill all required fields');
    await fetch('/api/addresses', { method: 'POST', headers, body: JSON.stringify({ ...form, is_default: addresses.length === 0 }) });
    toast.success('Address saved!');
    setShowForm(false); setForm({ label: 'Home', name: '', phone: '', address: '', city: '', state: 'Madhya Pradesh', pin: '' });
    load();
  };

  const remove = async (id: string) => { await fetch(`/api/addresses/${id}`, { method: 'DELETE', headers }); toast.success('Deleted'); load(); };
  const setDefault = async (id: string) => { await fetch(`/api/addresses/${id}/default`, { method: 'PUT', headers }); toast.success('Set as default'); load(); };

  return (
    <div className="space-y-3">
      {addresses.map((a: any) => (
        <Card key={a.id}>
          <CardContent className="p-4 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{a.label}</span>
                {a.is_default ? <Badge variant="secondary" className="text-[10px]">Default</Badge> : null}
              </div>
              <p className="text-sm">{a.name} • {a.phone}</p>
              <p className="text-xs text-muted-foreground">{a.address}, {a.city}, {a.state} - {a.pin}</p>
            </div>
            <div className="flex gap-1">
              {!a.is_default && <Button size="sm" variant="ghost" className="text-xs" onClick={() => setDefault(a.id)}>Set Default</Button>}
              <Button size="sm" variant="ghost" className="text-xs text-destructive" onClick={() => remove(a.id)}>Delete</Button>
            </div>
          </CardContent>
        </Card>
      ))}
      {!showForm ? (
        <Button variant="outline" className="w-full" onClick={() => setShowForm(true)}>+ Add New Address</Button>
      ) : (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Label</Label><Input className="mt-1 h-9" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Home/Office" /></div>
              <div><Label className="text-xs">Full Name *</Label><Input className="mt-1 h-9" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            </div>
            <div><Label className="text-xs">Phone *</Label><Input className="mt-1 h-9" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div><Label className="text-xs">Address *</Label><Input className="mt-1 h-9" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs">City *</Label><Input className="mt-1 h-9" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></div>
              <div><Label className="text-xs">State</Label><Input className="mt-1 h-9" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} /></div>
              <div><Label className="text-xs">PIN *</Label><Input className="mt-1 h-9" value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value }))} /></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={save}>Save Address</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Returns Tab ───────────────────────────────────────────
function ReturnsTab({ orders }: { orders: any[] }) {
  const [returns, setReturns] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ order_id: '', reason: '', type: 'return' });
  const token = localStorage.getItem('ailaptopwala_token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const load = () => fetch('/api/returns', { headers }).then(r => r.json()).then(d => { if (Array.isArray(d)) setReturns(d); });
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.order_id || !form.reason) return toast.error('Select order and enter reason');
    const res = await fetch('/api/returns', { method: 'POST', headers, body: JSON.stringify(form) }).then(r => r.json());
    if (res.success) { toast.success(res.message || 'Return request submitted!'); setShowForm(false); load(); }
    else toast.error(res.error || 'Failed');
  };

  const statusColor: Record<string, string> = { requested: 'bg-yellow-100 text-yellow-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700', refunded: 'bg-blue-100 text-blue-700' };

  return (
    <div className="space-y-3">
      {returns.length === 0 && !showForm && <p className="text-sm text-muted-foreground text-center py-8">No return requests yet</p>}
      {returns.map((r: any) => (
        <Card key={r.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-sm">Order: {r.order_number}</p>
                <p className="text-xs text-muted-foreground mt-1">Reason: {r.reason}</p>
                <p className="text-xs text-muted-foreground">Type: {r.type} • Amount: ₹{r.refund_amount?.toLocaleString('en-IN')}</p>
              </div>
              <Badge className={statusColor[r.status] || 'bg-muted'}>{r.status}</Badge>
            </div>
            {r.admin_notes && <p className="text-xs mt-2 p-2 bg-muted rounded">Admin: {r.admin_notes}</p>}
          </CardContent>
        </Card>
      ))}
      {!showForm ? (
        <Button variant="outline" className="w-full" onClick={() => setShowForm(true)}>Request Return/Refund</Button>
      ) : (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div>
              <Label className="text-xs">Select Order *</Label>
              <select className="w-full mt-1 h-9 border rounded-md px-3 text-sm" value={form.order_id} onChange={e => setForm(f => ({ ...f, order_id: e.target.value }))}>
                <option value="">Choose order...</option>
                {orders.filter(o => o.status === 'delivered').map((o: any) => (
                  <option key={o.id} value={o.order_number}>{o.order_number} — ₹{o.total}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Type</Label>
              <select className="w-full mt-1 h-9 border rounded-md px-3 text-sm" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="return">Return</option>
                <option value="refund">Refund Only</option>
                <option value="exchange">Exchange</option>
              </select>
            </div>
            <div><Label className="text-xs">Reason *</Label><Input className="mt-1 h-9" value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} placeholder="Why do you want to return?" /></div>
            <div className="flex gap-2">
              <Button onClick={submit}>Submit Request</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Wallet + Referral Tab ─────────────────────────────────
function WalletTab() {
  const [wallet, setWallet] = useState<any>({ balance: 0, transactions: [] });
  const [referral, setReferral] = useState<any>({ code: '', referred_count: 0, total_earned: 0 });
  const [refCode, setRefCode] = useState('');
  const token = localStorage.getItem('ailaptopwala_token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    fetch('/api/wallet', { headers }).then(r => r.json()).then(d => setWallet(d)).catch(() => {});
    fetch('/api/wallet/referral', { headers }).then(r => r.json()).then(d => setReferral(d)).catch(() => {});
  }, []);

  const applyCode = async () => {
    if (!refCode.trim()) return;
    const res = await fetch('/api/wallet/referral/apply', { method: 'POST', headers, body: JSON.stringify({ code: refCode }) }).then(r => r.json());
    if (res.success) { toast.success(res.message); setRefCode(''); fetch('/api/wallet', { headers }).then(r => r.json()).then(setWallet); }
    else toast.error(res.error || 'Failed');
  };

  return (
    <div className="space-y-4">
      {/* Balance */}
      <Card>
        <CardContent className="p-5 text-center">
          <p className="text-sm text-muted-foreground mb-1">Wallet Balance</p>
          <p className="text-4xl font-black text-primary">₹{wallet.balance?.toLocaleString('en-IN') || '0'}</p>
          <p className="text-xs text-muted-foreground mt-1">Use at checkout for instant discount</p>
        </CardContent>
      </Card>

      {/* Referral */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-bold text-sm mb-3">🎁 Refer & Earn ₹500</h3>
          <p className="text-xs text-muted-foreground mb-3">Share your code with friends. They get ₹250, you get ₹500 when they sign up!</p>
          <div className="flex gap-2 mb-3">
            <div className="flex-1 bg-muted rounded-lg px-4 py-2.5 font-mono font-bold text-center tracking-wider">{referral.code || '...'}</div>
            <Button variant="outline" onClick={() => { navigator.clipboard.writeText(referral.code); toast.success('Code copied!'); }}>Copy</Button>
          </div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Friends joined: <strong>{referral.referred_count}</strong></span>
            <span>Total earned: <strong>₹{referral.total_earned}</strong></span>
          </div>
        </CardContent>
      </Card>

      {/* Apply Code */}
      <Card>
        <CardContent className="p-5">
          <h3 className="font-bold text-sm mb-2">Have a referral code?</h3>
          <div className="flex gap-2">
            <Input placeholder="Enter code" value={refCode} onChange={e => setRefCode(e.target.value)} className="h-9" />
            <Button size="sm" onClick={applyCode}>Apply</Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      {wallet.transactions?.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="font-bold text-sm mb-3">Transaction History</h3>
            <div className="space-y-2">
              {wallet.transactions.map((t: any) => (
                <div key={t.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{t.description}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(t.created_at).toLocaleDateString('en-IN')}</p>
                  </div>
                  <span className={`font-bold text-sm ${t.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {t.amount > 0 ? '+' : ''}₹{Math.abs(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default Account;
