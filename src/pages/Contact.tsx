import { useState } from "react";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import CustomerLayout from "@/components/CustomerLayout";
import SEOHead from "@/components/SEOHead";
import { toast } from "sonner";
import { api } from "@/lib/api";

const contactInfo = [
  { icon: Phone, title: "Phone", value: "+91 98934 96163", link: "tel:+919893496163" },
  { icon: Mail, title: "Email", value: "hello@ailaptopwala.com", link: "mailto:hello@ailaptopwala.com" },
  { icon: MapPin, title: "Address", value: "AI Laptop Wala Store, India", link: "#" },
  { icon: Clock, title: "Hours", value: "Mon-Sat: 9 AM – 7 PM", link: "#" },
];

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.submitContact(form);
      toast.success('Message sent! We will reply soon.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomerLayout>
      <SEOHead
        title="Contact Us — AI Laptop Wala Indore"
        description="Contact AI Laptop Wala. Visit us at Silver Mall, RNT Marg, Indore. Call +91 98934 96163. Open Mon-Sat 10AM-8PM. WhatsApp available."
        canonical="/contact"
        breadcrumbs={[{name:"Contact"}]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Contact AI Laptop Wala",
          "url": "https://ailaptopwala.com/contact",
          "mainEntity": {
            "@type": "LocalBusiness",
            "name": "AI Laptop Wala",
            "telephone": "+91-98934-96163",
            "email": "contact@ailaptopwala.com",
            "address": { "@type": "PostalAddress", "streetAddress": "LG-21, B-Block, Silver Mall, RNT Marg", "addressLocality": "Indore", "addressRegion": "MP", "postalCode": "452001", "addressCountry": "IN" }
          }
        }}
      />
    <section className="bg-gradient-to-br from-primary/5 via-background to-accent/10 py-16">
      <div className="container mx-auto px-4 text-center max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Contact Us</h1>
        <p className="text-lg text-muted-foreground">Have a question? We'd love to hear from you. Reach out and we'll respond as soon as we can.</p>
      </div>
    </section>

    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div>
            <h2 className="text-2xl font-serif font-bold mb-6">Get in Touch</h2>
            <div className="space-y-4 mb-6">
              {contactInfo.map((c) => (
                <a key={c.title} href={c.link} className="flex items-start gap-4 p-4 rounded-xl border hover:shadow-md transition-shadow">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <c.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{c.title}</p>
                    <p className="text-sm text-muted-foreground">{c.value}</p>
                  </div>
                </a>
              ))}
            </div>
            <a href="https://wa.me/919893496163?text=Hi! I have a query." target="_blank" rel="noreferrer">
              <Button className="w-full gap-2" size="lg">
                <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
              </Button>
            </a>

            <div className="mt-6 p-3 rounded-xl bg-muted/50 border flex items-center gap-3">
              <Badge variant="secondary" className="text-[10px]">Response Time</Badge>
              <span className="text-xs text-muted-foreground">We typically respond within 2-4 hours during business hours</span>
            </div>

            {/* Map Placeholder */}
            <div className="mt-6 rounded-xl border overflow-hidden bg-muted h-48 flex items-center justify-center">
              <div className="text-center">
                <Globe className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Google Maps embed will appear here</p>
                <p className="text-[10px] text-muted-foreground">AI Laptop Wala Store, India</p>
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-serif font-bold">Send a Message</h2>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-xs">Full Name *</Label><Input className="mt-1" placeholder="Your name" /></div>
                <div><Label className="text-xs">Phone</Label><Input className="mt-1" placeholder="+91 XXXXX XXXXX" /></div>
              </div>
              <div><Label className="text-xs">Email *</Label><Input className="mt-1" placeholder="you@example.com" /></div>
              <div><Label className="text-xs">Subject</Label><Input className="mt-1" placeholder="Order inquiry, consultation, etc." /></div>
              <div><Label className="text-xs">Message *</Label><Textarea className="mt-1" rows={4} placeholder="Tell us how we can help..." /></div>
              <Button className="w-full" disabled={loading} onClick={handleSubmit}>{loading ? 'Sending...' : 'Send Message'}</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
    </CustomerLayout>
  );
};

export default Contact;
