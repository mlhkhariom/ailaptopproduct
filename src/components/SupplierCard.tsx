import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2, Phone, Mail, MapPin, FileText, IndianRupee, Clock, StickyNote } from "lucide-react";

interface Props {
  supplier: any;
  onEdit: () => void;
  onDelete: () => void;
  onNewPO: () => void;
  onToggleActive: () => void;
}

const TERMS_COLOR: Record<string, string> = {
  immediate: 'bg-green-100 text-green-700',
  net15: 'bg-blue-100 text-blue-700',
  net30: 'bg-yellow-100 text-yellow-700',
  net60: 'bg-orange-100 text-orange-700',
};

export default function SupplierCard({ supplier: s, onEdit, onDelete, onNewPO, onToggleActive }: Props) {
  return (
    <Card className={`hover:shadow-md transition-all ${!s.is_active ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-base truncate">{s.name}</p>
            {s.contact_person && <p className="text-sm text-muted-foreground">{s.contact_person}</p>}
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <Switch checked={!!s.is_active} onCheckedChange={onToggleActive} />
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onEdit}><Edit className="h-3.5 w-3.5" /></Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-1.5 mb-3">
          {s.phone && (
            <a href={`tel:${s.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Phone className="h-3.5 w-3.5 shrink-0" />{s.phone}
            </a>
          )}
          {s.email && (
            <a href={`mailto:${s.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Mail className="h-3.5 w-3.5 shrink-0" />{s.email}
            </a>
          )}
          {s.address && (
            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" /><span className="truncate">{s.address}</span>
            </p>
          )}
          {s.gstin && <p className="text-xs font-mono bg-muted/50 px-2 py-0.5 rounded w-fit">GSTIN: {s.gstin}</p>}
          {s.notes && (
            <p className="flex items-start gap-2 text-xs text-muted-foreground italic">
              <StickyNote className="h-3.5 w-3.5 shrink-0 mt-0.5" />{s.notes}
            </p>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 border rounded-lg p-2 mb-3 bg-muted/20">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">POs</p>
            <p className="font-bold text-sm">{s.po_count || 0}</p>
          </div>
          <div className="text-center border-x">
            <p className="text-xs text-muted-foreground">Total Spend</p>
            <p className="font-bold text-sm text-primary">₹{(s.total_spend || 0).toLocaleString('en-IN')}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Last PO</p>
            <p className="font-bold text-xs">{s.last_po ? new Date(s.last_po).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${TERMS_COLOR[s.payment_terms] || 'bg-gray-100 text-gray-700'}`}>
            {s.payment_terms}
          </span>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={onNewPO}>
            <FileText className="h-3 w-3" /> New PO
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
