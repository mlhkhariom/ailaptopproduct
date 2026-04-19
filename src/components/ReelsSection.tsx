import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Play, ExternalLink, Instagram, Youtube, Facebook } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

const platformIcon: any = { instagram: Instagram, youtube: Youtube, facebook: Facebook };
const platformGradient: any = {
  instagram: "from-pink-500 to-purple-600",
  youtube: "from-red-500 to-red-700",
  facebook: "from-blue-500 to-blue-700",
};

// Extract YouTube thumbnail
const getYtThumb = (url: string) => {
  const m = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/);
  return m ? `https://img.youtube.com/vi/${m[1]}/hqdefault.jpg` : null;
};

// Get embed URL for modal
const getEmbedUrl = (url: string, platform: string) => {
  if (platform === 'youtube') {
    const m = url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1` : null;
  }
  if (platform === 'instagram') {
    const m = url?.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/);
    return m ? `https://www.instagram.com/p/${m[1]}/embed/` : null;
  }
  return null;
};

const ReelsSection = () => {
  const [reels, setReels] = useState<any[]>([]);
  const [playing, setPlaying] = useState<any>(null);

  useEffect(() => {
    api.getReels().then(setReels).catch(() => {});
  }, []);

  if (reels.length === 0) return null;

  const handleClick = (reel: any) => {
    const embedUrl = getEmbedUrl(reel.video_url, reel.platform);
    if (embedUrl) setPlaying({ ...reel, embedUrl });
    else if (reel.video_url) window.open(reel.video_url, '_blank');
  };

  return (
    <>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black flex items-center gap-2">
                <Instagram className="h-6 w-6 text-pink-500" />
                Latest <span className="gradient-text">Reels</span>
              </h2>
              <div className="section-divider mt-2 mx-0" />
            </div>
            <a href="https://www.instagram.com/ailaptopwala" target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-sm font-semibold text-pink-500 hover:text-pink-600">
              @ailaptopwala <ExternalLink size={14} />
            </a>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {reels.slice(0, 6).map(reel => {
              const Icon = platformIcon[reel.platform] || Instagram;
              const gradient = platformGradient[reel.platform] || platformGradient.instagram;
              const thumb = reel.thumbnail || getYtThumb(reel.video_url);
              const hasEmbed = !!getEmbedUrl(reel.video_url, reel.platform);

              const card = (
                <div key={reel.id}
                  className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-muted cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02]"
                  onClick={() => handleClick(reel)}>
                  {/* Thumbnail */}
                  {thumb ? (
                    <img src={thumb} alt={reel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${gradient} opacity-20`} />
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                  {/* Platform badge */}
                  <div className={`absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r ${gradient} text-white text-[10px] font-bold`}>
                    <Icon className="h-3 w-3" />
                  </div>

                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 group-hover:bg-white/30 transition-all">
                      <Play className="h-6 w-6 text-white fill-white ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-white text-[10px] font-medium line-clamp-2">{reel.title}</p>
                    {reel.views && reel.views !== '0' && (
                      <p className="text-white/60 text-[9px] mt-0.5">👁 {reel.views}</p>
                    )}
                    {/* Linked product badge */}
                    {reel.product_name && (
                      <div className="mt-1 bg-primary/80 text-white text-[9px] px-1.5 py-0.5 rounded-full inline-block font-medium">
                        🛍 {reel.product_name}
                      </div>
                    )}
                  </div>
                </div>
              );

              // If linked to product, wrap in Link
              return reel.product_slug && !hasEmbed ? (
                <Link key={reel.id} to={`/products/${reel.product_slug}`}>{card}</Link>
              ) : card;
            })}
          </div>

          <div className="mt-6 text-center">
            <a href="https://www.instagram.com/ailaptopwala" target="_blank" rel="noreferrer">
              <Button variant="outline" size="lg" className="gap-2 border-pink-300 text-pink-600 hover:bg-pink-50">
                <Instagram className="h-5 w-5" /> Follow @ailaptopwala
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Video Modal */}
      {playing && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setPlaying(null)}>
          <div className="relative w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <button onClick={() => setPlaying(null)} className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm">✕ Close</button>
            <div className="aspect-[9/16] rounded-2xl overflow-hidden bg-black">
              <iframe src={playing.embedUrl} className="w-full h-full" allowFullScreen allow="autoplay; encrypted-media" title={playing.title} />
            </div>
            {/* Linked product CTA */}
            {playing.product_slug && (
              <Link to={`/products/${playing.product_slug}`} onClick={() => setPlaying(null)}
                className="mt-3 flex items-center justify-center gap-2 w-full bg-primary text-white py-3 rounded-xl font-bold text-sm">
                🛍 View Product: {playing.product_name}
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ReelsSection;
