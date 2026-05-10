import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, ExternalLink } from "lucide-react";
import logo from "@/assets/logo.jpeg";

const Footer = () => (
  <footer className="bg-foreground text-background py-12 md:py-16">
    <div className="container mx-auto px-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8 mb-10">

        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <img src={logo} alt="AI Laptop Wala" className="h-10 w-auto rounded-lg" />
            <span className="font-heading text-lg font-bold text-background">AI Laptop Wala</span>
          </Link>
          <p className="text-sm text-background/60 leading-relaxed mb-4">
            Your trusted partner for certified refurbished laptops and expert repair services in Indore. Since 2011.
          </p>
          <div className="flex items-center gap-2">
            {[
              { href: "https://www.instagram.com/ailaptopwala", label: "Instagram", svg: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /> },
              { href: "https://www.youtube.com/@AiLaptopwalaindore", label: "YouTube", svg: <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /> },
              { href: "https://www.facebook.com/profile.php?id=61563386652422", label: "Facebook", svg: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /> },
            ].map(s => (
              <a key={s.label} href={s.href} target="_blank" rel="noreferrer" aria-label={s.label}
                className="w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                <svg className="w-4 h-4 fill-background/70" viewBox="0 0 24 24">{s.svg}</svg>
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-heading font-bold text-sm mb-4 text-background">Quick Links</h4>
          <ul className="space-y-2.5">
            {[
              { label: "Home", to: "/" },
              { label: "Buy Laptops", to: "/products" },
              { label: "Repair & Services", to: "/services" },
              { label: "About Us", to: "/about" },
              { label: "Blog", to: "/blog" },
              { label: "Contact Us", to: "/contact" },
              { label: "Track Order", to: "/track-order" },
              { label: "Wishlist", to: "/wishlist" },
            ].map(l => (
              <li key={l.to}><Link to={l.to} className="text-sm text-background/60 hover:text-primary transition-colors">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="font-heading font-bold text-sm mb-4 text-background">Repair Services</h4>
          <ul className="space-y-2.5">
            {["Screen Replacement", "Battery Replacement", "Keyboard Repair", "SSD/RAM Upgrade", "OS Installation", "Motherboard Repair", "Data Recovery", "Virus Removal"].map(s => (
              <li key={s}><Link to="/services" className="text-sm text-background/60 hover:text-primary transition-colors">{s}</Link></li>
            ))}
          </ul>
        </div>

        {/* Policies */}
        <div>
          <h4 className="font-heading font-bold text-sm mb-4 text-background">Policies</h4>
          <ul className="space-y-2.5 mb-6">
            {[
              { label: "Privacy Policy", to: "/privacy" },
              { label: "Terms & Conditions", to: "/terms" },
              { label: "Refund & Returns", to: "/refund" },
              { label: "Shipping Policy", to: "/shipping" },
              { label: "FAQ", to: "/faq" },
            ].map(l => (
              <li key={l.to}><Link to={l.to} className="text-sm text-background/60 hover:text-primary transition-colors">{l.label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-heading font-bold text-sm mb-4 text-background">Our Branches</h4>
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <MapPin size={14} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-background/80 mb-0.5">Silver Mall (Main)</p>
                <p className="text-xs text-background/50 leading-relaxed">LB-21, Block-B, Silver Mall, 8-A, RNT Marg, Indore 452001</p>
                <a href="https://maps.app.goo.gl/Z4e1Z91HVKwjm5xp9" target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline">Get Directions →</a>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <MapPin size={14} className="text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-background/80 mb-0.5">Bangali Chouraha</p>
                <p className="text-xs text-background/50 leading-relaxed">21, G3, Sai Residency, Near Bangali Chouraha, Indore 452016</p>
                <a href="https://maps.app.goo.gl/drVLkuS9tGjEmwUF7" target="_blank" rel="noreferrer" className="text-[10px] text-primary hover:underline">Get Directions →</a>
              </div>
            </div>
            <a href="tel:+919893496163" className="flex items-center gap-2.5 text-sm text-background/60 hover:text-primary transition-colors">
              <Phone size={14} className="text-primary shrink-0" /> +91 98934 96163
            </a>
            <a href="mailto:contact@ailaptopwala.com" className="flex items-center gap-2.5 text-sm text-background/60 hover:text-primary transition-colors">
              <Mail size={14} className="text-primary shrink-0" /> contact@ailaptopwala.com
            </a>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-background/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-xs text-background/40">© {new Date().getFullYear()} AI Laptop Wala | Asati Infotech. All Rights Reserved.</p>
        <div className="flex items-center gap-3 text-xs text-background/40">
          <a href="https://www.justdial.com/Indore/Ai-Laptop-Wala/0731PX731-X731-251014151403-Y2S4_BZDET" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">JustDial</a>
          <span>·</span>
          <a href="https://www.indiamart.com/asati-infotech" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">IndiaMart</a>
          <span>·</span>
          <span>Crafted with ❤️ by <a href="https://mlhk.in" target="_blank" rel="noreferrer" className="text-primary hover:underline">Hariom Vishwkarma</a></span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
