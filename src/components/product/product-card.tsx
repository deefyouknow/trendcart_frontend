import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PlatformBadge } from "./platform-badge";
import { formatPrice } from "@/lib/utils";
import { proxiedImageUrl } from "@/lib/image";
import type { StoreProductListItem, Platform } from "@/lib/types";

interface ProductCardProps {
  product: StoreProductListItem;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.images && product.images.length > 0 ? (
            <Image
              src={proxiedImageUrl(product.images[0])}
              alt={product.title}
              fill
              unoptimized
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
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
        <CardContent className="p-4">
          <h3 className="font-medium line-clamp-2 text-sm group-hover:text-accent transition-colors">
            {product.title}
          </h3>
          <p className="mt-1 text-lg font-bold text-foreground">
            {formatPrice(product.min_price, product.min_currency)}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {product.platforms.map((platform) => (
              <PlatformBadge
                key={platform}
                platform={platform as Platform}
              />
            ))}
          </div>
          {product.category && (
            <p className="mt-2 text-xs text-muted-foreground capitalize">
              {product.category}
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
