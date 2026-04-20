import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Package, Truck, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CustomerLayout from "@/components/CustomerLayout";
import SEOHead from "@/components/SEOHead";
import { api } from "@/lib/api";
import { toast } from "sonner";

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('order') || "");
  const [result, setResult] = useState<any | null | "not_found">(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!orderId.trim()) return;
    setLoading(true);
    try {
      const order = await api.trackOrder(orderId.trim().toUpperCase());
      setResult(order);
    } catch {
      setResult("not_found");
    } finally { setLoading(false); }
  };

  useEffect(() => { if (orderId) handleSearch(); }, []);

  const statusSteps = [
    { key: "placed",     label: "Order Placed",  icon: Package,      desc: "Your order has been confirmed" },
    { key: "processing", label: "Processing",    icon: Clock,        desc: "Being packed and prepared" },
    { key: "shipped",    label: "Shipped",       icon: Truck,        desc: "On the way to you" },
    { key: "delivered",  label: "Delivered",     icon: CheckCircle,  desc: "Successfully delivered" },
  ];

  const getStepIndex = (status: string) => statusSteps.findIndex((s) => s.key === status);

  return (
    <CustomerLayout>
      <SEOHead title="Track Your Order — AI Laptop Wala" canonical="/track-order" noindex={true} />
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/10 py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h1 className="text-4xl font-serif font-bold mb-4">Track Your Order</h1>
          <p className="text-muted-foreground mb-8">Enter your order ID to check the delivery status</p>
          <div className="flex gap-3 max-w-md mx-auto">
            <Input
              placeholder="e.g. ALW-001"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="h-12 text-base"
            />
            <Button onClick={handleSearch} disabled={loading} className="h-12 px-6 gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Track
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Enter your Order ID (format: ALW-XXXXXX)</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {result === "not_found" && (
            <Card>
              <CardContent className="p-8 text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="font-medium">Order Not Found</p>
                <p className="text-sm text-muted-foreground mt-1">Please check the order ID and try again</p>
              </CardContent>
            </Card>
          )}

          {result && result !== "not_found" && (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-serif font-bold text-xl">Order #{result.order_number}</p>
                      <p className="text-sm text-muted-foreground">Placed on {new Date(result.created_at).toLocaleDateString('en-IN')}</p>
                    </div>
                    <Badge className="capitalize">{result.status}</Badge>
                  </div>

                  {/* Timeline */}
                  <div className="relative mt-8">
                    {statusSteps.map((step, i) => {
                      const currentIdx = getStepIndex(result.status);
                      const isCompleted = i <= currentIdx;
                      const isCurrent = i === currentIdx;
                      return (
                        <div key={step.key} className="flex gap-4 mb-6 last:mb-0">
                          <div className="flex flex-col items-center">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"} ${isCurrent ? "ring-4 ring-primary/20" : ""}`}>
                              <step.icon className="h-5 w-5" />
                            </div>
                            {i < statusSteps.length - 1 && <div className={`w-0.5 h-8 mt-1 ${i < currentIdx ? "bg-primary" : "bg-muted"}`} />}
                          </div>
                          <div className="pt-1.5">
                            <p className={`font-medium text-sm ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                            <p className="text-xs text-muted-foreground">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {result.tracking_id && (
                    <div className="mt-4 p-3 rounded-lg bg-primary/5 text-sm flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" />
                      <span className="font-mono font-medium text-primary">{result.tracking_id}</span>
                      {result.courier && <span className="text-muted-foreground">via {result.courier}</span>}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>
    </CustomerLayout>
  );
};

export default TrackOrder;
