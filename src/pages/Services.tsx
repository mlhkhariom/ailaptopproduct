import { useState, useEffect } from "react";
import { Wrench, Clock, CheckCircle, Phone, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CustomerLayout from "@/components/CustomerLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";

const CATEGORIES = ['all', 'repair', 'upgrade', 'software', 'recovery', 'maintenance'];

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

  return (
    <CustomerLayout>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Wrench className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-3">Laptop Repair & Services</h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">Expert repair for all laptop brands. Same day service available in Indore.</p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-500" /> 6 Month Warranty</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-primary" /> Same Day Service</span>
            <span className="flex items-center gap-1"><Phone className="h-4 w-4 text-secondary" /> Free Pickup Indore</span>
          </div>
        </div>
      </section>

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

          {/* Services Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map(s => (
              <Card key={s.id} className="hover:shadow-lg transition-shadow group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-primary" />
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize">{s.category}</Badge>
                  </div>
                  <h3 className="font-semibold mb-1">{s.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{s.description}</p>
                  <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> {s.duration}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold text-primary">₹{s.price.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">Starting price</p>
                    </div>
                    <Button size="sm" onClick={() => openBook(s)} className="gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
            <p className="text-xs text-muted-foreground">📱 You will receive WhatsApp confirmation after booking.</p>
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
