"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProductGrid, ProductGridSkeleton } from "@/components/product/product-grid";
import { CategoryFilter } from "@/components/product/category-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import { ITEMS_PER_PAGE } from "@/lib/constants";
import type { StoreProductListItem, Category } from "@/lib/types";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"><ProductGridSkeleton /></div>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentCategory = searchParams.get("category") || undefined;
  const currentSearch = searchParams.get("search") || "";
  // Guard against NaN if page query param is invalid (e.g. "abc")
  const parsedPage = Number(searchParams.get("page") || "1");
  const currentPage = Number.isFinite(parsedPage) && parsedPage >= 1 ? Math.floor(parsedPage) : 1;

  const [products, setProducts] = useState<StoreProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(currentSearch);

  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      // Reset to page 1 when filters change (except when changing page)
      if (!("page" in updates)) {
        params.delete("page");
      }
      router.push(`/products?${params.toString()}`);
    },
    [searchParams, router]
  );

  // Fetch categories once
  useEffect(() => {
    api.getCategories().then((res) => setCategories(res.categories)).catch(console.error);
  }, []);

  // Fetch products when params change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    api
      .getStoreProducts({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        category: currentCategory,
        search: currentSearch || undefined,
      })
      .then((res) => {
        if (!cancelled) {
          setProducts(res.products);
          setTotal(res.total);

          // If user landed on a page beyond available data, redirect to last valid page.
          // Only redirect once we know the real total (skip while loading).
          if (
            res.total > 0 &&
            currentPage > Math.max(1, Math.ceil(res.total / ITEMS_PER_PAGE))
          ) {
            const lastPage = Math.max(1, Math.ceil(res.total / ITEMS_PER_PAGE));
            updateParams({ page: String(lastPage) });
          } else if (res.total === 0 && currentPage > 1) {
            // No results at all and we're past page 1 — go back to page 1
            updateParams({ page: "1" });
          }
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [currentPage, currentCategory, currentSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput || null });
  };

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Page header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Products</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading ? "Loading..." : `${total} product${total === 1 ? "" : "s"} found`}
            </p>
          </div>

          {/* Search + Filters */}
          <div className="mb-6 space-y-4">
            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="search"
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="max-w-sm"
              />
              <Button type="submit" size="sm">
                Search
              </Button>
              {currentSearch && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchInput("");
                    updateParams({ search: null });
                  }}
                >
                  Clear
                </Button>
              )}
            </form>

            {/* Category filter */}
            <CategoryFilter categories={categories} selected={currentCategory} />
          </div>

          {/* Products grid */}
          {loading ? (
            <ProductGridSkeleton />
          ) : (
            <ProductGrid products={products} />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => updateParams({ page: String(currentPage - 1) })}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => updateParams({ page: String(currentPage + 1) })}
              >
                Next
              </Button>
            </div>
          )}
        </div>
    </>
  );
}
