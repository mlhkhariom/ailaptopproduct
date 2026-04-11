import { useState } from "react";
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CustomerLayout from "@/components/CustomerLayout";
import { orders } from "@/data/mockData";

const TrackOrder = () => {
  const [orderId, setOrderId] = useState("");
  const [result, setResult] = useState<typeof orders[0] | null | "not_found">(null);

  const handleSearch = () => {
    if (!orderId.trim()) return;
    const order = orders.find((o) => o.id.toLowerCase() === orderId.trim().toLowerCase());
    setResult(order || "not_found");
  };

  const statusSteps = [
    { key: "pending", label: "Order Placed", icon: Package, desc: "Your order has been confirmed" },
    { key: "processing", label: "Processing", icon: Clock, desc: "Being packed and prepared" },
    { key: "shipped", label: "Shipped", icon: Truck, desc: "On the way to you" },
    { key: "delivered", label: "Delivered", icon: CheckCircle, desc: "Successfully delivered" },
  ];

  const getStepIndex = (status: string) => statusSteps.findIndex((s) => s.key === status);

  return (
    <CustomerLayout>
      <section className="bg-gradient-to-br from-primary/5 via-background to-accent/10 py-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h1 className="text-4xl font-serif font-bold mb-4">Track Your Order</h1>
          <p className="text-muted-foreground mb-8">Enter your order ID to check the delivery status</p>
          <div className="flex gap-3 max-w-md mx-auto">
            <Input
              placeholder="e.g. APC-001"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="h-12 text-base"
            />
            <Button onClick={handleSearch} className="h-12 px-6 gap-2">
              <Search className="h-4 w-4" /> Track
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Demo: try APC-001, APC-002, APC-004</p>
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
                      <p className="font-serif font-bold text-xl">Order #{result.id}</p>
                      <p className="text-sm text-muted-foreground">Placed on {result.date}</p>
                    </div>
                    <Badge variant="default" className="capitalize">{result.status}</Badge>
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
                            {i < statusSteps.length - 1 && (
                              <div className={`w-0.5 h-8 mt-1 ${i < currentIdx ? "bg-primary" : "bg-muted"}`} />
                            )}
                          </div>
                          <div className="pt-1.5">
                            <p className={`font-medium text-sm ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                            <p className="text-xs text-muted-foreground">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-semibold">Order Details</h3>
                  {result.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{item.name} × {item.quantity}</span>
                      <span className="font-medium">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{result.total}</span>
                  </div>
                  {result.trackingId && (
                    <div className="p-3 rounded-lg bg-primary/5 text-sm">
                      <span className="text-muted-foreground">Tracking: </span>
                      <span className="font-mono font-medium text-primary">{result.trackingId}</span>
                      {result.courierPartner && <span className="text-muted-foreground ml-2">via {result.courierPartner}</span>}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{result.address}</span>
                  </div>
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
