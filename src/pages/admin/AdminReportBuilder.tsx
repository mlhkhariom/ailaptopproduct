import { useState, useEffect } from "react";
import ERPLayout from "@/components/ERPLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Play, Download, Plus, X, GripVertical, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";

const req = (method: string, path: string, body?: any) =>
  fetch(`/api/erp${path}`, {
    method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then(r => r.json());

const OPS = [
  { value: 'like', label: 'Contains' },
  { value: 'eq', label: 'Equals' },
  { value: 'gte', label: '>=' },
  { value: 'lte', label: '<=' },
  { value: 'date_from', label: 'Date From' },
  { value: 'date_to', label: 'Date To' },
];

export default function AdminReportBuilder() {
  const [sources, setSources] = useState<any[]>([]);
  const [source, setSource] = useState('orders');
  const [allFields, setAllFields] = useState<string[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [filters, setFilters] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('DESC');
  const [rows, setRows] = useState<any[]>([]);
  const [cols, setCols] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [saveName, setSaveName] = useState('');
  const [saveOpen, setSaveOpen] = useState(false);

  useEffect(() => {
    req('GET', '/report-builder/sources').then(d => { setSources(d); });
    req('GET', '/saved-reports').then(d => setSavedReports(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    const src = sources.find(s => s.key === source);
    if (src) { setAllFields(src.fields); setSelectedFields(src.fields.slice(0, 6)); setFilters([]); setRows([]); setRan(false); }
  }, [source, sources]);

  const toggleField = (f: string) => {
    setSelectedFields(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  };

  const moveField = (i: number, dir: -1 | 1) => {
    const arr = [...selectedFields];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setSelectedFields(arr);
  };

  const addFilter = () => setFilters(f => [...f, { field: allFields[0], op: 'like', value: '' }]);
  const removeFilter = (i: number) => setFilters(f => f.filter((_, j) => j !== i));
  const updateFilter = (i: number, key: string, val: string) => setFilters(f => f.map((x, j) => j === i ? { ...x, [key]: val } : x));

  const run = async () => {
    setLoading(true); setRan(true);
    const res = await req('POST', '/report-builder/run', { source, fields: selectedFields, filters, sort_by: sortBy, sort_dir: sortDir });
    if (res.error) { toast.error(res.error); setLoading(false); return; }
    setRows(res.rows || []); setCols(res.cols || []);
    setLoading(false);
    toast.success(`${res.total} rows loaded`);
  };

  const saveReport = async () => {
    if (!saveName) return;
    await req('POST', '/saved-reports', { name: saveName, source, fields: selectedFields, filters, sort_by: sortBy, sort_dir: sortDir });
    setSaveOpen(false); setSaveName('');
    req('GET', '/saved-reports').then(d => setSavedReports(Array.isArray(d) ? d : []));
  };

  const loadSaved = (r: any) => {
    setSource(r.source);
    const f = typeof r.fields === 'string' ? JSON.parse(r.fields) : r.fields;
    const fi = typeof r.filters === 'string' ? JSON.parse(r.filters) : r.filters;
    setSelectedFields(f || []); setFilters(fi || []);
    setSortBy(r.sort_by || 'created_at'); setSortDir(r.sort_dir || 'DESC');
  };

  const deleteSaved = async (id: string) => {
    await req('DELETE', `/saved-reports/${id}`, {});
    req('GET', '/saved-reports').then(d => setSavedReports(Array.isArray(d) ? d : []));
  };

  const exportCSV = async () => {
    const res = await fetch('/api/erp/report-builder/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
      body: JSON.stringify({ source, fields: selectedFields, filters, sort_by: sortBy, sort_dir: sortDir }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `report_${source}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const currentSrc = sources.find(s => s.key === source);

  return (
    <ERPLayout>
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-xl font-black flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" /> Custom Report Builder</h1>
          <div className="flex gap-2">
            {ran && rows.length > 0 && <Button size="sm" variant="outline" onClick={exportCSV} className="gap-1.5"><Download className="h-4 w-4" /> Export CSV</Button>}
            {ran && rows.length > 0 && <Button size="sm" variant="outline" onClick={() => setSaveOpen(true)} className="gap-1.5"><Plus className="h-4 w-4" /> Save Report</Button>}
            <Button size="sm" onClick={run} disabled={loading} className="gap-1.5"><Play className="h-4 w-4" />{loading ? 'Running...' : 'Run Report'}</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left panel — config */}
          <div className="space-y-4">
            {/* Data Source */}
            <div className="border rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data Source</p>
              <Select value={source} onValueChange={setSource}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {sources.map(s => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {/* Fields */}
            <div className="border rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fields ({selectedFields.length} selected)</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {allFields.map(f => (
                  <button key={f} onClick={() => toggleField(f)}
                    className={`text-xs px-2 py-1 rounded-full border transition-all ${selectedFields.includes(f) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50'}`}>
                    {f}
                  </button>
                ))}
              </div>
              {/* Order */}
              {selectedFields.length > 0 && (
                <div className="space-y-1 mt-2 border-t pt-2">
                  <p className="text-xs text-muted-foreground">Column order (drag to reorder):</p>
                  {selectedFields.map((f, i) => (
                    <div key={f} className="flex items-center gap-1 bg-muted/40 rounded px-2 py-1">
                      <GripVertical className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs flex-1">{f}</span>
                      <button onClick={() => moveField(i, -1)} disabled={i === 0}><ChevronUp className="h-3 w-3" /></button>
                      <button onClick={() => moveField(i, 1)} disabled={i === selectedFields.length - 1}><ChevronDown className="h-3 w-3" /></button>
                      <button onClick={() => toggleField(f)}><X className="h-3 w-3 text-red-500" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="border rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Filters</p>
                <Button size="sm" variant="ghost" className="h-6 text-xs gap-1" onClick={addFilter}><Plus className="h-3 w-3" /> Add</Button>
              </div>
              {filters.map((f, i) => (
                <div key={i} className="grid grid-cols-12 gap-1 items-center">
                  <Select value={f.field} onValueChange={v => updateFilter(i, 'field', v)}>
                    <SelectTrigger className="col-span-4 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{allFields.map(x => <SelectItem key={x} value={x} className="text-xs">{x}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={f.op} onValueChange={v => updateFilter(i, 'op', v)}>
                    <SelectTrigger className="col-span-3 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{OPS.map(o => <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input className="col-span-4 h-8 text-xs" value={f.value} onChange={e => updateFilter(i, 'value', e.target.value)} placeholder="Value" />
                  <button onClick={() => removeFilter(i)} className="col-span-1 flex justify-center"><X className="h-3.5 w-3.5 text-red-500" /></button>
                </div>
              ))}
              {!filters.length && <p className="text-xs text-muted-foreground">No filters — showing all records</p>}
            </div>

            {/* Saved Reports */}
            {savedReports.length > 0 && (
              <div className="border rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Saved Reports</p>
                {savedReports.map((r: any) => (
                  <div key={r.id} className="flex items-center gap-1">
                    <button onClick={() => loadSaved(r)} className="flex-1 text-left text-xs px-2 py-1.5 rounded hover:bg-muted/50 font-medium truncate">{r.name}</button>
                    <button onClick={() => deleteSaved(r.id)} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Sort */}
            <div className="border rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sort</p>
              <div className="grid grid-cols-2 gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{allFields.map(f => <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={sortDir} onValueChange={setSortDir}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DESC">Newest First</SelectItem>
                    <SelectItem value="ASC">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Right panel — results */}
          <div className="lg:col-span-2">
            {!ran && (
              <div className="border rounded-xl h-64 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <BarChart3 className="h-10 w-10 opacity-30" />
                <p className="text-sm">Configure your report and click Run</p>
              </div>
            )}
            {ran && (
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 flex items-center justify-between">
                  <p className="text-xs font-semibold">{currentSrc?.label} — {rows.length} rows</p>
                  {rows.length > 0 && <Badge variant="outline" className="text-xs">{cols.length} columns</Badge>}
                </div>
                <div className="overflow-auto max-h-[60vh]">
                  {rows.length > 0 ? (
                    <table className="w-full text-xs">
                      <thead className="bg-muted/30 sticky top-0">
                        <tr>{cols.map(c => <th key={c} className="text-left p-2 font-semibold whitespace-nowrap border-b">{c}</th>)}</tr>
                      </thead>
                      <tbody>
                        {rows.map((row, i) => (
                          <tr key={i} className="border-b hover:bg-muted/20">
                            {cols.map(c => (
                              <td key={c} className="p-2 whitespace-nowrap max-w-[200px] truncate">
                                {row[c] !== null && row[c] !== undefined ? String(row[c]) : '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-10 text-center text-muted-foreground text-sm">No results found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Save Report Dialog */}
      {saveOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border rounded-xl p-6 w-80 space-y-3">
            <p className="font-bold">Save Report</p>
            <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Report name..." value={saveName} onChange={e => setSaveName(e.target.value)} autoFocus />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setSaveOpen(false)} className="px-3 py-1.5 text-sm border rounded-lg">Cancel</button>
              <button onClick={saveReport} className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </ERPLayout>
  );
}
