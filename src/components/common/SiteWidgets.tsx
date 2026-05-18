import { useState, useEffect } from "react";
import { Sun, Moon, X, Mail, Clock, Play, Scale } from "lucide-react";
import { useSiteSettings, useAppSettings } from "@/contexts/SiteSettingsContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Dark Mode Toggle ────────────────────────────────────────
export const DarkModeToggle = () => {
  const { dark_mode_toggle } = useSiteSettings();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const preferDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const shouldDark = saved === 'dark' || (!saved && preferDark);
    setIsDark(shouldDark);
    document.documentElement.classList.toggle('dark', shouldDark);
  }, []);

  if (!dark_mode_toggle) return null;

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggle} className="h-9 w-9" aria-label="Toggle theme">
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
};

// ── Newsletter Popup (Exit Intent) ──────────────────────────
export const NewsletterPopup = () => {
  const { newsletter_popup } = useSiteSettings();
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!newsletter_popup) return;
    if (localStorage.getItem('newsletter_shown') === '1') return;

    const onMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 20) {
        setShow(true);
        localStorage.setItem('newsletter_shown', '1');
        document.removeEventListener('mouseleave', onMouseLeave);
      }
    };
    // Also auto-show after 30 seconds
    const timer = setTimeout(() => {
      if (!localStorage.getItem('newsletter_shown')) {
        setShow(true);
        localStorage.setItem('newsletter_shown', '1');
      }
    }, 30000);

    setTimeout(() => document.addEventListener('mouseleave', onMouseLeave), 5000);
    return () => { clearTimeout(timer); document.removeEventListener('mouseleave', onMouseLeave); };
  }, [newsletter_popup]);

  if (!newsletter_popup || !show) return null;

  const handleSubscribe = async () => {
    if (!email.includes('@')) return;
    try {
      await fetch('/api/subscribers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source: 'newsletter_popup' }) });
    } catch {}
    setSubscribed(true);
    setTimeout(() => setShow(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShow(false)}>
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full p-6 relative" onClick={e => e.stopPropagation()}>
        <button onClick={() => setShow(false)} className="absolute top-3 right-3 h-8 w-8 rounded-full hover:bg-accent flex items-center justify-center">
          <X className="h-4 w-4" />
        </button>
        {subscribed ? (
          <div className="text-center py-6">
            <div className="text-5xl mb-3"></div>
            <h3 className="font-serif text-2xl font-bold mb-2">Subscribed!</h3>
            <p className="text-sm text-muted-foreground">Check your inbox for your welcome discount.</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-4">
              <Mail className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-serif text-2xl font-bold mb-1">Wait! Don't leave empty-handed</h3>
              <p className="text-sm text-muted-foreground">Get <b className="text-primary">₹500 OFF</b> your first order + weekly deals</p>
            </div>
            <div className="flex gap-2">
              <Input placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubscribe()} />
              <Button onClick={handleSubscribe}>Claim</Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-3">No spam. Unsubscribe anytime.</p>
          </>
        )}
      </div>
    </div>
  );
};

// ── Sale Countdown Timer ─────────────────────────────────────
export const SaleCountdown = () => {
  const { sale_countdown } = useSiteSettings();
  const { sale_ends_at } = useAppSettings() as any;
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    if (!sale_countdown || !sale_ends_at) return;
    const target = new Date(sale_ends_at).getTime();

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) return setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
      setTimeLeft({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [sale_countdown, sale_ends_at]);

  if (!sale_countdown || !sale_ends_at) return null;
  if (timeLeft.d === 0 && timeLeft.h === 0 && timeLeft.m === 0 && timeLeft.s === 0) return null;

  return (
    <div className="bg-gradient-to-r from-red-500 via-orange-500 to-red-500 text-white py-3 px-4 text-center">
      <div className="flex items-center justify-center gap-2 text-sm font-medium">
        <Clock className="h-4 w-4" />
        <span>Sale ends in:</span>
        <div className="flex gap-1 font-mono">
          <span className="bg-white/20 px-2 py-0.5 rounded">{String(timeLeft.d).padStart(2, '0')}d</span>
          <span className="bg-white/20 px-2 py-0.5 rounded">{String(timeLeft.h).padStart(2, '0')}h</span>
          <span className="bg-white/20 px-2 py-0.5 rounded">{String(timeLeft.m).padStart(2, '0')}m</span>
          <span className="bg-white/20 px-2 py-0.5 rounded">{String(timeLeft.s).padStart(2, '0')}s</span>
        </div>
      </div>
    </div>
  );
};

// ── Recently Viewed Products Tracker ─────────────────────────
export function trackProductView(product: any) {
  const enabled = localStorage.getItem('__recently_viewed_enabled') !== 'false';
  if (!enabled) return;
  const viewed = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
  const filtered = viewed.filter((p: any) => p.id !== product.id);
  filtered.unshift({ id: product.id, name: product.name, price: product.price, image: product.image, slug: product.slug, viewed_at: Date.now() });
  localStorage.setItem('recently_viewed', JSON.stringify(filtered.slice(0, 6)));
}

export const RecentlyViewedSection = () => {
  const { recently_viewed } = useSiteSettings();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    localStorage.setItem('__recently_viewed_enabled', String(recently_viewed));
    if (recently_viewed) {
      try { setItems(JSON.parse(localStorage.getItem('recently_viewed') || '[]')); } catch {}
    }
  }, [recently_viewed]);

  if (!recently_viewed || items.length === 0) return null;

  return (
    <section className="py-8 border-t">
      <div className="container mx-auto px-4">
        <h2 className="text-lg font-serif font-bold mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" /> Recently Viewed
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {items.map(item => (
            <a key={item.id} href={`/products/${item.slug || item.id}`} className="group">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-2">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <p className="text-xs font-medium line-clamp-2 group-hover:text-primary">{item.name}</p>
              <p className="text-xs text-primary font-bold mt-0.5">₹{item.price}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
