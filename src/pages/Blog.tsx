import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CustomerLayout from "@/components/CustomerLayout";
import { blogPosts } from "@/data/mockData";

const Blog = () => (
  <CustomerLayout>
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-serif font-bold mb-1">आयुर्वेदिक ज्ञान</h1>
      <p className="text-muted-foreground mb-8">Ayurvedic Wisdom – सेहत के टिप्स, गाइड और जानकारी</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <Link to={`/blog/${post.id}`} key={post.id}>
            <Card className="overflow-hidden group hover:shadow-lg transition-all h-full">
              <div className="aspect-video overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                  <span className="text-xs text-muted-foreground">{post.readTime}</span>
                </div>
                <h2 className="font-serif font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">{post.title}</h2>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{post.author}</span>
                  <span>•</span>
                  <span>{post.date}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  </CustomerLayout>
);

export default Blog;
