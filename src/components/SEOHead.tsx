import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  image?: string;
  type?: "website" | "article" | "product";
  noindex?: boolean;
  jsonLd?: object | object[];
  breadcrumbs?: { name: string; url?: string }[];
  article?: { publishedTime?: string; modifiedTime?: string; author?: string; section?: string };
}

const SITE = {
  name: "AI Laptop Wala",
  url: "https://ailaptopwala.com",
  logo: "https://ailaptopwala.com/favicon.png",
  phone: "+91-98934-96163",
  email: "contact@ailaptopwala.com",
  address: "LB-21, Block-B, Silver Mall, 8-A, RNT Marg, South Tukoganj, Indore, MP 452001",
  founder: "Bhagwan Das Asati",
  company: "Asati Infotech",
  since: "2011",
  rating: "4.8",
  reviews: "5000",
  social: {
    instagram: "https://www.instagram.com/ailaptopwala",
    facebook: "https://www.facebook.com/profile.php?id=61563386652422",
    youtube: "https://www.youtube.com/@AiLaptopwalaindore",
    whatsapp: "https://wa.me/919893496163",
    justdial1: "https://www.justdial.com/Indore/Ai-Laptop-Wala/0731PX731-X731-251014151403-Y2S4_BZDET",
    justdial2: "https://www.justdial.com/Indore/Ai-Laptopwala-Rnt-Road/0731PX731-X731-260220122854-E9T8_BZDET",
    justdial3: "https://www.justdial.com/Indore/Asati-Infotech-Silver-Mall-Near-Shrimaya-Hotel-Rnt-Road/0731PX731-X731-111212153207-K3X8_BZDET",
    indiamart: "https://www.indiamart.com/asati-infotech",
  },
};

// Global Organization + LocalBusiness schema (on every page)
const globalSchema = [
  {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Store", "ComputerStore"],
    "@id": `${SITE.url}/#business`,
    "name": SITE.name,
    "legalName": SITE.company,
    "description": "AI Laptop Wala — Indore's most trusted laptop store since 2011. Buy certified refurbished laptops, open-box MacBooks, gaming laptops, desktops & accessories. Expert laptop repair, screen replacement, battery, SSD/RAM upgrade, virus removal, motherboard repair. Home service available across Indore. Two branches: Silver Mall & Bangali Chouraha.",
    "url": SITE.url,
    "logo": { "@type": "ImageObject", "url": SITE.logo, "width": 200, "height": 200 },
    "image": SITE.logo,
    "telephone": SITE.phone,
    "email": SITE.email,
    "foundingDate": SITE.since,
    "founder": { "@type": "Person", "name": SITE.founder },
    "employee": { "@type": "Person", "name": "Nitin Asati", "jobTitle": "CEO & Manager" },
    "taxID": "23ATNPA4415H1Z2",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "LB-21, Block-B, Silver Mall, 8-A, RNT Marg, South Tukoganj",
      "addressLocality": "Indore",
      "addressRegion": "Madhya Pradesh",
      "postalCode": "452001",
      "addressCountry": "IN"
    },
    "geo": { "@type": "GeoCoordinates", "latitude": "22.7166372", "longitude": "75.8737741" },
    "hasMap": "https://maps.app.goo.gl/Z4e1Z91HVKwjm5xp9",
    "openingHoursSpecification": [
      { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], "opens": "10:00", "closes": "20:00" }
    ],
    "priceRange": "₹₹",
    "currenciesAccepted": "INR",
    "paymentAccepted": "Cash, Credit Card, Debit Card, UPI, Net Banking, EMI",
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": SITE.rating, "reviewCount": SITE.reviews, "bestRating": "5", "worstRating": "1" },
    "sameAs": [
      SITE.social.instagram,
      SITE.social.facebook,
      SITE.social.youtube,
      SITE.social.whatsapp,
      SITE.social.justdial1,
      SITE.social.justdial2,
      SITE.social.justdial3,
      SITE.social.indiamart,
    ],
    "contactPoint": [
      { "@type": "ContactPoint", "telephone": SITE.phone, "contactType": "sales", "areaServed": "IN", "availableLanguage": ["Hindi", "English"] },
      { "@type": "ContactPoint", "telephone": SITE.phone, "contactType": "customer service", "areaServed": "IN", "availableLanguage": ["Hindi", "English"] },
      { "@type": "ContactPoint", "telephone": SITE.phone, "contactType": "technical support", "areaServed": "IN", "availableLanguage": ["Hindi", "English"] }
    ],
    "department": [
      {
        "@type": "LocalBusiness",
        "name": "AI Laptop Wala — Silver Mall Branch",
        "address": { "@type": "PostalAddress", "streetAddress": "LB-21, Block-B, Silver Mall, 8-A, RNT Marg, South Tukoganj", "addressLocality": "Indore", "addressRegion": "MP", "postalCode": "452001", "addressCountry": "IN" },
        "geo": { "@type": "GeoCoordinates", "latitude": "22.7166372", "longitude": "75.8737741" },
        "hasMap": "https://maps.app.goo.gl/Z4e1Z91HVKwjm5xp9",
        "telephone": SITE.phone,
      },
      {
        "@type": "LocalBusiness",
        "name": "AI Laptop Wala — Bangali Chouraha Branch",
        "address": { "@type": "PostalAddress", "streetAddress": "21, G3, Sai Residency, Ashish Nagar, Near Bangali Chouraha", "addressLocality": "Indore", "addressRegion": "MP", "postalCode": "452016", "addressCountry": "IN" },
        "geo": { "@type": "GeoCoordinates", "latitude": "22.7161819", "longitude": "75.9079282" },
        "hasMap": "https://maps.app.goo.gl/drVLkuS9tGjEmwUF7",
        "telephone": SITE.phone,
      }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Laptops, Desktops, Accessories & Repair Services",
      "itemListElement": [
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Certified Refurbished Laptops", "url": "https://ailaptopwala.com/products?category=Laptops" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Open-Box MacBooks", "url": "https://ailaptopwala.com/products?category=MacBooks" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Gaming Laptops", "url": "https://ailaptopwala.com/products?category=Gaming" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Refurbished Desktops", "url": "https://ailaptopwala.com/products?category=Desktops" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Laptop Accessories", "url": "https://ailaptopwala.com/products?category=Accessories" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Laptop Screen Replacement" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Battery Replacement" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "SSD & RAM Upgrade" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Virus Removal & OS Installation" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Home Laptop Repair Indore" } },
      ]
    },
    "knowsAbout": [
      "Refurbished Laptops", "MacBook", "Gaming Laptops", "Desktops", "Laptop Accessories",
      "Laptop Repair", "Screen Replacement", "Battery Replacement", "SSD Upgrade", "RAM Upgrade",
      "Virus Removal", "OS Installation", "Motherboard Repair", "Data Recovery",
      "Home Laptop Service Indore", "Laptop Buying Guide"
    ],
    "areaServed": [
      { "@type": "City", "name": "Indore", "sameAs": "https://en.wikipedia.org/wiki/Indore" },
      { "@type": "State", "name": "Madhya Pradesh" }
    ],
    "slogan": "Buy, Sell & Repair Laptops — Indore's Most Trusted Since 2011",
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    "name": SITE.name,
    "alternateName": ["AI Laptop Wala Indore", "Asati Infotech", "ailaptopwala"],
    "url": SITE.url,
    "description": "Buy certified refurbished laptops, MacBooks, gaming laptops, desktops in Indore. Expert repair & home service.",
    "publisher": { "@id": `${SITE.url}/#business` },
    "potentialAction": {
      "@type": "SearchAction",
      "target": { "@type": "EntryPoint", "urlTemplate": `${SITE.url}/products?q={search_term_string}` },
      "query-input": "required name=search_term_string"
    },
    "inLanguage": ["en-IN", "hi-IN"],
  }
];

const SEOHead = ({
  title,
  description,
  keywords,
  canonical,
  image,
  type = "website",
  noindex = false,
  jsonLd,
  breadcrumbs,
  article,
}: SEOProps) => {
  const fullTitle = title ? `${title} | AI Laptop Wala Indore` : "AI Laptop Wala Indore – Best Laptop Shop | MacBook, Gaming, Refurbished";
  const fullDesc = description || "AI Laptop Wala – Indore's most trusted laptop store since 2011. Buy certified refurbished laptops, MacBooks, gaming laptops. Expert repair at Silver Mall, RNT Marg. 5000+ happy customers.";
  const fullKeywords = keywords || "AI Laptop Wala, laptop shop Indore, refurbished laptop Indore, MacBook Indore, gaming laptop Indore, laptop repair Indore, Silver Mall laptop, Asati Infotech";
  const fullImage = image 
    ? (image.startsWith('http') ? image : `${SITE.url}${image}`)
    : SITE.logo;
  const fullCanonical = canonical ? (canonical.startsWith("http") ? canonical : `${SITE.url}${canonical}`) : SITE.url;

  // Breadcrumb schema
  const breadcrumbSchema = breadcrumbs?.length ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": SITE.url },
      ...breadcrumbs.map((b, i) => ({
        "@type": "ListItem",
        "position": i + 2,
        "name": b.name,
        ...(b.url ? { "item": b.url.startsWith("http") ? b.url : `${SITE.url}${b.url}` } : {})
      }))
    ]
  } : null;

  const allSchemas = [
    ...globalSchema,
    ...(breadcrumbSchema ? [breadcrumbSchema] : []),
    ...(jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : []),
  ];

  return (
    <Helmet>
      {/* Core */}
      <title>{fullTitle}</title>
      <meta name="description" content={fullDesc} />
      <meta name="keywords" content={fullKeywords} />
      <link rel="canonical" href={fullCanonical} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      {!noindex && <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />}

      {/* EEAT signals */}
      <meta name="author" content={`${SITE.name} | ${SITE.company}`} />
      <meta name="publisher" content={SITE.name} />
      <meta name="copyright" content={`© ${new Date().getFullYear()} ${SITE.company}`} />
      <meta name="rating" content="general" />
      <meta name="revisit-after" content="7 days" />
      <meta name="language" content="en-IN" />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDesc} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_IN" />
      <meta property="og:locale:alternate" content="hi_IN" />
      {article?.publishedTime && <meta property="article:published_time" content={article.publishedTime} />}
      {article?.modifiedTime && <meta property="article:modified_time" content={article.modifiedTime} />}
      {article?.author && <meta property="article:author" content={article.author} />}
      {article?.section && <meta property="article:section" content={article.section} />}

      {/* Twitter/X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@Ailaptopwala" />
      <meta name="twitter:creator" content="@Ailaptopwala" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDesc} />
      <meta name="twitter:image" content={fullImage} />

      {/* GEO / AEO — for AI search engines (ChatGPT, Perplexity, Gemini) */}
      <meta name="geo.region" content="IN-MP" />
      <meta name="geo.placename" content="Indore, Madhya Pradesh, India" />
      <meta name="geo.position" content="22.7166372;75.8737741" />
      <meta name="ICBM" content="22.7166372, 75.8737741" />
      <meta name="DC.title" content={fullTitle} />
      <meta name="DC.description" content={fullDesc} />
      <meta name="DC.subject" content="Laptop Store, Computer Repair, Refurbished Laptops, Desktop, Accessories" />
      <meta name="DC.coverage" content="Indore, Madhya Pradesh, India" />
      <meta name="DC.creator" content="Bhagwan Das Asati — Asati Infotech" />
      <meta name="DC.publisher" content="AI Laptop Wala" />
      <meta name="DC.rights" content={`© ${new Date().getFullYear()} Asati Infotech`} />

      {/* Schema.org JSON-LD */}
      {allSchemas.map((schema, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(schema)}</script>
      ))}
    </Helmet>
  );
};

export default SEOHead;
export { SITE };
