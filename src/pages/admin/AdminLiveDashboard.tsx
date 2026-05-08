import { useState, useEffect, useCallback } from "react";
import { IndianRupee, Wrench, CheckCircle, Clock, Users, TrendingUp, RefreshCw, Tv2, AlertTriangle } from "lucide-react";
import BranchSelector from "@/components/BranchSelector";

const authFetch = (url: string) =>
  fetch(url, { headers: { Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` } }).then(r => r.json()).catch(() => ({}));

export default function AdminLiveDashboard() {
  const [data, setData] = useState<any>({});
  const [jobs, setJobs] = useState<any[]>([]);
  const [branch, setBranch] = useState('all');
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [fullscreen, setFullscreen] = useState(false);

  const load = useCallback(async () => {
    const bq = branch !== 'all' ? `?branch_id=${branch}` : '';
    const [dash, jobList] = await Promise.all([
      authFetch(`/api/erp/dashboard${bq}`),
      authFetch(`/api/erp/job-cards${bq}`),
    ]);
    setData(dash || {});
    setJobs(Array.isArray(jobList) ? jobList.filter((j: any) => ['pending', 'in_progress'].includes(j.status)).slice(0, 12) : []);
    setLastUpdate(new Date());
  }, [branch]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const time = lastUpdate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const kpis = [
    { label: 'Today Revenue', value: `₹${(data.monthRevenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-green-400', bg: 'bg-green-950/50 border-green-800' },
    { label: 'Pending Jobs', value: data.pendingJobs || 0, icon: Clock, color: 'text-orange-400', bg: 'bg-orange-950/50 border-orange-800' },
    { label: 'Completed Today', value: data.completedToday || 0, icon: CheckCircle, color: 'text-blue-400', bg: 'bg-blue-950/50 border-blue-800' },
    { label: 'Pending Payments', value: data.pendingPayments || 0, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-950/50 border-red-800' },
    { label: 'Active Staff', value: data.totalStaff || 0, icon: Users, color: 'text-purple-400', bg: 'bg-purple-950/50 border-purple-800' },
    { label: 'Net Profit (Month)', value: `₹${(data.netProfit || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: data.netProfit >= 0 ? 'text-green-400' : 'text-red-400', bg: 'bg-slate-800/50 border-slate-700' },
  ];

  const statusColor: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-300 border-yellow-700',
    in_progress: 'bg-blue-500/20 text-blue-300 border-blue-700',
    completed: 'bg-green-500/20 text-green-300 border-green-700',
  };

  return (
    <div className={`min-h-screen bg-gray-950 text-white ${fullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Tv2 className="h-5 w-5 text-primary" />
          <span className="font-black text-lg">AI Laptop Wala — Live Dashboard</span>
          <span className="text-xs text-gray-400 ml-2">{today}</span>
        </div>
        <div className="flex items-center gap-3">
          <BranchSelector value={branch} onChange={setBranch} className="w-44 bg-gray-800 border-gray-700 text-white" />
          <button onClick={load} className="p-1.5 rounded hover:bg-gray-800"><RefreshCw className="h-4 w-4 text-gray-400" /></button>
          <button onClick={() => setFullscreen(f => !f)} className="p-1.5 rounded hover:bg-gray-800 text-xs text-gray-400">{fullscreen ? 'Exit' : 'Fullscreen'}</button>
          <span className="text-xs text-gray-500">Updated: {time}</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {kpis.map(k => (
            <div key={k.label} className={`border rounded-xl p-4 ${k.bg}`}>
              <div className="flex items-center gap-2 mb-2">
                <k.icon className={`h-4 w-4 ${k.color}`} />
                <span className="text-xs text-gray-400">{k.label}</span>
              </div>
              <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Live Job Board */}
        <div className="border border-gray-800 rounded-xl overflow-hidden">
          <div className="bg-gray-900 px-4 py-2 flex items-center justify-between">
            <span className="font-bold text-sm flex items-center gap-2"><Wrench className="h-4 w-4 text-primary" /> Live Job Board</span>
            <span className="text-xs text-gray-500">{jobs.length} active jobs</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 p-4">
            {jobs.map((j: any) => (
              <div key={j.id} className="bg-gray-900 border border-gray-800 rounded-lg p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-gray-400">{j.booking_number}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColor[j.status] || 'bg-gray-800 text-gray-300 border-gray-700'}`}>
                    {j.status === 'in_progress' ? 'In Progress' : 'Pending'}
                  </span>
                </div>
                <p className="font-bold text-sm truncate">{j.customer_name}</p>
                <p className="text-xs text-gray-400 truncate">{j.device_brand} {j.device_model}</p>
                <p className="text-xs text-gray-500 truncate">{j.service_name}</p>
                {j.technician && <p className="text-xs text-blue-400">👨‍🔧 {j.technician}</p>}
                {j.sla_breached ? <p className="text-xs text-red-400 font-bold">⚠ SLA Breached</p> : null}
              </div>
            ))}
            {!jobs.length && (
              <div className="col-span-4 py-12 text-center text-gray-600">
                <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
                <p>No active jobs right now</p>
              </div>
            )}
          </div>
        </div>

        {/* Auto-refresh indicator */}
        <div className="text-center text-xs text-gray-700">
          Auto-refreshes every 30 seconds • {branch === 'all' ? 'All Branches' : 'Branch filtered'}
        </div>
      </div>
    </div>
  );
}
