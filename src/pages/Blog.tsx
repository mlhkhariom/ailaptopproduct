import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Clock, User, ChevronRight } from "lucide-react";
import CustomerLayout from "@/components/CustomerLayout";
import SEOHead from "@/components/SEOHead";
import { api } from "@/lib/api";

const Blog = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => { api.getPosts({ status: 'published' }).then(setPosts).catch(() => {}); }, []);

  const categories = ["All", ...Array.from(new Set(posts.map(p => p.category).filter(Boolean))) as string[]];

  const filtered = posts.filter(p =>
    (category === "All" || p.category === category) &&
    (p.title.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase()))
  );

  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <CustomerLayout>
      <SEOHead
        title="Blog — Laptop Tips, Buying Guides & Tech News | AI Laptop Wala"
        description="Laptop buying guides, repair tips, tech news from AI Laptop Wala Indore. Expert advice on refurbished laptops, MacBooks, gaming laptops and more."
        canonical="/blog"
        breadcrumbs={[{ name: "Blog" }]}
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-foreground to-foreground/90 text-background py-14">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-black mb-3">Laptop <span className="text-primary">Tips & Guides</span></h1>
          <p className="text-background/60 text-sm mb-6">Expert advice on buying, repairing and maintaining laptops from AI Laptop Wala Indore</p>
          <div className="relative max-w-sm mx-auto">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search articles..." className="pl-9 bg-background/10 border-background/20 text-background placeholder:text-background/40"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Category filter */}
          <div className="flex gap-2 flex-wrap mb-8 justify-center">
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${category === c ? 'bg-primary text-white' : 'bg-muted hover:bg-primary/10'}`}>
                {c}
              </button>
            ))}
          </div>

          {/* Featured post */}
          {featured && (
            <Link to={`/blog/${featured.slug || featured.id}`} className="block mb-10 group">
              <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="grid md:grid-cols-2">
                  <div className="aspect-video md:aspect-auto overflow-hidden">
                    <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 min-h-[220px]" />
                  </div>
                  <CardContent className="p-6 md:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-primary text-white text-xs">Featured</Badge>
                      {featured.category && <Badge variant="outline" className="text-xs">{featured.category}</Badge>}
                    </div>
                    <h2 className="text-xl md:text-2xl font-black mb-3 group-hover:text-primary transition-colors line-clamp-2">{featured.title}</h2>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{featured.excerpt}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{featured.author || 'AI Laptop Wala'}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{featured.read_time || '5 min read'}</span>
                      {featured.published_at && <span>{new Date(featured.published_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-primary text-sm font-semibold">Read More <ChevronRight className="h-4 w-4" /></div>
                  </CardContent>
                </div>
              </Card>
            </Link>
          )}

          {/* Rest of posts */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map(post => (
              <Link to={`/blog/${post.slug || post.id}`} key={post.id}>
                <Card className="overflow-hidden group hover:shadow-lg transition-all h-full">
                  <div className="aspect-video overflow-hidden">
                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <CardContent className="p-5">
                    {post.category && <Badge variant="secondary" className="text-xs mb-2">{post.category}</Badge>}
                    <h2 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h2>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{post.author || 'AI Laptop Wala'}</span>
                      <span>{post.published_at ? new Date(post.published_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : ''}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg mb-2">No posts found</p>
              <button onClick={() => { setSearch(""); setCategory("All"); }} className="text-primary text-sm hover:underline">Clear filters</button>
            </div>
          )}
        </div>
      </section>
    </CustomerLayout>
  );
};

export default Blog;
