import { Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppSettings } from "@/contexts/SiteSettingsContext";

const Footer = () => {
  const appSettings = useAppSettings();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center font-serif font-bold text-sm">A</div>
              <div>
                <span className="text-lg font-serif font-bold block leading-none">{appSettings.store_name.split(" ")[0]}</span>
                <span className="text-[10px] opacity-70">{appSettings.store_tagline}</span>
              </div>
            </div>
            <p className="text-sm opacity-80 mb-4">{appSettings.store_tagline}</p>
            <a href={`https://wa.me/${appSettings.whatsapp_number || '919876543210'}`} target="_blank" rel="noreferrer" className="inline-block text-xs bg-primary-foreground/10 px-3 py-1.5 rounded-full hover:bg-primary-foreground/20 transition-colors">
              💬 Chat on WhatsApp
            </a>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm opacity-80">
              <Link to="/products" className="block hover:opacity-100">Products</Link>
              <Link to="/blog" className="block hover:opacity-100">Blog</Link>
              <Link to="/about" className="block hover:opacity-100">About Us</Link>
              <Link to="/contact" className="block hover:opacity-100">Contact</Link>
              <Link to="/faq" className="block hover:opacity-100">FAQs</Link>
              <Link to="/track-order" className="block hover:opacity-100">Track Order</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Policies</h4>
            <div className="space-y-2 text-sm opacity-80">
              <Link to="/privacy" className="block hover:opacity-100">Privacy Policy</Link>
              <Link to="/terms" className="block hover:opacity-100">Terms & Conditions</Link>
              <Link to="/refund" className="block hover:opacity-100">Refund & Returns</Link>
              <Link to="/shipping" className="block hover:opacity-100">Shipping Policy</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <div className="space-y-2 text-sm opacity-80">
              <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> {appSettings.store_phone}</div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> {appSettings.store_email}</div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {appSettings.store_address}</div>
            </div>
            <div className="mt-4">
              <p className="text-xs opacity-70 mb-2">Newsletter</p>
              <div className="flex gap-2">
                <Input placeholder="Your email" className="bg-primary-foreground/10 border-primary-foreground/20 placeholder:text-primary-foreground/50 text-primary-foreground text-sm h-9" />
                <Button size="sm" variant="secondary" className="shrink-0">Join</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-sm opacity-60">
          <span>© 2024 {appSettings.store_name} – {appSettings.store_tagline}. All rights reserved. Made with 🌿 in India.</span>
          <span className="text-[11px]">
            Developed by{" "}
            <a href="https://mlhk.in" target="_blank" rel="noreferrer" className="opacity-80 hover:opacity-100 underline underline-offset-2">
              MLHK Infotech
            </a>{" "}
            (Hariom Vishwkarma)
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
