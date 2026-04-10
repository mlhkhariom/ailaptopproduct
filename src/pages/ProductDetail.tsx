import { useParams, Link } from "react-router-dom";
import { ShoppingCart, MessageCircle, Star, ArrowLeft, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerLayout from "@/components/CustomerLayout";
import ProductCard from "@/components/ProductCard";
import { products } from "@/data/mockData";

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const [qty, setQty] = useState(1);

  if (!product) {
    return (
      <CustomerLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-serif font-bold">Product not found</h1>
          <Link to="/products"><Button className="mt-4">Back to Products</Button></Link>
        </div>
      </CustomerLayout>
    );
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-8">
        <Link to="/products" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden bg-muted aspect-square">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            {discount > 0 && <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground text-sm">{discount}% OFF</Badge>}
          </div>

          {/* Info */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">{product.category}</p>
            <h1 className="text-3xl font-serif font-bold mb-3">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-gold text-gold" : "text-border"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{product.rating} ({product.reviews} reviews)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-foreground">₹{product.price}</span>
              {product.originalPrice && <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice}</span>}
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
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </Button>
              <Button size="lg" variant="secondary" className="flex-1">Buy Now</Button>
            </div>

            <a href={`https://wa.me/919876543210?text=Hi! I'm interested in ${product.name}`} target="_blank" rel="noreferrer">
              <Button variant="outline" className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5">
                <MessageCircle className="h-4 w-4" /> Consult a Vaidya on WhatsApp
              </Button>
            </a>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="ingredients" className="mb-16">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="benefits">Benefits</TabsTrigger>
            <TabsTrigger value="usage">How to Use</TabsTrigger>
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
            <h2 className="text-2xl font-serif font-bold mb-6">Related Products</h2>
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
