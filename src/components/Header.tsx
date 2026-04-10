import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCMSStore } from "@/store/cmsStore";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { siteSettings } = useCMSStore();

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Products", to: "/products" },
    { label: "Blog", to: "/blog" },
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
    { label: "FAQs", to: "/faq" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b">
      {siteSettings.announcementActive && (
        <div className="bg-primary text-primary-foreground text-xs text-center py-1.5 px-4">
          {siteSettings.announcementBar}
        </div>
      )}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-sm">A</div>
          <div className="leading-tight">
            <span className="text-lg font-serif font-bold text-foreground block leading-none">{siteSettings.storeName.split(" ")[0]}</span>
            <span className="text-[10px] text-muted-foreground leading-none">{siteSettings.tagline}</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-5">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{l.label}</Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-8 w-44 h-9 text-sm" />
          </div>
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">3</span>
            </Button>
          </Link>
          <Link to="/admin"><Button size="sm" variant="outline" className="text-xs">Admin</Button></Link>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-card p-4 space-y-3">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary" onClick={() => setMobileOpen(false)}>{l.label}</Link>
          ))}
          <div className="flex gap-2 pt-2">
            <Link to="/cart" className="flex-1"><Button variant="outline" className="w-full" size="sm">🛒 Cart</Button></Link>
            <Link to="/admin" className="flex-1"><Button className="w-full" size="sm">Admin</Button></Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
