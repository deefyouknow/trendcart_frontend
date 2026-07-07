"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ProductGrid, ProductGridSkeleton } from "@/components/product/product-grid";
import { CategoryFilter } from "@/components/product/category-filter";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { StoreProductListItem, Category } from "@/lib/types";

export default function Home() {
  const [products, setProducts] = useState<StoreProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [productRes, catRes] = await Promise.all([
          api.getStoreProducts({ page: 1, limit: 8 }),
          api.getCategories(),
        ]);
        setProducts(productRes.products);
        setCategories(catRes.categories);
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <>
        {/* Hero */}
        <section className="border-b bg-card">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Compare Prices Across Platforms
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Find the best deals from Shopee, Lazada, and TikTok Shop.
              One place to compare prices, variants, and availability.
            </p>
            <div className="mt-6 flex gap-3">
              <Button asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/products">View All</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Categories */}
        {categories?.length > 0 && (
          <section className="border-b bg-background">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Categories
              </h2>
              <CategoryFilter categories={categories} />
            </div>
          </section>
        )}

        {/* Featured Products */}
        <section className="bg-background">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Featured Products</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/products">View All →</Link>
              </Button>
            </div>
            {loading ? (
              <ProductGridSkeleton />
            ) : (
              <ProductGrid products={products} />
            )}
          </div>
        </section>
    </>
  );
}
