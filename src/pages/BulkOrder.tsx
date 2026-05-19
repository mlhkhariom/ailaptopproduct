import { useState } from "react";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { Building2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomerLayout from "@/components/layout/CustomerLayout";
import SEOHead from "@/components/common/SEOHead";
import { toast } from "sonner";

export default function BulkOrder() {
  const [form, setForm] = useState({ company: '', name: '', phone: '', email: '', quantity: '', requirements: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.quantity) return toast.error('Fill required fields');
    try {
      await fetch('/api/contacts/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name, phone: form.phone, interest: `Bulk Order: ${form.quantity} units`, message: `Company: ${form.company}\nEmail: ${form.email}\nRequirements: ${form.requirements}` }) });
      setSubmitted(true);
    } catch { toast.error('Failed. Try calling +91 98934 96163'); }
  };

  if (submitted) return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-black mb-2">Request Received!</h2>
        <p className="text-muted-foreground">Our team will contact you within 2 hours with a custom quote.</p>
        <p className="text-sm mt-4">For urgent orders: <a href="tel:+919893496163" className="text-primary font-bold">+91 98934 96163</a></p>
      </div>
    </CustomerLayout>
  );

  return (
    <CustomerLayout>
      <SEOHead title="Bulk & Corporate Orders | AI Laptop Wala" description="Order 5+ laptops for your office, school, or business. Special corporate pricing, GST invoice, and dedicated support." canonical="/bulk-order" />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2"><Building2 className="inline h-8 w-8 mr-2" />Bulk & <span className="gradient-text">Corporate</span> Orders</h1>
          <p className="text-muted-foreground text-sm">5+ units? Get special pricing, GST invoice, and priority delivery</p>
        </div>

        <Card>
          <CardHeader><CardTitle>Request a Quote</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Company Name</Label><Input className="mt-1" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Optional" /></div>
                <div><Label>Contact Person *</Label><Input className="mt-1" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Phone *</Label><Input className="mt-1" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} required /></div>
                <div><Label>Email</Label><Input type="email" className="mt-1" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
              </div>
              <div><Label>Quantity Needed *</Label><Input className="mt-1" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="e.g., 10 laptops" required /></div>
              <div><Label>Requirements</Label><textarea className="mt-1 w-full border rounded-lg px-3 py-2 text-sm min-h-[80px]" value={form.requirements} onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))} placeholder="Budget, specs, brand preference, delivery timeline..." /></div>
              <Button type="submit" className="w-full gap-2"><Send className="h-4 w-4" /> Submit Request</Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { icon: "💰", title: "Special Pricing", desc: "Up to 15% off on 10+ units" },
            { icon: "📄", title: "GST Invoice", desc: "Proper tax invoice for claims" },
            { icon: "🚚", title: "Priority Delivery", desc: "Setup & delivery included" },
          ].map(f => (
            <Card key={f.title}><CardContent className="p-4 text-center"><span className="text-2xl">{f.icon}</span><h3 className="font-bold text-xs mt-2">{f.title}</h3><p className="text-[10px] text-muted-foreground">{f.desc}</p></CardContent></Card>
          ))}
        </div>
      </div>
    </CustomerLayout>
  );
}
