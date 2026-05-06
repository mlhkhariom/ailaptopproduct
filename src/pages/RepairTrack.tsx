import { useState } from "react";
import { Search, Package, CheckCircle, Clock, Wrench, XCircle, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string; desc: string }> = {
  pending:      { label: 'Received',    icon: Package,      color: 'text-blue-600',   bg: 'bg-blue-100',   desc: 'Your device has been received and is waiting for diagnosis.' },
  in_progress:  { label: 'In Progress', icon: Wrench,       color: 'text-orange-600', bg: 'bg-orange-100', desc: 'Our technician is currently working on your device.' },
  completed:    { label: 'Ready',       icon: CheckCircle,  color: 'text-green-600',  bg: 'bg-green-100',  desc: 'Your device is repaired and ready for pickup!' },
  cancelled:    { label: 'Cancelled',   icon: XCircle,      color: 'text-red-600',    bg: 'bg-red-100',    desc: 'This job card has been cancelled.' },
};

const STAGES = ['pending', 'in_progress', 'completed'];

export default function RepairTrack() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch(`/api/erp/job-cards?search=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      const jobs = Array.isArray(data) ? data : [];
      const job = jobs.find(j =>
        j.booking_number?.toLowerCase() === query.trim().toLowerCase() ||
        j.customer_phone?.replace(/\D/g, '').endsWith(query.trim().replace(/\D/g, ''))
      );
      if (job) setResult(job);
      else setError('No repair found. Please check your Job ID or phone number.');
    } catch { setError('Something went wrong. Please try again.'); }
    setLoading(false);
  };

  const cfg = result ? (STATUS_CONFIG[result.status] || STATUS_CONFIG.pending) : null;
  const Icon = cfg?.icon;
  const currentStageIdx = result ? STAGES.indexOf(result.status) : -1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col">
      {/* Header */}
      <div className="bg-black/20 px-6 py-4 flex items-center gap-3">
        <img src="/assets/logo.png" alt="AI Laptop Wala" className="h-8 w-auto" onError={e => (e.currentTarget.style.display = 'none')} />
        <div>
          <p className="font-bold text-white text-sm">AI Laptop Wala</p>
          <p className="text-xs text-white/60">Repair Tracking</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Search */}
          <div className="text-center">
            <h1 className="text-2xl font-black text-white mb-1">Track Your Repair</h1>
            <p className="text-white/60 text-sm">Enter your Job ID or phone number</p>
          </div>

          <div className="flex gap-2">
            <Input
              className="h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-orange-500"
              placeholder="JC-123456 or phone number"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
            />
            <Button className="h-12 px-5 bg-orange-500 hover:bg-orange-600 text-white" onClick={search} disabled={loading}>
              {loading ? <Clock className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            </Button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm text-center">{error}</div>
          )}

          {/* Result */}
          {result && cfg && Icon && (
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              {/* Status header */}
              <div className={`${cfg.bg} p-5 flex items-center gap-4`}>
                <div className={`h-14 w-14 rounded-full bg-white flex items-center justify-center shadow-sm`}>
                  <Icon className={`h-7 w-7 ${cfg.color}`} />
                </div>
                <div>
                  <p className={`text-xl font-black ${cfg.color}`}>{cfg.label}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{cfg.desc}</p>
                </div>
              </div>

              {/* Progress bar */}
              {result.status !== 'cancelled' && (
                <div className="px-5 py-4 border-b">
                  <div className="flex items-center gap-0">
                    {STAGES.map((stage, i) => {
                      const done = i <= currentStageIdx;
                      const active = i === currentStageIdx;
                      return (
                        <div key={stage} className="flex items-center flex-1">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${done ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'} ${active ? 'ring-4 ring-orange-200' : ''}`}>
                            {i + 1}
                          </div>
                          {i < STAGES.length - 1 && <div className={`flex-1 h-1 mx-1 rounded ${i < currentStageIdx ? 'bg-orange-500' : 'bg-gray-100'}`} />}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-gray-500">Received</span>
                    <span className="text-[10px] text-gray-500">In Progress</span>
                    <span className="text-[10px] text-gray-500">Ready</span>
                  </div>
                </div>
              )}

              {/* Details */}
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Job ID</p>
                    <p className="font-bold text-sm font-mono">{result.booking_number}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Device</p>
                    <p className="font-bold text-sm">{result.device_brand} {result.device_model}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Service</p>
                    <p className="font-bold text-sm">{result.service_name || 'Repair'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="font-bold text-sm">₹{(result.total_charge || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                {result.technician && (
                  <div className="bg-orange-50 rounded-xl p-3">
                    <p className="text-xs text-orange-600">Assigned Technician</p>
                    <p className="font-bold text-sm">{result.technician}</p>
                  </div>
                )}
                {result.diagnosis && (
                  <div className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500">Diagnosis</p>
                    <p className="text-sm">{result.diagnosis}</p>
                  </div>
                )}
              </div>

              {/* Contact */}
              <div className="bg-gray-50 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Silver Mall, RNT Marg, Indore</span>
                </div>
                <a href="tel:+919893496163" className="flex items-center gap-1.5 text-orange-600 text-xs font-semibold">
                  <Phone className="h-3.5 w-3.5" /> Call Us
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
