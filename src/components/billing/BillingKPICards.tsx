// BillingKPICards — stats row for unified billing
import { Card, CardContent } from "@/components/ui/card";
import { IndianRupee, TrendingUp, Clock, FileText, ShoppingBag, Wrench } from "lucide-react";

interface Props {
  rows: any[];
}

export default function BillingKPICards({ rows }: Props) {
  const paid = rows.filter(r => r.payment_status === 'paid');
  const pending = rows.filter(r => r.payment_status !== 'paid');
  const collected = paid.reduce((s, r) => s + (r.amount || 0), 0);
  const pendingAmt = pending.reduce((s, r) => s + (r.amount || 0), 0);
  const orders = rows.filter(r => r.type === 'order');
  const services = rows.filter(r => r.type === 'service');
  const custom = rows.filter(r => r.type === 'custom');

  const cards = [
    { label: 'Collected', value: `₹${collected.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100', sub: `${paid.length} invoices` },
    { label: 'Pending', value: `₹${pendingAmt.toLocaleString('en-IN')}`, icon: Clock, color: 'text-red-600', bg: 'bg-red-100', sub: `${pending.length} invoices` },
    { label: 'Orders', value: orders.length, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100', sub: `₹${orders.reduce((s,r)=>s+(r.amount||0),0).toLocaleString('en-IN')}` },
    { label: 'Service Jobs', value: services.length, icon: Wrench, color: 'text-orange-600', bg: 'bg-orange-100', sub: `₹${services.reduce((s,r)=>s+(r.amount||0),0).toLocaleString('en-IN')}` },
    { label: 'Custom', value: custom.length, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100', sub: `₹${custom.reduce((s,r)=>s+(r.amount||0),0).toLocaleString('en-IN')}` },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {cards.map(c => (
        <Card key={c.label}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className={`h-9 w-9 rounded-xl ${c.bg} flex items-center justify-center`}>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </div>
            </div>
            <p className={`text-2xl font-black ${c.color}`}>{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
