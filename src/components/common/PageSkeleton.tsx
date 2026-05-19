export function ProductSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      <div className="h-4 w-48 bg-muted rounded mb-6" />
      <div className="grid md:grid-cols-2 gap-8">
        <div className="aspect-square bg-muted rounded-xl" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 bg-muted rounded" />
          <div className="h-5 w-1/3 bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
          <div className="h-12 w-40 bg-muted rounded-lg mt-6" />
        </div>
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border p-3 space-y-3">
          <div className="aspect-square bg-muted rounded-lg" />
          <div className="h-4 w-3/4 bg-muted rounded" />
          <div className="h-3 w-1/2 bg-muted rounded" />
          <div className="h-5 w-1/3 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse space-y-6">
      <div className="h-8 w-64 bg-muted rounded" />
      <div className="h-4 w-full bg-muted rounded" />
      <div className="h-4 w-5/6 bg-muted rounded" />
      <div className="h-64 bg-muted rounded-xl" />
    </div>
  );
}
