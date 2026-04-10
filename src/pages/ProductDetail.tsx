import { useParams, Link } from "react-router-dom";
import { ShoppingCart, MessageCircle, Star, ArrowLeft, Minus, Plus, Play, Instagram, Youtube, Facebook } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerLayout from "@/components/CustomerLayout";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/mockData";

const platformIcon = {
  instagram: Instagram,
  youtube: Youtube,
  facebook: Facebook,
};

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const [qty, setQty] = useState(1);
  const [activeReel, setActiveReel] = useState(0);

  if (!product) {
    return (
      <CustomerLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-serif font-bold">प्रोडक्ट नहीं मिला</h1>
          <Link to="/products"><Button className="mt-4">वापस जाएं</Button></Link>
        </div>
      </CustomerLayout>
    );
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
  const PlatformIcon = product.reels[activeReel] ? platformIcon[product.reels[activeReel].platform] : Instagram;

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-8">
        <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> वापस जाएं (Back)
        </Link>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Image + Reel Thumbnails */}
          <div>
            <div className="relative rounded-2xl overflow-hidden bg-muted aspect-square mb-4">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              {discount > 0 && <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground text-sm">{discount}% छूट</Badge>}
            </div>
            {/* Mini reel thumbnails below product image */}
            <div className="grid grid-cols-3 gap-2">
              {product.reels.map((reel, i) => {
                const Icon = platformIcon[reel.platform];
                return (
                  <div
                    key={reel.id}
                    className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${activeReel === i ? "border-primary" : "border-transparent hover:border-primary/30"}`}
                    onClick={() => setActiveReel(i)}
                  >
                    <img src={reel.thumbnail} alt={reel.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center">
                      <Play className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
                    </div>
                    <div className="absolute bottom-1 left-1">
                      <Icon className="h-3.5 w-3.5 text-primary-foreground" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">{product.category}</p>
            <h1 className="text-3xl font-serif font-bold mb-1">{product.name}</h1>
            {product.nameHi && <p className="text-lg text-muted-foreground font-serif mb-3">{product.nameHi}</p>}

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-gold text-gold" : "text-border"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{product.rating} ({product.reviews} समीक्षाएं)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-foreground">₹{product.price}</span>
              {product.originalPrice && <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice}</span>}
              {discount > 0 && <Badge variant="secondary" className="text-xs">{discount}% बचत</Badge>}
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center border rounded-lg">
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></Button>
                <span className="w-10 text-center font-medium">{qty}</span>
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQty(qty + 1)}><Plus className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <Button size="lg" className="flex-1 gap-2" disabled={!product.inStock}>
                <ShoppingCart className="h-4 w-4" /> कार्ट में डालें
              </Button>
              <Button size="lg" variant="secondary" className="flex-1">अभी खरीदें</Button>
            </div>

            <a href={`https://wa.me/919876543210?text=नमस्ते! मुझे ${product.name} (${product.nameHi || ''}) के बारे में जानकारी चाहिए।`} target="_blank" rel="noreferrer">
              <Button variant="outline" className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5">
                <MessageCircle className="h-4 w-4" /> 💬 WhatsApp पर डॉक्टर से पूछें
              </Button>
            </a>
          </div>
        </div>

        {/* Video Reels Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-serif font-bold mb-4">📹 प्रोडक्ट Reels & Videos</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {product.reels.map((reel) => {
              const Icon = platformIcon[reel.platform];
              return (
                <Card key={reel.id} className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all">
                  <div className="relative aspect-[9/16] bg-muted">
                    <img src={reel.thumbnail} alt={reel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent flex flex-col justify-end p-4">
                      <div className="flex items-center justify-center mb-auto mt-auto">
                        <div className="h-14 w-14 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="h-7 w-7 text-primary-foreground fill-primary-foreground ml-1" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="h-4 w-4 text-primary-foreground" />
                        <span className="text-primary-foreground text-xs capitalize">{reel.platform}</span>
                      </div>
                      <p className="text-primary-foreground text-sm font-medium line-clamp-2">{reel.title}</p>
                      <p className="text-primary-foreground/70 text-xs mt-1">👁 {reel.views} views</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Tabs */}
        <Tabs defaultValue="ingredients" className="mb-16">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="ingredients">सामग्री (Ingredients)</TabsTrigger>
            <TabsTrigger value="benefits">फायदे (Benefits)</TabsTrigger>
            <TabsTrigger value="usage">उपयोग विधि (Usage)</TabsTrigger>
          </TabsList>
          <TabsContent value="ingredients" className="mt-4">
            <ul className="space-y-2">
              {product.ingredients.map((ing, i) => (
                <li key={i} className="flex items-center gap-2 text-sm"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{ing}</li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="benefits" className="mt-4">
            <ul className="space-y-2">
              {product.benefits.map((b, i) => (
                <li key={i} className="flex items-center gap-2 text-sm"><span className="h-1.5 w-1.5 rounded-full bg-accent" />{b}</li>
              ))}
            </ul>
          </TabsContent>
          <TabsContent value="usage" className="mt-4">
            <p className="text-sm text-muted-foreground leading-relaxed">{product.usage}</p>
          </TabsContent>
        </Tabs>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 className="text-2xl font-serif font-bold mb-6">संबंधित प्रोडक्ट्स (Related)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default ProductDetail;
