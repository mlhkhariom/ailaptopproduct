import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Wrench, ShoppingBag, FileText, Star, Phone, Search, IndianRupee } from "lucide-react";

const authFetch = (url: string) => fetch(url).then(r => r.json()).catch(() => null);

const STATUS_COLOR: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700',
};

export default function CustomerPortal() {
  const [phone, setPhone] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async () => {
    if (!phone.trim() || phone.length < 10) { setError('Enter valid 10-digit phone number'); return; }
    setLoading(true); setError(''); setData(null);
    const [jobs, orders, loyalty] = await Promise.all([
      authFetch(`/api/erp/job-cards?customer_phone=${phone}`),
      authFetch(`/api/orders?customer_phone=${phone}`),
      authFetch(`/api/erp/loyalty/${phone}`),
    ]);
    const hasData = (Array.isArray(jobs) && jobs.length) || (Array.isArray(orders) && orders.length);
    if (!hasData) { setError('No records found for this number.'); setLoading(false); return; }
    setData({ jobs: Array.isArray(jobs) ? jobs : [], orders: Array.isArray(orders) ? orders : [], loyalty: loyalty || { points: 0, tier: 'Bronze' } });
    setLoading(false);
  };

  const totalSpent = data ? [
    ...data.jobs.filter((j: any) => j.payment_status === 'paid').map((j: any) => j.total_charge || 0),
    ...data.orders.filter((o: any) => o.payment_status === 'paid').map((o: any) => o.total || 0),
  ].reduce((a: number, b: number) => a + b, 0) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <div className="bg-white border-b shadow-sm px-4 py-3 flex items-center gap-3">
        <img src="/favicon.png" alt="Logo" className="h-8 w-8 rounded-lg" onError={e => (e.currentTarget.style.display = 'none')} />
        <div>
          <p className="font-black text-orange-600 text-sm">AI Laptop Wala</p>
          <p className="text-xs text-muted-foreground">Customer Portal</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-5">
        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm border p-5 space-y-3">
          <h1 className="font-black text-lg">Track Your Orders & Repairs</h1>
          <p className="text-sm text-muted-foreground">Enter your registered phone number to view all your history.</p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9 h-10" placeholder="9XXXXXXXXX" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} onKeyDown={e => e.key === 'Enter' && search()} maxLength={10} />
            </div>
            <Button onClick={search} disabled={loading} className="gap-1.5 bg-orange-500 hover:bg-orange-600">
              <Search className="h-4 w-4" />{loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {data && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Spent', value: `₹${totalSpent.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-green-600' },
                { label: 'Loyalty Points', value: `${data.loyalty.points} pts`, icon: Star, color: 'text-yellow-600' },
                { label: 'Tier', value: data.loyalty.tier, icon: Star, color: 'text-purple-600' },
              ].map(k => (
                <div key={k.label} className="bg-white rounded-xl border p-3 text-center">
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                  <p className={`font-black text-sm ${k.color}`}>{k.value}</p>
                </div>
              ))}
            </div>

            {/* Repairs */}
            {data.jobs.length > 0 && (
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b flex items-center gap-2 bg-orange-50">
                  <Wrench className="h-4 w-4 text-orange-500" />
                  <span className="font-bold text-sm">Repair History ({data.jobs.length})</span>
                </div>
                <div className="divide-y">
                  {data.jobs.map((j: any) => (
                    <div key={j.id} className="p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-muted-foreground">{j.booking_number}</span>
                        <Badge className={`text-xs ${STATUS_COLOR[j.status] || 'bg-gray-100 text-gray-600'}`}>{j.status?.replace('_', ' ')}</Badge>
                      </div>
                      <p className="font-semibold text-sm">{j.device_brand} {j.device_model}</p>
                      <p className="text-xs text-muted-foreground">{j.service_name}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{new Date(j.created_at).toLocaleDateString('en-IN')}</span>
                        <span className="font-bold text-sm text-green-600">₹{(j.total_charge || 0).toLocaleString('en-IN')}</span>
                      </div>
                      {j.technician && <p className="text-xs text-blue-600">Technician: {j.technician}</p>}
                      {j.warranty_days > 0 && j.status === 'completed' && <p className="text-xs text-green-600 font-medium">✓ {j.warranty_days} days warranty</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Orders */}
            {data.orders.length > 0 && (
              <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b flex items-center gap-2 bg-blue-50">
                  <ShoppingBag className="h-4 w-4 text-blue-500" />
                  <span className="font-bold text-sm">Purchase History ({data.orders.length})</span>
                </div>
                <div className="divide-y">
                  {data.orders.map((o: any) => (
                    <div key={o.id} className="p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-muted-foreground">{o.order_number || o.id?.slice(0, 8)}</span>
                        <Badge className={`text-xs ${STATUS_COLOR[o.payment_status] || 'bg-gray-100 text-gray-600'}`}>{o.payment_status}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString('en-IN')}</span>
                        <span className="font-bold text-sm text-green-600">₹{(o.total || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="bg-orange-50 rounded-2xl border border-orange-200 p-4 text-center space-y-2">
              <p className="font-bold text-sm">Need help?</p>
              <p className="text-xs text-muted-foreground">Call or WhatsApp us</p>
              <a href="tel:+919893496163" className="inline-flex items-center gap-1.5 bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">
                <Phone className="h-4 w-4" /> +91 98934 96163
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
