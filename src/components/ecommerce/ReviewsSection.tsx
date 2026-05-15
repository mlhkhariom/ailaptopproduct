import { useState, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface Props { productId: string; rating: number; reviewCount: number; }

const StarPicker = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map(s => (
      <button key={s} type="button" onClick={() => onChange(s)}>
        <Star className={`h-6 w-6 transition-colors ${s <= value ? 'fill-yellow-400 text-yellow-400' : 'text-border hover:text-yellow-300'}`} />
      </button>
    ))}
  </div>
);

const ReviewsSection = ({ productId, rating, reviewCount }: Props) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [avg, setAvg] = useState(rating);
  const [count, setCount] = useState(reviewCount);
  const [newRating, setNewRating] = useState(5);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.getProductReviews(productId).then(d => {
      setReviews(d.reviews || []);
      if (d.avg) setAvg(parseFloat(d.avg));
      if (d.count) setCount(d.count);
    }).catch(() => {});
  }, [productId]);

  const submit = async () => {
    if (!review.trim()) return toast.error('Please write a review');
    setLoading(true);
    try {
      await api.submitReview(productId, { rating: newRating, review });
      toast.success('Review submitted! It will appear after approval.');
      setSubmitted(true);
      setReview('');
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  // Rating breakdown from actual reviews
  const breakdown = [5,4,3,2,1].map(s => ({
    stars: s,
    percent: reviews.length ? Math.round((reviews.filter(r => r.rating === s).length / reviews.length) * 100) : 0
  }));

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="text-5xl font-bold">{avg}</p>
          <div className="flex gap-0.5 mt-1 justify-center">
            {[1,2,3,4,5].map(i => <Star key={i} className={`h-4 w-4 ${i <= Math.round(avg) ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`} />)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{count} reviews</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {breakdown.map(r => (
            <div key={r.stars} className="flex items-center gap-2 text-xs">
              <span className="w-3">{r.stars}</span>
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <Progress value={r.percent} className="h-1.5 flex-1" />
              <span className="text-muted-foreground w-8">{r.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Submit form */}
      {user ? (
        submitted ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
            ✅ Thank you! Your review is under review and will be published soon.
          </div>
        ) : (
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="font-medium text-sm">Write a Review</p>
              <StarPicker value={newRating} onChange={setNewRating} />
              <Textarea value={review} onChange={e => setReview(e.target.value)} placeholder="Share your experience with this product..." rows={3} className="text-sm resize-none" />
              <Button onClick={submit} disabled={loading} size="sm" className="gap-2">
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Submit Review
              </Button>
            </CardContent>
          </Card>
        )
      ) : (
        <div className="bg-muted/50 rounded-lg p-4 text-sm text-center">
          <Link to="/login" className="text-primary font-medium hover:underline">Login</Link> to write a review
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-3">
        {reviews.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No reviews yet. Be the first!</p>}
        {reviews.map(r => (
          <Card key={r.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {r.customer_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{r.customer_name}</p>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} className={`h-3 w-3 ${i <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-border'}`} />)}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString('en-IN')}</span>
              </div>
              {r.review && <p className="text-sm text-muted-foreground">{r.review}</p>}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReviewsSection;
