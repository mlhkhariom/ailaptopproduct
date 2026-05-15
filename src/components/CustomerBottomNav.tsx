import { Link, useLocation } from "react-router-dom";
import { Home, Search, ShoppingCart, Heart, User } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

const NAV_ITEMS = [
  { url: '/', icon: Home, label: 'Home' },
  { url: '/products', icon: Search, label: 'Shop' },
  { url: '/cart', icon: ShoppingCart, label: 'Cart', badge: 'cart' },
  { url: '/wishlist', icon: Heart, label: 'Wishlist', badge: 'wishlist' },
  { url: '/account', icon: User, label: 'Account' },
];

export default function CustomerBottomNav() {
  const { pathname } = useLocation();
  const cartCount = useCartStore(s => s.items.length);
  const wishlistCount = useWishlistStore(s => s.items.length);

  // Don't show on admin pages
  if (pathname.startsWith('/admin')) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t">
      <div className="flex items-center justify-around h-14 max-w-md mx-auto">
        {NAV_ITEMS.map(item => {
          const active = item.url === '/' ? pathname === '/' : pathname.startsWith(item.url);
          const count = item.badge === 'cart' ? cartCount : item.badge === 'wishlist' ? wishlistCount : 0;
          return (
            <Link key={item.url} to={item.url}
              className={`relative flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}>
              <item.icon className={`h-5 w-5 ${active ? 'fill-primary/10' : ''}`} />
              {count > 0 && (
                <span className="absolute -top-0.5 right-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                  {count > 9 ? '9+' : count}
                </span>
              )}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
