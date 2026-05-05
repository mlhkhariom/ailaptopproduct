import { useState, useEffect } from "react";
import ERPLayout from "@/components/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Package, Users, Wrench, BarChart3, IndianRupee, Truck, ClipboardList, Wallet, UserCheck, TrendingUp, TrendingDown, AlertTriangle, ShoppingCart, ArrowRight, Cpu, DollarSign, Box } from "lucide-react";
import { Link } from "react-router-dom";

const req = (path: string) =>
  fetch(`/api/erp${path}`, { headers: { Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` } }).then(r => r.json());

const MODULE_GROUPS = [
  {
    label: "Operations",
    icon: Cpu,
    color: "border-blue-200 bg-blue-50/50",
    modules: [
      { title: "Job Cards", desc: "Repair tracking", url: "/admin/erp/job-cards", icon: ClipboardList, statKey: "pendingJobs", statLabel: "pending", color: "text-blue-600", bg: "bg-blue-100" },
      { title: "Sales CRM", desc: "Leads & follow-ups", url: "/admin/erp/crm", icon: Users, statKey: "crmLeads", statLabel: "leads", color: "text-indigo-600", bg: "bg-indigo-100" },
      { title: "Services", desc: "Bookings", url: "/admin/services", icon: Wrench, statKey: null, statLabel: "manage", color: "text-cyan-600", bg: "bg-cyan-100" },
    ],
  },
  {
    label: "Finance",
    icon: DollarSign,
    color: "border-green-200 bg-green-50/50",
    modules: [
      { title: "Billing", desc: "GST invoices", url: "/admin/erp/billing", icon: IndianRupee, statKey: "pendingPayments", statLabel: "pending", color: "text-green-600", bg: "bg-green-100" },
      { title: "Expenses", desc: "Cost tracking", url: "/admin/erp/expenses", icon: Wallet, statKey: "monthExpenses", statLabel: "this month", color: "text-red-600", bg: "bg-red-100", currency: true },
      { title: "ERP Reports", desc: "P&L analytics", url: "/admin/erp/reports", icon: BarChart3, statKey: null, statLabel: "view", color: "text-pink-600", bg: "bg-pink-100" },
    ],
  },
  {
    label: "People",
    icon: UserCheck,
    color: "border-purple-200 bg-purple-50/50",
    modules: [
      { title: "Staff", desc: "Team management", url: "/admin/erp/staff", icon: UserCheck, statKey: "totalStaff", statLabel: "members", color: "text-teal-600", bg: "bg-teal-100" },
      { title: "Branches", desc: "Multi-branch ops", url: "/admin/erp/branches", icon: Building2, statKey: "branchCount", statLabel: "active", color: "text-cyan-600", bg: "bg-cyan-100" },
    ],
  },
  {
    label: "Procurement",
    icon: Box,
    color: "border-orange-200 bg-orange-50/50",
    modules: [
      { title: "Inventory", desc: "Stock & products", url: "/admin/inventory", icon: Package, statKey: "lowStock", statLabel: "low stock", color: "text-orange-600", bg: "bg-orange-100" },
      { title: "Suppliers", desc: "Vendor management", url: "/admin/inventory?tab=suppliers", icon: Truck, statKey: "totalSuppliers", statLabel: "active", color: "text-purple-600", bg: "bg-purple-100" },
      { title: "Purchase Orders", desc: "Procurement", url: "/admin/inventory?tab=po", icon: ShoppingCart, statKey: "pendingPOs", statLabel: "pending", color: "text-yellow-600", bg: "bg-yellow-100" },
    ],
  },
];

export default function AdminERP() {
  const [stats, setStats] = useState<any>({});
  const [invStats, setInvStats] = useState<any>({});
  const [branchCount, setBranchCount] = useState(0);
  const [pendingBilling, setPendingBilling] = useState(0);
  const [ecomStats, setEcomStats] = useState<any>({});
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);

  useEffect(() => {
    const h = { Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` };
    req('/dashboard').then(d => setStats(d || {}));
    fetch('/api/inventory/stats', { headers: h }).then(r => r.json()).then(d => setInvStats(d || {}));
    req('/branches').then(d => setBranchCount(Array.isArray(d) ? d.filter((b: any) => b.is_active).length : 0));
    fetch('/api/erp/billing?status=pending', { headers: h }).then(r => r.json()).then(d => setPendingBilling(Array.isArray(d) ? d.length : 0));
    fetch('/api/reports/dashboard', { headers: h }).then(r => r.json()).then(d => setEcomStats(d || {}));
    req('/job-cards').then(d => setRecentJobs(Array.isArray(d) ? d.slice(0, 5) : []));
    req('/leads?status=all').then(d => setRecentLeads(Array.isArray(d) ? d.slice(0, 5) : []));
  }, []);

  const allStats: Record<string, any> = {
    pendingJobs: stats.pendingJobs || 0,
    crmLeads: recentLeads.length,
    pendingPayments: pendingBilling,
    monthExpenses: stats.monthExpenses || 0,
    totalStaff: stats.totalStaff || 0,
    branchCount,
    lowStock: invStats.lowStock || 0,
    totalSuppliers: invStats.totalSuppliers || 0,
    pendingPOs: invStats.pendingPOs || 0,
  };

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    new: 'bg-gray-100 text-gray-700',
    contacted: 'bg-blue-100 text-blue-700',
    interested: 'bg-yellow-100 text-yellow-700',
    won: 'bg-green-100 text-green-700',
    lost: 'bg-red-100 text-red-700',
  };

  return (
    <ERPLayout>
      <div className="space-y-6 max-w-6xl mx-auto">

        {/* Top KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pending Jobs', value: stats.pendingJobs || 0, color: 'text-blue-600', icon: ClipboardList, url: '/admin/erp/job-cards' },
            { label: 'Completed Today', value: stats.completedToday || 0, color: 'text-green-600', icon: TrendingUp, url: '/admin/erp/job-cards' },
            { label: 'Month Revenue', value: `₹${(stats.monthRevenue || 0).toLocaleString('en-IN')}`, color: 'text-primary', icon: IndianRupee, url: '/admin/erp/reports' },
            { label: 'Net Profit', value: `₹${(stats.netProfit || 0).toLocaleString('en-IN')}`, color: (stats.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600', icon: (stats.netProfit || 0) >= 0 ? TrendingUp : TrendingDown, url: '/admin/erp/reports' },
          ].map(k => (
            <Link key={k.label} to={k.url}>
              <Card className="hover:shadow-md transition-all hover:border-primary/30 cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{k.label}</p>
                      <p className={`text-3xl font-black mt-1 ${k.color}`}>{k.value}</p>
                    </div>
                    <k.icon className={`h-10 w-10 opacity-15 ${k.color}`} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Ecommerce KPIs */}
        {(ecomStats.totalOrders > 0 || ecomStats.todayOrders > 0) && (
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" /> Ecommerce Today
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Today's Orders", value: ecomStats.todayOrders || 0, color: 'text-blue-600', url: '/admin/orders' },
                { label: 'Pending Orders', value: ecomStats.pendingOrders || 0, color: 'text-orange-600', url: '/admin/orders' },
                { label: 'Month Sales', value: `₹${(ecomStats.monthRevenue || 0).toLocaleString('en-IN')}`, color: 'text-green-600', url: '/admin/reports' },
                { label: 'Low Stock', value: invStats.lowStock || 0, color: 'text-red-600', url: '/admin/inventory' },
              ].map(k => (
                <Link key={k.label} to={k.url}>
                  <div className="border rounded-xl p-5 hover:shadow-sm transition-all hover:border-primary/30 bg-card cursor-pointer">
                    <p className="text-sm text-muted-foreground">{k.label}</p>
                    <p className={`text-3xl font-black mt-1 ${k.color}`}>{k.value}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Alerts */}
        {(pendingBilling > 0 || invStats.lowStock > 0) && (
          <div className="space-y-2">
            {pendingBilling > 0 && (
              <Link to="/admin/erp/billing">
                <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm hover:bg-yellow-100 transition-colors">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
                  <span className="font-medium"><strong>{pendingBilling}</strong> invoices have pending payment</span>
                  <ArrowRight className="ml-auto h-4 w-4 text-yellow-600" />
                </div>
              </Link>
            )}
            {invStats.lowStock > 0 && (
              <Link to="/admin/inventory">
                <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm hover:bg-orange-100 transition-colors">
                  <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0" />
                  <span className="font-medium"><strong>{invStats.lowStock}</strong> products have low stock (≤5 units)</span>
                  <ArrowRight className="ml-auto h-4 w-4 text-orange-600" />
                </div>
              </Link>
            )}
          </div>
        )}

        {/* Module Groups */}
        <div className="space-y-5">
          {MODULE_GROUPS.map(group => (
            <div key={group.label}>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                <group.icon className="h-4 w-4" />{group.label}
              </p>
              <div className={`border rounded-xl p-4 ${group.color}`}>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {group.modules.map(m => {
                    const statVal = m.statKey ? allStats[m.statKey] : null;
                    const display = statVal !== null
                      ? (m.currency ? `₹${Number(statVal).toLocaleString('en-IN')}` : statVal)
                      : m.statLabel;
                    return (
                      <Link key={m.url} to={m.url}>
                        <div className="bg-white rounded-xl p-4 hover:shadow-md transition-all border border-transparent hover:border-primary/20 cursor-pointer">
                          <div className={`h-10 w-10 rounded-xl ${m.bg} flex items-center justify-center mb-3`}>
                            <m.icon className={`h-5 w-5 ${m.color}`} />
                          </div>
                          <p className="font-bold text-base">{m.title}</p>
                          <p className="text-sm text-muted-foreground mt-0.5">{m.desc}</p>
                          <p className={`text-sm font-semibold mt-2 ${m.color}`}>
                            {m.statKey ? `${display} ${m.statLabel}` : m.statLabel}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Job Cards</CardTitle>
              <Link to="/admin/erp/job-cards" className="text-sm text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
            </CardHeader>
            <CardContent className="p-0">
              {recentJobs.length === 0
                ? <p className="text-sm text-muted-foreground text-center py-8">No job cards yet</p>
                : recentJobs.map(j => (
                  <div key={j.id} className="flex items-center gap-3 px-5 py-3 border-t first:border-t-0 hover:bg-muted/30">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{j.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{j.device_brand} {j.device_model} · {j.booking_number}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_COLORS[j.status] || 'bg-gray-100 text-gray-700'}`}>
                      {j.status?.replace('_', ' ')}
                    </span>
                  </div>
                ))
              }
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Leads</CardTitle>
              <Link to="/admin/erp/crm" className="text-sm text-primary hover:underline flex items-center gap-1">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
            </CardHeader>
            <CardContent className="p-0">
              {recentLeads.length === 0
                ? <p className="text-sm text-muted-foreground text-center py-8">No leads yet</p>
                : recentLeads.map(l => (
                  <div key={l.id} className="flex items-center gap-3 px-5 py-3 border-t first:border-t-0 hover:bg-muted/30">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{l.source} · {l.interest || 'No interest noted'}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_COLORS[l.status] || 'bg-gray-100 text-gray-700'}`}>
                      {l.status}
                    </span>
                  </div>
                ))
              }
            </CardContent>
          </Card>
        </div>
      </div>
    </ERPLayout>
  );
}
