// Job Card Timeline — status history with timestamps
import { useState, useEffect } from "react";
import { Clock, CheckCircle, Wrench, XCircle, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const STATUS_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  pending:     { icon: Clock,         color: 'text-gray-500',   bg: 'bg-gray-100' },
  in_progress: { icon: Wrench,        color: 'text-blue-600',   bg: 'bg-blue-100' },
  completed:   { icon: CheckCircle,   color: 'text-green-600',  bg: 'bg-green-100' },
  cancelled:   { icon: XCircle,       color: 'text-red-600',    bg: 'bg-red-100' },
  diagnosed:   { icon: AlertCircle,   color: 'text-orange-600', bg: 'bg-orange-100' },
  waiting_parts:{ icon: Clock,        color: 'text-yellow-600', bg: 'bg-yellow-100' },
};

const req = (method: string, path: string, body?: any) =>
  fetch(`/api/erp${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then(r => r.json());

interface Props { jobId: string; currentStatus: string; }

export default function JobCardTimeline({ jobId, currentStatus }: Props) {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [note, setNote] = useState('');

  const load = async () => {
    const d = await req('GET', `/job-cards/${jobId}/timeline`);
    setTimeline(Array.isArray(d) ? d : []);
  };

  useEffect(() => { if (jobId) load(); }, [jobId]);

  const addEntry = async () => {
    await req('POST', `/job-cards/${jobId}/timeline`, { status: currentStatus, notes: note });
    toast.success('Timeline updated'); setNote(''); setAdding(false); load();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Timeline</p>
        <Button size="sm" variant="ghost" className="h-6 text-xs gap-1" onClick={() => setAdding(v => !v)}>
          <Plus className="h-3 w-3" /> Add Note
        </Button>
      </div>

      {adding && (
        <div className="flex gap-2">
          <Input className="h-8 text-xs flex-1" placeholder="Add note to timeline..." value={note} onChange={e => setNote(e.target.value)} onKeyDown={e => e.key === 'Enter' && addEntry()} />
          <Button size="sm" className="h-8 text-xs" onClick={addEntry}>Save</Button>
        </div>
      )}

      <div className="relative">
        {timeline.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-3">No timeline entries yet</p>
        )}
        {timeline.map((entry, i) => {
          const cfg = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending;
          const Icon = cfg.icon;
          return (
            <div key={entry.id} className="flex gap-3 pb-4 relative">
              {/* Vertical line */}
              {i < timeline.length - 1 && (
                <div className="absolute left-3.5 top-7 bottom-0 w-px bg-border" />
              )}
              <div className={`h-7 w-7 rounded-full ${cfg.bg} flex items-center justify-center shrink-0 z-10`}>
                <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold capitalize ${cfg.color}`}>{entry.status.replace('_', ' ')}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(entry.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                {entry.notes && <p className="text-xs text-muted-foreground mt-0.5">{entry.notes}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
