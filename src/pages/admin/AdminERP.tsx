import { useState, useEffect } from "react";
import ERPLayout from "@/components/ERPLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Package, Users, Wrench, BarChart3, IndianRupee, Truck, ClipboardList, Wallet, UserCheck, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

const req = (path: string) =>
  fetch(`/api/erp${path}`, { headers: { Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` } }).then(r => r.json());

export default function AdminERP() {
  const [stats, setStats] = useState<any>({});
  const [invStats, setInvStats] = useState<any>({});
  const [branchCount, setBranchCount] = useState(0);
  const [pendingBilling, setPendingBilling] = useState(0);
  const [ecomStats, setEcomStats] = useState<any>({});

  useEffect(() => {
    const h = { Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` };
    req('/dashboard').then(d => setStats(d || {}));
    fetch('/api/inventory/stats', { headers: h }).then(r => r.json()).then(d => setInvStats(d || {}));
    req('/branches').then(d => setBranchCount(Array.isArray(d) ? d.filter((b: any) => b.is_active).length : 0));
    fetch('/api/erp/billing?status=pending', { headers: h }).then(r => r.json()).then(d => setPendingBilling(Array.isArray(d) ? d.length : 0));
    fetch('/api/reports/dashboard', { headers: h }).then(r => r.json()).then(d => setEcomStats(d || {}));
  }, []);

  const modules = [
    { title: "Job Cards", desc: "Repair tracking & billing", url: "/admin/erp/job-cards", icon: ClipboardList, stat: `${stats.pendingJobs || 0} pending`, color: "text-blue-600" },
    { title: "Sales CRM", desc: "Leads & follow-ups", url: "/admin/erp/crm", icon: Users, stat: "Track leads", color: "text-indigo-600" },
    { title: "Billing", desc: "GST invoices & payments", url: "/admin/erp/billing", icon: IndianRupee, stat: `${pendingBilling} pending`, color: "text-green-600" },
    { title: "Inventory", desc: "Stock & products", url: "/admin/inventory", icon: Package, stat: `${invStats.lowStock || 0} low stock`, color: "text-orange-600" },
    { title: "Suppliers", desc: "Vendor management", url: "/admin/inventory?tab=suppliers", icon: Truck, stat: `${invStats.totalSuppliers || 0} active`, color: "text-purple-600" },
    { title: "Purchase Orders", desc: "Stock procurement", url: "/admin/inventory?tab=po", icon: ClipboardList, stat: `${invStats.pendingPOs || 0} pending`, color: "text-yellow-600" },
    { title: "Expenses", desc: "Cost tracking", url: "/admin/erp/expenses", icon: Wallet, stat: `₹${(stats.monthExpenses || 0).toLocaleString('en-IN')} this month`, color: "text-red-600" },
    { title: "Staff", desc: "Team management", url: "/admin/erp/staff", icon: UserCheck, stat: `${stats.totalStaff || 0} members`, color: "text-teal-600" },
    { title: "Branches", desc: "Multi-branch ops", url: "/admin/erp/branches", icon: Building2, stat: `${branchCount} active`, color: "text-cyan-600" },
    { title: "ERP Reports", desc: "P&L & analytics", url: "/admin/erp/reports", icon: BarChart3, stat: "View insights", color: "text-pink-600" },
  ];

  return (
    <ERPLayout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-black">ERP Dashboard</h1>
        </div>

        {/* KPI Cards — ERP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Pending Jobs</p>
            <p className="text-2xl font-black text-blue-600">{stats.pendingJobs || 0}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Completed Today</p>
            <p className="text-2xl font-black text-green-600">{stats.completedToday || 0}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Month Revenue</p>
            <p className="text-xl font-black text-primary">₹{(stats.monthRevenue || 0).toLocaleString('en-IN')}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Net Profit</p>
            <p className={`text-xl font-black ${(stats.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ₹{(stats.netProfit || 0).toLocaleString('en-IN')}
            </p>
          </CardContent></Card>
        </div>

        {/* KPI Cards — Ecommerce */}
        {(ecomStats.totalOrders > 0 || ecomStats.todayOrders > 0) && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">🛒 Ecommerce</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card><CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Today's Orders</p>
                <p className="text-2xl font-black text-blue-600">{ecomStats.todayOrders || 0}</p>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Pending Orders</p>
                <p className="text-2xl font-black text-orange-600">{ecomStats.pendingOrders || 0}</p>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Month Sales</p>
                <p className="text-xl font-black text-green-600">₹{(ecomStats.monthRevenue || 0).toLocaleString('en-IN')}</p>
              </CardContent></Card>
              <Card><CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total Products</p>
                <p className="text-2xl font-black">{invStats.totalProducts || 0}</p>
              </CardContent></Card>
            </div>
          </div>
        )}

        {/* Alerts */}
        {(stats.pendingPayments > 0 || invStats.lowStock > 0) && (
          <div className="space-y-2">
            {stats.pendingPayments > 0 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0" />
                <span><strong>{stats.pendingPayments}</strong> completed jobs have pending payment</span>
                <Link to="/admin/erp/job-cards" className="ml-auto text-xs text-primary underline">View</Link>
              </div>
            )}
            {invStats.lowStock > 0 && (
              <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm">
                <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0" />
                <span><strong>{invStats.lowStock}</strong> products have low stock (≤5 units)</span>
                <Link to="/admin/inventory" className="ml-auto text-xs text-primary underline">View</Link>
              </div>
            )}
          </div>
        )}

        {/* Module Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {modules.map(m => (
            <Link key={m.url} to={m.url}>
              <Card className="hover:shadow-md transition-all hover:border-primary/30 cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center`}>
                      <m.icon className={`h-5 w-5 ${m.color}`} />
                    </div>
                  </div>
                  <p className="font-bold text-sm">{m.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                  <p className={`text-xs font-semibold mt-2 ${m.color}`}>{m.stat}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </ERPLayout>
  );
}
