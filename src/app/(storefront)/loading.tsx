import { ProductGridSkeleton } from "@/components/product/product-grid";

export default function Loading() {
  return (
    <>
      {/* Hero Skeleton */}
      <section className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="h-10 bg-muted rounded w-3/4 max-w-lg mb-4 animate-pulse"></div>
          <div className="h-6 bg-muted rounded w-1/2 max-w-md mb-6 animate-pulse"></div>
          <div className="flex gap-3">
            <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Featured Products Skeleton */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="h-7 bg-muted rounded w-48 animate-pulse"></div>
            <div className="h-9 bg-muted rounded w-24 animate-pulse"></div>
          </div>
          <ProductGridSkeleton />
        </div>
      </section>
    </>
  );
}
