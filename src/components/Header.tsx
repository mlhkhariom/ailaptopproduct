import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Phone, ShoppingCart, Heart, User, LogIn } from "lucide-react";
import logo from "@/assets/logo.jpeg";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Repair & Services", to: "/services" },
  { label: "Blog", to: "/blog" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Track Order", to: "/track-order" },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { user, logout, isAdmin } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => { setMobileOpen(false); window.scrollTo(0, 0); }, [location.pathname]);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[70] transition-all duration-500 ${scrolled ? "bg-card/95 backdrop-blur-xl shadow-lg border-b border-border/50" : "bg-transparent backdrop-blur-md"}`}>
        <nav className="container mx-auto flex items-center justify-between px-4 py-2.5 md:py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="AI Laptop Wala" className="h-9 md:h-10 w-auto rounded-lg" />
            <span className="font-heading text-base md:text-lg font-extrabold gradient-text tracking-tight hidden sm:inline">AI Laptop Wala</span>
          </Link>

          {/* Desktop Nav */}
          <ul className="hidden lg:flex items-center gap-0.5">
            {navLinks.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors duration-200 ${location.pathname === l.to ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5">
            {/* Search */}
            <div className="hidden md:flex relative">
              <Input placeholder="Search laptops..." className="pl-3 w-36 h-8 text-xs rounded-lg"
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) navigate(`/products?q=${encodeURIComponent((e.target as HTMLInputElement).value.trim())}`); }} />
            </div>

            {/* Wishlist */}
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <Heart className="h-4 w-4" />
                {wishlistCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{wishlistCount}</span>}
              </Button>
            </Link>

            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative h-9 w-9">
                <ShoppingCart className="h-4 w-4" />
                {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
              </Button>
            </Link>

            {/* User */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">{user.name?.[0]?.toUpperCase()}</div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem asChild><Link to="/account">My Account</Link></DropdownMenuItem>
                  {isAdmin && <DropdownMenuItem asChild><Link to="/admin">Admin Panel</Link></DropdownMenuItem>}
                  <DropdownMenuItem onClick={logout} className="text-destructive">Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="icon" className="h-9 w-9"><LogIn className="h-4 w-4" /></Button>
              </Link>
            )}

            {/* WhatsApp CTA */}
            <a href="https://wa.me/919893496163" target="_blank" rel="noreferrer"
              className="hidden lg:inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition-all glow-cyan ml-1">
              <Phone size={12} /> WhatsApp
            </a>

            {/* Mobile toggle */}
            <button className="lg:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-muted text-foreground active:scale-95 transition-transform"
              onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Spacer */}
      <div className="h-14 md:h-16" />

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[75] flex flex-col items-center justify-center gap-1 px-8 bg-background">
          <img src={logo} alt="AI Laptop Wala" className="h-16 w-auto mb-6 rounded-xl" />
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to}
              className={`text-2xl font-heading font-bold transition-colors py-2.5 block ${location.pathname === l.to ? "text-primary" : "text-foreground hover:text-primary"}`}
              onClick={() => setMobileOpen(false)}>
              {l.label}
            </Link>
          ))}
          <a href="https://wa.me/919893496163" target="_blank" rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground glow-cyan active:scale-95 transition-transform"
            onClick={() => setMobileOpen(false)}>
            <Phone size={18} /> WhatsApp Us
          </a>
        </div>
      )}
    </>
  );
};

export default Header;
