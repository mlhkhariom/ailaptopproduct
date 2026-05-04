import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, TrendingDown, RefreshCw, IndianRupee, Package, Wrench, Wallet } from "lucide-react";

const authFetch = (url: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` } }).then(r => r.json());

export default function AdminERPReports() {
  const [period, setPeriod] = useState('month');
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
    const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    const [erpDash, invStats, expenses, orders, jobCards] = await Promise.all([
      authFetch('/api/erp/dashboard'),
      authFetch('/api/inventory/stats'),
      authFetch(`/api/erp/expenses?from=${from}&to=${today}`),
      authFetch(`/api/orders?from=${from}&to=${today}`),
      authFetch(`/api/erp/job-cards`),
    ]);

    const expTotal = Array.isArray(expenses) ? expenses.reduce((s: number, e: any) => s + (e.amount || 0), 0) : 0;
    const orderRevenue = Array.isArray(orders) ? orders.filter((o: any) => o.payment_status === 'paid').reduce((s: number, o: any) => s + (o.total || 0), 0) : 0;
    const serviceRevenue = Array.isArray(jobCards) ? jobCards.filter((j: any) => j.payment_status === 'paid').reduce((s: number, j: any) => s + (j.total_charge || 0), 0) : 0;
    const totalRevenue = orderRevenue + serviceRevenue;

    // Category breakdown for expenses
    const expByCategory: Record<string, number> = {};
    if (Array.isArray(expenses)) {
      expenses.forEach((e: any) => { expByCategory[e.category] = (expByCategory[e.category] || 0) + e.amount; });
    }

    // Job status breakdown
    const jobByStatus: Record<string, number> = {};
    if (Array.isArray(jobCards)) {
      jobCards.forEach((j: any) => { jobByStatus[j.status] = (jobByStatus[j.status] || 0) + 1; });
    }

    setData({ erpDash, invStats, expTotal, orderRevenue, serviceRevenue, totalRevenue, netProfit: totalRevenue - expTotal, expByCategory, jobByStatus, totalJobs: Array.isArray(jobCards) ? jobCards.length : 0 });
    setLoading(false);
  };

  useEffect(() => { load(); }, [period]);

  const kpis = [
    { label: 'Total Revenue', value: `₹${(data.totalRevenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-green-600', sub: `Orders: ₹${(data.orderRevenue || 0).toLocaleString('en-IN')} + Service: ₹${(data.serviceRevenue || 0).toLocaleString('en-IN')}` },
    { label: 'Total Expenses', value: `₹${(data.expTotal || 0).toLocaleString('en-IN')}`, icon: Wallet, color: 'text-red-600', sub: 'All categories' },
    { label: 'Net Profit', value: `₹${(data.netProfit || 0).toLocaleString('en-IN')}`, icon: (data.netProfit || 0) >= 0 ? TrendingUp : TrendingDown, color: (data.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600', sub: `Margin: ${data.totalRevenue ? Math.round((data.netProfit / data.totalRevenue) * 100) : 0}%` },
    { label: 'Total Job Cards', value: data.totalJobs || 0, icon: Wrench, color: 'text-blue-600', sub: `Pending: ${data.jobByStatus?.pending || 0} | Done: ${data.jobByStatus?.completed || 0}` },
    { label: 'Inventory Value', value: `₹${(data.invStats?.totalValue || 0).toLocaleString('en-IN')}`, icon: Package, color: 'text-purple-600', sub: `${data.invStats?.inStock || 0} in stock, ${data.invStats?.lowStock || 0} low` },
  ];

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-xl font-black flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> ERP Reports</h1>
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="h-8 w-32 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
                <SelectItem value="quarter">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline" onClick={load} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {kpis.map(k => (
            <Card key={k.label}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                    <p className={`text-xl font-black ${k.color}`}>{k.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</p>
                  </div>
                  <k.icon className={`h-8 w-8 opacity-20 ${k.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* P&L Summary */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Profit & Loss Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span>Product Sales Revenue</span><span className="font-bold text-green-600">+ ₹{(data.orderRevenue || 0).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-sm"><span>Service Revenue</span><span className="font-bold text-green-600">+ ₹{(data.serviceRevenue || 0).toLocaleString('en-IN')}</span></div>
              <div className="border-t pt-2 flex justify-between text-sm font-bold"><span>Total Revenue</span><span className="text-green-600">₹{(data.totalRevenue || 0).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-sm"><span>Total Expenses</span><span className="font-bold text-red-600">- ₹{(data.expTotal || 0).toLocaleString('en-IN')}</span></div>
              <div className="border-t pt-2 flex justify-between text-base font-black">
                <span>Net Profit</span>
                <span className={(data.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>₹{(data.netProfit || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        {Object.keys(data.expByCategory || {}).length > 0 && (
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Expense Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.expByCategory || {}).sort(([,a]: any, [,b]: any) => b - a).map(([cat, amt]: any) => (
                  <div key={cat} className="flex items-center gap-2">
                    <span className="text-xs w-24 shrink-0">{cat}</span>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div className="bg-red-400 h-2 rounded-full" style={{ width: `${Math.min(100, (amt / (data.expTotal || 1)) * 100)}%` }} />
                    </div>
                    <span className="text-xs font-bold w-20 text-right">₹{amt.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
