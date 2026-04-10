import { Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center font-serif font-bold text-sm">A</div>
            <div>
              <span className="text-lg font-serif font-bold block leading-none">Apsoncure</span>
              <span className="text-[10px] opacity-70">Prachi Homeo Clinic</span>
            </div>
          </div>
          <p className="text-sm opacity-80">Pure, Authentic & Trusted Ayurvedic Products. Ancient wisdom for modern health.</p>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <div className="space-y-2 text-sm opacity-80">
            <Link to="/products" className="block hover:opacity-100">Products</Link>
            <Link to="/blog" className="block hover:opacity-100">Blog</Link>
            <Link to="/about" className="block hover:opacity-100">About Us</Link>
            <Link to="/cart" className="block hover:opacity-100">Cart</Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Contact Us</h4>
          <div className="space-y-2 text-sm opacity-80">
            <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 98765 43210</div>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@apsoncure.com</div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> India</div>
          </div>
          <div className="mt-3">
            <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="inline-block text-xs bg-primary-foreground/10 px-3 py-1.5 rounded-full hover:bg-primary-foreground/20 transition-colors">
              💬 Chat on WhatsApp
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Newsletter</h4>
          <p className="text-sm opacity-80 mb-3">Get Ayurvedic tips and exclusive offers.</p>
          <div className="flex gap-2">
            <Input placeholder="Your email" className="bg-primary-foreground/10 border-primary-foreground/20 placeholder:text-primary-foreground/50 text-primary-foreground text-sm h-9" />
            <Button size="sm" variant="secondary" className="shrink-0">Subscribe</Button>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm opacity-60">
        © 2024 Apsoncure PHC – Prachi Homeo Clinic. All rights reserved. Made with 🌿 in India.
      </div>
    </div>
  </footer>
);

export default Footer;
