import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem { label: string; href?: string; }

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground py-3 overflow-x-auto">
      <Link to="/" className="flex items-center gap-1 hover:text-primary shrink-0"><Home className="h-3 w-3" /><span className="hidden sm:inline">Home</span></Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1 shrink-0">
          <ChevronRight className="h-3 w-3" />
          {item.href ? <Link to={item.href} className="hover:text-primary">{item.label}</Link> : <span className="text-foreground font-medium truncate max-w-[200px]">{item.label}</span>}
        </span>
      ))}
    </nav>
  );
}
