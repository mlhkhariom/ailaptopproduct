import { useState, useEffect } from "react";
import { Search, Download, Phone, Mail, ShoppingBag, IndianRupee, Eye, RefreshCw, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewCustomer, setViewCustomer] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    try { setCustomers(await api.getCustomers()); }
    catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (c: any) => {
    await api.updateCustomer(c.id, { is_active: !c.is_active, role: c.role });
    toast.success(c.is_active ? 'Customer deactivated' : 'Customer activated');
    load();
  };

  const filtered = customers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const totalLTV = customers.reduce((s, c) => s + (c.total_spent || 0), 0);
  const totalOrders = customers.reduce((s, c) => s + (c.order_count || 0), 0);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Customers</h1>
          <p className="text-sm text-muted-foreground">{customers.length} registered customers</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={load}>
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{customers.length}</p><p className="text-xs text-muted-foreground">Total Customers</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">₹{totalLTV.toLocaleString()}</p><p className="text-xs text-muted-foreground">Total Revenue</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">₹{customers.length ? Math.round(totalLTV / customers.length).toLocaleString() : 0}</p><p className="text-xs text-muted-foreground">Avg. LTV</p></CardContent></Card>
        <Card><CardContent className="p-3 text-center"><p className="text-2xl font-bold">{totalOrders}</p><p className="text-xs text-muted-foreground">Total Orders</p></CardContent></Card>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name, email, phone..." className="pl-8 h-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground"><RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No customers found</div>
          ) : (
            <div className="divide-y">
              {filtered.map(c => (
                <div key={c.id} className="p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                      {c.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">{c.name}</p>
                        <Badge className={`text-[10px] ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {c.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>
                        {c.phone && <span className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone}</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold">₹{(c.total_spent || 0).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{c.order_count || 0} orders</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setViewCustomer(c)}><Eye className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => toggleActive(c)}>
                        {c.is_active ? <UserX className="h-3.5 w-3.5 text-red-500" /> : <UserCheck className="h-3.5 w-3.5 text-green-500" />}
                      </Button>
                      <a href={`https://wa.me/${c.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600"><Phone className="h-3.5 w-3.5" /></Button>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Customer Dialog */}
      <Dialog open={!!viewCustomer} onOpenChange={() => setViewCustomer(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Customer Details</DialogTitle></DialogHeader>
          {viewCustomer && (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                  {viewCustomer.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-base">{viewCustomer.name}</p>
                  <Badge className={`text-[10px] ${viewCustomer.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {viewCustomer.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 bg-muted/30 rounded-lg p-3">
                <div><p className="text-xs text-muted-foreground">Email</p><p className="font-medium text-xs">{viewCustomer.email}</p></div>
                <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium text-xs">{viewCustomer.phone || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Total Orders</p><p className="font-bold text-lg">{viewCustomer.order_count || 0}</p></div>
                <div><p className="text-xs text-muted-foreground">Total Spent</p><p className="font-bold text-lg text-primary">₹{(viewCustomer.total_spent || 0).toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Joined</p><p className="text-xs">{new Date(viewCustomer.created_at).toLocaleDateString('en-IN')}</p></div>
                <div><p className="text-xs text-muted-foreground">Role</p><p className="text-xs capitalize">{viewCustomer.role}</p></div>
              </div>
              <div className="flex gap-2">
                <a href={`mailto:${viewCustomer.email}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs"><Mail className="h-3.5 w-3.5" /> Email</Button>
                </a>
                <a href={`https://wa.me/${viewCustomer.phone?.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs text-green-600"><Phone className="h-3.5 w-3.5" /> WhatsApp</Button>
                </a>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCustomers;
