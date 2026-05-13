// Linktree-style page — ailaptopwala.com/links
import { useState } from "react";
import { ClipboardList, Instagram, Youtube, Facebook, Phone, MessageCircle, Mail, ShieldCheck, BadgeCheck, Gift, Repeat, MapPin, Navigation, LucideIcon } from "lucide-react";
import logo from "@/assets/logo.jpeg";

const LinkCard = ({ href, icon: Icon, label, sublabel, variant = "default", external = true }: { href: string; icon: LucideIcon; label: string; sublabel?: string; variant?: "default" | "primary"; external?: boolean }) => (
  <a href={href} target={external && href.startsWith("http") ? "_blank" : undefined} rel={external && href.startsWith("http") ? "noopener noreferrer" : undefined}
    className={`group flex w-full items-center gap-4 rounded-2xl border px-5 py-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${variant === "primary" ? "border-transparent bg-gradient-to-r from-primary to-orange-500 text-white" : "border-border bg-card hover:border-primary/40"}`}>
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${variant === "primary" ? "bg-white/20" : "bg-gradient-to-br from-primary to-orange-500 text-white"}`}>
      <Icon className="h-5 w-5" strokeWidth={2.2} />
    </span>
    <span className="flex flex-1 flex-col text-left">
      <span className="text-base font-semibold leading-tight">{label}</span>
      {sublabel && <span className={`text-xs ${variant === "primary" ? "text-white/80" : "text-muted-foreground"}`}>{sublabel}</span>}
    </span>
  </a>
);

const BranchCard = ({ name, address, mapUrl }: { name: string; address: string; mapUrl: string }) => (
  <div className="rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-orange-500 text-white">
        <MapPin className="h-5 w-5" strokeWidth={2.2} />
      </span>
      <div className="flex-1">
        <h3 className="text-sm font-semibold">{name}</h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{address}</p>
        <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          <Navigation className="h-3.5 w-3.5" /> Get Directions
        </a>
      </div>
    </div>
  </div>
);

const BenefitChip = ({ icon: Icon, label }: { icon: LucideIcon; label: string }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium">
    <Icon className="h-3.5 w-3.5 text-primary" strokeWidth={2.5} />{label}
  </span>
);

function EnquiryForm() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', interest: '', budget: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) { setError('Name and phone required'); return; }
    if (form.phone.replace(/[^0-9]/g, '').length < 10) { setError('Valid 10-digit phone required'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/contacts/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }).then(r => r.json());
      if (res.success) setSubmitted(true);
      else setError(res.error || 'Something went wrong');
    } catch { setError('Network error. Try again.'); }
    finally { setLoading(false); }
  };

  if (submitted) return (
    <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
      <div className="text-5xl mb-4">🎉</div>
      <h3 className="text-xl font-bold text-primary mb-2">Thank You!</h3>
      <p className="text-sm text-muted-foreground mb-1">Your enquiry has been received.</p>
      <p className="text-sm text-muted-foreground">We will contact you on WhatsApp shortly.</p>
      <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-200 text-xs text-green-700">
        ✅ Auto WhatsApp confirmation sent to {form.phone}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border bg-card p-5 shadow-sm space-y-3">
      {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}
      <div>
        <label className="text-xs font-medium">Name *</label>
        <input className="mt-1 w-full h-10 rounded-xl border px-3 text-sm bg-background" placeholder="Your name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      </div>
      <div>
        <label className="text-xs font-medium">Phone (WhatsApp) *</label>
        <input className="mt-1 w-full h-10 rounded-xl border px-3 text-sm bg-background" placeholder="9876543210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} maxLength={10} />
      </div>
      <div>
        <label className="text-xs font-medium">Email</label>
        <input className="mt-1 w-full h-10 rounded-xl border px-3 text-sm bg-background" placeholder="your@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
      </div>
      <div>
        <label className="text-xs font-medium">Looking for</label>
        <select className="mt-1 w-full h-10 rounded-xl border px-3 text-sm bg-background" value={form.interest} onChange={e => setForm(f => ({ ...f, interest: e.target.value }))}>
          <option value="">Select...</option>
          <option value="Laptop - New">Laptop (New)</option>
          <option value="Laptop - Refurbished">Laptop (Refurbished)</option>
          <option value="MacBook">MacBook</option>
          <option value="Desktop">Desktop</option>
          <option value="Repair Service">Repair / Service</option>
          <option value="Screen Replacement">Screen Replacement</option>
          <option value="RAM/SSD Upgrade">RAM / SSD Upgrade</option>
          <option value="Data Recovery">Data Recovery</option>
          <option value="Accessories">Accessories</option>
          <option value="Printer">Printer</option>
          <option value="CCTV">CCTV</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-medium">Budget (₹)</label>
        <input className="mt-1 w-full h-10 rounded-xl border px-3 text-sm bg-background" placeholder="e.g. 25000" type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} />
      </div>
      <div>
        <label className="text-xs font-medium">Message (optional)</label>
        <textarea className="mt-1 w-full rounded-xl border px-3 py-2 text-sm bg-background resize-none" rows={2} placeholder="Any specific requirements..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
      </div>
      <button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50">
        {loading ? 'Submitting...' : 'Submit Enquiry'}
      </button>
      <p className="text-[10px] text-center text-muted-foreground">You will receive a WhatsApp confirmation instantly</p>
    </form>
  );
}

export default function LinksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      <main className="mx-auto flex w-full max-w-[480px] flex-col items-center px-5 pb-16 pt-10">
        {/* Header */}
        <header className="flex flex-col items-center text-center">
          <div className="rounded-full bg-gradient-to-br from-primary to-orange-500 p-1 shadow-lg">
            <img src={logo} alt="AI Laptop Wala" className="h-24 w-24 rounded-full border-4 border-background object-cover" />
          </div>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight">
            AI <span className="text-primary">Laptop Wala</span>
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">Asati Infotech · Indore's Trusted Laptop Store</p>
          <p className="mt-3 max-w-[340px] text-sm leading-relaxed text-foreground/80">
            Study, office or gaming — find the perfect laptop & expert repairs in Indore.
          </p>
        </header>

        {/* Benefits */}
        <section className="mt-6 flex flex-wrap justify-center gap-2">
          <BenefitChip icon={ShieldCheck} label="1 Year Warranty" />
          <BenefitChip icon={BadgeCheck} label="100% Tested" />
          <BenefitChip icon={Gift} label="5 Free Gifts" />
          <BenefitChip icon={Repeat} label="Easy Exchange" />
        </section>

        {/* Links */}
        <section className="mt-8 flex w-full flex-col gap-3">
          <LinkCard href="https://ailaptopwala.com" icon={ClipboardList} label="Visit Our Store" sublabel="Browse laptops & accessories" variant="primary" />
          <LinkCard href="https://www.instagram.com/ailaptopwala" icon={Instagram} label="Instagram" sublabel="@AiLaptopWala" />
          <LinkCard href="https://www.youtube.com/@AiLaptopwalaindore" icon={Youtube} label="YouTube" sublabel="AI Laptopwala Official" />
          <LinkCard href="https://www.facebook.com/profile.php?id=61563386652422" icon={Facebook} label="Facebook" sublabel="AI Laptopwala Indore" />
          <LinkCard href="tel:+919893496163" icon={Phone} label="Call Us" sublabel="+91 98934 96163" external={false} />
          <LinkCard href="https://wa.me/919893496163" icon={MessageCircle} label="WhatsApp" sublabel="Chat with us instantly" />
          <LinkCard href="mailto:contact@ailaptopwala.com" icon={Mail} label="Email Us" sublabel="contact@ailaptopwala.com" external={false} />
        </section>

        {/* Branches */}
        <section className="mt-10 w-full">
          <h2 className="mb-3 text-center text-lg font-bold">Our <span className="text-primary">Branches</span></h2>
          <div className="flex flex-col gap-3">
            <BranchCard name="Branch 1 — Silver Mall" address="LB-21, Block-B, Silver Mall, 8-A, RNT Marg, South Tukoganj, Indore, MP 452001" mapUrl="https://maps.app.goo.gl/Z4e1Z91HVKwjm5xp9" />
            <BranchCard name="Branch 2 — Sai Residency" address="21, G3, Sai Residency, Ashish Nagar, Near Bangali Chouraha, Indore, MP 452016" mapUrl="https://maps.app.goo.gl/drVLkuS9tGjEmwUF7" />
          </div>
        </section>

        {/* Enquiry Form */}
        <section id="enquiry" className="mt-10 w-full">
          <h2 className="mb-1 text-center text-lg font-bold">Enquiry <span className="text-primary">Form</span></h2>
          <p className="mb-4 text-center text-sm text-muted-foreground">Fill the form & our team will reach out shortly.</p>
          <EnquiryForm />
        </section>

        {/* Footer */}
        <footer className="mt-12 flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-3">
            {[{ href: "https://www.instagram.com/ailaptopwala", icon: Instagram }, { href: "https://www.youtube.com/@AiLaptopwalaindore", icon: Youtube }, { href: "https://www.facebook.com/profile.php?id=61563386652422", icon: Facebook }].map(s => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" className="flex h-9 w-9 items-center justify-center rounded-full border bg-card hover:bg-primary hover:text-white transition-all">
                <s.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} AI Laptopwala · Asati Infotech</p>
        </footer>
      </main>
    </div>
  );
}
