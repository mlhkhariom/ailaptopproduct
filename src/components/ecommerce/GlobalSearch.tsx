import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function GlobalSearch({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query || query.length < 2) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(() => {
      fetch(`/api/products?search=${encodeURIComponent(query)}&limit=8`).then(r => r.json()).then(d => {
        const items = Array.isArray(d) ? d : d?.products || [];
        setResults(items.slice(0, 8));
        setLoading(false);
      }).catch(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query) navigate(`/products?q=${encodeURIComponent(query)}`);
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <form onSubmit={submit} className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          className="w-full pl-9 pr-9 py-2 rounded-full border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          placeholder="Search laptops, repairs..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); setResults([]); }} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {open && query.length >= 2 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-background border rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {loading && <p className="p-3 text-xs text-muted-foreground text-center">Searching...</p>}
          {!loading && !results.length && query.length >= 2 && <p className="p-3 text-xs text-muted-foreground text-center">No results for "{query}"</p>}
          {!query && open && (
            <div className="p-3">
              <p className="text-[10px] font-semibold text-muted-foreground mb-2">🔥 Popular Searches</p>
              <div className="flex flex-wrap gap-1.5">
                {['Dell Laptop', 'MacBook', 'Gaming', 'HP EliteBook', '8GB RAM', 'SSD'].map(s => (
                  <button key={s} onClick={() => { setQuery(s); }} className="text-xs bg-muted px-2.5 py-1 rounded-full hover:bg-primary/10 hover:text-primary transition-colors">{s}</button>
                ))}
              </div>
            </div>
          )}
          {results.map((r: any) => (
            <Link key={r.id} to={`/products/${r.slug || r.id}`} onClick={() => setOpen(false)} className="flex items-center gap-3 p-2.5 hover:bg-muted/50 border-b last:border-0">
              {r.image && <img src={r.image} alt="" className="h-10 w-10 rounded object-cover" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.category} · ₹{r.price}</p>
              </div>
            </Link>
          ))}
          {results.length >= 8 && (
            <button onClick={submit} className="w-full p-2 text-xs text-primary hover:bg-muted/50 font-medium">
              View all results →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
