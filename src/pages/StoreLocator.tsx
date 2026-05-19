import { useState, useEffect } from "react";
import { MapPin, Phone, Clock, Navigation, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CustomerLayout from "@/components/layout/CustomerLayout";
import SEOHead from "@/components/common/SEOHead";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";

export default function StoreLocator() {
  const settings = useSiteSettings() as any;
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/erp/branches').then(r => r.json()).then(d => {
      if (Array.isArray(d)) setBranches(d.filter((b: any) => b.is_active));
    }).catch(() => {});
  }, []);

  const storeName = settings.store_name || 'AI Laptop Wala';
  const storePhone = settings.store_phone || '';
  const whatsapp = settings.whatsapp_number || '919893496163';
  const businessHours = settings.business_hours || 'Mon-Sat: 11AM - 9PM';

  return (
    <CustomerLayout>
      <SEOHead title={`Store Locator — ${storeName}`} description={`Visit ${storeName} stores. ${branches.length} locations. Get directions.`} canonical="/store-locator" />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2">Our <span className="gradient-text">Stores</span></h1>
          <p className="text-muted-foreground text-sm">Visit us at any of our 2 branches in Indore</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {branches.map(b => (
            <Card key={b.name} className="overflow-hidden">
              <div className="h-48 bg-muted">
                <iframe src={b.map_embed || ""} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={b.name} />
              </div>
              <CardContent className="p-5">
                <h2 className="font-black text-lg mb-3">{b.name}</h2>
                <div className="space-y-2 text-sm">
                  <p className="flex items-start gap-2"><MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />{b.address}</p>
                  <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /><a href={`tel:${b.phone}`} className="hover:text-primary">{b.phone}</a></p>
                  <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{businessHours}</p>
                </div>
                <a href={b.map_url} target="_blank" rel="noreferrer" className="mt-4 block">
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
            <a href={`https://wa.me/${whatsapp}?text=Hi, I need home service`}><Button variant="outline" className="gap-2">📱 Book Home Service</Button></a>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
}
