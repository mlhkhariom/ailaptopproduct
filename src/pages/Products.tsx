import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { LayoutGrid, List, Search, SlidersHorizontal } from "lucide-react";
import CustomerLayout from "@/components/CustomerLayout";
import ProductCard from "@/components/ProductCard";
import { products, categories } from "@/data/mockData";

const Products = () => {
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("popular");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = products
    .filter((p) => category === "All" || p.category === category)
    .filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1])
    .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.nameHi && p.nameHi.includes(search)))
    .sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return b.rating - a.rating;
      if (sort === "newest") return 0;
      return b.reviews - a.reviews;
    });

  const newArrivals = ["7", "8"];
  const bestSellers = ["1", "3", "5"];

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-1">Our Products</h1>
            <p className="text-muted-foreground">Explore our complete range of authentic Ayurvedic products</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-8 w-52 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 md:hidden" onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            <div className="hidden md:flex items-center gap-1 border rounded-lg p-0.5">
              <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setViewMode("grid")}><LayoutGrid className="h-3.5 w-3.5" /></Button>
              <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" className="h-7 w-7" onClick={() => setViewMode("list")}><List className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <Button
                key={c}
                variant={category === c ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(c)}
                className="text-xs"
              >
                {c}
              </Button>
            ))}
          </div>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-48 h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Filter */}
        {(showFilters || true) && (
          <div className="mb-6 flex items-center gap-4">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Price: ₹{priceRange[0]} – ₹{priceRange[1]}</span>
            <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={2000} step={50} className="flex-1 max-w-xs" />
          </div>
        )}

        <p className="text-sm text-muted-foreground mb-4">Showing {filtered.length} products</p>

        <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" : "space-y-4"}>
          {filtered.map((p) => (
            <div key={p.id} className="relative">
              {newArrivals.includes(p.id) && <Badge className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground text-[9px]">NEW</Badge>}
              {bestSellers.includes(p.id) && <Badge className="absolute top-2 right-2 z-10 bg-accent text-accent-foreground text-[9px]">BESTSELLER</Badge>}
              <ProductCard product={p} />
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">No products found. Try adjusting your filters.</div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default Products;
