import { useState, useEffect } from "react";
import ERPLayout from "@/components/layout/ERPLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Star, RefreshCw, Plus, Gift, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const req = (method: string, path: string, body?: any) =>
  fetch(`/api/erp${path}`, {
    method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then(r => r.json());

const TIER_COLOR: Record<string, string> = {
  Bronze: 'bg-orange-100 text-orange-700',
  Silver: 'bg-gray-100 text-gray-700',
  Gold: 'bg-yellow-100 text-yellow-700',
  Platinum: 'bg-purple-100 text-purple-700',
};

export default function AdminLoyalty() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [earnOpen, setEarnOpen] = useState(false);
  const [redeemOpen, setRedeemOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [earnForm, setEarnForm] = useState({ phone: '', customer_name: '', amount: 0 });
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [search, setSearch] = useState('');

  const load = async () => { setLoading(true); const d = await req('GET', '/loyalty'); setList(Array.isArray(d) ? d : []); setLoading(false); };
  useEffect(() => { load(); }, []);

  const earn = async () => {
    if (!earnForm.phone || !earnForm.amount) return toast.error('Phone and amount required');
    const res = await req('POST', '/loyalty/earn', earnForm);
    toast.success(res.message || 'Points added'); setEarnOpen(false); load();
  };

  const redeem = async () => {
    if (!selected || !redeemPoints) return;
    const res = await req('POST', '/loyalty/redeem', { phone: selected.phone, points: redeemPoints });
    if (res.error) toast.error(res.error);
    else toast.success(`Redeemed ${redeemPoints} pts = ₹${res.discount_amount} discount`);
    setRedeemOpen(false); load();
  };

  const filtered = list.filter(c => !search || c.customer_name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search));
  const totalPoints = list.reduce((s, c) => s + (c.points || 0), 0);
  const platinum = list.filter(c => c.tier === 'Platinum').length;
  const gold = list.filter(c => c.tier === 'Gold').length;

  return (
    <ERPLayout>
      <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl font-black flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500" /> Loyalty Program</h1>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={load} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
            <Button size="sm" onClick={() => { setEarnForm({ phone: '', customer_name: '', amount: 0 }); setEarnOpen(true); }} className="gap-1.5"><Plus className="h-4 w-4" /> Add Points</Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Members', value: list.length, color: 'text-blue-600' },
            { label: 'Total Points', value: totalPoints.toLocaleString('en-IN'), color: 'text-green-600' },
            { label: 'Gold Members', value: gold, color: 'text-yellow-600' },
            { label: 'Platinum Members', value: platinum, color: 'text-purple-600' },
          ].map(k => (
            <div key={k.label} className="border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Tier info */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { tier: 'Bronze', min: 0, max: 499, color: 'border-orange-200 bg-orange-50' },
            { tier: 'Silver', min: 500, max: 1999, color: 'border-gray-200 bg-gray-50' },
            { tier: 'Gold', min: 2000, max: 4999, color: 'border-yellow-200 bg-yellow-50' },
            { tier: 'Platinum', min: 5000, max: null, color: 'border-purple-200 bg-purple-50' },
          ].map(t => (
            <div key={t.tier} className={`border rounded-lg p-3 text-center ${t.color}`}>
              <p className="font-bold text-sm">{t.tier}</p>
              <p className="text-xs text-muted-foreground">{t.min}+ pts</p>
            </div>
          ))}
        </div>

        <Input placeholder="Search by name or phone..." className="h-9" value={search} onChange={e => setSearch(e.target.value)} />

        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>
              <th className="text-left p-3 text-xs font-semibold">Customer</th>
              <th className="text-center p-3 text-xs font-semibold">Tier</th>
              <th className="text-right p-3 text-xs font-semibold">Points</th>
              <th className="text-right p-3 text-xs font-semibold">Total Earned</th>
              <th className="text-right p-3 text-xs font-semibold">Redeemed</th>
              <th className="text-center p-3 text-xs font-semibold">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-t hover:bg-muted/30">
                  <td className="p-3"><p className="font-medium">{c.customer_name || '—'}</p><p className="text-xs text-muted-foreground">{c.phone}</p></td>
                  <td className="p-3 text-center"><Badge className={`text-xs ${TIER_COLOR[c.tier] || ''}`}>{c.tier}</Badge></td>
                  <td className="p-3 text-right font-black text-green-600">{(c.points || 0).toLocaleString('en-IN')}</td>
                  <td className="p-3 text-right text-sm">{(c.total_earned || 0).toLocaleString('en-IN')}</td>
                  <td className="p-3 text-right text-sm text-red-600">{(c.total_redeemed || 0).toLocaleString('en-IN')}</td>
                  <td className="p-3 text-center">
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => { setSelected(c); setRedeemPoints(0); setRedeemOpen(true); }}>
                      <Gift className="h-3 w-3" /> Redeem
                    </Button>
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={6} className="p-10 text-center text-muted-foreground">No loyalty members yet</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Earn Points Dialog */}
        <Dialog open={earnOpen} onOpenChange={setEarnOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Add Loyalty Points</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">1 point per ₹100 spent</p>
              <div><Label className="text-xs">Customer Phone *</Label><Input className="mt-1 h-9" value={earnForm.phone} onChange={e => setEarnForm(f => ({ ...f, phone: e.target.value }))} placeholder="9XXXXXXXXX" /></div>
              <div><Label className="text-xs">Customer Name</Label><Input className="mt-1 h-9" value={earnForm.customer_name} onChange={e => setEarnForm(f => ({ ...f, customer_name: e.target.value }))} /></div>
              <div><Label className="text-xs">Amount Spent (₹) *</Label><Input type="number" className="mt-1 h-9" value={earnForm.amount || ''} onChange={e => setEarnForm(f => ({ ...f, amount: Number(e.target.value) }))} /></div>
              {earnForm.amount > 0 && <p className="text-sm font-bold text-green-600">Points to earn: {Math.floor(earnForm.amount / 100)}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEarnOpen(false)}>Cancel</Button>
              <Button onClick={earn}>Add Points</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Redeem Dialog */}
        <Dialog open={redeemOpen} onOpenChange={setRedeemOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Redeem Points — {selected?.customer_name}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <p className="text-sm">Available: <span className="font-black text-green-600">{selected?.points || 0} pts</span></p>
              <p className="text-xs text-muted-foreground">10 points = ₹1 discount</p>
              <div><Label className="text-xs">Points to Redeem</Label>
                <Input type="number" className="mt-1 h-9" min={0} max={selected?.points || 0} value={redeemPoints || ''} onChange={e => setRedeemPoints(Number(e.target.value))} />
              </div>
              {redeemPoints > 0 && <p className="text-sm font-bold text-blue-600">Discount: ₹{Math.floor(redeemPoints / 10)}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRedeemOpen(false)}>Cancel</Button>
              <Button onClick={redeem} disabled={redeemPoints > (selected?.points || 0)}>Redeem</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
}
