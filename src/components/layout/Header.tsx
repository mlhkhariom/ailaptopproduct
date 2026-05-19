import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Phone, ShoppingCart, Heart, User, LogIn, Bell, Sun, Moon } from "lucide-react";
import logo from "@/assets/logo.jpeg";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings, useAppSettings } from "@/contexts/SiteSettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import GlobalSearch from "@/components/ecommerce/GlobalSearch";
import { FreeShippingBanner } from "@/components/common/SiteFeatures";
import { DarkModeToggle } from "@/components/common/SiteWidgets";

const DEFAULT_NAV = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Offers", to: "/offers" },
  { label: "Repair & Services", to: "/services" },
  { label: "EMI", to: "/emi-calculator" },
  { label: "Blog", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navLinks, setNavLinks] = useState(DEFAULT_NAV);
  const location = useLocation();
  const navigate = useNavigate();
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { user, logout, isAdmin } = useAuth();
  const { sticky_header, wishlist_enabled, store_phone, store_name } = useSiteSettings();
  const appS = useAppSettings() as any;

  useEffect(() => {
    fetch('/api/menus/header').then(r => r.json()).then(d => {
      if (Array.isArray(d) && d.length > 0) setNavLinks(d.filter((i: any) => i.is_visible).map((i: any) => ({ label: i.label, to: i.url })));
    }).catch(() => {});
  }, []);

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
      {appS?.show_announcement !== '0' && appS?.announcement_text && (
        <div className="w-full text-center py-1.5 text-xs font-medium text-white" style={{ background: appS.announcement_bg || '#2563eb' }}>
          {appS.announcement_link ? <a href={appS.announcement_link} className="hover:underline">{appS.announcement_text}</a> : appS.announcement_text}
        </div>
      )}
      {(!appS?.announcement_text) && <FreeShippingBanner />}
      <header className={`${sticky_header !== false ? 'fixed' : 'relative'} top-0 left-0 right-0 z-[70] transition-all duration-500 ${scrolled ? "bg-card/95 backdrop-blur-xl shadow-lg border-b border-border/50" : "bg-transparent backdrop-blur-md"}`}>
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
            {/* Search with autocomplete */}
            <div className="hidden md:block">
              <GlobalSearch className="w-56" />
            </div>

            {/* Dark mode toggle */}
            {appS?.dark_mode_toggle !== '0' && (
              <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => { document.documentElement.classList.toggle('dark'); }}>
                <Sun className="h-4 w-4 dark:hidden" />
                <Moon className="h-4 w-4 hidden dark:block" />
              </Button>
            )}

            {/* Wishlist (feature toggle) */}
            {wishlist_enabled !== false && (
              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <Heart className="h-4 w-4" />
                  {wishlistCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{wishlistCount}</span>}
                </Button>
              </Link>
            )}

            {/* Dark Mode (feature toggle) */}
            <DarkModeToggle />

            {/* Notifications Bell */}
            {user && (
              <Link to="/notifications">
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <Bell className="h-4 w-4" />
                </Button>
              </Link>
            )}

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
            <a href={`https://wa.me/91${(store_phone || "9893496163").replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer"
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
          <div className="w-full max-w-xs mb-4"><GlobalSearch /></div>
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to}
              className={`text-2xl font-heading font-bold transition-colors py-2.5 block ${location.pathname === l.to ? "text-primary" : "text-foreground hover:text-primary"}`}
              onClick={() => setMobileOpen(false)}>
              {l.label}
            </Link>
          ))}
          <a href={`https://wa.me/91${(store_phone || "9893496163").replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer"
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
