import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomerLayout from "@/components/CustomerLayout";
import SEOHead from "@/components/SEOHead";
import { api } from "@/lib/api";

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    api.getPost(id).then(p => { setPost(p); api.getPosts({ status: 'published' }).then(all => setRelated(all.filter((r: any) => r.id !== p.id).slice(0, 2))).catch(() => {}); }).catch(() => {});
  }, [id]);

  if (!post) return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-serif">Post not found</h1>
        <Link to="/blog"><Button className="mt-4">Go Back</Button></Link>
      </div>
    </CustomerLayout>
  );

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "image": post.image,
    "author": { "@type": "Person", "name": post.author || "AI Laptop Wala Team" },
    "publisher": { "@type": "Organization", "name": "AI Laptop Wala", "logo": { "@type": "ImageObject", "url": "https://ailaptopwala.com/favicon.png" } },
    "datePublished": post.published_at || post.created_at,
    "dateModified": post.updated_at || post.published_at || post.created_at,
    "mainEntityOfPage": { "@type": "WebPage", "@id": `https://ailaptopwala.com/blog/${post.slug}` },
    "articleSection": post.category,
    "inLanguage": "en-IN",
  };

  return (
    <CustomerLayout>
      <SEOHead
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt}
        canonical={`/blog/${post.slug}`}
        image={post.image}
        type="article"
        article={{ publishedTime: post.published_at, modifiedTime: post.updated_at, author: post.author, section: post.category }}
        breadcrumbs={[{ name: "Blog", url: "/blog" }, { name: post.title }]}
        jsonLd={articleSchema}
      />
      <article className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>

        <Badge variant="secondary" className="mb-4">{post.category}</Badge>
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4 leading-tight">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
          <span className="flex items-center gap-1"><User className="h-4 w-4" />{post.author}</span>
          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{post.published_at ? new Date(post.published_at).toLocaleDateString("en-IN") : ""}</span>
          <span className="flex items-center gap-1">5 min read</span>
        </div>

        <img src={post.image} alt={post.title} className="w-full rounded-2xl mb-8 aspect-video object-cover" />

        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">{post.excerpt}</p>
          <div className="text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content || '' }} />
        </div>

        {related.length > 0 && (
          <div className="mt-12 pt-8 border-t">
            <h3 className="text-xl font-serif font-bold mb-4">Related Articles</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link to={`/blog/${r.id}`} key={r.id}>
                  <Card className="overflow-hidden group hover:shadow-md transition-all">
                    <CardContent className="p-4 flex gap-4">
                      <img src={r.image} alt={r.title} className="h-20 w-20 rounded-lg object-cover" />
                      <div>
                        <h4 className="font-semibold text-sm group-hover:text-primary transition-colors line-clamp-2">{r.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{r.readTime}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-8 p-6 bg-primary/5 rounded-xl border text-center">
            <h3 className="font-bold mb-2">Looking for a Laptop in Indore?</h3>
            <p className="text-sm text-muted-foreground mb-4">AI Laptop Wala — Certified refurbished laptops, MacBooks, gaming laptops at best prices.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/products"><Button size="sm">Browse Laptops</Button></Link>
              <Link to="/services"><Button size="sm" variant="outline">Book Repair</Button></Link>
              <Link to="/contact"><Button size="sm" variant="outline">Contact Us</Button></Link>
            </div>
          </div>
        )}
      </article>
    </CustomerLayout>
  );
};

export default BlogPost;
