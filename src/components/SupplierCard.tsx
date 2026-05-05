// Supplier Card with PO count + quick actions
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Phone, Mail, MapPin, FileText } from "lucide-react";

interface Props {
  supplier: any;
  poCount: number;
  onEdit: () => void;
  onDelete: () => void;
  onNewPO: () => void;
}

const TERMS_COLOR: Record<string, string> = {
  immediate: 'bg-green-100 text-green-700',
  net15: 'bg-blue-100 text-blue-700',
  net30: 'bg-yellow-100 text-yellow-700',
  net60: 'bg-orange-100 text-orange-700',
};

export default function SupplierCard({ supplier: s, poCount, onEdit, onDelete, onNewPO }: Props) {
  return (
    <Card className="hover:shadow-md transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="font-bold text-base">{s.name}</p>
            {s.contact_person && <p className="text-sm text-muted-foreground">{s.contact_person}</p>}
          </div>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onEdit}><Edit className="h-3.5 w-3.5" /></Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
          </div>
        </div>

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
              <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />{s.address}
            </p>
          )}
          {s.gstin && <p className="text-xs text-muted-foreground">GSTIN: {s.gstin}</p>}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TERMS_COLOR[s.payment_terms] || 'bg-gray-100 text-gray-700'}`}>
              {s.payment_terms}
            </span>
            {poCount > 0 && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <FileText className="h-3 w-3" />{poCount} POs
              </span>
            )}
          </div>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={onNewPO}>
            <FileText className="h-3 w-3" /> New PO
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
