"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart, type CartItem as CartItemType } from "@/components/cart/cart-provider";
import { AffiliateDisclosure } from "@/components/disclosure/affiliate-disclosure";
import { PLATFORM_CONFIG, STOCK_STATUS_LABELS, STOCK_STATUS_COLORS } from "@/lib/constants";
import { proxiedImageUrl } from "@/lib/image";
import { formatPrice, cn } from "@/lib/utils";
import { ImageIcon, X, ShoppingCart } from "lucide-react";

function CartRow({ item }: { item: CartItemType }) {
  const { removeItem } = useCart();
  const platform = PLATFORM_CONFIG[item.platform as keyof typeof PLATFORM_CONFIG] || PLATFORM_CONFIG.other;

  return (
    <div className="flex gap-4 py-4 border-b last:border-0">
      {/* Image */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
        {item.productImage ? (
          <Image
            src={proxiedImageUrl(item.productImage)}
            alt={item.productTitle}
            fill
            unoptimized
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageIcon className="h-6 w-6" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.productId}`}
          className="text-sm font-medium hover:text-accent transition-colors line-clamp-1"
        >
          {item.productTitle}
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5">{item.storeName}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span
            className={cn(
              "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium",
              platform.bgClass,
              platform.textClass
            )}
          >
            {platform.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {item.variant.variant_name}
          </span>
          <span
            className={cn(
              "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium",
              STOCK_STATUS_COLORS[item.variant.stock_status]
            )}
          >
            {STOCK_STATUS_LABELS[item.variant.stock_status]}
          </span>
        </div>
        <p className="text-base font-bold mt-1.5">
          {formatPrice(item.variant.price, item.variant.currency)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => removeItem(item.merchantLinkId, item.variant.id)}
          aria-label={`Remove ${item.productTitle}`}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          asChild
          disabled={item.variant.stock_status === "out_of_stock"}
        >
          <a
            href={item.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Buy
          </a>
        </Button>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { items, clearCart, itemCount } = useCart();

  const total = items.reduce((sum, item) => sum + item.variant.price, 0);
  const currency = items.length > 0 ? items[0].variant.currency : "THB";

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight">
              Shopping Cart
              {itemCount > 0 && (
                <span className="ml-2 text-base font-normal text-muted-foreground">
                  ({itemCount} item{itemCount === 1 ? "" : "s"})
                </span>
              )}
            </h1>
            {items.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart}>
                Clear All
              </Button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart className="mb-4 h-14 w-14 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Your cart is empty</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse products and add items to get started.
              </p>
              <Button asChild className="mt-6">
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Cart items */}
              <div className="rounded-lg border bg-card">
                {items.map((item) => (
                  <CartRow key={`${item.merchantLinkId}-${item.variant.id}`} item={item} />
                ))}
              </div>

              {/* Total */}
              <div className="mt-6 rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Total ({itemCount} item{itemCount === 1 ? "" : "s"})
                  </span>
                  <span className="text-lg font-bold">
                    {formatPrice(total, currency)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button variant="outline" asChild>
                  <Link href="/products">Continue Shopping</Link>
                </Button>
                <Button variant="outline" onClick={clearCart}>
                  Clear Cart
                </Button>
              </div>

              {/* Disclosure */}
              <div className="mt-8">
                <AffiliateDisclosure variant="banner" />
              </div>
            </>
          )}
        </div>
    </>
  );
}
