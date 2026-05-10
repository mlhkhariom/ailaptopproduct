import { useState } from "react";
import ERPLayout from "@/components/ERPLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserCircle, Phone, ShoppingBag, Wrench, FileText, Star } from "lucide-react";

const authFetch = (url: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` } }).then(r => r.json()).catch(() => null);

export default function AdminCustomer360() {
  const [phone, setPhone] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    const [orders, jobs, invoices, leads, loyalty] = await Promise.all([
      authFetch(`/api/orders?customer_phone=${phone}`),
      authFetch(`/api/erp/job-cards?customer_phone=${phone}`),
      authFetch(`/api/erp/billing?customer_phone=${phone}`),
      authFetch(`/api/erp/leads?phone=${phone}`),
      authFetch(`/api/erp/loyalty/${phone}`),
    ]);
    setData({
      orders: Array.isArray(orders) ? orders : orders?.orders || [],
      jobs: Array.isArray(jobs) ? jobs : [],
      invoices: Array.isArray(invoices) ? invoices : [],
      leads: Array.isArray(leads) ? leads : [],
      loyalty: loyalty || { points: 0, tier: 'Bronze' },
    });
    setLoading(false);
  };

  const totalSpent = (data?.orders || []).filter((o: any) => o.payment_status === 'paid').reduce((s: number, o: any) => s + (o.total || 0), 0)
    + (data?.jobs || []).filter((j: any) => j.payment_status === 'paid').reduce((s: number, j: any) => s + (j.total_charge || 0), 0);

  return (
    <ERPLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
        <h1 className="text-xl font-black flex items-center gap-2"><UserCircle className="h-5 w-5 text-primary" /> Customer 360</h1>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8 h-10" placeholder="Search by phone number..." value={phone} onChange={e => setPhone(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} />
          </div>
          <Button onClick={search} disabled={loading} className="gap-1.5"><Search className="h-4 w-4" />{loading ? 'Searching...' : 'Search'}</Button>
        </div>

        {data && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[
                { label: 'Total Spent', value: `₹${totalSpent.toLocaleString('en-IN')}`, color: 'text-green-600' },
                { label: 'Orders', value: data.orders.length, color: 'text-blue-600' },
                { label: 'Repairs', value: data.jobs.length, color: 'text-orange-600' },
                { label: 'Loyalty Points', value: data.loyalty.points, color: 'text-purple-600' },
                { label: 'Tier', value: data.loyalty.tier, color: 'text-yellow-600' },
              ].map(k => (
                <div key={k.label} className="border rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                  <p className={`text-xl font-black ${k.color}`}>{k.value}</p>
                </div>
              ))}
            </div>

            {/* Job Cards */}
            {data.jobs.length > 0 && (
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 flex items-center gap-2"><Wrench className="h-4 w-4 text-orange-500" /><span className="font-semibold text-sm">Repair History ({data.jobs.length})</span></div>
                <table className="w-full text-sm">
                  <thead className="bg-muted/30"><tr>
                    <th className="text-left p-3 text-xs">Job #</th>
                    <th className="text-left p-3 text-xs">Device</th>
                    <th className="text-left p-3 text-xs">Service</th>
                    <th className="text-center p-3 text-xs">Status</th>
                    <th className="text-right p-3 text-xs">Amount</th>
                    <th className="text-left p-3 text-xs">Date</th>
                  </tr></thead>
                  <tbody>
                    {data.jobs.map((j: any) => (
                      <tr key={j.id} className="border-t hover:bg-muted/20">
                        <td className="p-3 font-mono text-xs">{j.booking_number}</td>
                        <td className="p-3 text-xs">{j.device_brand} {j.device_model}</td>
                        <td className="p-3 text-xs">{j.service_name}</td>
                        <td className="p-3 text-center"><Badge variant={j.status === 'completed' ? 'default' : 'secondary'} className="text-xs">{j.status}</Badge></td>
                        <td className="p-3 text-right font-bold">₹{(j.total_charge || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3 text-xs text-muted-foreground">{new Date(j.created_at).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Orders */}
            {data.orders.length > 0 && (
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-blue-500" /><span className="font-semibold text-sm">Orders ({data.orders.length})</span></div>
                <table className="w-full text-sm">
                  <thead className="bg-muted/30"><tr>
                    <th className="text-left p-3 text-xs">Order #</th>
                    <th className="text-center p-3 text-xs">Status</th>
                    <th className="text-right p-3 text-xs">Amount</th>
                    <th className="text-left p-3 text-xs">Date</th>
                  </tr></thead>
                  <tbody>
                    {data.orders.map((o: any) => (
                      <tr key={o.id} className="border-t hover:bg-muted/20">
                        <td className="p-3 font-mono text-xs">{o.order_number || o.id?.slice(0,8)}</td>
                        <td className="p-3 text-center"><Badge variant={o.payment_status === 'paid' ? 'default' : 'secondary'} className="text-xs">{o.payment_status}</Badge></td>
                        <td className="p-3 text-right font-bold">₹{(o.total || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3 text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Invoices */}
            {data.invoices.length > 0 && (
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 flex items-center gap-2"><FileText className="h-4 w-4 text-green-500" /><span className="font-semibold text-sm">Invoices ({data.invoices.length})</span></div>
                <table className="w-full text-sm">
                  <thead className="bg-muted/30"><tr>
                    <th className="text-left p-3 text-xs">Invoice #</th>
                    <th className="text-center p-3 text-xs">Status</th>
                    <th className="text-right p-3 text-xs">Amount</th>
                    <th className="text-left p-3 text-xs">Date</th>
                  </tr></thead>
                  <tbody>
                    {data.invoices.map((i: any) => (
                      <tr key={i.id} className="border-t hover:bg-muted/20">
                        <td className="p-3 font-mono text-xs">{i.invoice_number}</td>
                        <td className="p-3 text-center"><Badge variant={i.payment_status === 'paid' ? 'default' : 'secondary'} className="text-xs">{i.payment_status}</Badge></td>
                        <td className="p-3 text-right font-bold">₹{(i.amount || i.total || 0).toLocaleString('en-IN')}</td>
                        <td className="p-3 text-xs text-muted-foreground">{new Date(i.created_at).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* CRM Leads */}
            {data.leads.length > 0 && (
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500" /><span className="font-semibold text-sm">CRM Leads ({data.leads.length})</span></div>
                <table className="w-full text-sm">
                  <thead className="bg-muted/30"><tr>
                    <th className="text-left p-3 text-xs">Name</th>
                    <th className="text-left p-3 text-xs">Source</th>
                    <th className="text-center p-3 text-xs">Status</th>
                    <th className="text-right p-3 text-xs">Budget</th>
                  </tr></thead>
                  <tbody>
                    {data.leads.map((l: any) => (
                      <tr key={l.id} className="border-t hover:bg-muted/20">
                        <td className="p-3 font-medium text-sm">{l.name}</td>
                        <td className="p-3 text-xs text-muted-foreground">{l.source}</td>
                        <td className="p-3 text-center"><Badge variant="outline" className="text-xs">{l.status}</Badge></td>
                        <td className="p-3 text-right text-sm">₹{(l.budget || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!data.jobs.length && !data.orders.length && !data.invoices.length && !data.leads.length && (
              <div className="text-center py-12 text-muted-foreground">
                <UserCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No records found for {phone}</p>
              </div>
            )}
          </>
        )}
      </div>
    </ERPLayout>
  );
}
