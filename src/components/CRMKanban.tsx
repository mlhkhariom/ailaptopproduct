// CRM Kanban Board Component
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, ClipboardList, AlertTriangle } from "lucide-react";

const STAGES = [
  { key: 'new', label: 'New', color: 'bg-gray-100 border-gray-300 text-gray-700' },
  { key: 'contacted', label: 'Contacted', color: 'bg-blue-100 border-blue-300 text-blue-700' },
  { key: 'interested', label: 'Interested', color: 'bg-yellow-100 border-yellow-300 text-yellow-700' },
  { key: 'negotiating', label: 'Negotiating', color: 'bg-orange-100 border-orange-300 text-orange-700' },
  { key: 'won', label: 'Won', color: 'bg-green-100 border-green-300 text-green-700' },
  { key: 'lost', label: 'Lost', color: 'bg-red-100 border-red-300 text-red-700' },
];

const PRIORITY_DOT: Record<string, string> = {
  high: 'bg-red-500', normal: 'bg-blue-400', low: 'bg-gray-400',
};

interface KanbanProps {
  leads: any[];
  onStatusChange: (id: string, status: string) => void;
  onOpenDetail: (lead: any) => void;
  onConvert: (lead: any) => void;
}

export default function CRMKanban({ leads, onStatusChange, onOpenDetail, onConvert }: KanbanProps) {
  const byStage = (key: string) => leads.filter(l => l.status === key);
  const stageValue = (key: string) => byStage(key).reduce((s, l) => s + (l.deal_value || l.budget || 0), 0);

  const handleDragStart = (e: React.DragEvent, id: string) => e.dataTransfer.setData('leadId', id);
  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('leadId');
    if (id) onStatusChange(id, status);
  };

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 min-h-[500px]">
      {STAGES.map(stage => {
        const stageleads = byStage(stage.key);
        const val = stageValue(stage.key);
        return (
          <div key={stage.key} className="flex-shrink-0 w-64"
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(e, stage.key)}>
            {/* Column header */}
            <div className={`rounded-t-xl border-b-2 px-3 py-2.5 ${stage.color} border`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{stage.label}</span>
                <span className="text-xs font-bold bg-white/60 px-2 py-0.5 rounded-full">{stageleads.length}</span>
              </div>
              {val > 0 && <p className="text-xs mt-0.5 opacity-70">₹{val.toLocaleString('en-IN')}</p>}
            </div>

            {/* Cards */}
            <div className="bg-muted/30 rounded-b-xl border border-t-0 min-h-[400px] p-2 space-y-2">
              {stageleads.map(l => {
                const overdue = l.next_followup && new Date(l.next_followup) < new Date() && !['won','lost'].includes(l.status);
                return (
                  <div key={l.id} draggable
                    onDragStart={e => handleDragStart(e, l.id)}
                    onClick={() => onOpenDetail(l)}
                    className="bg-white rounded-lg p-3 shadow-sm border hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-start justify-between gap-1 mb-1.5">
                      <p className="font-semibold text-sm leading-tight">{l.name}</p>
                      <span className={`h-2 w-2 rounded-full shrink-0 mt-1 ${PRIORITY_DOT[l.priority] || PRIORITY_DOT.normal}`} title={l.priority} />
                    </div>
                    {l.interest && <p className="text-xs text-muted-foreground truncate mb-1">{l.interest}</p>}
                    {(l.deal_value || l.budget) > 0 && (
                      <p className="text-xs font-bold text-green-600">₹{(l.deal_value || l.budget).toLocaleString('en-IN')}</p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1">
                        {overdue && <AlertTriangle className="h-3 w-3 text-red-500" title="Overdue" />}
                        {l.next_followup && !overdue && <span className="text-[10px] text-muted-foreground">{l.next_followup}</span>}
                        {l.source && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">{l.source}</span>}
                      </div>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`tel:${l.phone}`} onClick={e => e.stopPropagation()}>
                          <Button size="icon" variant="ghost" className="h-6 w-6"><Phone className="h-3 w-3" /></Button>
                        </a>
                        <a href={`https://wa.me/91${l.phone?.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-green-600">
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          </Button>
                        </a>
                        {!['won','lost'].includes(l.status) && (
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-blue-600" onClick={e => { e.stopPropagation(); onConvert(l); }}>
                            <ClipboardList className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {stageleads.length === 0 && (
                <div className="text-center py-8 text-xs text-muted-foreground/50">Drop here</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
