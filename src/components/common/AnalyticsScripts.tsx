import { useEffect } from "react";
import { useAppSettings } from "@/contexts/SiteSettingsContext";

// Inject GA4 + GTM scripts dynamically
export const AnalyticsScripts = () => {
  const { ga4_measurement_id, gtm_id, search_console_verification } = useAppSettings() as any;

  useEffect(() => {
    // GA4
    if (ga4_measurement_id && !document.getElementById('ga4-script')) {
      const s1 = document.createElement('script');
      s1.id = 'ga4-script';
      s1.async = true;
      s1.src = `https://www.googletagmanager.com/gtag/js?id=${ga4_measurement_id}`;
      document.head.appendChild(s1);

      const s2 = document.createElement('script');
      s2.id = 'ga4-init';
      s2.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4_measurement_id}');`;
      document.head.appendChild(s2);
    }

    // GTM
    if (gtm_id && !document.getElementById('gtm-script')) {
      const s = document.createElement('script');
      s.id = 'gtm-script';
      s.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm_id}');`;
      document.head.appendChild(s);
    }

    // Search Console meta tag
    if (search_console_verification && !document.getElementById('sc-meta')) {
      const meta = document.createElement('meta');
      meta.id = 'sc-meta';
      meta.name = 'google-site-verification';
      meta.content = search_console_verification.replace('google-site-verification=', '');
      document.head.appendChild(meta);
    }
  }, [ga4_measurement_id, gtm_id, search_console_verification]);

  return null;
};
