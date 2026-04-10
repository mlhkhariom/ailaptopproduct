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
          <h1 className="text-2xl font-serif">पोस्ट नहीं मिली</h1>
          <Link to="/blog"><Button className="mt-4">वापस जाएं</Button></Link>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <article className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> वापस ब्लॉग पर
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
            आयुर्वेद, "जीवन का विज्ञान," 5,000 से अधिक वर्षों से मानवता को स्वास्थ्य की ओर मार्गदर्शन कर रहा है। 
            आज की भागदौड़ भरी ज़िंदगी में, आयुर्वेद की प्राचीन विद्या आधुनिक स्वास्थ्य चुनौतियों के लिए व्यावहारिक समाधान प्रदान करती है।
          </p>
          <h2 className="text-2xl font-serif font-bold mt-8 mb-4">संतुलन की नींव</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            आयुर्वेदिक दर्शन के केंद्र में संतुलन की अवधारणा है — मन, शरीर और आत्मा के बीच। 
            जब ये तत्व सामंजस्य में होते हैं, तो हम जीवंत स्वास्थ्य अनुभव करते हैं।
          </p>
          <h2 className="text-2xl font-serif font-bold mt-8 mb-4">दैनिक जीवन के लिए टिप्स</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            सुबह गर्म पानी और नींबू से शुरुआत करें। तिल या नारियल तेल से ऑयल पुलिंग करें। 
            दोपहर में सबसे बड़ा भोजन करें जब पाचन अग्नि सबसे मजबूत होती है। शाम को अश्वगंधा या ब्राह्मी जैसी शांतिदायक जड़ी-बूटियों से विश्राम करें।
          </p>
        </div>

        {related.length > 0 && (
          <div className="mt-12 pt-8 border-t">
            <h3 className="text-xl font-serif font-bold mb-4">संबंधित लेख (Related)</h3>
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
