import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Scale, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CompareBar() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const check = () => setItems(JSON.parse(localStorage.getItem('compare') || '[]'));
    check();
    window.addEventListener('storage', check);
    const interval = setInterval(check, 2000); // poll for changes
    return () => { window.removeEventListener('storage', check); clearInterval(interval); };
  }, []);

  const remove = (id: string) => {
    const updated = items.filter(i => i.id !== id);
    localStorage.setItem('compare', JSON.stringify(updated));
    setItems(updated);
  };

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-16 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-card border shadow-xl rounded-xl p-3 animate-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold flex items-center gap-1.5"><Scale className="h-4 w-4" /> Compare ({items.length}/4)</span>
        <Link to="/compare"><Button size="sm">Compare Now</Button></Link>
      </div>
      <div className="flex gap-2">
        {items.map(item => (
          <div key={item.id} className="relative w-12 h-12 rounded-lg border overflow-hidden">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            <button onClick={() => remove(item.id)} className="absolute -top-1 -right-1 bg-destructive text-white rounded-full w-4 h-4 flex items-center justify-center">
              <X className="h-2.5 w-2.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
