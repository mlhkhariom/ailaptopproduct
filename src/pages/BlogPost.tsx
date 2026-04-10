import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomerLayout from "@/components/CustomerLayout";
import { blogPosts } from "@/data/mockData";

const BlogPost = () => {
  const { id } = useParams();
  const post = blogPosts.find((p) => p.id === id);
  const related = blogPosts.filter((p) => p.id !== id).slice(0, 2);

  if (!post) {
    return (
      <CustomerLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-serif">Post not found</h1>
          <Link to="/blog"><Button className="mt-4">Go Back</Button></Link>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <article className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Blog
        </Link>

        <Badge variant="secondary" className="mb-4">{post.category}</Badge>
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-4 leading-tight">{post.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
          <span className="flex items-center gap-1"><User className="h-4 w-4" />{post.author}</span>
          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{post.date}</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{post.readTime}</span>
        </div>

        <img src={post.image} alt={post.title} className="w-full rounded-2xl mb-8 aspect-video object-cover" />

        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-muted-foreground leading-relaxed mb-4">{post.excerpt}</p>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Ayurveda, the "Science of Life," has been guiding humanity towards health for over 5,000 years. 
            In today's fast-paced world, ancient Ayurvedic wisdom provides practical solutions for modern health challenges.
          </p>
          <h2 className="text-2xl font-serif font-bold mt-8 mb-4">The Foundation of Balance</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            At the heart of Ayurvedic philosophy lies the concept of balance — between mind, body and spirit. 
            When these elements are in harmony, we experience vibrant health and well-being.
          </p>
          <h2 className="text-2xl font-serif font-bold mt-8 mb-4">Daily Wellness Tips</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Start your morning with warm water and lemon. Practice oil pulling with sesame or coconut oil. 
            Have your largest meal at noon when digestive fire is strongest. Relax in the evening with calming herbs like Ashwagandha or Brahmi.
          </p>
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
        )}
      </article>
    </CustomerLayout>
  );
};

export default BlogPost;
