import { useState, useEffect } from "react";
import { Search, Download, IndianRupee, CreditCard, Smartphone, Banknote, TrendingUp, CheckCircle, XCircle, Clock, ArrowUpRight, ArrowDownRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/AdminLayout";
import { api } from "@/lib/api";

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  captured: { label: "Captured", color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700 border-yellow-300", icon: Clock },
  failed: { label: "Failed", color: "bg-red-100 text-red-700 border-red-300", icon: XCircle },
  refunded: { label: "Refunded", color: "bg-blue-100 text-blue-700 border-blue-300", icon: ArrowDownRight },
};

const AdminPayments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  useEffect(() => {
    Promise.all([
      api.getOrders(),
      api.getBilling({ type: 'service' }),
    ]).then(([orders, services]: [any[], any[]]) => {
      const rows = [
        ...orders.map((o: any) => ({
          id: o.razorpay_id || o.payment_id || `COD-${o.order_number}`,
          orderId: o.order_number, customer: o.customer_name || 'Customer',
          amount: o.total, method: o.payment_method || 'COD',
          type: o.payment_method === 'COD' ? 'Cash' : 'Online',
          status: o.payment_status === 'paid' ? 'captured' : o.payment_status || 'pending',
          date: new Date(o.created_at).toLocaleDateString('en-IN'),
          time: new Date(o.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          stream: 'order',
        })),
        ...services.map((s: any) => ({
          id: s.invoice_number,
          orderId: s.invoice_number, customer: s.customer_name || 'Customer',
          amount: s.amount, method: s.payment_method || 'Cash',
          type: 'Service', stream: 'service',
          status: s.payment_status === 'paid' ? 'captured' : s.payment_status || 'pending',
          date: new Date(s.created_at).toLocaleDateString('en-IN'),
          time: new Date(s.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        })),
      ];
      rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPayments(rows);
    }).catch(() => {});
  }, []);

  const filtered = payments
    .filter((p) => statusFilter === "all" || p.status === statusFilter)
    .filter((p) => methodFilter === "all" || p.method === methodFilter)
    .filter((p) => p.customer.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()) || p.orderId.toLowerCase().includes(search.toLowerCase()));

  const totalCaptured = payments.filter(p => p.status === "captured").reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const totalFailed = payments.filter(p => p.status === "failed").reduce((s, p) => s + p.amount, 0);
  const totalRefunded = payments.filter(p => p.status === "refunded").reduce((s, p) => s + p.amount, 0);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold">Payment Tracking</h1>
          <p className="text-sm text-muted-foreground">Monitor all transactions — Razorpay, UPI, COD</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8"><Download className="h-3.5 w-3.5" /> Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center"><ArrowUpRight className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-xs text-muted-foreground">Captured</p><p className="text-xl font-bold text-green-700">₹{totalCaptured.toLocaleString()}</p></div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center"><Clock className="h-5 w-5 text-yellow-600" /></div>
            <div><p className="text-xs text-muted-foreground">Pending (COD)</p><p className="text-xl font-bold text-yellow-700">₹{totalPending.toLocaleString()}</p></div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center"><XCircle className="h-5 w-5 text-red-600" /></div>
            <div><p className="text-xs text-muted-foreground">Failed</p><p className="text-xl font-bold text-red-700">₹{totalFailed.toLocaleString()}</p></div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center"><ArrowDownRight className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-xs text-muted-foreground">Refunded</p><p className="text-xl font-bold text-blue-700">₹{totalRefunded.toLocaleString()}</p></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <Tabs defaultValue="all">
              <TabsList className="h-8">
                {["all", "captured", "pending", "failed", "refunded"].map((s) => (
                  <TabsTrigger key={s} value={s} className="text-xs h-7 px-3 capitalize" onClick={() => setStatusFilter(s)}>
                    {s === "all" ? `All (${payments.length})` : `${s} (${payments.filter(p => p.status === s).length})`}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="flex gap-2">
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="h-8 w-32 text-xs"><SelectValue placeholder="Method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Methods</SelectItem>
                  <SelectItem value="Razorpay" className="text-xs">Razorpay</SelectItem>
                  <SelectItem value="COD" className="text-xs">COD</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search..." className="pl-8 h-8 text-xs w-48" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/30 text-left">
                <th className="p-3 text-xs font-medium text-muted-foreground">Transaction ID</th>
                <th className="p-3 text-xs font-medium text-muted-foreground">Order</th>
                <th className="p-3 text-xs font-medium text-muted-foreground">Customer</th>
                <th className="p-3 text-xs font-medium text-muted-foreground">Amount</th>
                <th className="p-3 text-xs font-medium text-muted-foreground">Method</th>
                <th className="p-3 text-xs font-medium text-muted-foreground">Type</th>
                <th className="p-3 text-xs font-medium text-muted-foreground">Status</th>
                <th className="p-3 text-xs font-medium text-muted-foreground">Date & Time</th>              </tr></thead>
              <tbody>
                {filtered.map((p) => {
                  const sc = statusConfig[p.status];
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="p-3 text-xs font-mono">{p.id}</td>
                      <td className="p-3 text-xs font-bold">{p.orderId}</td>
                      <td className="p-3 text-sm">{p.customer}</td>
                      <td className="p-3 font-bold">₹{p.amount.toLocaleString()}</td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px]">
                          {p.method === "Razorpay" ? <CreditCard className="h-3 w-3 mr-1" /> : <Banknote className="h-3 w-3 mr-1" />}
                          {p.method}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs">{p.type}</td>                      <td className="p-3">
                        <Badge variant="outline" className={`text-[10px] ${sc.color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" /> {sc.label}
                        </Badge>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{p.date}<br /><span className="text-[10px]">{p.time}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t text-xs text-muted-foreground">
            Showing {filtered.length} of {payments.length} transactions
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminPayments;
