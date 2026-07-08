import Link from "next/link";
import { ProductGrid } from "@/components/product/product-grid";
import { CategoryFilter } from "@/components/product/category-filter";
import { Button } from "@/components/ui/button";
import { serverApi } from "@/lib/server/api";

export const metadata = {
  title: "เปรียบเทียบราคาสินค้า | TrendCart",
  description: "ค้นหาดีลที่ดีที่สุดจาก Shopee, Lazada และ TikTok Shop",
};

export default async function Home() {
  // Fetch data on the server
  const [productRes, categories] = await Promise.all([
    serverApi.getStoreProducts("page=1&limit=8").catch(() => ({ products: [] })),
    serverApi.getCategories().catch(() => []),
  ]);

  const products = productRes.products || [];

  return (
    <>
      {/* Hero */}
      <section className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            เปรียบเทียบราคาสินค้าข้ามแพลตฟอร์ม
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            ค้นหาดีลที่ดีที่สุดจาก Shopee, Lazada และ TikTok Shop ในที่เดียว
            สะดวกในการเปรียบเทียบราคา และความพร้อมของสินค้า
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild>
              <Link href="/products">ค้นหาสินค้า</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/products">ดูทั้งหมด</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="border-b bg-background">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              หมวดหมู่สินค้า
            </h2>
            <CategoryFilter categories={categories} />
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">สินค้าแนะนำ</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/products">ดูทั้งหมด →</Link>
            </Button>
          </div>
          <ProductGrid products={products} />
        </div>
      </section>
    </>
  );
}
