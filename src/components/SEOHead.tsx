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
  address: "LG-21, B-Block, Silver Mall, RNT Marg, Indore, MP 452001",
  founder: "Bhagwan Das Asati",
  company: "Asati Infotech",
  since: "2011",
  rating: "4.8",
  reviews: "5000",
  social: {
    instagram: "https://instagram.com/Ailaptopwala",
    facebook: "https://facebook.com/Ailaptopwala",
    youtube: "https://youtube.com/@Ailaptopwala",
    whatsapp: "https://wa.me/919893496163",
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
    "description": "Indore's most trusted laptop store since 2011. Buy certified refurbished laptops, MacBooks, gaming laptops. Expert repair & upgrade services at Silver Mall, RNT Marg.",
    "url": SITE.url,
    "logo": { "@type": "ImageObject", "url": SITE.logo, "width": 200, "height": 200 },
    "image": SITE.logo,
    "telephone": SITE.phone,
    "email": SITE.email,
    "foundingDate": SITE.since,
    "founder": { "@type": "Person", "name": SITE.founder },
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "LG-21, B-Block, Silver Mall, RNT Marg",
      "addressLocality": "Indore",
      "addressRegion": "Madhya Pradesh",
      "postalCode": "452001",
      "addressCountry": "IN"
    },
    "geo": { "@type": "GeoCoordinates", "latitude": "22.7196", "longitude": "75.8577" },
    "hasMap": "https://maps.google.com/?q=Silver+Mall+Indore",
    "openingHoursSpecification": [
      { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], "opens": "10:00", "closes": "20:00" }
    ],
    "priceRange": "₹₹",
    "currenciesAccepted": "INR",
    "paymentAccepted": "Cash, Credit Card, Debit Card, UPI, Net Banking",
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": SITE.rating, "reviewCount": SITE.reviews, "bestRating": "5", "worstRating": "1" },
    "sameAs": Object.values(SITE.social),
    "contactPoint": [
      { "@type": "ContactPoint", "telephone": SITE.phone, "contactType": "sales", "areaServed": "IN", "availableLanguage": ["Hindi", "English"] },
      { "@type": "ContactPoint", "telephone": SITE.phone, "contactType": "customer service", "areaServed": "IN", "availableLanguage": ["Hindi", "English"] }
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Laptops & Repair Services",
      "itemListElement": [
        { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Certified Refurbished Laptops" } },
        { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Laptop Repair Services" } },
        { "@type": "Offer", "itemOffered": { "@type": "Product", "name": "Open-Box MacBooks" } },
      ]
    },
    "knowsAbout": ["Laptop Repair", "Refurbished Laptops", "MacBook", "Gaming Laptops", "SSD Upgrade", "RAM Upgrade", "Screen Replacement", "Battery Replacement"],
    "areaServed": { "@type": "City", "name": "Indore", "sameAs": "https://en.wikipedia.org/wiki/Indore" },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    "name": SITE.name,
    "url": SITE.url,
    "description": "Buy certified refurbished laptops, MacBooks, gaming laptops in Indore. Expert repair services.",
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
  const fullImage = image || SITE.logo;
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
      <meta name="geo.position" content="22.7196;75.8577" />
      <meta name="ICBM" content="22.7196, 75.8577" />
      <meta name="DC.title" content={fullTitle} />
      <meta name="DC.description" content={fullDesc} />
      <meta name="DC.subject" content="Laptop Store, Computer Repair, Refurbished Laptops" />
      <meta name="DC.coverage" content="Indore, Madhya Pradesh, India" />

      {/* Schema.org JSON-LD */}
      {allSchemas.map((schema, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(schema)}</script>
      ))}
    </Helmet>
  );
};

export default SEOHead;
export { SITE };
