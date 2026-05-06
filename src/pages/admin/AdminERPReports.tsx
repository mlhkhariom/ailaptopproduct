import { useState, useEffect } from "react";
import ERPLayout from "@/components/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, TrendingDown, RefreshCw, IndianRupee, Package, Wrench, Wallet, Users, Printer, FileText, TrendingUp as Forecast } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { api } from "@/lib/api";

const authFetch = (url: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` } }).then(r => r.json());

const today = () => new Date().toISOString().split('T')[0];
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString().split('T')[0];

export default function AdminERPReports() {
  const [preset, setPreset] = useState('month');
  const [from, setFrom] = useState(daysAgo(30));
  const [to, setTo] = useState(today());
  const [data, setData] = useState<any>({});
  const [gstData, setGstData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const applyPreset = (p: string) => {
    setPreset(p);
    if (p === 'week') { setFrom(daysAgo(7)); setTo(today()); }
    else if (p === 'month') { setFrom(daysAgo(30)); setTo(today()); }
    else if (p === 'quarter') { setFrom(daysAgo(90)); setTo(today()); }
    else if (p === 'year') { setFrom(daysAgo(365)); setTo(today()); }
    // 'custom' — user sets manually
  };

  const load = async () => {
    setLoading(true);
    try {
      const [erpDash, invStats, expenses, orders, jobCards, customInvoices, staff, techPerf] = await Promise.all([
        authFetch('/api/erp/dashboard'),
        authFetch('/api/inventory/stats'),
        authFetch(`/api/erp/expenses?from=${from}&to=${to}`),
        authFetch(`/api/orders?from=${from}&to=${to}`),
        authFetch(`/api/erp/job-cards?from=${from}&to=${to}`),
        authFetch(`/api/erp/billing?type=custom&from=${from}&to=${to}`),
        authFetch('/api/erp/staff'),
        authFetch(`/api/erp/technician-performance?from=${from}&to=${to}`),
      ]);

      const expTotal = Array.isArray(expenses) ? expenses.reduce((s: number, e: any) => s + (e.amount || 0), 0) : 0;
      const salaryCost = Array.isArray(staff) ? staff.reduce((s: number, m: any) => s + (m.salary || 0), 0) : 0;
      const orderRevenue = Array.isArray(orders) ? orders.filter((o: any) => o.payment_status === 'paid').reduce((s: number, o: any) => s + (o.total || 0), 0) : 0;
      const serviceRevenue = Array.isArray(jobCards) ? jobCards.filter((j: any) => j.payment_status === 'paid').reduce((s: number, j: any) => s + (j.total_charge || 0), 0) : 0;
      const customRevenue = Array.isArray(customInvoices) ? customInvoices.filter((c: any) => c.payment_status === 'paid').reduce((s: number, c: any) => s + (c.amount || 0), 0) : 0;
      const totalRevenue = orderRevenue + serviceRevenue + customRevenue;
      const totalExpenses = expTotal + salaryCost;
      const netProfit = totalRevenue - totalExpenses;

      // Expense by category
      const expByCategory: Record<string, number> = {};
      if (Array.isArray(expenses)) expenses.forEach((e: any) => { expByCategory[e.category] = (expByCategory[e.category] || 0) + e.amount; });
      if (salaryCost > 0) expByCategory['Salary (Staff)'] = salaryCost;

      // Job status breakdown
      const jobByStatus: Record<string, number> = {};
      if (Array.isArray(jobCards)) jobCards.forEach((j: any) => { jobByStatus[j.status] = (jobByStatus[j.status] || 0) + 1; });

      // Order status breakdown
      const orderByStatus: Record<string, number> = {};
      if (Array.isArray(orders)) orders.forEach((o: any) => { orderByStatus[o.status] = (orderByStatus[o.status] || 0) + 1; });

      setData({
        erpDash, invStats, expTotal, salaryCost, orderRevenue, serviceRevenue, customRevenue,
        totalRevenue, totalExpenses, netProfit, expByCategory, jobByStatus, orderByStatus,
        totalJobs: Array.isArray(jobCards) ? jobCards.length : 0,
        totalOrders: Array.isArray(orders) ? orders.length : 0,
        staffCount: Array.isArray(staff) ? staff.length : 0,
        techPerf: Array.isArray(techPerf) ? techPerf : [],
      });
      // GST + Forecast parallel
      const [gst, forecast] = await Promise.all([
        authFetch(`/api/erp/gst-report?from=${from}&to=${to}`),
        authFetch('/api/erp/forecast'),
      ]);
      setGstData(gst);
      setForecastData(forecast);
    } catch { }
    setLoading(false);
  };

  useEffect(() => { load(); }, [from, to]);

  const printReport = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>ERP Report</title>
<style>
  body{font-family:Arial,sans-serif;padding:30px;max-width:750px;margin:0 auto;color:#333}
  h1{color:#FF8000;font-size:20px;margin-bottom:4px}
  .period{font-size:12px;color:#666;margin-bottom:20px}
  table{width:100%;border-collapse:collapse;margin-bottom:20px}
  th{background:#FF8000;color:#fff;padding:8px 12px;text-align:left;font-size:12px}
  td{padding:8px 12px;font-size:12px;border-bottom:1px solid #eee}
  .green{color:#2e7d32;font-weight:700} .red{color:#c62828;font-weight:700}
  .total td{font-weight:800;font-size:14px;border-top:2px solid #FF8000}
  @media print{button{display:none}}
</style></head><body>
<h1>💻 AI Laptop Wala — ERP Report</h1>
<p class="period">Period: ${from} to ${to}</p>
<table>
  <tr><th colspan="2">Revenue</th></tr>
  <tr><td>Product Sales</td><td class="green">₹${(data.orderRevenue || 0).toLocaleString('en-IN')}</td></tr>
  <tr><td>Service Revenue</td><td class="green">₹${(data.serviceRevenue || 0).toLocaleString('en-IN')}</td></tr>
  <tr><td>Custom Invoices</td><td class="green">₹${(data.customRevenue || 0).toLocaleString('en-IN')}</td></tr>
  <tr class="total"><td>Total Revenue</td><td class="green">₹${(data.totalRevenue || 0).toLocaleString('en-IN')}</td></tr>
</table>
<table>
  <tr><th colspan="2">Expenses</th></tr>
  <tr><td>Operating Expenses</td><td class="red">₹${(data.expTotal || 0).toLocaleString('en-IN')}</td></tr>
  <tr><td>Staff Salary</td><td class="red">₹${(data.salaryCost || 0).toLocaleString('en-IN')}</td></tr>
  <tr class="total"><td>Total Expenses</td><td class="red">₹${(data.totalExpenses || 0).toLocaleString('en-IN')}</td></tr>
</table>
<table>
  <tr><th colspan="2">Net Profit / Loss</th></tr>
  <tr class="total"><td>Net Profit</td><td class="${(data.netProfit || 0) >= 0 ? 'green' : 'red'}">₹${(data.netProfit || 0).toLocaleString('en-IN')}</td></tr>
</table>
<br><button onclick="window.print()" style="background:#FF8000;color:#fff;border:none;padding:10px 24px;border-radius:6px;cursor:pointer">🖨️ Print Report</button>
</body></html>`);
    win.document.close();
  };

  const kpis = [
    { label: 'Total Revenue', value: `₹${(data.totalRevenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-green-600', sub: `Orders ₹${(data.orderRevenue || 0).toLocaleString('en-IN')} + Service ₹${(data.serviceRevenue || 0).toLocaleString('en-IN')} + Custom ₹${(data.customRevenue || 0).toLocaleString('en-IN')}` },
    { label: 'Total Expenses', value: `₹${(data.totalExpenses || 0).toLocaleString('en-IN')}`, icon: Wallet, color: 'text-red-600', sub: `Ops ₹${(data.expTotal || 0).toLocaleString('en-IN')} + Salary ₹${(data.salaryCost || 0).toLocaleString('en-IN')}` },
    { label: 'Net Profit', value: `₹${(data.netProfit || 0).toLocaleString('en-IN')}`, icon: (data.netProfit || 0) >= 0 ? TrendingUp : TrendingDown, color: (data.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600', sub: `Margin: ${data.totalRevenue ? Math.round((data.netProfit / data.totalRevenue) * 100) : 0}%` },
    { label: 'Job Cards', value: data.totalJobs || 0, icon: Wrench, color: 'text-blue-600', sub: `Pending: ${data.jobByStatus?.pending || 0} | Done: ${data.jobByStatus?.completed || 0}` },
    { label: 'Orders', value: data.totalOrders || 0, icon: Package, color: 'text-purple-600', sub: `Delivered: ${data.orderByStatus?.delivered || 0}` },
    { label: 'Inventory Value', value: `₹${(data.invStats?.totalValue || 0).toLocaleString('en-IN')}`, icon: Package, color: 'text-orange-600', sub: `${data.invStats?.inStock || 0} in stock, ${data.invStats?.lowStock || 0} low` },
  ];

  return (
    <ERPLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-xl font-black flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" /> ERP Reports
          </h1>
          <div className="flex gap-2 flex-wrap items-center">
            {/* Preset buttons */}
            {['week', 'month', 'quarter', 'year', 'custom'].map(p => (
              <button key={p} onClick={() => applyPreset(p)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${preset === p ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50'}`}>
                {p === 'week' ? '7D' : p === 'month' ? '30D' : p === 'quarter' ? '90D' : p === 'year' ? '1Y' : 'Custom'}
              </button>
            ))}
            <Button size="sm" variant="outline" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button size="sm" variant="outline" onClick={printReport}>
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
          </div>
        </div>

        {/* Custom date range */}
        {preset === 'custom' && (
          <div className="flex gap-2 items-center flex-wrap border rounded-lg p-3 bg-muted/30">
            <span className="text-xs font-medium">From:</span>
            <Input type="date" className="h-8 text-xs w-36" value={from} onChange={e => setFrom(e.target.value)} />
            <span className="text-xs font-medium">To:</span>
            <Input type="date" className="h-8 text-xs w-36" value={to} onChange={e => setTo(e.target.value)} />
            <Button size="sm" className="h-8" onClick={load}>Apply</Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground">Period: <strong>{from}</strong> → <strong>{to}</strong></p>

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

        {/* P&L Statement */}
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Profit & Loss Statement</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Product Sales</span><span className="font-semibold text-green-600">+ ₹{(data.orderRevenue || 0).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Service Revenue</span><span className="font-semibold text-green-600">+ ₹{(data.serviceRevenue || 0).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Custom Invoices</span><span className="font-semibold text-green-600">+ ₹{(data.customRevenue || 0).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-sm font-bold border-t pt-2"><span>Total Revenue</span><span className="text-green-600">₹{(data.totalRevenue || 0).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-sm mt-2"><span className="text-muted-foreground">Operating Expenses</span><span className="font-semibold text-red-600">- ₹{(data.expTotal || 0).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Staff Salary</span><span className="font-semibold text-red-600">- ₹{(data.salaryCost || 0).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-sm font-bold border-t pt-2"><span>Total Expenses</span><span className="text-red-600">₹{(data.totalExpenses || 0).toLocaleString('en-IN')}</span></div>
              <div className={`flex justify-between text-base font-black border-t-2 pt-3 ${(data.netProfit || 0) >= 0 ? 'border-green-500' : 'border-red-500'}`}>
                <span>Net {(data.netProfit || 0) >= 0 ? 'Profit' : 'Loss'}</span>
                <span className={(data.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                  ₹{Math.abs(data.netProfit || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        {Object.keys(data.expByCategory || {}).length > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            {/* Bar chart */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Expense by Category</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={Object.entries(data.expByCategory || {}).sort(([,a]:any,[,b]:any) => b-a).slice(0,6).map(([cat,amt]) => ({ cat, amt }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="cat" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Amount']} />
                    <Bar dataKey="amt" fill="#ef4444" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie chart — Revenue split */}
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Revenue Split</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Product Sales', value: data.orderRevenue || 0 },
                        { name: 'Service', value: data.serviceRevenue || 0 },
                        { name: 'Custom', value: data.customRevenue || 0 },
                      ].filter(d => d.value > 0)}
                      cx="50%" cy="50%" outerRadius={70}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {['#FF8000','#3b82f6','#8b5cf6'].map((color, i) => <Cell key={i} fill={color} />)}
                    </Pie>
                    <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString('en-IN')}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Job + Order breakdown */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Job Cards by Status</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.jobByStatus || {}).map(([status, count]: any) => (
                  <div key={status} className="flex justify-between text-xs">
                    <span className="capitalize text-muted-foreground">{status.replace('_', ' ')}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))}
                {!Object.keys(data.jobByStatus || {}).length && <p className="text-xs text-muted-foreground">No data</p>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Orders by Status</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(data.orderByStatus || {}).map(([status, count]: any) => (
                  <div key={status} className="flex justify-between text-xs">
                    <span className="capitalize text-muted-foreground">{status}</span>
                    <span className="font-bold">{count}</span>
                  </div>
                ))}
                {!Object.keys(data.orderByStatus || {}).length && <p className="text-xs text-muted-foreground">No data</p>}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Technician Performance</CardTitle></CardHeader>
            <CardContent className="p-0">
              {(data.techPerf || []).length === 0
                ? <p className="text-xs text-muted-foreground text-center py-4">No data</p>
                : (data.techPerf || []).map((t: any, i: number) => (
                  <div key={t.technician} className="flex items-center gap-3 px-4 py-2.5 border-t first:border-t-0">
                    <span className="text-sm font-black text-muted-foreground w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{t.technician}</p>
                      <p className="text-xs text-muted-foreground">{t.completed}/{t.total_jobs} done · {Math.round(t.avg_hours || 0)}h avg</p>
                    </div>
                    <span className="text-sm font-bold text-green-600">₹{(t.revenue || 0).toLocaleString('en-IN')}</span>
                  </div>
                ))
              }
            </CardContent>
          </Card>
        </div>

        {/* GST Report */}
        {gstData && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> GST Summary — {gstData.period?.from} to {gstData.period?.to}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { label: 'Total GST Collected', value: `₹${(gstData.summary?.totalGST || 0).toLocaleString('en-IN')}`, color: 'text-primary' },
                  { label: 'CGST (9%)', value: `₹${(gstData.summary?.cgst || 0).toLocaleString('en-IN')}`, color: 'text-blue-600' },
                  { label: 'SGST (9%)', value: `₹${(gstData.summary?.sgst || 0).toLocaleString('en-IN')}`, color: 'text-purple-600' },
                  { label: 'GST Invoices', value: (gstData.services?.count || 0) + (gstData.customs?.count || 0), color: 'text-green-600' },
                ].map(k => (
                  <div key={k.label} className="border rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                    <p className={`text-xl font-black ${k.color}`}>{k.value}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Product Sales (B2C)</span><span className="font-medium">{gstData.orders?.count || 0} invoices · ₹{(gstData.orders?.total || 0).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between py-1 border-b"><span className="text-muted-foreground">Service (GST enabled)</span><span className="font-medium">{gstData.services?.count || 0} invoices · GST ₹{(gstData.services?.gst || 0).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between py-1"><span className="text-muted-foreground">Custom Invoices (GST enabled)</span><span className="font-medium">{gstData.customs?.count || 0} invoices · GST ₹{(gstData.customs?.gst || 0).toLocaleString('en-IN')}</span></div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sales Forecast */}
        {forecastData && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-600" /> Sales Forecast (Next 4 Weeks)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Avg Weekly Revenue</p>
                  <p className="text-xl font-black text-primary">₹{(forecastData.avgWeeklyRevenue || 0).toLocaleString('en-IN')}</p>
                </div>
                <div className="border rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Pipeline Value (CRM)</p>
                  <p className="text-xl font-black text-blue-600">₹{(forecastData.pipelineValue || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={forecastData.forecast || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Predicted']} />
                  <Bar dataKey="predicted" fill="#FF8000" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

      </div>
    </ERPLayout>
  );
}
