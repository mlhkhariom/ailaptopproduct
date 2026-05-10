import { useState, useEffect, useRef } from "react";
import ERPLayout from "@/components/ERPLayout";
import BranchSelector from "@/components/BranchSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IndianRupee, RefreshCw, Play, Printer, CheckCircle, Clock, Users, Download } from "lucide-react";
import { toast } from "sonner";

const req = (method: string, path: string, body?: any) =>
  fetch(`/api/erp${path}`, {
    method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then(r => r.json());

const months = Array.from({ length: 12 }, (_, i) => {
  const d = new Date(); d.setMonth(d.getMonth() - i);
  return d.toISOString().slice(0, 7);
});

export default function AdminPayroll() {
  const [list, setList] = useState<any[]>([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [branchFilter, setBranchFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState<any>(null);
  const [slipOpen, setSlipOpen] = useState(false);
  const [slipData, setSlipData] = useState<any>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    setLoading(true);
    const d = await req('GET', `/payroll?month=${month}${branchFilter !== 'all' ? '&branch_id=' + branchFilter : ''}`);
    setList(Array.isArray(d) ? d : []);
    setLoading(false);
  };
  useEffect(() => { load(); }, [month, branchFilter]);

  const generate = async () => {
    setLoading(true);
    const res = await req('POST', '/payroll/generate', { month, branch_id: branchFilter !== 'all' ? branchFilter : undefined });
    if (res.generated === 0) toast.info('Payroll already generated for this month');
    else toast.success(`Generated ${res.generated} payroll records`);
    load();
  };

  const markPaid = async (id: string) => {
    await req('PATCH', `/payroll/${id}/pay`, {});
    toast.success('Marked as paid'); load();
  };

  const openEdit = (row: any) => { setEditRow({ ...row }); setEditOpen(true); };

  const saveEdit = async () => {
    await req('PUT', `/payroll/${editRow.id}`, editRow);
    toast.success('Saved'); setEditOpen(false); load();
  };

  const openSlip = async (id: string) => {
    const d = await req('GET', `/payroll/${id}/slip`);
    setSlipData(d); setSlipOpen(true);
  };

  const exportNEFT = () => {
    const paid = list.filter(r => r.status === 'paid' || r.net > 0);
    const rows = [
      ['Staff Name', 'Account No', 'IFSC', 'Amount', 'Remarks'],
      ...paid.map(r => [r.staff_name || '', '', '', r.net || 0, `Salary ${month}`])
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `NEFT_Salary_${month}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const printSlip = () => {
    const w = window.open('', '_blank');
    if (!w || !printRef.current) return;
    w.document.write(`<html><head><title>Salary Slip</title><style>body{font-family:Arial;padding:20px;font-size:13px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ccc;padding:6px 10px}th{background:#f5f5f5}.header{text-align:center;margin-bottom:16px}.row{display:flex;justify-content:space-between;margin:4px 0}</style></head><body>${printRef.current.innerHTML}</body></html>`);
    w.document.close(); w.print();
  };

  const totals = list.reduce((s, r) => ({ gross: s.gross + (r.gross || 0), net: s.net + (r.net || 0), pf: s.pf + (r.pf_employer || 0) + (r.pf_employee || 0) }), { gross: 0, net: 0, pf: 0 });

  return (
    <ERPLayout>
      <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl font-black flex items-center gap-2"><IndianRupee className="h-5 w-5 text-primary" /> Payroll</h1>
          <div className="flex gap-2 flex-wrap">
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{months.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
<BranchSelector value={branchFilter} onChange={setBranchFilter} className="w-44" />
            <Button size="sm" variant="outline" onClick={load} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></Button>
            <Button size="sm" variant="outline" onClick={exportNEFT} className="gap-1.5"><Download className="h-4 w-4" /> NEFT File</Button>
            <Button size="sm" onClick={generate} className="gap-1.5"><Play className="h-4 w-4" /> Generate Payroll</Button>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Gross', value: `₹${totals.gross.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-blue-600' },
            { label: 'Total Net Pay', value: `₹${totals.net.toLocaleString('en-IN')}`, icon: CheckCircle, color: 'text-green-600' },
            { label: 'Total PF', value: `₹${totals.pf.toLocaleString('en-IN')}`, icon: Users, color: 'text-orange-600' },
          ].map(k => (
            <div key={k.label} className="border rounded-xl p-4">
              <p className="text-xs text-muted-foreground">{k.label}</p>
              <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>
              <th className="text-left p-3 text-xs font-semibold">Staff</th>
              <th className="text-right p-3 text-xs font-semibold">Basic</th>
              <th className="text-right p-3 text-xs font-semibold">HRA</th>
              <th className="text-right p-3 text-xs font-semibold">Gross</th>
              <th className="text-right p-3 text-xs font-semibold text-red-600">PF+ESI</th>
              <th className="text-right p-3 text-xs font-semibold text-green-600">Net Pay</th>
              <th className="text-center p-3 text-xs font-semibold">Days</th>
              <th className="text-center p-3 text-xs font-semibold">Status</th>
              <th className="text-center p-3 text-xs font-semibold">Actions</th>
            </tr></thead>
            <tbody>
              {list.map(r => (
                <tr key={r.id} className="border-t hover:bg-muted/30">
                  <td className="p-3"><p className="font-medium">{r.staff_name}</p><p className="text-xs text-muted-foreground">{r.role}</p></td>
                  <td className="p-3 text-right">₹{(r.basic || 0).toLocaleString('en-IN')}</td>
                  <td className="p-3 text-right">₹{(r.hra || 0).toLocaleString('en-IN')}</td>
                  <td className="p-3 text-right font-bold">₹{(r.gross || 0).toLocaleString('en-IN')}</td>
                  <td className="p-3 text-right text-red-600">₹{((r.pf_employee || 0) + (r.esi_employee || 0)).toLocaleString('en-IN')}</td>
                  <td className="p-3 text-right font-black text-green-600">₹{(r.net || 0).toLocaleString('en-IN')}</td>
                  <td className="p-3 text-center text-xs">{r.present_days}/{r.working_days}</td>
                  <td className="p-3 text-center">
                    <Badge variant={r.status === 'paid' ? 'default' : 'secondary'} className="text-xs">
                      {r.status === 'paid' ? '✅ Paid' : '⏳ Draft'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1 justify-center">
                      <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => openEdit(r)}>Edit</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs px-2" onClick={() => openSlip(r.id)}><Printer className="h-3 w-3" /></Button>
                      {r.status !== 'paid' && <Button size="sm" className="h-7 text-xs px-2 bg-green-600 hover:bg-green-700" onClick={() => markPaid(r.id)}>Pay</Button>}
                    </div>
                  </td>
                </tr>
              ))}
              {!list.length && <tr><td colSpan={9} className="p-10 text-center text-muted-foreground">No payroll for {month}. Click "Generate Payroll" to create.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Edit Dialog */}
        {editRow && (
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Edit Payroll — {editRow.staff_name}</DialogTitle></DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'basic', label: 'Basic' }, { key: 'hra', label: 'HRA' },
                  { key: 'allowances', label: 'Allowances' }, { key: 'pf_employee', label: 'PF (Employee)' },
                  { key: 'esi_employee', label: 'ESI (Employee)' }, { key: 'tds', label: 'TDS' },
                  { key: 'advance_deduction', label: 'Advance Deduction' }, { key: 'other_deduction', label: 'Other Deduction' },
                  { key: 'present_days', label: 'Present Days' },
                ].map(f => (
                  <div key={f.key}>
                    <Label className="text-xs">{f.label}</Label>
                    <Input type="number" className="mt-1 h-9" value={editRow[f.key] || 0} onChange={e => setEditRow((r: any) => ({ ...r, [f.key]: Number(e.target.value) }))} />
                  </div>
                ))}
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <div className="flex justify-between"><span>Gross:</span><span className="font-bold">₹{((editRow.basic || 0) + (editRow.hra || 0) + (editRow.allowances || 0)).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between text-red-600"><span>Deductions:</span><span>-₹{((editRow.pf_employee || 0) + (editRow.esi_employee || 0) + (editRow.tds || 0) + (editRow.advance_deduction || 0) + (editRow.other_deduction || 0)).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between font-black text-green-600 border-t mt-1 pt-1"><span>Net Pay:</span><span>₹{((editRow.basic || 0) + (editRow.hra || 0) + (editRow.allowances || 0) - (editRow.pf_employee || 0) - (editRow.esi_employee || 0) - (editRow.tds || 0) - (editRow.advance_deduction || 0) - (editRow.other_deduction || 0)).toLocaleString('en-IN')}</span></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                <Button onClick={saveEdit}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Salary Slip Dialog */}
        {slipData && (
          <Dialog open={slipOpen} onOpenChange={setSlipOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Salary Slip — {slipData.month}</DialogTitle></DialogHeader>
              <div ref={printRef} className="text-sm space-y-3">
                <div className="text-center border-b pb-3">
                  <p className="font-black text-lg">AI Laptop Wala</p>
                  <p className="text-xs text-muted-foreground">Silver Mall, Vijay Nagar, Indore</p>
                  <p className="font-semibold mt-1">Salary Slip — {slipData.month}</p>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div><span className="text-muted-foreground">Employee:</span> <span className="font-medium">{slipData.staff_name}</span></div>
                  <div><span className="text-muted-foreground">Role:</span> <span className="font-medium">{slipData.role}</span></div>
                  <div><span className="text-muted-foreground">Working Days:</span> <span className="font-medium">{slipData.working_days}</span></div>
                  <div><span className="text-muted-foreground">Present Days:</span> <span className="font-medium">{slipData.present_days}</span></div>
                </div>
                <table className="w-full border text-xs">
                  <thead><tr className="bg-muted/50"><th className="p-2 text-left border">Earnings</th><th className="p-2 text-right border">Amount</th><th className="p-2 text-left border">Deductions</th><th className="p-2 text-right border">Amount</th></tr></thead>
                  <tbody>
                    <tr><td className="p-2 border">Basic</td><td className="p-2 border text-right">₹{(slipData.basic || 0).toLocaleString('en-IN')}</td><td className="p-2 border">PF (Employee 12%)</td><td className="p-2 border text-right">₹{(slipData.pf_employee || 0).toLocaleString('en-IN')}</td></tr>
                    <tr><td className="p-2 border">HRA (40%)</td><td className="p-2 border text-right">₹{(slipData.hra || 0).toLocaleString('en-IN')}</td><td className="p-2 border">ESI (Employee 0.75%)</td><td className="p-2 border text-right">₹{(slipData.esi_employee || 0).toLocaleString('en-IN')}</td></tr>
                    <tr><td className="p-2 border">Allowances</td><td className="p-2 border text-right">₹{(slipData.allowances || 0).toLocaleString('en-IN')}</td><td className="p-2 border">TDS</td><td className="p-2 border text-right">₹{(slipData.tds || 0).toLocaleString('en-IN')}</td></tr>
                    <tr><td className="p-2 border"></td><td className="p-2 border"></td><td className="p-2 border">Advance</td><td className="p-2 border text-right">₹{(slipData.advance_deduction || 0).toLocaleString('en-IN')}</td></tr>
                    <tr className="font-bold bg-muted/30"><td className="p-2 border">Gross</td><td className="p-2 border text-right">₹{(slipData.gross || 0).toLocaleString('en-IN')}</td><td className="p-2 border">Total Deductions</td><td className="p-2 border text-right">₹{((slipData.pf_employee || 0) + (slipData.esi_employee || 0) + (slipData.tds || 0) + (slipData.advance_deduction || 0)).toLocaleString('en-IN')}</td></tr>
                  </tbody>
                </table>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center">
                  <span className="font-bold">Net Pay</span>
                  <span className="text-xl font-black text-green-600">₹{(slipData.net || 0).toLocaleString('en-IN')}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  <div>PF Employer (12%): ₹{(slipData.pf_employer || 0).toLocaleString('en-IN')}</div>
                  <div>ESI Employer (3.25%): ₹{(slipData.esi_employer || 0).toLocaleString('en-IN')}</div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSlipOpen(false)}>Close</Button>
                <Button onClick={printSlip} className="gap-1.5"><Printer className="h-4 w-4" /> Print</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </ERPLayout>
  );
}
