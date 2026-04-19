import { useState } from "react";
import { Mail, Phone, MapPin, Clock, MessageCircle, Navigation, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import CustomerLayout from "@/components/CustomerLayout";
import SEOHead from "@/components/SEOHead";
import { toast } from "sonner";
import { api } from "@/lib/api";

const branches = [
  {
    name: "Branch 1 — Silver Mall (Main)",
    address: "LB-21, Block-B, Silver Mall, 8-A, RNT Marg, South Tukoganj, Indore, MP 452001",
    geo: { lat: 22.7166372, lng: 75.8737741 },
    mapUrl: "https://maps.app.goo.gl/Z4e1Z91HVKwjm5xp9",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3679.8!2d75.8737741!3d22.7166372!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDQzJzAwLjAiTiA3NcKwNTInMjUuNiJF!5e0!3m2!1sen!2sin!4v1",
    note: "Near Shrimaya Hotel, RNT Road",
    color: "text-primary",
  },
  {
    name: "Branch 2 — Bangali Chouraha",
    address: "21, G3, Sai Residency, Ashish Nagar, Near Bangali Chouraha, Indore, MP 452016",
    geo: { lat: 22.7161819, lng: 75.9079282 },
    mapUrl: "https://maps.app.goo.gl/drVLkuS9tGjEmwUF7",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3679.9!2d75.9079282!3d22.7161819!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDQyJzU4LjMiTiA3NcKwNTQnMjguNSJF!5e0!3m2!1sen!2sin!4v1",
    note: "Near Bangali Chouraha",
    color: "text-secondary",
  },
];

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [activeMap, setActiveMap] = useState(0);

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message) return toast.error('Name and message required');
    setLoading(true);
    try {
      await api.submitContact(form);
      toast.success('Message sent! We will reply soon.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <CustomerLayout>
      <SEOHead
        title="Contact Us — AI Laptop Wala Indore | 2 Branches"
        description="Contact AI Laptop Wala. 2 branches in Indore — Silver Mall (RNT Marg) & Bangali Chouraha. Call +91 98934 96163. Open Mon-Sat 10AM-8PM."
        canonical="/contact"
        breadcrumbs={[{ name: "Contact" }]}
        jsonLd={{
          "@context": "https://schema.org", "@type": "ContactPage",
          "name": "Contact AI Laptop Wala",
          "url": "https://ailaptopwala.com/contact",
          "mainEntity": { "@type": "LocalBusiness", "name": "AI Laptop Wala", "telephone": "+91-98934-96163", "email": "contact@ailaptopwala.com" }
        }}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-foreground to-foreground/90 text-background py-14">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-black mb-3">Get in <span className="text-primary">Touch</span></h1>
          <p className="text-background/60 text-sm">Visit any of our 2 branches in Indore or reach us via WhatsApp, call or email.</p>
          <div className="flex flex-wrap justify-center gap-3 mt-5">
            <a href="tel:+919893496163" className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary px-4 py-2 rounded-full text-sm font-semibold">
              <Phone size={14} /> +91 98934 96163
            </a>
            <a href="https://wa.me/919893496163" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] px-4 py-2 rounded-full text-sm font-semibold">
              <MessageCircle size={14} /> WhatsApp
            </a>
            <a href="mailto:contact@ailaptopwala.com" className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-background/80 px-4 py-2 rounded-full text-sm font-semibold">
              <Mail size={14} /> contact@ailaptopwala.com
            </a>
          </div>
        </div>
      </section>

      {/* Branches + Maps */}
      <section className="py-14">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl font-black text-center mb-2">Our <span className="gradient-text">Branches</span></h2>
          <p className="text-muted-foreground text-center text-sm mb-8">2 convenient locations in Indore</p>

          {/* Branch selector */}
          <div className="flex gap-3 mb-5 justify-center">
            {branches.map((b, i) => (
              <button key={i} onClick={() => setActiveMap(i)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${activeMap === i ? 'bg-primary text-white' : 'bg-muted hover:bg-primary/10'}`}>
                Branch {i + 1}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Branch info */}
            <div className="space-y-4">
              {branches.map((b, i) => (
                <Card key={i} className={`transition-all ${activeMap === i ? 'border-primary shadow-md' : 'opacity-70'}`}
                  onClick={() => setActiveMap(i)}>
                  <CardContent className="p-5">
                    <h3 className={`font-bold mb-2 ${b.color}`}>{b.name}</h3>
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground">{b.address}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{b.note}</p>
                    <div className="flex gap-2">
                      <a href={b.mapUrl} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                          <Navigation className="h-3.5 w-3.5" /> Get Directions
                        </Button>
                      </a>
                      <a href={`https://www.google.com/maps?q=${b.geo.lat},${b.geo.lng}`} target="_blank" rel="noreferrer">
                        <Button size="sm" variant="ghost" className="gap-1.5 h-8 text-xs">
                          <ExternalLink className="h-3.5 w-3.5" /> Open in Maps
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Hours + contact */}
              <Card>
                <CardContent className="p-5 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-medium">Mon – Sat: 10:00 AM – 8:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-primary" />
                    <a href="tel:+919893496163" className="hover:text-primary">+91 98934 96163</a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-primary" />
                    <a href="mailto:contact@ailaptopwala.com" className="hover:text-primary">contact@ailaptopwala.com</a>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Google Map embed */}
            <div className="rounded-2xl overflow-hidden border shadow-md h-[420px] md:h-auto">
              <iframe
                key={activeMap}
                src={`https://maps.google.com/maps?q=${branches[activeMap].geo.lat},${branches[activeMap].geo.lng}&z=16&output=embed`}
                width="100%" height="100%" style={{ border: 0, minHeight: '420px' }}
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                title={branches[activeMap].name}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-14 bg-muted/40">
        <div className="container mx-auto px-4 max-w-2xl">
          <h2 className="text-2xl font-black text-center mb-2">Send a <span className="gradient-text">Message</span></h2>
          <p className="text-muted-foreground text-center text-sm mb-8">We typically respond within 2-4 hours during business hours</p>
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-xs">Full Name *</Label><Input className="mt-1" value={form.name} onChange={f('name')} placeholder="Your name" /></div>
                  <div><Label className="text-xs">Phone</Label><Input className="mt-1" value={form.phone} onChange={f('phone')} placeholder="+91 XXXXX XXXXX" /></div>
                </div>
                <div><Label className="text-xs">Email</Label><Input className="mt-1" value={form.email} onChange={f('email')} placeholder="you@example.com" /></div>
                <div><Label className="text-xs">Subject</Label><Input className="mt-1" value={form.subject} onChange={f('subject')} placeholder="Laptop inquiry, repair booking, etc." /></div>
                <div><Label className="text-xs">Message *</Label><Textarea className="mt-1 resize-none" rows={4} value={form.message} onChange={f('message')} placeholder="Tell us how we can help..." /></div>
                <Button type="submit" className="w-full gap-2" size="lg" disabled={loading}>
                  {loading ? 'Sending...' : '📩 Send Message'}
                </Button>
                <p className="text-xs text-center text-muted-foreground">Or WhatsApp us directly for instant reply →
                  <a href="https://wa.me/919893496163" target="_blank" rel="noreferrer" className="text-primary font-medium ml-1">+91 98934 96163</a>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </CustomerLayout>
  );
};

export default Contact;
