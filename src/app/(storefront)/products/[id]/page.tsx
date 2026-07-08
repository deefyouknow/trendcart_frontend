"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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
import { ImageIcon, ShoppingCart } from "lucide-react";
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

  const sortedLinks = product
    ? [...product.merchant_links].sort((a, b) => a.platform_price - b.platform_price)
    : [];

  const lowestPrice = sortedLinks.length > 0 ? sortedLinks[0] : null;

  if (loading) {
    return (
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
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">{error || "Product not found"}</h1>
        <p className="mt-2 text-muted-foreground">
          The product you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button asChild className="mt-6">
          <Link href="/products">Back to Products</Link>
        </Button>
      </div>
    );
  }

  return (
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
                <ImageIcon className="h-16 w-16" />
              </div>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={cn(
                    "relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                    selectedImage === i ? "border-accent" : "border-transparent hover:border-border"
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
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{product.title}</h1>
            {lowestPrice && (
              <Badge variant="secondary" className="mt-1 shrink-0">Best Price</Badge>
            )}
          </div>

          {product.category && (
            <p className="mt-2 text-sm text-muted-foreground capitalize">Category: {product.category}</p>
          )}

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

          <div className="mt-4">
            <AffiliateDisclosure variant="banner" />
          </div>

          {/* Price comparison */}
          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Price Comparison ({sortedLinks.length} offer{sortedLinks.length !== 1 ? "s" : ""})
            </h2>

            {sortedLinks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No merchant links available for this product.</p>
            ) : (
              <div className="space-y-3">
                {sortedLinks.map((ml) => {
                  const selectedVariant = selectedVariants[ml.id] || ml.variants[0];
                  const isLowest = lowestPrice && ml.id === lowestPrice.id;

                  return (
                    <div
                      key={ml.id}
                      className={cn(
                        "rounded-lg border p-4 transition-colors",
                        isLowest ? "border-accent/50 bg-accent/5" : "bg-card"
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <PlatformBadge platform={ml.platform} />
                            <span className="text-sm font-medium">{ml.store_name}</span>
                            {isLowest && <Badge variant="default" className="text-[10px]">Lowest</Badge>}
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

                      {ml.variants.length > 1 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {ml.variants.map((v) => (
                            <button
                              key={v.id}
                              onClick={() => setSelectedVariants((prev) => ({ ...prev, [ml.id]: v }))}
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddToCart(ml, selectedVariant)}
                          disabled={!selectedVariant || selectedVariant.stock_status === "out_of_stock"}
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Add to Cart
                        </Button>
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

          <div className="mt-6">
            <PriceDisclaimer priceCheckedAt={sortedLinks.length > 0 ? sortedLinks[0].price_checked_at : null} />
          </div>
        </div>
      </div>
    </div>
  );
}
