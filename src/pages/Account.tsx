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
import CustomerLayout from "@/components/CustomerLayout";
import ProductCard from "@/components/ProductCard";
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
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: (user as any)?.phone || '', address: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    fetchProducts();
    api.myOrders().then(setMyOrders).catch(() => {});
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
                <TabsTrigger value="profile" className="gap-1 text-xs"><User className="h-3 w-3" /> Profile</TabsTrigger>
                <TabsTrigger value="wishlist" className="gap-1 text-xs"><Heart className="h-3 w-3" /> Wishlist ({wishlistProducts.length})</TabsTrigger>
                <TabsTrigger value="password" className="gap-1 text-xs"><Lock className="h-3 w-3" /> Password</TabsTrigger>
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
            </Tabs>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default Account;
