import { useState, useEffect } from "react";
import { Tag, Gift, Percent, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CustomerLayout from "@/components/layout/CustomerLayout";
import SEOHead from "@/components/common/SEOHead";
import { toast } from "sonner";

export default function Offers() {
  const [coupons, setCoupons] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/coupons/active').then(r => r.json()).then(d => { if (Array.isArray(d)) setCoupons(d); }).catch(() => {});
  }, []);

  const copy = (code: string) => { navigator.clipboard.writeText(code); toast.success(`${code} copied!`); };

  return (
    <CustomerLayout>
      <SEOHead title="Offers & Coupons | AI Laptop Wala" description="Get the best deals on laptops in Indore. Active coupons, discounts, and offers at AI Laptop Wala." canonical="/offers" />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">Offers & <span className="gradient-text">Coupons</span></h1>
          <p className="text-muted-foreground text-sm">Active deals and discount codes — apply at checkout</p>
        </div>

        {/* Permanent Offers */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { icon: "🚚", title: "Free Delivery", desc: "Free delivery across Indore on all orders" },
            { icon: "💳", title: "No Cost EMI", desc: "0% EMI on 3 & 6 month tenure" },
            { icon: "🛡️", title: "90-Day Warranty", desc: "All laptops come with 90-day warranty" },
          ].map(o => (
            <Card key={o.title}>
              <CardContent className="p-5 text-center">
                <span className="text-3xl mb-2 block">{o.icon}</span>
                <h3 className="font-bold text-sm">{o.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{o.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coupon Codes */}
        <h2 className="text-xl font-black mb-4 flex items-center gap-2"><Tag className="h-5 w-5" /> Active Coupon Codes</h2>
        {coupons.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No active coupons right now. Check back soon!</CardContent></Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {coupons.map((c: any) => (
              <Card key={c.code} className="border-2 border-dashed border-primary/30 hover:border-primary/60 transition-colors">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge className="mb-2">{c.discount_type === 'percentage' ? `${c.discount_value}% OFF` : `₹${c.discount_value} OFF`}</Badge>
                      <p className="text-sm font-medium">{c.description || `Get ${c.discount_type === 'percentage' ? c.discount_value + '%' : '₹' + c.discount_value} off`}</p>
                      {c.min_order && <p className="text-xs text-muted-foreground mt-1">Min order: ₹{c.min_order}</p>}
                    </div>
                    <Button size="sm" variant="outline" className="font-mono font-bold" onClick={() => copy(c.code)}>{c.code}</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Referral */}
        <Card className="mt-8 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-6 text-center">
            <Gift className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-black mb-1">Refer a Friend, Get ₹500!</h3>
            <p className="text-sm text-muted-foreground mb-3">Share your referral code. Friend gets ₹250, you get ₹500 in wallet.</p>
            <Button onClick={() => window.location.href = '/account'}>Get My Referral Code →</Button>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}
