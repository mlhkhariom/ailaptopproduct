import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import CustomerLayout from "@/components/CustomerLayout";
import { api } from "@/lib/api";

const Blog = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => { api.getPosts({ status: 'published' }).then(setPosts).catch(() => {}); }, []);

  const filtered = posts.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold mb-1">Laptop Wisdom</h1>
        <p className="text-muted-foreground mb-6">Health tips, guides and knowledge from ancient Ayurveda</p>
        <div className="relative mb-8 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search articles..." className="pl-8" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(post => (
            <Link to={`/blog/${post.slug || post.id}`} key={post.id}>
              <Card className="overflow-hidden group hover:shadow-lg transition-all h-full">
                <div className="aspect-video overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <CardContent className="p-5">
                  <Badge variant="secondary" className="text-xs mb-2">{post.category}</Badge>
                  <h2 className="font-serif font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">{post.title}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.author}</span>
                    <span>{post.published_at ? new Date(post.published_at).toLocaleDateString('en-IN') : ''}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {filtered.length === 0 && <div className="col-span-3 text-center py-16 text-muted-foreground">No posts found</div>}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default Blog;
