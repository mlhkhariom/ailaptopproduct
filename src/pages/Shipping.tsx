import { Truck, Clock, MapPin, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import CustomerLayout from "@/components/CustomerLayout";

const shippingInfo = [
  { icon: Truck, title: "Free Shipping", desc: "On all orders above ₹499. Flat ₹50 for orders below ₹499." },
  { icon: Clock, title: "Processing Time", desc: "Orders are dispatched within 1-2 business days after payment confirmation." },
  { icon: MapPin, title: "Pan-India Delivery", desc: "We deliver across India via DTDC, BlueDart, Delhivery, and India Post." },
  { icon: CheckCircle, title: "Tracking", desc: "Real-time tracking via WhatsApp/SMS. Track your order anytime." },
];

const Shipping = () => (
  <CustomerLayout>
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-serif font-bold mb-2">Shipping Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Everything you need to know about delivery</p>

      <div className="grid md:grid-cols-2 gap-4 mb-12">
        {shippingInfo.map((s) => (
          <Card key={s.title}>
            <CardContent className="p-5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-serif font-bold mb-3">Delivery Timelines</h2>
          <div className="border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-muted/50"><th className="p-3 text-left font-medium">Region</th><th className="p-3 text-left font-medium">Estimated Delivery</th></tr></thead>
              <tbody>
                <tr className="border-t"><td className="p-3">Metro Cities (Delhi, Mumbai, Bangalore, etc.)</td><td className="p-3">3-5 business days</td></tr>
                <tr className="border-t"><td className="p-3">Tier 2 Cities</td><td className="p-3">5-7 business days</td></tr>
                <tr className="border-t"><td className="p-3">Remote / Rural Areas</td><td className="p-3">7-10 business days</td></tr>
                <tr className="border-t"><td className="p-3">North-East India</td><td className="p-3">7-12 business days</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-serif font-bold mb-3">Cash on Delivery (COD)</h2>
          <p className="text-muted-foreground leading-relaxed">COD is available on select pin codes for orders up to ₹5,000. An additional ₹30 COD handling fee applies. For faster processing, we recommend prepaid orders via UPI, cards, or net banking.</p>
        </section>

        <section>
          <h2 className="text-xl font-serif font-bold mb-3">Order Tracking</h2>
          <p className="text-muted-foreground leading-relaxed">Once your order is shipped, you'll receive a tracking ID via WhatsApp and SMS. You can also contact us at +91 98765 43210 for order status updates.</p>
        </section>
      </div>
    </div>
  </CustomerLayout>
);

export default Shipping;
