"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlatformBadge } from "@/components/product/platform-badge";
import { PriceBadge } from "@/components/product/price-badge";
import { AffiliateDisclosure } from "@/components/disclosure/affiliate-disclosure";
import { PriceDisclaimer } from "@/components/disclosure/price-disclaimer";
import { useCart } from "@/components/cart/cart-provider";
import { api, ApiRequestError } from "@/lib/api";
import { PLATFORM_CONFIG, STOCK_STATUS_LABELS, STOCK_STATUS_COLORS } from "@/lib/constants";
import { proxiedImageUrl } from "@/lib/image";
import { formatPrice, cn } from "@/lib/utils";
import type { StoreProductDetail, StoreMerchantLink, Variant } from "@/lib/types";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { addItem } = useCart();

  const [product, setProduct] = useState<StoreProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, Variant>>({});

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .getStoreProduct(id)
      .then((data) => {
        setProduct(data);
        // Default-select first variant for each merchant link
        const defaults: Record<string, Variant> = {};
        data.merchant_links.forEach((ml) => {
          if (ml.variants.length > 0) {
            defaults[ml.id] = ml.variants[0];
          }
        });
        setSelectedVariants(defaults);
      })
      .catch((err) => {
        if (err instanceof ApiRequestError && err.status === 404) {
          setError("Product not found");
        } else {
          setError("Failed to load product");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = (merchantLink: StoreMerchantLink, variant: Variant) => {
    if (!product) return;
    addItem({
      productId: product.id,
      productTitle: product.title,
      productImage: product.images?.[0] || "",
      merchantLinkId: merchantLink.id,
      platform: merchantLink.platform,
      storeName: merchantLink.store_name,
      variant,
      affiliateUrl: `/redirect?merchant=${merchantLink.id}&variant=${variant.id}`,
    });
  };

  // Sort merchant links by price (lowest first)
  const sortedLinks = product
    ? [...product.merchant_links].sort((a, b) => a.platform_price - b.platform_price)
    : [];

  // Find lowest price
  const lowestPrice = sortedLinks.length > 0 ? sortedLinks[0] : null;

  if (loading) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="aspect-square animate-pulse rounded-xl bg-muted" />
              <div className="space-y-4">
                <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-40 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Header />
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold">
              {error || "Product not found"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              The product you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button asChild className="mt-6">
              <Link href="/products">Back to Products</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/products" className="hover:text-foreground">Products</Link>
            {product.category && (
              <>
                <span className="mx-2">/</span>
                <Link
                  href={`/products?category=${encodeURIComponent(product.category)}`}
                  className="hover:text-foreground capitalize"
                >
                  {product.category}
                </Link>
              </>
            )}
          </nav>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Image gallery */}
            <div>
              {/* Main image */}
              <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={proxiedImageUrl(product.images[selectedImage])}
                    alt={product.title}
                    fill
                    unoptimized
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="64"
                      height="64"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(i)}
                      className={cn(
                        "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                        selectedImage === i
                          ? "border-accent"
                          : "border-transparent hover:border-border"
                      )}
                    >
                      <Image
                        src={proxiedImageUrl(img)}
                        alt={`${product.title} ${i + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                        sizes="64px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product info */}
            <div>
              <div className="flex items-start gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {product.title}
                </h1>
                {lowestPrice && (
                  <Badge variant="secondary" className="mt-1 shrink-0">
                    Best Price
                  </Badge>
                )}
              </div>

              {product.category && (
                <p className="mt-2 text-sm text-muted-foreground capitalize">
                  Category: {product.category}
                </p>
              )}

              {/* Lowest price highlight */}
              {lowestPrice && (
                <div className="mt-4 rounded-lg border bg-card p-4">
                  <p className="text-xs text-muted-foreground mb-1">Lowest price from</p>
                  <div className="flex items-center gap-2">
                    <PlatformBadge platform={lowestPrice.platform} />
                    <span className="text-sm font-medium">{lowestPrice.store_name}</span>
                  </div>
                  <PriceBadge
                    price={lowestPrice.platform_price}
                    currency={lowestPrice.currency}
                    isEstimated={lowestPrice.is_price_estimated}
                    priceCheckedAt={lowestPrice.price_checked_at}
                    className="mt-2"
                  />
                </div>
              )}

              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                {product.description || "No description available."}
              </p>

              {/* Affiliate disclosure */}
              <div className="mt-4">
                <AffiliateDisclosure variant="banner" />
              </div>

              {/* Price comparison */}
              <div className="mt-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Price Comparison ({sortedLinks.length} offer{sortedLinks.length !== 1 ? "s" : ""})
                </h2>

                {sortedLinks.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No merchant links available for this product.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {sortedLinks.map((ml) => {
                      const selectedVariant = selectedVariants[ml.id] || ml.variants[0];
                      const isLowest =
                        lowestPrice && ml.id === lowestPrice.id;

                      return (
                        <div
                          key={ml.id}
                          className={cn(
                            "rounded-lg border p-4 transition-colors",
                            isLowest
                              ? "border-accent/50 bg-accent/5"
                              : "bg-card"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <PlatformBadge platform={ml.platform} />
                                <span className="text-sm font-medium">
                                  {ml.store_name}
                                </span>
                                {isLowest && (
                                  <Badge variant="default" className="text-[10px]">
                                    Lowest
                                  </Badge>
                                )}
                              </div>
                              <PriceBadge
                                price={ml.platform_price}
                                currency={ml.currency}
                                isEstimated={ml.is_price_estimated}
                                priceCheckedAt={ml.price_checked_at}
                                className="mt-2"
                              />
                            </div>
                          </div>

                          {/* Variants */}
                          {ml.variants.length > 1 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {ml.variants.map((v) => (
                                <button
                                  key={v.id}
                                  onClick={() =>
                                    setSelectedVariants((prev) => ({
                                      ...prev,
                                      [ml.id]: v,
                                    }))
                                  }
                                  className={cn(
                                    "rounded-md border px-2.5 py-1 text-xs transition-colors",
                                    selectedVariant?.id === v.id
                                      ? "border-accent bg-accent/10 text-accent"
                                      : "border-border hover:border-muted-foreground/30"
                                  )}
                                >
                                  {v.variant_name}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Stock status + actions */}
                          <div className="mt-3 flex items-center gap-3">
                            {selectedVariant && (
                              <span
                                className={cn(
                                  "inline-flex items-center rounded px-2 py-0.5 text-[10px] font-medium",
                                  STOCK_STATUS_COLORS[selectedVariant.stock_status]
                                )}
                              >
                                {STOCK_STATUS_LABELS[selectedVariant.stock_status]}
                              </span>
                            )}

                            <div className="flex-1" />

                            {/* Add to Cart */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddToCart(ml, selectedVariant)}
                              disabled={!selectedVariant || selectedVariant.stock_status === "out_of_stock"}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <circle cx="8" cy="21" r="1" />
                                <circle cx="19" cy="21" r="1" />
                                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                              </svg>
                              Add to Cart
                            </Button>

                            {/* Buy (redirect) */}
                            <Button
                              size="sm"
                              asChild
                              disabled={!selectedVariant || selectedVariant.stock_status === "out_of_stock"}
                            >
                              <a
                                href={`/redirect?merchant=${ml.id}&variant=${selectedVariant?.id || ""}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Buy on {PLATFORM_CONFIG[ml.platform]?.label || ml.platform}
                              </a>
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Price disclaimer */}
              <div className="mt-6">
                <PriceDisclaimer
                  priceCheckedAt={
                    sortedLinks.length > 0 ? sortedLinks[0].price_checked_at : null
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
