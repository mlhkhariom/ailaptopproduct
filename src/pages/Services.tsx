import { useState, useEffect } from "react";
import { Wrench, Clock, CheckCircle, Phone, Calendar, Loader2, MessageCircle, Home, MapPin, Wifi, Gauge, Monitor, Battery } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CustomerLayout from "@/components/CustomerLayout";
import SEOHead from "@/components/SEOHead";
import { api } from "@/lib/api";
import { toast } from "sonner";

const CATEGORIES = ['all', 'repair', 'upgrade', 'software', 'recovery', 'maintenance'];

const qualityChecks = [
  { icon: Monitor, title: "Screen & Display", desc: "No dead pixels, scratches, or color bleeding." },
  { icon: Battery, title: "Battery Health", desc: "Minimum 80% capacity guaranteed." },
  { icon: Gauge, title: "Performance Stress", desc: "CPU & GPU stress tested for stability." },
  { icon: Wifi, title: "Connectivity", desc: "All ports, Wi-Fi, and Bluetooth verified." },
];

const repairFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "What is the home visit charge for laptop repair in Indore?", "acceptedAnswer": { "@type": "Answer", "text": "Home visit charges start from ₹199. This covers engineer visit and checkup. Parts are charged separately." } },
    { "@type": "Question", "name": "Do you provide No Fix No Charge service?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, AI Laptop Wala follows a No Fix No Charge policy. If we cannot fix your laptop, you don't pay anything." } },
    { "@type": "Question", "name": "How to book home laptop repair service in Indore?", "acceptedAnswer": { "@type": "Answer", "text": "Call or WhatsApp at +91 98934 96163 or book online at ailaptopwala.com/services." } },
  ]
};

const Services = () => {
  const [services, setServices] = useState<any[]>([]);
  const [category, setCategory] = useState('all');
  const [bookDialog, setBookDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_email: '', device_brand: '', device_model: '', issue_description: '', preferred_date: '', preferred_time: '' });

  useEffect(() => {
    api.getServices(category === 'all' ? undefined : category).then(setServices).catch(() => {});
  }, [category]);

  const f = (k: string) => (e: any) => setForm(p => ({ ...p, [k]: e.target.value }));
  const openBook = (service: any) => { setSelectedService(service); setBookDialog(true); };

  const submitBooking = async () => {
    if (!form.customer_name || !form.customer_phone) return toast.error('Name and phone required');
    setLoading(true);
    try {
      const result = await api.bookService({ ...form, service_id: selectedService.id });
      toast.success(`Booking confirmed! ID: ${result.booking_number}`);
      setBookDialog(false);
      setForm({ customer_name: '', customer_phone: '', customer_email: '', device_brand: '', device_model: '', issue_description: '', preferred_date: '', preferred_time: '' });
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const serviceSchema = services.length > 0 ? {
    "@context": "https://schema.org", "@type": "ItemList",
    "name": "Laptop Repair & Services — AI Laptop Wala Indore",
    "itemListElement": services.map((s, i) => ({
      "@type": "ListItem", "position": i + 1,
      "item": { "@type": "Service", "name": s.name, "description": s.description, "offers": { "@type": "Offer", "price": s.price, "priceCurrency": "INR" }, "provider": { "@type": "LocalBusiness", "name": "AI Laptop Wala" }, "areaServed": "Indore" }
    }))
  } : null;

  return (
    <CustomerLayout>
      <SEOHead
        title="Laptop Repair & Services Indore — AI Laptop Wala | Home Service Available"
        description="Expert laptop repair & services in Indore. Screen replacement, battery, keyboard, SSD/RAM upgrade, virus removal. Same day service. Home pickup available. Book online or WhatsApp."
        canonical="/services"
        keywords="laptop repair Indore, home laptop repair Indore, laptop screen repair Indore, battery replacement Indore, SSD upgrade Indore, doorstep laptop repair Indore, laptop service booking Indore"
        breadcrumbs={[{ name: "Repair & Services" }]}
        jsonLd={[serviceSchema, repairFaqSchema].filter(Boolean)}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-foreground to-foreground/90 text-background py-16">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-black mb-3">
            Laptop <span className="text-primary">Repair & Services</span>
          </h1>
          <p className="text-background/60 mb-6">Expert repair for all brands — Doorstep service in Indore</p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="flex items-center gap-1.5 bg-primary/20 border border-primary/30 text-primary px-4 py-2 rounded-full text-xs font-semibold"><CheckCircle className="h-3.5 w-3.5" /> 6 Month Warranty</span>
            <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-background/80 px-4 py-2 rounded-full text-xs font-semibold"><Clock className="h-3.5 w-3.5" /> Same Day Service</span>
            <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-background/80 px-4 py-2 rounded-full text-xs font-semibold"><Home className="h-3.5 w-3.5" /> Free Home Pickup</span>
            <span className="flex items-center gap-1.5 bg-white/10 border border-white/20 text-background/80 px-4 py-2 rounded-full text-xs font-semibold"><MapPin className="h-3.5 w-3.5" /> All Over Indore</span>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap mb-8 justify-center">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${category === c ? 'bg-primary text-white' : 'bg-muted hover:bg-primary/10'}`}>
                {c === 'all' ? 'All Services' : c}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(s => (
              <Card key={s.id} className="hover:shadow-lg transition-shadow group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Wrench className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize">{s.category}</Badge>
                  </div>
                  <h3 className="font-semibold mb-1">{s.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{s.description}</p>
                  <div className="flex items-center gap-1.5 mb-4 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> {s.duration}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold text-primary">₹{s.price.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">Starting price</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={`https://wa.me/919893496163?text=Hi, I need ${encodeURIComponent(s.name)} service`} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="outline" className="gap-1 border-green-500 text-green-600 hover:bg-green-50 h-8 px-2">
                          <MessageCircle className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                      <Button size="sm" onClick={() => openBook(s)} className="gap-1.5 h-8">
                        <Calendar className="h-3.5 w-3.5" /> Book
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Promise */}
      <section className="py-10 bg-muted/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-xl font-bold text-center mb-6">हमारा वादा — Our Promise</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {["⚡ Fast Service", "✅ Genuine Parts", "💰 Transparent Pricing", "🔧 No Fix – No Charge", "👨‍🔧 Trusted Engineers"].map(item => (
              <div key={item} className="bg-card border rounded-xl p-3 text-center text-xs font-semibold">{item}</div>
            ))}
          </div>
        </div>
      </section>

      {/* 40-Step Quality Check */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-xl font-bold text-center mb-2">Our 40-Step <span className="text-primary">Quality Check</span></h2>
          <p className="text-muted-foreground text-center text-sm mb-8">Every repaired device goes through rigorous testing before delivery.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {qualityChecks.map(q => (
              <Card key={q.title}>
                <CardContent className="p-5 text-center">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <q.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-bold text-sm mb-1">{q.title}</h3>
                  <p className="text-xs text-muted-foreground">{q.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-primary/5 text-center">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-2xl font-bold mb-2">Need a Repair?</h2>
          <p className="text-muted-foreground text-sm mb-6">Call us or WhatsApp for instant booking. Our engineer will visit your home/office in Indore.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="tel:+919893496163"><Button size="lg" className="gap-2 w-full sm:w-auto"><Phone className="h-4 w-4" /> Call Now</Button></a>
            <a href="https://wa.me/919893496163?text=Hi, I need laptop repair service" target="_blank" rel="noreferrer">
              <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto border-green-500 text-green-600 hover:bg-green-50"><MessageCircle className="h-4 w-4" /> WhatsApp Us</Button>
            </a>
          </div>
        </div>
      </section>

      {/* Booking Dialog */}
      <Dialog open={bookDialog} onOpenChange={setBookDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Book: {selectedService?.name}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="bg-primary/5 rounded-lg p-3 text-sm">
              <p className="font-medium">{selectedService?.name}</p>
              <p className="text-muted-foreground text-xs">{selectedService?.duration} · ₹{selectedService?.price}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Your Name *</Label><Input value={form.customer_name} onChange={f('customer_name')} className="mt-1 text-sm" /></div>
              <div><Label className="text-xs">Phone *</Label><Input value={form.customer_phone} onChange={f('customer_phone')} className="mt-1 text-sm" placeholder="+91..." /></div>
            </div>
            <div><Label className="text-xs">Email</Label><Input value={form.customer_email} onChange={f('customer_email')} className="mt-1 text-sm" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Device Brand</Label><Input value={form.device_brand} onChange={f('device_brand')} className="mt-1 text-sm" placeholder="Dell, HP, Apple..." /></div>
              <div><Label className="text-xs">Model</Label><Input value={form.device_model} onChange={f('device_model')} className="mt-1 text-sm" placeholder="Latitude E7470..." /></div>
            </div>
            <div><Label className="text-xs">Issue Description</Label><Textarea value={form.issue_description} onChange={f('issue_description')} className="mt-1 text-sm resize-none" rows={2} placeholder="Describe the problem..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Preferred Date</Label><Input type="date" value={form.preferred_date} onChange={f('preferred_date')} className="mt-1 text-sm" /></div>
              <div><Label className="text-xs">Preferred Time</Label>
                <Select value={form.preferred_time} onValueChange={v => setForm(p => ({ ...p, preferred_time: v }))}>
                  <SelectTrigger className="mt-1 text-sm"><SelectValue placeholder="Select time" /></SelectTrigger>
                  <SelectContent>
                    {['10:00 AM','11:00 AM','12:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">📱 WhatsApp confirmation milegi booking ke baad.</p>
            <Button onClick={submitBooking} disabled={loading} className="w-full gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
              {loading ? 'Booking...' : 'Confirm Booking'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
};

export default Services;
