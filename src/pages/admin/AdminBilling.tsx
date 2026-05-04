import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IndianRupee, Plus, Printer, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";

const req = (method: string, path: string, body?: any) =>
  fetch(`/api/erp${path}`, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` }, ...(body ? { body: JSON.stringify(body) } : {}) }).then(r => r.json());

export default function AdminBilling() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('completed');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const d = await req('GET', `/job-cards${filter !== 'all' ? `?status=${filter}` : ''}`);
    setJobs(Array.isArray(d) ? d : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filter]);

  const filtered = jobs.filter(j =>
    j.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
    j.booking_number?.includes(search)
  );

  const printInvoice = (job: any) => {
    const win = window.open('', '_blank');
    if (!win) return;
    const gst = Math.round((job.total_charge || 0) * 0.18);
    const subtotal = (job.total_charge || 0);
    const total = subtotal + gst;
    win.document.write(`<!DOCTYPE html><html><head><title>Invoice ${job.booking_number}</title>
<style>
  body{font-family:Arial,sans-serif;padding:30px;max-width:700px;margin:0 auto;color:#333}
  .header{display:flex;justify-content:space-between;border-bottom:3px solid #FF8000;padding-bottom:15px;margin-bottom:20px}
  .brand h1{color:#FF8000;font-size:22px;margin:0}
  .brand p{color:#666;font-size:11px;margin:2px 0}
  .invoice-info{text-align:right}
  .invoice-info h2{color:#333;font-size:18px;margin:0}
  table{width:100%;border-collapse:collapse;margin:15px 0}
  th{background:#FF8000;color:white;padding:8px;text-align:left;font-size:12px}
  td{padding:8px;border-bottom:1px solid #eee;font-size:12px}
  .total-section{text-align:right;margin-top:10px}
  .total-section p{margin:3px 0;font-size:13px}
  .grand-total{font-size:16px;font-weight:bold;color:#FF8000}
  .footer{margin-top:30px;text-align:center;color:#999;font-size:10px;border-top:1px solid #eee;padding-top:15px}
  @media print{button{display:none}}
</style></head><body>
<div class="header">
  <div class="brand">
    <h1>💻 AI Laptop Wala</h1>
    <p>Asati Infotech | GST: 23ATNPA4415H1Z2</p>
    <p>Silver Mall, LB-21, RNT Marg, Indore 452001</p>
    <p>📞 +91 98934 96163</p>
  </div>
  <div class="invoice-info">
    <h2>SERVICE INVOICE</h2>
    <p style="font-size:12px">Invoice #: ${job.booking_number}</p>
    <p style="font-size:12px">Date: ${new Date().toLocaleDateString('en-IN')}</p>
  </div>
</div>
<div style="display:flex;justify-content:space-between;margin-bottom:15px">
  <div>
    <p style="font-size:11px;color:#666;margin:0">Bill To:</p>
    <p style="font-weight:bold;margin:2px 0">${job.customer_name}</p>
    <p style="font-size:12px;margin:2px 0">${job.customer_phone}</p>
  </div>
  <div style="text-align:right">
    <p style="font-size:11px;color:#666;margin:0">Device:</p>
    <p style="font-weight:bold;margin:2px 0">${job.device_brand || ''} ${job.device_model || ''}</p>
    <p style="font-size:12px;margin:2px 0">Technician: ${job.technician || 'N/A'}</p>
  </div>
</div>
<table>
  <tr><th>Description</th><th>Amount</th></tr>
  <tr><td>${job.service_name || 'Repair Service'}<br><small style="color:#666">${job.diagnosis || job.issue_description || ''}</small></td><td>₹${(job.labour_charge || 0).toLocaleString('en-IN')}</td></tr>
  ${job.parts_charge > 0 ? `<tr><td>Parts & Components</td><td>₹${(job.parts_charge || 0).toLocaleString('en-IN')}</td></tr>` : ''}
</table>
<div class="total-section">
  <p>Subtotal: ₹${subtotal.toLocaleString('en-IN')}</p>
  <p>GST (18%): ₹${gst.toLocaleString('en-IN')}</p>
  <p class="grand-total">Total: ₹${total.toLocaleString('en-IN')}</p>
  <p style="font-size:11px;color:#666">Payment: ${job.payment_status === 'paid' ? `✅ Paid via ${job.payment_method || 'Cash'}` : '⏳ Pending'}</p>
</div>
<div class="footer">
  <p>Thank you for choosing AI Laptop Wala! | ailaptopwala.com</p>
  <p>Warranty: As per service terms | Returns: 7 days if defective</p>
</div>
<br><button onclick="window.print()" style="background:#FF8000;color:white;border:none;padding:10px 20px;border-radius:5px;cursor:pointer;font-size:14px">🖨️ Print Invoice</button>
</body></html>`);
    win.document.close();
  };

  const markPaid = async (id: string, job: any) => {
    await req('PUT', `/job-cards/${id}`, { ...job, payment_status: 'paid', payment_method: 'cash' });
    toast.success('Marked as paid!'); load();
  };

  const totalRevenue = filtered.filter(j => j.payment_status === 'paid').reduce((s, j) => s + (j.total_charge || 0), 0);
  const pendingAmount = filtered.filter(j => j.payment_status !== 'paid').reduce((s, j) => s + (j.total_charge || 0), 0);

  return (
    <AdminLayout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h1 className="text-xl font-black flex items-center gap-2"><IndianRupee className="h-5 w-5 text-primary" /> Billing & Invoices</h1>
          <Button size="sm" variant="outline" onClick={load} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="border rounded-lg p-4"><p className="text-xs text-muted-foreground">Collected</p><p className="text-2xl font-black text-green-600">₹{totalRevenue.toLocaleString('en-IN')}</p></div>
          <div className="border rounded-lg p-4"><p className="text-xs text-muted-foreground">Pending</p><p className="text-2xl font-black text-red-600">₹{pendingAmount.toLocaleString('en-IN')}</p></div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-40">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-8 h-8 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="h-8 w-36 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>
              <th className="text-left p-3 text-xs">Invoice #</th>
              <th className="text-left p-3 text-xs">Customer</th>
              <th className="text-left p-3 text-xs">Service</th>
              <th className="text-right p-3 text-xs">Amount</th>
              <th className="text-center p-3 text-xs">Payment</th>
              <th className="text-center p-3 text-xs">Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(j => (
                <tr key={j.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-mono text-xs font-bold">{j.booking_number}</td>
                  <td className="p-3"><p className="text-xs font-medium">{j.customer_name}</p><p className="text-[10px] text-muted-foreground">{j.customer_phone}</p></td>
                  <td className="p-3 text-xs">{j.service_name || 'Repair'}<br/><span className="text-[10px] text-muted-foreground">{j.device_brand} {j.device_model}</span></td>
                  <td className="p-3 text-right text-xs font-bold">₹{(j.total_charge || 0).toLocaleString('en-IN')}</td>
                  <td className="p-3 text-center">
                    <Badge variant={j.payment_status === 'paid' ? 'default' : 'destructive'} className="text-[10px]">{j.payment_status}</Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1 justify-center">
                      <Button size="sm" variant="outline" className="h-7 text-[10px] px-2 gap-1" onClick={() => printInvoice(j)}><Printer className="h-3 w-3" /> Invoice</Button>
                      {j.payment_status !== 'paid' && <Button size="sm" className="h-7 text-[10px] px-2" onClick={() => markPaid(j.id, j)}>Mark Paid</Button>}
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground text-xs">No records found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
