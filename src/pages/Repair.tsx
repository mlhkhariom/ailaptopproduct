import { Link } from "react-router-dom";
import { Monitor, Battery, Keyboard, Cpu, Sparkles, HardDrive, Phone, MessageCircle, CheckCircle, Wifi, Gauge, Home, Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomerLayout from "@/components/CustomerLayout";
import SEOHead from "@/components/SEOHead";

const services = [
  { icon: Monitor, title: "Screen Replacement", desc: "Cracked or flickering screen? We replace with original quality panels.", price: "₹2,499" },
  { icon: Battery, title: "Battery Replacement", desc: "Laptop draining fast? Get a new battery with 6-month warranty.", price: "₹1,499" },
  { icon: Keyboard, title: "Keyboard Repair", desc: "Keys not working or sticky? We fix or replace full keyboard modules.", price: "₹999" },
  { icon: Cpu, title: "Motherboard Repair", desc: "Complex chip-level repairs for dead laptops or liquid damage.", price: "₹2,999" },
  { icon: Sparkles, title: "General Service", desc: "Deep cleaning, thermal paste replacement, and fan optimization.", price: "₹999" },
  { icon: HardDrive, title: "SSD/RAM Upgrade", desc: "Boost performance with storage and memory upgrades.", price: "₹1,999" },
  { icon: Wifi, title: "OS Installation", desc: "Windows 10/11 or Linux installation with all drivers.", price: "₹799" },
  { icon: Gauge, title: "Virus Removal", desc: "Complete virus/malware removal and system cleanup.", price: "₹599" },
  { icon: HardDrive, title: "Data Recovery", desc: "Recover lost data from hard drive, SSD or damaged laptop.", price: "₹1,999" },
];

const qualityChecks = [
  { icon: Monitor, title: "Screen & Display", desc: "No dead pixels, scratches, or color bleeding." },
  { icon: Battery, title: "Battery Health", desc: "Minimum 80% capacity guaranteed." },
  { icon: Gauge, title: "Performance Stress", desc: "CPU & GPU stress tested for stability." },
  { icon: Wifi, title: "Connectivity", desc: "All ports, Wi-Fi, and Bluetooth verified." },
];

const repairServiceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Computer Repair Service",
  "name": "Home Laptop & Desktop Repair Service Indore",
  "description": "Doorstep laptop and desktop repair service in Indore. Screen replacement, battery, keyboard, SSD/RAM upgrade, motherboard repair, OS installation, virus removal. No Fix No Charge policy.",
  "provider": { "@type": "ComputerStore", "name": "AI Laptop Wala", "telephone": "+919893496163", "address": { "@type": "PostalAddress", "streetAddress": "LB-21, Block-B, Silver Mall, 8-A, RNT Marg", "addressLocality": "Indore", "addressRegion": "Madhya Pradesh", "postalCode": "452001", "addressCountry": "IN" } },
  "areaServed": [{ "@type": "City", "name": "Indore" }],
  "availableChannel": { "@type": "ServiceChannel", "serviceType": "Home Service", "servicePhone": "+919893496163" }
};

const repairFaqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "What is the home visit charge for laptop repair in Indore?", "acceptedAnswer": { "@type": "Answer", "text": "Home visit charges start from ₹199. This covers engineer visit and checkup. Parts are charged separately if needed." } },
    { "@type": "Question", "name": "Do you provide No Fix No Charge service?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, AI Laptop Wala follows a No Fix No Charge policy. If we cannot fix your laptop, you don't pay anything." } },
    { "@type": "Question", "name": "How to book home laptop repair service in Indore?", "acceptedAnswer": { "@type": "Answer", "text": "Call or WhatsApp at +91 98934 96163. Our expert engineer will visit your home or office for laptop/desktop repair in Indore." } },
  ]
};

const Repair = () => (
  <CustomerLayout>
    <SEOHead
      title="Home Laptop Repair Service Indore – Screen, Battery, Keyboard, Motherboard"
      description="Best home laptop repair service in Indore by AI Laptop Wala. Doorstep screen replacement, battery, keyboard, SSD/RAM upgrade, motherboard repair. No Fix No Charge. Call +91 98934 96163."
      canonical="/repair"
      keywords="laptop repair Indore, home laptop repair Indore, laptop screen repair Indore, battery replacement Indore, keyboard repair Indore, motherboard repair Indore, SSD upgrade Indore, doorstep laptop repair Indore"
      breadcrumbs={[{ name: "Repair Services" }]}
      jsonLd={[repairServiceSchema, repairFaqSchema]}
    />

    {/* Hero */}
    <section className="bg-gradient-to-br from-foreground to-foreground/90 text-background py-16">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <h1 className="text-3xl md:text-5xl font-black mb-4">
          Expert <span className="text-primary">Repair</span> Services
        </h1>
        <p className="text-background/60 mb-4">Laptop Ka One Stop Solution — Doorstep service in Indore</p>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <div className="flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary px-4 py-2 rounded-full text-xs font-semibold">
            <Home size={12} /> Home Service Available
          </div>
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 text-background/80 px-4 py-2 rounded-full text-xs font-semibold">
            <Clock size={12} /> Same Day Service
          </div>
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 text-background/80 px-4 py-2 rounded-full text-xs font-semibold">
            <MapPin size={12} /> All Over Indore
          </div>
        </div>
      </div>
    </section>

    {/* Services Grid */}
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="text-2xl font-bold text-center mb-2">Our <span className="text-primary">Services</span></h2>
        <p className="text-muted-foreground text-center text-sm mb-10">All brands supported — Dell, HP, Lenovo, Apple, Asus, Acer</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <Card key={s.title} className="hover:shadow-lg transition-shadow group">
              <CardContent className="p-5">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <s.icon size={20} className="text-primary" />
                </div>
                <h3 className="font-bold mb-1">{s.title}</h3>
                <p className="text-xs text-muted-foreground mb-3">{s.desc}</p>
                <p className="text-sm font-bold text-primary mb-3">Starting {s.price}</p>
                <a href={`https://wa.me/919893496163?text=Hi, I need ${encodeURIComponent(s.title)} service`} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                  <MessageCircle size={11} /> Book on WhatsApp
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>

    {/* Our Promise */}
    <section className="py-12 bg-muted/50">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-2xl font-bold text-center mb-8">हमारा <span className="text-primary">वादा</span> — Our Promise</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {["⚡ Fast Service", "✅ Genuine Parts", "💰 Transparent Pricing", "🔧 No Fix – No Charge", "👨‍🔧 Trusted Engineers"].map((item) => (
            <div key={item} className="bg-card border rounded-xl p-4 text-center text-xs font-semibold">{item}</div>
          ))}
        </div>
      </div>
    </section>

    {/* Quality Check */}
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-2xl font-bold text-center mb-2">Our 40-Step <span className="text-primary">Quality Check</span></h2>
        <p className="text-muted-foreground text-center text-sm mb-10">Every repaired device goes through rigorous testing before delivery.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {qualityChecks.map((q) => (
            <Card key={q.title}>
              <CardContent className="p-5 text-center">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <q.icon size={20} className="text-primary" />
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
          <a href="tel:+919893496163"><Button size="lg" className="gap-2 w-full sm:w-auto"><Phone size={16} /> Call Now</Button></a>
          <a href="https://wa.me/919893496163?text=Hi, I need laptop repair service" target="_blank" rel="noreferrer">
            <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto border-green-500 text-green-600 hover:bg-green-50"><MessageCircle size={16} /> WhatsApp Us</Button>
          </a>
          <Link to="/services"><Button size="lg" variant="outline" className="w-full sm:w-auto">Book Online</Button></Link>
        </div>
      </div>
    </section>
  </CustomerLayout>
);

export default Repair;
