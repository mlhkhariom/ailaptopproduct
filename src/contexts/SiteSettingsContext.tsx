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

  return <SiteSettingsContext.Provider value={{ features, app }}>{children}</SiteSettingsContext.Provider>;
};

export const useSiteSettings = () => useContext(SiteSettingsContext).features;
export const useAppSettings = () => useContext(SiteSettingsContext).app;
