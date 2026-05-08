import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  allLabel?: string;
  className?: string;
}

export default function BranchSelector({ value, onChange, allLabel = "All Branches", className = "" }: Props) {
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/erp/branches', { headers: { Authorization: `Bearer ${localStorage.getItem('ailaptopwala_token')}` } })
      .then(r => r.json()).then(d => setBranches(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`h-9 gap-1.5 ${className}`}>
        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
        <SelectValue placeholder={allLabel} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
