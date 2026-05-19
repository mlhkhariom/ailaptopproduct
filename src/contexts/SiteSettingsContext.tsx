import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface SiteSettings {
  maintenance_mode: boolean;
  show_reviews: boolean;
  show_stock_count: boolean;
  whatsapp_chat_button: boolean;
  show_hindi_names: boolean;
  enable_reels: boolean;
  cookie_consent: boolean;
  // New features
  dark_mode_toggle: boolean;
  guest_checkout: boolean;
  product_zoom: boolean;
  emi_calculator: boolean;
  recently_viewed: boolean;
  wishlist_enabled: boolean;
  compare_enabled: boolean;
  free_shipping_banner: boolean;
  back_to_top: boolean;
  sticky_header: boolean;
  sale_countdown: boolean;
  newsletter_popup: boolean;
  new_arrivals_badge: boolean;
}

interface AppSettings {
  store_name: string;
  store_tagline: string;
  store_email: string;
  store_phone: string;
  store_website: string;
  store_address: string;
  store_logo: string;
  shipping_flat_rate: string;
  shipping_free_above: string;
  shipping_cod_charge: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
}

interface SettingsCtx {
  features: SiteSettings;
  app: AppSettings;
}

const defaults: SettingsCtx = {
  features: {
    maintenance_mode: false, show_reviews: true, show_stock_count: true,
    whatsapp_chat_button: true, show_hindi_names: true, enable_reels: true, cookie_consent: true,
    // New features — sensible defaults
    dark_mode_toggle: true, guest_checkout: true, product_zoom: true, emi_calculator: true,
    recently_viewed: true, wishlist_enabled: true, compare_enabled: false, free_shipping_banner: true,
    back_to_top: true, sticky_header: true, sale_countdown: false, newsletter_popup: false,
    new_arrivals_badge: true,
  },
  app: {
    store_name: 'AI Laptop Wala', store_tagline: "Nature's Power, Modern Science",
    store_email: 'contact@ailaptopwala.com', store_phone: '+91 98934 96163',
    store_website: 'https://ailaptopwala.com', store_address: 'AI Laptop Wala Store, India',
    store_logo: '', shipping_flat_rate: '50', shipping_free_above: '499',
    shipping_cod_charge: '30', seo_title: 'AI Laptop Wala | Authentic Laptop Products',
    seo_description: 'Buy certified refurbished laptops in Indore. Expert repair services.', seo_keywords: 'refurbished laptop indore, laptop repair indore, macbook indore',
  }
};

const SiteSettingsContext = createContext<SettingsCtx>(defaults);

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [features, setFeatures] = useState(defaults.features);
  const [app, setApp] = useState(defaults.app);

  useEffect(() => {
    fetch(`${BASE}/site-settings`).then(r => r.json()).then(setFeatures).catch(() => {});
    fetch(`${BASE}/app-settings`).then(r => r.json()).then(setApp).catch(() => {});
  }, []);

  // Apply theme colors, custom CSS/JS from settings
  useEffect(() => {
    if (!app || typeof app !== 'object') return;
    const s = app as any;
    // Theme colors → CSS variables
    if (s.color_primary) document.documentElement.style.setProperty('--color-primary', s.color_primary);
    if (s.color_secondary) document.documentElement.style.setProperty('--color-secondary', s.color_secondary);
    if (s.color_accent) document.documentElement.style.setProperty('--color-accent', s.color_accent);
    if (s.border_radius) document.documentElement.style.setProperty('--radius', s.border_radius + 'px');
    // Custom CSS injection
    if (s.custom_css) {
      let el = document.getElementById('custom-css-inject');
      if (!el) { el = document.createElement('style'); el.id = 'custom-css-inject'; document.head.appendChild(el); }
      el.textContent = s.custom_css;
    }
    // Custom JS injection
    if (s.custom_js) {
      let el = document.getElementById('custom-js-inject');
      if (!el) { el = document.createElement('script'); el.id = 'custom-js-inject'; document.body.appendChild(el); }
      el.textContent = s.custom_js;
    }
    // Custom head tags
    if (s.custom_head_tags) {
      let el = document.getElementById('custom-head-inject');
      if (!el) { el = document.createElement('div'); el.id = 'custom-head-inject'; document.head.appendChild(el); }
      el.innerHTML = s.custom_head_tags;
    }
  }, [app]);

  return <SiteSettingsContext.Provider value={{ features, app }}>{children}</SiteSettingsContext.Provider>;
};

export const useSiteSettings = () => useContext(SiteSettingsContext).features;
export const useAppSettings = () => useContext(SiteSettingsContext).app;
