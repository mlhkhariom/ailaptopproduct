import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Menu, X, Search, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCMSStore } from "@/store/cmsStore";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { siteSettings } = useCMSStore();
  const { user, logout, isAdmin } = useAuth();

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

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-[10px] text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/account">My Account</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/cart">My Cart</Link></DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link to="/admin">Admin Panel</Link></DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button size="sm" variant="outline" className="text-xs gap-1.5">
                <LogIn className="h-3.5 w-3.5" /> Login
              </Button>
            </Link>
          )}
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
            {user ? (
              <Link to="/account" className="flex-1"><Button className="w-full" size="sm">My Account</Button></Link>
            ) : (
              <Link to="/login" className="flex-1"><Button className="w-full" size="sm">Login</Button></Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
