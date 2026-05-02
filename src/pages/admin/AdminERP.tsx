import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Package, Users, ShoppingBag, Wrench, BarChart3, IndianRupee, Truck, ClipboardList, Settings2 } from "lucide-react";

const modules = [
  { title: "Inventory Management", desc: "Stock tracking, low stock alerts, purchase orders, supplier management", icon: Package, status: "planned", priority: "High" },
  { title: "Purchase Orders", desc: "Create POs, track supplier deliveries, manage vendor payments", icon: Truck, status: "planned", priority: "High" },
  { title: "Sales & CRM", desc: "Lead tracking, customer history, follow-ups, sales pipeline", icon: Users, status: "planned", priority: "High" },
  { title: "Repair Job Cards", desc: "Job card creation, technician assignment, parts used, billing", icon: Wrench, status: "planned", priority: "High" },
  { title: "Billing & Invoicing", desc: "GST invoices, quotations, receipts, payment tracking", icon: IndianRupee, status: "planned", priority: "High" },
  { title: "Expense Tracking", desc: "Daily expenses, salary, rent, utilities, profit/loss", icon: ClipboardList, status: "planned", priority: "Medium" },
  { title: "Staff Management", desc: "Employee records, attendance, salary, performance", icon: Users, status: "planned", priority: "Medium" },
  { title: "Analytics & Reports", desc: "Sales reports, profit analysis, top products, customer insights", icon: BarChart3, status: "partial", priority: "Medium" },
  { title: "Multi-Branch", desc: "Silver Mall + Bangali Chouraha — separate stock, sales, staff", icon: Building2, status: "planned", priority: "Low" },
  { title: "WhatsApp Integration", desc: "Auto-send invoices, job card updates, payment reminders via WhatsApp", icon: Settings2, status: "partial", priority: "Medium" },
];

const statusColor: Record<string, string> = {
  planned: "secondary",
  partial: "default",
  done: "outline",
};

export default function AdminERP() {
  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-black flex items-center gap-2"><Building2 className="h-6 w-6 text-primary" /> ERP — Enterprise Resource Planning</h1>
          <p className="text-muted-foreground text-sm mt-1">AI Laptop Wala ke liye complete business management system ka roadmap</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <p className="text-sm font-semibold mb-1">Current Status</p>
              <p className="text-xs text-muted-foreground">E-commerce, Orders, WhatsApp AI, Services booking — already working ✅</p>
            </CardContent>
          </Card>
          <Card className="border-orange-300/30 bg-orange-50/50">
            <CardContent className="p-4">
              <p className="text-sm font-semibold mb-1">Next Priority</p>
              <p className="text-xs text-muted-foreground">Repair Job Cards + Purchase Orders + GST Billing — most needed for daily operations</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((m) => (
            <Card key={m.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <m.icon className="h-4 w-4 text-primary" />
                    </div>
                    <CardTitle className="text-sm font-bold">{m.title}</CardTitle>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Badge variant={statusColor[m.status] as any} className="text-[10px]">{m.status}</Badge>
                    <Badge variant="outline" className={`text-[10px] ${m.priority === 'High' ? 'border-red-300 text-red-600' : m.priority === 'Medium' ? 'border-yellow-300 text-yellow-600' : 'border-gray-300'}`}>{m.priority}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-xs text-muted-foreground">{m.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 bg-muted/50 rounded-xl border">
          <p className="text-sm font-semibold mb-2">Implementation Plan</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>📌 <strong>Phase 1 (1-2 weeks):</strong> Repair Job Cards — create, assign technician, track status, generate bill</p>
            <p>📌 <strong>Phase 2 (2-3 weeks):</strong> GST Billing — invoices, quotations, payment tracking</p>
            <p>📌 <strong>Phase 3 (3-4 weeks):</strong> Purchase Orders — supplier management, stock receiving</p>
            <p>📌 <strong>Phase 4 (4-6 weeks):</strong> Expense tracking, staff management, multi-branch</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
