// BillingTable — main invoice table + mobile cards
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Send, Edit, ShoppingBag, Wrench, FileText, History } from "lucide-react";

type BillingRow = {
  id: string; invoice_number: string; type: 'order' | 'service' | 'custom';
  customer_name: string; customer_phone: string; amount: number;
  payment_status: string; payment_method: string; created_at: string;
  device?: string; service_name?: string; items?: any;
};

const TYPE_CONFIG = {
  order:   { label: 'Order',   icon: ShoppingBag, color: 'bg-blue-100 text-blue-700' },
  service: { label: 'Service', icon: Wrench,      color: 'bg-orange-100 text-orange-700' },
  custom:  { label: 'Custom',  icon: FileText,    color: 'bg-purple-100 text-purple-700' },
};

const PAY_COLOR: Record<string, string> = {
  paid:    'bg-green-100 text-green-700',
  pending: 'bg-red-100 text-red-700',
  partial: 'bg-yellow-100 text-yellow-700',
};

interface Props {
  rows: BillingRow[];
  onView: (r: BillingRow) => void;
  onSendWA: (r: BillingRow) => void;
  onEdit: (r: BillingRow) => void;
  onPayClick: (r: BillingRow) => void;
  onPartialClick?: (r: BillingRow) => void;
}

export default function BillingTable({ rows, onView, onSendWA, onEdit, onPayClick, onPartialClick }: Props) {
  if (!rows.length) return (
    <div className="border rounded-xl p-16 text-center text-muted-foreground">
      <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
      <p>No invoices found</p>
    </div>
  );

  return (
    <>
      {/* Desktop Table */}
      <div className="border rounded-xl overflow-hidden hidden md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3.5 text-xs font-semibold">Invoice #</th>
              <th className="text-left p-3.5 text-xs font-semibold">Type</th>
              <th className="text-left p-3.5 text-xs font-semibold">Customer</th>
              <th className="text-left p-3.5 text-xs font-semibold">Details</th>
              <th className="text-right p-3.5 text-xs font-semibold">Amount</th>
              <th className="text-center p-3.5 text-xs font-semibold">Payment</th>
              <th className="text-center p-3.5 text-xs font-semibold">Date</th>
              <th className="text-center p-3.5 text-xs font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => {
              const tc = TYPE_CONFIG[r.type] || TYPE_CONFIG.custom;
              const Icon = tc.icon;
              return (
                <tr key={`${r.type}-${r.id}`} className="border-t hover:bg-muted/30">
                  <td className="p-3.5 font-mono text-sm font-bold text-primary">{r.invoice_number}</td>
                  <td className="p-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 w-fit ${tc.color}`}>
                      <Icon className="h-3 w-3" />{tc.label}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <p className="font-medium text-sm">{r.customer_name}</p>
                    <p className="text-xs text-muted-foreground">{r.customer_phone}</p>
                  </td>
                  <td className="p-3.5 text-sm text-muted-foreground">
                    {r.type === 'service' ? r.device || r.service_name : r.type === 'order' ? 'Product order' : 'Custom invoice'}
                  </td>
                  <td className="p-3.5 text-right">
                    <p className="font-black text-base">₹{(r.amount || 0).toLocaleString('en-IN')}</p>
                    {r.payment_method && <p className="text-xs text-muted-foreground">{r.payment_method}</p>}
                  </td>
                  <td className="p-3.5 text-center">
                    <button onClick={() => onPayClick(r)}
                      className={`text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer hover:opacity-80 transition-opacity ${PAY_COLOR[r.payment_status] || PAY_COLOR.pending}`}>
                      {r.payment_status}
                    </button>
                  </td>
                  <td className="p-3.5 text-center text-sm text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString('en-IN')}
                  </td>
                  <td className="p-3.5">
                    <div className="flex gap-1 justify-center">
                      <Button size="icon" variant="ghost" className="h-8 w-8" title="View Invoice" onClick={() => onView(r)}>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                      {onPartialClick && r.type !== 'order' && (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" title="Add Payment" onClick={() => onPartialClick(r)}>
                          <History className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" title="Send WhatsApp" onClick={() => onSendWA(r)}>
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                      {r.type === 'custom' && (
                        <Button size="icon" variant="ghost" className="h-8 w-8" title="Edit" onClick={() => onEdit(r)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-2">
        {rows.map(r => {
          const tc = TYPE_CONFIG[r.type] || TYPE_CONFIG.custom;
          const Icon = tc.icon;
          return (
            <div key={`${r.type}-${r.id}`} className="border rounded-xl p-4 bg-card space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono font-bold text-primary text-sm">{r.invoice_number}</p>
                  <p className="font-semibold mt-0.5">{r.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{r.customer_phone}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${tc.color}`}>
                    <Icon className="h-3 w-3" />{tc.label}
                  </span>
                  <button onClick={() => onPayClick(r)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${PAY_COLOR[r.payment_status] || PAY_COLOR.pending}`}>
                    {r.payment_status}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xl font-black">₹{(r.amount || 0).toLocaleString('en-IN')}</p>
                <p className="text-sm text-muted-foreground">{new Date(r.created_at).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 h-8 gap-1.5 text-xs" onClick={() => onView(r)}>
                  <ExternalLink className="h-3.5 w-3.5" /> Invoice
                </Button>
                <Button size="sm" variant="outline" className="flex-1 h-8 gap-1.5 text-xs text-green-600 border-green-200" onClick={() => onSendWA(r)}>
                  <Send className="h-3.5 w-3.5" /> WhatsApp
                </Button>
                {r.type === 'custom' && (
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0" onClick={() => onEdit(r)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
