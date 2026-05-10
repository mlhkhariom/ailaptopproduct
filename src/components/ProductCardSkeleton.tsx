export default function ProductCardSkeleton() {
  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-4 skeleton rounded" />
        <div className="h-3 w-2/3 skeleton rounded" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 w-16 skeleton rounded" />
          <div className="h-8 w-8 skeleton rounded-full" />
        </div>
      </div>
    </div>
  );
}
