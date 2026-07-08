import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import { AdminProductList } from "@/components/admin/admin-product-list";
import { ProductSearch } from "@/components/admin/product-search";
import { serverApi } from "@/lib/server/api";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import { Plus } from "lucide-react";

export const metadata = {
  title: "Admin Products | TrendCart",
};

export default async function AdminProductsPage(props: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const searchParams = await props.searchParams;
  const parsedPage = Number(searchParams.page || "1");
  const currentPage = Number.isFinite(parsedPage) && parsedPage >= 1 ? Math.floor(parsedPage) : 1;

  const queryParams = new URLSearchParams();
  queryParams.set("page", String(currentPage));
  queryParams.set("limit", String(ITEMS_PER_PAGE));
  
  if (typeof searchParams.search === "string" && searchParams.search.trim()) {
    queryParams.set("search", searchParams.search.trim());
  }

  const res = await serverApi.getAdminProducts(queryParams.toString()).catch(() => ({ products: [], total: 0 }));
  const products = res.products || [];
  const total = res.total || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        description={`${total} product${total !== 1 ? "s" : ""} total`}
        action={
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full sm:w-auto">
            <ProductSearch />
            <Link href="/admin/products/new">
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                New Product
              </Button>
            </Link>
          </div>
        }
      />

      {products.length === 0 ? (
        <EmptyState
          message="No products yet"
          actionLabel="Create your first product"
          actionHref="/admin/products/new"
        />
      ) : (
        <>
          <AdminProductList initialProducts={products} />
          <PaginationWrapper page={currentPage} total={total} limit={ITEMS_PER_PAGE} />
        </>
      )}
    </div>
  );
}
