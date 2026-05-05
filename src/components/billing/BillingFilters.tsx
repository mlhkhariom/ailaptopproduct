// BillingFilters — type tabs + status + date range + search
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, X, ShoppingBag, Wrench, FileText, LayoutList } from "lucide-react";

interface Props {
  typeFilter: string; setTypeFilter: (v: string) => void;
  statusFilter: string; setStatusFilter: (v: string) => void;
  search: string; setSearch: (v: string) => void;
  from: string; setFrom: (v: string) => void;
  to: string; setTo: (v: string) => void;
  onSearch: () => void;
  counts: { all: number; order: number; service: number; custom: number };
}

export default function BillingFilters({
  typeFilter, setTypeFilter, statusFilter, setStatusFilter,
  search, setSearch, from, setFrom, to, setTo, onSearch, counts,
}: Props) {
  const hasFilters = from || to || statusFilter !== 'all' || search;

  return (
    <div className="space-y-3">
      {/* Type tabs */}
      <Tabs value={typeFilter} onValueChange={setTypeFilter}>
        <TabsList className="h-9">
          <TabsTrigger value="all" className="gap-1.5 text-sm">
            <LayoutList className="h-3.5 w-3.5" /> All ({counts.all})
          </TabsTrigger>
          <TabsTrigger value="order" className="gap-1.5 text-sm">
            <ShoppingBag className="h-3.5 w-3.5" /> Orders ({counts.order})
          </TabsTrigger>
          <TabsTrigger value="service" className="gap-1.5 text-sm">
            <Wrench className="h-3.5 w-3.5" /> Service ({counts.service})
          </TabsTrigger>
          <TabsTrigger value="custom" className="gap-1.5 text-sm">
            <FileText className="h-3.5 w-3.5" /> Custom ({counts.custom})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters row */}
      <div className="flex gap-2 flex-wrap items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name, invoice #..."
            className="pl-8 h-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && onSearch()}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-32 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1.5">
          <Input type="date" className="h-9 text-sm w-36" value={from} onChange={e => setFrom(e.target.value)} />
          <span className="text-muted-foreground text-sm">—</span>
          <Input type="date" className="h-9 text-sm w-36" value={to} onChange={e => setTo(e.target.value)} />
        </div>

        {hasFilters && (
          <Button size="sm" variant="ghost" className="h-9 gap-1.5 text-sm"
            onClick={() => { setFrom(''); setTo(''); setStatusFilter('all'); setSearch(''); }}>
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}
