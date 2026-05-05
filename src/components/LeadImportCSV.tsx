// LeadImportCSV — parse CSV and bulk import leads
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const req = (method: string, path: string, body?: any) =>
  fetch(`/api/erp${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then(r => r.json());

interface Props { open: boolean; onClose: () => void; onDone: () => void; }

const SAMPLE_CSV = `name,phone,email,source,interest,budget,priority
Rahul Sharma,9876543210,rahul@email.com,JustDial,Dell Laptop,45000,normal
Priya Singh,9765432109,,Walk-in,Screen Repair,3000,high
Amit Kumar,9654321098,amit@gmail.com,WhatsApp,HP Laptop,35000,normal`;

export default function LeadImportCSV({ open, onClose, onDone }: Props) {
  const [preview, setPreview] = useState<any[]>([]);
  const [results, setResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    return lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const obj: any = {};
      headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
      return obj;
    }).filter(r => r.name);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const rows = parseCSV(ev.target?.result as string);
      setPreview(rows); setResults(null);
    };
    reader.readAsText(file);
  };

  const importLeads = async () => {
    if (!preview.length) return;
    setImporting(true);
    let success = 0, failed = 0;
    const errors: string[] = [];
    for (const row of preview) {
      try {
        const res = await req('POST', '/leads', {
          name: row.name, phone: row.phone || '', email: row.email || '',
          source: row.source || 'Import', interest: row.interest || '',
          budget: Number(row.budget) || 0, priority: row.priority || 'normal',
          status: 'new',
        });
        if (res.error === 'duplicate') { errors.push(`${row.name}: duplicate`); failed++; }
        else { success++; }
      } catch { errors.push(`${row.name}: failed`); failed++; }
    }
    setResults({ success, failed, errors });
    setImporting(false);
    if (success > 0) { toast.success(`${success} leads imported!`); onDone(); }
  };

  const downloadSample = () => {
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(SAMPLE_CSV);
    a.download = 'leads_sample.csv'; a.click();
  };

  const reset = () => { setPreview([]); setResults(null); if (fileRef.current) fileRef.current.value = ''; };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Import Leads from CSV</DialogTitle></DialogHeader>

        <div className="space-y-4">
          {/* Upload area */}
          <div className="border-2 border-dashed rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium mb-1">Drop CSV file or click to upload</p>
            <p className="text-xs text-muted-foreground mb-3">Columns: name, phone, email, source, interest, budget, priority</p>
            <div className="flex gap-2 justify-center">
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}>Choose File</Button>
              <Button size="sm" variant="ghost" className="gap-1.5 text-xs" onClick={downloadSample}><Download className="h-3.5 w-3.5" /> Sample CSV</Button>
            </div>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFile} />
          </div>

          {/* Preview */}
          {preview.length > 0 && !results && (
            <div>
              <p className="text-sm font-semibold mb-2">{preview.length} leads ready to import</p>
              <div className="border rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Phone</th>
                      <th className="text-left p-2">Source</th>
                      <th className="text-left p-2">Interest</th>
                      <th className="text-right p-2">Budget</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((r, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2 font-medium">{r.name}</td>
                        <td className="p-2 text-muted-foreground">{r.phone}</td>
                        <td className="p-2">{r.source || 'Import'}</td>
                        <td className="p-2 text-muted-foreground">{r.interest}</td>
                        <td className="p-2 text-right">{r.budget ? `₹${Number(r.budget).toLocaleString('en-IN')}` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-2">
              <div className="flex gap-3">
                <div className="flex items-center gap-2 text-green-600"><CheckCircle className="h-4 w-4" /><span className="font-bold">{results.success} imported</span></div>
                {results.failed > 0 && <div className="flex items-center gap-2 text-red-600"><XCircle className="h-4 w-4" /><span className="font-bold">{results.failed} failed</span></div>}
              </div>
              {results.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-h-32 overflow-y-auto">
                  {results.errors.map((e, i) => <p key={i} className="text-xs text-red-600">{e}</p>)}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onClose(); }}>Close</Button>
          {preview.length > 0 && !results && (
            <Button onClick={importLeads} disabled={importing} className="gap-1.5">
              <Upload className="h-4 w-4" />
              {importing ? 'Importing...' : `Import ${preview.length} Leads`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
