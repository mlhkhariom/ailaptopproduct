// Inventory Stock Chart — category-wise stock distribution
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

interface Props {
  products: any[];
}

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16'];

export default function InventoryStockChart({ products }: Props) {
  // Group by category
  const byCategory: Record<string, { total: number; inStock: number; value: number }> = {};
  products.forEach(p => {
    const cat = p.category || 'Uncategorized';
    if (!byCategory[cat]) byCategory[cat] = { total: 0, inStock: 0, value: 0 };
    byCategory[cat].total++;
    if (p.in_stock) byCategory[cat].inStock++;
    byCategory[cat].value += (p.price || 0) * (p.stock || 0);
  });

  const data = Object.entries(byCategory)
    .map(([cat, d]) => ({ cat: cat.length > 10 ? cat.slice(0, 10) + '…' : cat, ...d }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" /> Stock by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="cat" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip
              formatter={(value: any, name: string) => [value, name === 'inStock' ? 'In Stock' : 'Total']}
              labelStyle={{ fontSize: 11 }}
            />
            <Bar dataKey="total" name="Total" fill="#e2e8f0" radius={[3,3,0,0]} />
            <Bar dataKey="inStock" name="In Stock" radius={[3,3,0,0]}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-2 mt-2">
          {data.map((d, i) => (
            <div key={d.cat} className="flex items-center gap-1 text-xs">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
              <span className="text-muted-foreground">{d.cat}</span>
              <span className="font-medium">{d.inStock}/{d.total}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
