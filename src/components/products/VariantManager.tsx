import { useState, useEffect } from "react";
import { Plus, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
}

export default function VariantManager({ open, onClose, productId, productName }: Props) {
  const [variants, setVariants] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [newVariant, setNewVariant] = useState({ name: '', price: '', stock: '', sku: '' });
  const [newOption, setNewOption] = useState({ option_name: '', option_values: '' });
  const token = localStorage.getItem('ailaptopwala_token');
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const load = () => {
    fetch(`/api/products/${productId}/variants`, { headers }).then(r => r.json()).then(d => {
      setVariants(d.variants || []);
      setOptions(d.options || []);
    });
  };
  useEffect(() => { if (open && productId) load(); }, [open, productId]);

  const addVariant = async () => {
    if (!newVariant.name || !newVariant.price) return toast.error('Name and price required');
    await fetch(`/api/products/${productId}/variants`, { method: 'POST', headers, body: JSON.stringify({ ...newVariant, price: Number(newVariant.price), stock: Number(newVariant.stock) || 0, attributes: {} }) });
    setNewVariant({ name: '', price: '', stock: '', sku: '' });
    toast.success('Variant added');
    load();
  };

  const removeVariant = async (id: string) => {
    await fetch(`/api/products/${productId}/variants/${id}`, { method: 'DELETE', headers });
    toast.success('Deleted');
    load();
  };

  const saveOptions = async () => {
    if (!newOption.option_name || !newOption.option_values) return toast.error('Fill option name and values');
    const newOpts = [...options, { option_name: newOption.option_name, option_values: newOption.option_values.split(',').map(v => v.trim()) }];
    await fetch(`/api/products/${productId}/variant-options`, { method: 'POST', headers, body: JSON.stringify({ options: newOpts }) });
    setNewOption({ option_name: '', option_values: '' });
    toast.success('Options saved');
    load();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Package className="h-5 w-5" /> Variants: {productName}</DialogTitle></DialogHeader>

        {/* Variant Options (RAM, Storage, Color) */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Option Types</h3>
          {options.map((opt: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <Badge variant="outline">{opt.option_name}</Badge>
              <span className="text-muted-foreground">{(typeof opt.option_values === 'string' ? JSON.parse(opt.option_values) : opt.option_values).join(', ')}</span>
            </div>
          ))}
          <div className="flex gap-2">
            <Input placeholder="Option name (RAM, Storage)" value={newOption.option_name} onChange={e => setNewOption(o => ({ ...o, option_name: e.target.value }))} className="h-8 text-sm" />
            <Input placeholder="Values (8GB, 16GB, 32GB)" value={newOption.option_values} onChange={e => setNewOption(o => ({ ...o, option_values: e.target.value }))} className="h-8 text-sm" />
            <Button size="sm" onClick={saveOptions}>Add</Button>
          </div>
        </div>

        <hr />

        {/* Variants List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Variants ({variants.length})</h3>
          {variants.map((v: any) => (
            <Card key={v.id}>
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{v.name}</p>
                  <p className="text-xs text-muted-foreground">₹{v.price} • Stock: {v.stock} • SKU: {v.sku || '-'}</p>
                </div>
                <Button size="icon" variant="ghost" className="text-destructive h-7 w-7" onClick={() => removeVariant(v.id)}><Trash2 className="h-3 w-3" /></Button>
              </CardContent>
            </Card>
          ))}

          {/* Add Variant */}
          <div className="grid grid-cols-4 gap-2">
            <Input placeholder="Name (8GB/256GB)" value={newVariant.name} onChange={e => setNewVariant(v => ({ ...v, name: e.target.value }))} className="h-8 text-sm" />
            <Input placeholder="Price" type="number" value={newVariant.price} onChange={e => setNewVariant(v => ({ ...v, price: e.target.value }))} className="h-8 text-sm" />
            <Input placeholder="Stock" type="number" value={newVariant.stock} onChange={e => setNewVariant(v => ({ ...v, stock: e.target.value }))} className="h-8 text-sm" />
            <Button size="sm" onClick={addVariant} className="gap-1"><Plus className="h-3 w-3" /> Add</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
