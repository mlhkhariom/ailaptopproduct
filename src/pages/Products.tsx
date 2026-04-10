import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import CustomerLayout from "@/components/CustomerLayout";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/data/mockData";

const Products = () => {
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("popular");

  const filtered = products
    .filter((p) => category === "All" || p.category === category)
    .sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      return b.reviews - a.reviews;
    });

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold mb-1">हमारे प्रोडक्ट्स</h1>
        <p className="text-muted-foreground mb-6">Our Products – शुद्ध आयुर्वेदिक उत्पादों की पूरी रेंज</p>

        <div className="flex flex-wrap gap-3 items-center justify-between mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Button
                key={c}
                variant={category === c ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(c)}
                className="text-xs"
              >
                {c === "All" ? "सभी (All)" : c}
              </Button>
            ))}
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-48 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">लोकप्रिय (Popular)</SelectItem>
              <SelectItem value="rating">सबसे अच्छी रेटिंग</SelectItem>
              <SelectItem value="price-low">कम दाम पहले</SelectItem>
              <SelectItem value="price-high">ज़्यादा दाम पहले</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">इस श्रेणी में कोई प्रोडक्ट नहीं मिला।</div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default Products;
