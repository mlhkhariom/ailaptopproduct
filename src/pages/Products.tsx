import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { LayoutGrid, List, Search, X, SlidersHorizontal, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import CustomerLayout from "@/components/layout/CustomerLayout";
import SEOHead from "@/components/common/SEOHead";
import ProductCardSkeleton from "@/components/ecommerce/ProductCardSkeleton";
import ProductCard from "@/components/ecommerce/ProductCard";
import QuickView from "@/components/ecommerce/QuickView";
import { useProductStore } from "@/store/productStore";
import { api } from "@/lib/api";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Popularity" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const RAM_OPTIONS = ["4GB", "8GB", "16GB", "32GB"];
const PROCESSOR_OPTIONS = ["Intel i3", "Intel i5", "Intel i7", "AMD Ryzen 5", "AMD Ryzen 7", "Apple M1", "Apple M2"];

const Products = () => {
  const { products, pagination, availableBrands, isLoading, fetchProducts } = useProductStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<any>(null);

  // Filter state from URL
  const category = searchParams.get("category") || "All";
  const search = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "newest";
  const brand = searchParams.get("brand") || "";
  const ram = searchParams.get("ram") || "";
  const processor = searchParams.get("processor") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const inStock = searchParams.get("inStock") === "true";
  const page = Number(searchParams.get("page")) || 1;

  // Local filter state for sliders
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(minPrice) || 0,
    Number(maxPrice) || 200000,
  ]);
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    api.getCategories().then((cats: any[]) => setCategories(cats.map((c: any) => c.name))).catch(() => {});
  }, []);

  // Fetch products when URL params change
  useEffect(() => {
    const params: Record<string, string> = { page: String(page), limit: "20" };
    if (category && category !== "All") params.category = category;
    if (search) params.search = search;
    if (sort) params.sort = sort;
    if (brand) params.brand = brand;
    if (ram) params.ram = ram;
    if (processor) params.processor = processor;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (inStock) params.inStock = "true";
    fetchProducts(params);
  }, [category, search, sort, brand, ram, processor, minPrice, maxPrice, inStock, page]);

  const updateFilter = useCallback((key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === "All") newParams.delete(key);
    else newParams.set(key, value);
    newParams.delete("page"); // Reset to page 1 on filter change
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    updateFilter("q", searchInput);
  };

  const applyPriceRange = () => {
    const newParams = new URLSearchParams(searchParams);
    if (priceRange[0] > 0) newParams.set("minPrice", String(priceRange[0]));
    else newParams.delete("minPrice");
    if (priceRange[1] < 200000) newParams.set("maxPrice", String(priceRange[1]));
    else newParams.delete("maxPrice");
    newParams.delete("page");
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setSearchInput("");
    setPriceRange([0, 200000]);
  };

  const goToPage = (p: number) => {
    const newParams = new URLSearchParams(searchParams);
    if (p <= 1) newParams.delete("page");
    else newParams.set("page", String(p));
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeFilterCount = [category !== "All" && category, brand, ram, processor, minPrice, maxPrice, inStock].filter(Boolean).length;

  // Filter sidebar content (shared between desktop and mobile)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Category</h3>
        <div className="space-y-2">
          {["All", ...categories].map(cat => (
            <button key={cat} onClick={() => updateFilter("category", cat)}
              className={`block w-full text-left text-sm px-3 py-1.5 rounded-md transition-colors ${category === cat ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Price Range</h3>
        <Slider min={0} max={200000} step={1000} value={priceRange}
          onValueChange={(v) => setPriceRange(v as [number, number])} className="mb-3" />
        <div className="flex items-center gap-2 text-xs">
          <span>₹{priceRange[0].toLocaleString("en-IN")}</span>
          <span className="text-muted-foreground">—</span>
          <span>₹{priceRange[1].toLocaleString("en-IN")}</span>
        </div>
        <Button size="sm" variant="outline" className="mt-2 w-full text-xs" onClick={applyPriceRange}>Apply Price</Button>
      </div>

      {/* Brand */}
      {availableBrands.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-3">Brand</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableBrands.map(b => (
              <label key={b} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={brand === b} onCheckedChange={(checked) => updateFilter("brand", checked ? b : "")} />
                {b}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* RAM */}
      <div>
        <h3 className="font-semibold text-sm mb-3">RAM</h3>
        <div className="flex flex-wrap gap-2">
          {RAM_OPTIONS.map(r => (
            <Badge key={r} variant={ram === r ? "default" : "outline"}
              className="cursor-pointer text-xs" onClick={() => updateFilter("ram", ram === r ? "" : r)}>
              {r}
            </Badge>
          ))}
        </div>
      </div>

      {/* Processor */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Processor</h3>
        <div className="flex flex-wrap gap-2">
          {PROCESSOR_OPTIONS.map(p => (
            <Badge key={p} variant={processor === p ? "default" : "outline"}
              className="cursor-pointer text-xs" onClick={() => updateFilter("processor", processor === p ? "" : p)}>
              {p}
            </Badge>
          ))}
        </div>
      </div>

      {/* In Stock Only */}
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <Checkbox checked={inStock} onCheckedChange={(checked) => updateFilter("inStock", checked ? "true" : "")} />
        In Stock Only
      </label>

      {/* Clear All */}
      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" className="w-full text-destructive" onClick={clearAllFilters}>
          <X className="h-3 w-3 mr-1" /> Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <CustomerLayout>
      <SEOHead
        title={search ? `"${search}" Laptops in Indore` : "Buy Laptops in Indore — Refurbished, MacBook, Gaming"}
        description="Buy certified refurbished laptops in Indore. MacBooks, gaming laptops, business laptops at best prices. AI Laptop Wala — Silver Mall, Indore."
        canonical="/products"
        breadcrumbs={[{ name: "Products", url: "/products" }]}
      />

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-black mb-1">
            {category !== "All" ? category : "All"} <span className="gradient-text">Laptops</span> in Indore
          </h1>
          <p className="text-muted-foreground text-sm">
            {pagination ? `${pagination.total} products found` : "Certified refurbished laptops — Dell, HP, Lenovo, MacBook, Gaming"}
          </p>
        </div>

        {/* Search + Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search laptops, brands..." className="pl-9"
                value={searchInput} onChange={e => setSearchInput(e.target.value)} />
              {searchInput && (
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2" onClick={() => { setSearchInput(""); updateFilter("q", ""); }}>
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <Button type="submit" size="icon" variant="outline"><Search className="h-4 w-4" /></Button>
          </form>

          <div className="flex gap-2">
            {/* Mobile Filter Button */}
            <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters {activeFilterCount > 0 && <Badge className="h-5 w-5 p-0 justify-center">{activeFilterCount}</Badge>}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                <div className="mt-4"><FilterContent /></div>
              </SheetContent>
            </Sheet>

            <Select value={sort} onValueChange={v => updateFilter("sort", v)}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>

            <div className="hidden sm:flex border rounded-md">
              <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="rounded-r-none" onClick={() => setViewMode("grid")}>
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="rounded-l-none" onClick={() => setViewMode("list")}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {category !== "All" && <Badge variant="secondary" className="gap-1">{category} <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("category", "")} /></Badge>}
            {brand && <Badge variant="secondary" className="gap-1">{brand} <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("brand", "")} /></Badge>}
            {ram && <Badge variant="secondary" className="gap-1">{ram} <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("ram", "")} /></Badge>}
            {processor && <Badge variant="secondary" className="gap-1">{processor} <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("processor", "")} /></Badge>}
            {(minPrice || maxPrice) && <Badge variant="secondary" className="gap-1">₹{minPrice || "0"} - ₹{maxPrice || "2L"} <X className="h-3 w-3 cursor-pointer" onClick={() => { updateFilter("minPrice", ""); updateFilter("maxPrice", ""); }} /></Badge>}
            {inStock && <Badge variant="secondary" className="gap-1">In Stock <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter("inStock", "")} /></Badge>}
            <button className="text-xs text-destructive hover:underline" onClick={clearAllFilters}>Clear all</button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-20 border rounded-xl p-4 bg-card">
              <h2 className="font-bold text-sm mb-4 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" /> Filters
                {activeFilterCount > 0 && <Badge className="h-5 px-1.5">{activeFilterCount}</Badge>}
              </h2>
              <FilterContent />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {isLoading ? (
              <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}>
                {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-lg font-semibold mb-2">No products found</p>
                <p className="text-muted-foreground text-sm mb-4">Try adjusting your filters or search term</p>
                <Button variant="outline" onClick={clearAllFilters}>Clear Filters</Button>
              </div>
            ) : (
              <>
                <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1"}`}>
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} viewMode={viewMode} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                      let pageNum: number;
                      if (pagination.totalPages <= 7) pageNum = i + 1;
                      else if (page <= 4) pageNum = i + 1;
                      else if (page >= pagination.totalPages - 3) pageNum = pagination.totalPages - 6 + i;
                      else pageNum = page - 3 + i;
                      return (
                        <Button key={pageNum} variant={pageNum === page ? "default" : "outline"} size="sm"
                          className="w-9 h-9" onClick={() => goToPage(pageNum)}>
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button variant="outline" size="sm" disabled={page >= (pagination?.totalPages || 1)} onClick={() => goToPage(page + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <span className="text-xs text-muted-foreground ml-2">
                      Page {page} of {pagination.totalPages}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <QuickView product={quickViewProduct} open={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </CustomerLayout>
  );
};

export default Products;
