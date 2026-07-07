"use client";

import Image from "next/image";
import { useCart, type CartItem as CartItemType } from "./cart-provider";
import { Button } from "@/components/ui/button";
import { PLATFORM_CONFIG, STOCK_STATUS_LABELS, STOCK_STATUS_COLORS } from "@/lib/constants";
import { formatPrice, cn } from "@/lib/utils";
import { proxiedImageUrl } from "@/lib/image";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { removeItem } = useCart();
  const platform = PLATFORM_CONFIG[item.platform as keyof typeof PLATFORM_CONFIG] || PLATFORM_CONFIG.other;

  return (
    <div className="flex gap-3 py-3 border-b last:border-0">
      {/* Image */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
        {item.productImage ? (
          <Image
            src={proxiedImageUrl(item.productImage)}
            alt={item.productTitle}
            fill
            unoptimized
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.productTitle}</p>
        <p className="text-xs text-muted-foreground truncate">{item.storeName}</p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className={cn(
              "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium",
              platform.bgClass,
              platform.textClass
            )}
          >
            {platform.label}
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
        <p className="text-sm font-semibold mt-1">
          {formatPrice(item.variant.price, item.variant.currency)}
        </p>
      </div>

      {/* Remove */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0"
        onClick={() => removeItem(item.merchantLinkId, item.variant.id)}
        aria-label={`Remove ${item.productTitle} from cart`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </Button>
    </div>
  );
}
