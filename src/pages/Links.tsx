// Linktree-style page — ailaptopwala.com/links
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
          <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
            <iframe src="https://docs.google.com/forms/d/e/1FAIpQLScxuqTNvb_KpgsksTnAf4foq9vCUlMmtGGXOEETkAV3QayWLA/viewform?embedded=true" width="100%" height="1460" frameBorder={0} title="AI Laptopwala Enquiry Form" className="block w-full" />
          </div>
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
