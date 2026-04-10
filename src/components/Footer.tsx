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
          <p className="text-sm opacity-80">आयुर्वेद की प्राचीन विद्या, आधुनिक स्वास्थ्य के लिए। शुद्ध, प्रामाणिक और भरोसेमंद उत्पाद।</p>
          <p className="text-xs opacity-60 mt-2">Pure, Authentic & Trusted Ayurvedic Products</p>
        </div>

        <div>
          <h4 className="font-semibold mb-4">त्वरित लिंक</h4>
          <div className="space-y-2 text-sm opacity-80">
            <Link to="/products" className="block hover:opacity-100">प्रोडक्ट्स (Products)</Link>
            <Link to="/blog" className="block hover:opacity-100">ब्लॉग (Blog)</Link>
            <Link to="/about" className="block hover:opacity-100">हमारे बारे में (About)</Link>
            <Link to="/cart" className="block hover:opacity-100">कार्ट (Cart)</Link>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4">संपर्क करें</h4>
          <div className="space-y-2 text-sm opacity-80">
            <div className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 98765 43210</div>
            <div className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@apsoncure.com</div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> भारत (India)</div>
          </div>
          <div className="mt-3">
            <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="inline-block text-xs bg-primary-foreground/10 px-3 py-1.5 rounded-full hover:bg-primary-foreground/20 transition-colors">
              💬 WhatsApp पर बात करें
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4">न्यूज़लेटर</h4>
          <p className="text-sm opacity-80 mb-3">आयुर्वेदिक टिप्स और ऑफर्स पाएं।</p>
          <div className="flex gap-2">
            <Input placeholder="आपका ईमेल" className="bg-primary-foreground/10 border-primary-foreground/20 placeholder:text-primary-foreground/50 text-primary-foreground text-sm h-9" />
            <Button size="sm" variant="secondary" className="shrink-0">जुड़ें</Button>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm opacity-60">
        © 2024 Apsoncure PHC – Prachi Homeo Clinic. सर्वाधिकार सुरक्षित। Made with 🌿 in India.
      </div>
    </div>
  </footer>
);

export default Footer;
