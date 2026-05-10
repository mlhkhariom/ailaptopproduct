import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CustomerLayout from "@/components/CustomerLayout";
import SEOHead from "@/components/SEOHead";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function CMSPage() {
  const { slug } = useParams();
  const [page, setPage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    api.getCMSPage(slug)
      .then(setPage)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <CustomerLayout>
        <div className="container mx-auto py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        </div>
      </CustomerLayout>
    );
  }

  if (notFound || !page) {
    return (
      <CustomerLayout>
        <div className="container mx-auto py-20 text-center max-w-lg">
          <h1 className="text-2xl font-bold mb-3">Page Not Found</h1>
          <p className="text-muted-foreground">The page "{slug}" doesn't exist or has been unpublished.</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <SEOHead
        title={page.meta_title || page.title}
        description={page.meta_description}
      />
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-6">{page.title}</h1>
        <div
          className="prose prose-sm md:prose-base max-w-none prose-headings:font-serif prose-a:text-primary"
          dangerouslySetInnerHTML={{ __html: page.content || '' }}
        />
      </div>
    </CustomerLayout>
  );
}
