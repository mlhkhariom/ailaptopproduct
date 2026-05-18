import { useState, useEffect } from "react";
import { MapPin, Phone, Clock, Navigation, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CustomerLayout from "@/components/layout/CustomerLayout";
import SEOHead from "@/components/common/SEOHead";

const DEFAULT_BRANCHES = [
  { name: 'Silver Mall (Main Branch)', address: 'LB-21, Block-B, Silver Mall, 8-A, RNT Marg, Indore 452001', phone: '+91 98934 96163', hours: 'Mon-Sat: 11AM - 9PM | Sun: 12PM - 3PM', map: 'https://maps.app.goo.gl/Z4e1Z91HVKwjm5xp9', embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3680.2!2d75.857!3d22.719!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sSilver+Mall+Indore!5e0!3m2!1sen!2sin!4v1' },
  { name: 'Bangali Chouraha (New Branch)', address: '21, G3, Sai Residency, Near Bangali Chouraha, Ashish Nagar, Indore 452016', phone: '+91 98934 96163', hours: 'Mon-Sat: 11AM - 9PM | Sun: Closed', map: 'https://maps.app.goo.gl/drVLkuS9tGjEmwUF7', embed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3680.5!2d75.88!3d22.72!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sBangali+Chouraha!5e0!3m2!1sen!2sin!4v1' },
];

export default function StoreLocator() {
  const [branches, setBranches] = useState(DEFAULT_BRANCHES);

  useEffect(() => {
    // Try to fetch from API (dynamic), fallback to defaults
    fetch('/api/erp/branches/public').then(r => r.json()).then(d => {
      if (Array.isArray(d) && d.length > 0) {
        setBranches(d.map(b => ({ name: b.name, address: b.address, phone: b.phone || '+91 98934 96163', hours: 'Mon-Sat: 11AM - 9PM', map: b.map_url || '#', embed: b.map_embed || '' })));
      }
    }).catch(() => {});
  }, []);
  return (
    <CustomerLayout>
      <SEOHead title="Store Locator — AI Laptop Wala Indore" description="Visit AI Laptop Wala stores in Indore. Silver Mall (RNT Marg) and Bangali Chouraha (Ashish Nagar). Get directions." canonical="/store-locator" />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">Our <span className="gradient-text">Stores</span></h1>
          <p className="text-muted-foreground text-sm">Visit us at any of our 2 branches in Indore</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {branches.map(b => (
            <Card key={b.name} className="overflow-hidden">
              <div className="h-48 bg-muted">
                <iframe src={b.embed} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={b.name} />
              </div>
              <CardContent className="p-5">
                <h2 className="font-black text-lg mb-3">{b.name}</h2>
                <div className="space-y-2 text-sm">
                  <p className="flex items-start gap-2"><MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />{b.address}</p>
                  <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /><a href={`tel:${b.phone}`} className="hover:text-primary">{b.phone}</a></p>
                  <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{b.hours}</p>
                </div>
                <a href={b.map} target="_blank" rel="noreferrer" className="mt-4 block">
                  <Button className="w-full gap-2"><Navigation className="h-4 w-4" /> Get Directions</Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6 text-center">
            <h3 className="font-bold text-lg mb-2">Home Service Available</h3>
            <p className="text-sm text-muted-foreground mb-3">Can't visit? We come to you! Laptop repair at your doorstep across Indore.</p>
            <a href="https://wa.me/919893496163?text=Hi, I need home service for laptop repair"><Button variant="outline" className="gap-2">📱 Book Home Service</Button></a>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}
