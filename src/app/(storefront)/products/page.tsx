import { Suspense } from "react";
import { ProductGrid, ProductGridSkeleton } from "@/components/product/product-grid";
import { CategoryFilter } from "@/components/product/category-filter";
import { ProductSearch } from "@/components/product/product-search";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import { serverApi } from "@/lib/server/api";
import { ITEMS_PER_PAGE } from "@/lib/constants";

export const metadata = {
  title: "Products | TrendCart",
};

export default async function ProductsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;

  const currentCategory = (searchParams.category as string) || undefined;
  const currentSearch = (searchParams.search as string) || "";
  const parsedPage = Number(searchParams.page || "1");
  const currentPage = Number.isFinite(parsedPage) && parsedPage >= 1 ? Math.floor(parsedPage) : 1;

  // Build query string for server API
  const queryParams = new URLSearchParams();
  queryParams.set("page", String(currentPage));
  queryParams.set("limit", String(ITEMS_PER_PAGE));
  if (currentCategory) queryParams.set("category", currentCategory);
  if (currentSearch) queryParams.set("search", currentSearch);

  // Fetch data
  const [productRes, categories] = await Promise.all([
    serverApi.getStoreProducts(queryParams.toString()).catch(() => ({ products: [], total: 0 })),
    serverApi.getCategories().catch(() => []),
  ]);

  const products = productRes.products || [];
  const total = productRes.total || 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">สินค้าทั้งหมด</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          พบสินค้าทั้งหมด {total} รายการ
        </p>
      </div>

      {/* Search + Filters */}
      <div className="mb-6 space-y-4">
        {/* Search bar */}
        <ProductSearch />

        {/* Category filter */}
        <CategoryFilter categories={categories} selected={currentCategory} />
      </div>

      {/* Products grid */}
      <ProductGrid products={products} />

      {/* Pagination */}
      <div className="mt-8">
        <PaginationWrapper
          page={currentPage}
          total={total}
          limit={ITEMS_PER_PAGE}
        />
      </div>
    </div>
  );
}
