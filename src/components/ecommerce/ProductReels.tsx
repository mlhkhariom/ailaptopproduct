import { useEffect, useState } from "react";
import { Play, Instagram, Youtube, Facebook, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";

const platformIcon: any = { instagram: Instagram, youtube: Youtube, facebook: Facebook };
const platformColor: any = { instagram: "text-pink-500", youtube: "text-red-500", facebook: "text-blue-500" };

export default function ProductReels({ productId }: { productId: string }) {
  const [reels, setReels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<any>(null);

  useEffect(() => {
    api.getReels({ product_id: productId })
      .then((list) => setReels(Array.isArray(list) ? list : []))
      .catch(() => setReels([]))
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return null;
  if (reels.length === 0) return null;

  const getEmbedUrl = (url: string, platform: string) => {
    if (!url) return null;
    if (platform === "youtube") {
      const m = url.match(/(?:v=|shorts\/|youtu\.be\/)([A-Za-z0-9_-]{11})/);
      return m ? `https://www.youtube.com/embed/${m[1]}?autoplay=1` : null;
    }
    if (platform === "instagram") {
      const m = url.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
      return m ? `https://www.instagram.com/p/${m[1]}/embed/` : null;
    }
    return null;
  };

  return (
    <div className="mt-5">
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
        <Play className="h-4 w-4 text-primary" /> Product Videos & Reviews
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {reels.slice(0, 6).map((r) => {
          const Icon = platformIcon[r.platform] || Instagram;
          return (
            <button
              key={r.id}
              onClick={() => setActive(r)}
              className="relative aspect-[9/16] rounded-lg overflow-hidden bg-muted group"
            >
              {r.thumbnail ? (
                <img src={r.thumbnail} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600">
                  <Play className="h-8 w-8 text-white" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <Icon className={`absolute top-1.5 right-1.5 h-3.5 w-3.5 ${platformColor[r.platform] || ""} drop-shadow`} />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                <Play className="h-8 w-8 text-white fill-white" />
              </div>
              <p className="absolute bottom-1 left-1 right-1 text-[10px] text-white line-clamp-1 drop-shadow font-medium">{r.title}</p>
            </button>
          );
        })}
      </div>

      {/* Modal player */}
      {active && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setActive(null)}>
          <div className="bg-card rounded-2xl max-w-sm w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="aspect-[9/16] bg-black relative">
              {getEmbedUrl(active.video_url, active.platform) ? (
                <iframe
                  src={getEmbedUrl(active.video_url, active.platform) || ''}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white p-4 text-center">
                  <Play className="h-12 w-12 mb-3 opacity-60" />
                  <p className="text-sm mb-3">{active.title}</p>
                  <a href={active.video_url} target="_blank" rel="noreferrer" className="text-xs bg-white/20 rounded-full px-3 py-1.5 hover:bg-white/30 flex items-center gap-1">
                    Open Original <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
            <div className="p-3">
              <p className="text-sm font-medium line-clamp-2">{active.title}</p>
              <button onClick={() => setActive(null)} className="mt-2 text-xs text-muted-foreground hover:text-foreground">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
