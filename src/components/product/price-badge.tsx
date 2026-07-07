import { cn, formatPrice, timeAgo } from "@/lib/utils";

interface PriceBadgeProps {
  price: number;
  currency?: string;
  isEstimated?: boolean;
  priceCheckedAt?: string | null;
  className?: string;
}

export function PriceBadge({
  price,
  currency = "THB",
  isEstimated = true,
  priceCheckedAt,
  className,
}: PriceBadgeProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      <span className="text-lg font-bold text-foreground">
        {formatPrice(price, currency)}
      </span>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {isEstimated && (
          <span className="inline-flex items-center rounded bg-muted px-1.5 py-0.5">
            Est.
          </span>
        )}
        {priceCheckedAt && (
          <span>checked {timeAgo(priceCheckedAt)}</span>
        )}
      </div>
    </div>
  );
}
