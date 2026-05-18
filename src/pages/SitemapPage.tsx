import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import CustomerLayout from "@/components/layout/CustomerLayout";
import SEOHead from "@/components/common/SEOHead";

export default function SitemapPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/products?limit=50').then(r => r.json()).then(d => setProducts(d.products || (Array.isArray(d) ? d : []))).catch(() => {});
    fetch('/api/categories?flat=1').then(r => r.json()).then(d => { if (Array.isArray(d)) setCategories(d); }).catch(() => {});
    fetch('/api/blog').then(r => r.json()).then(d => { if (Array.isArray(d)) setBlogs(d); }).catch(() => {});
  }, []);

  return (
    <CustomerLayout>
      <SEOHead title="Sitemap — AI Laptop Wala" description="Complete sitemap of AI Laptop Wala. Browse all pages, products, categories, and blog posts." canonical="/sitemap" />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-black mb-8">🗺️ Sitemap</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Pages */}
          <div>
            <h2 className="font-bold text-lg mb-3 border-b pb-2">Main Pages</h2>
            <ul className="space-y-1.5">
              {[
                { name: 'Home', url: '/' }, { name: 'Products', url: '/products' }, { name: 'Offers & Coupons', url: '/offers' },
                { name: 'EMI Calculator', url: '/emi-calculator' }, { name: 'Bulk Orders', url: '/bulk-order' },
                { name: 'Store Locator', url: '/store-locator' }, { name: 'Compare', url: '/compare' },
                { name: 'Blog', url: '/blog' }, { name: 'FAQ', url: '/faq' },
                { name: 'Services', url: '/services' }, { name: 'Contact', url: '/contact' }, { name: 'About', url: '/about' },
                { name: 'Track Order', url: '/track-order' }, { name: 'My Account', url: '/account' },
              ].map(p => <li key={p.url}><Link to={p.url} className="text-sm text-primary hover:underline">{p.name}</Link></li>)}
            </ul>

            <h2 className="font-bold text-lg mb-3 border-b pb-2 mt-6">Legal</h2>
            <ul className="space-y-1.5">
              {[{ name: 'Privacy Policy', url: '/privacy' }, { name: 'Terms & Conditions', url: '/terms' }, { name: 'Refund Policy', url: '/refund' }, { name: 'Shipping Policy', url: '/shipping' }]
                .map(p => <li key={p.url}><Link to={p.url} className="text-sm text-primary hover:underline">{p.name}</Link></li>)}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h2 className="font-bold text-lg mb-3 border-b pb-2">Categories</h2>
            <ul className="space-y-1.5">
              {categories.slice(0, 15).map(c => <li key={c.id}><Link to={`/products?category=${c.name}`} className="text-sm text-primary hover:underline">{c.name}</Link></li>)}
            </ul>

            <h2 className="font-bold text-lg mb-3 border-b pb-2 mt-6">Brands</h2>
            <ul className="space-y-1.5">
              {['Dell', 'HP', 'Lenovo', 'Apple', 'ASUS', 'Acer'].map(b => <li key={b}><Link to={`/brands/${b.toLowerCase()}`} className="text-sm text-primary hover:underline">{b} Laptops</Link></li>)}
            </ul>
          </div>

          {/* Products + Blog */}
          <div>
            <h2 className="font-bold text-lg mb-3 border-b pb-2">Products ({products.length})</h2>
            <ul className="space-y-1 max-h-60 overflow-y-auto">
              {products.slice(0, 30).map(p => <li key={p.id}><Link to={`/products/${p.slug || p.id}`} className="text-xs text-primary hover:underline line-clamp-1">{p.name}</Link></li>)}
            </ul>

            {blogs.length > 0 && (
              <>
                <h2 className="font-bold text-lg mb-3 border-b pb-2 mt-6">Blog Posts</h2>
                <ul className="space-y-1.5">
                  {blogs.slice(0, 10).map(b => <li key={b.id}><Link to={`/blog/${b.slug || b.id}`} className="text-sm text-primary hover:underline line-clamp-1">{b.title}</Link></li>)}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}
