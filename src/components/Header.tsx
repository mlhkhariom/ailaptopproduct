import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Menu, X, Leaf, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Home", to: "/" },
    { label: "Products", to: "/products" },
    { label: "Blog", to: "/blog" },
    { label: "About", to: "/about" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Leaf className="h-7 w-7 text-primary" />
          <span className="text-xl font-serif font-bold text-foreground">AyurVeda</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-8 w-48 h-9 text-sm" />
          </div>
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">3</span>
            </Button>
          </Link>
          <Link to="/admin">
            <Button size="sm" variant="outline" className="text-xs">Admin</Button>
          </Link>
        </div>

        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-card p-4 space-y-3">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className="block py-2 text-sm font-medium text-muted-foreground hover:text-primary" onClick={() => setMobileOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            <Link to="/cart" className="flex-1">
              <Button variant="outline" className="w-full" size="sm">Cart</Button>
            </Link>
            <Link to="/admin" className="flex-1">
              <Button className="w-full" size="sm">Admin</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
