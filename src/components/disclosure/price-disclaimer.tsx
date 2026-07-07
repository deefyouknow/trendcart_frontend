import { cn, timeAgo } from "@/lib/utils";

interface PriceDisclaimerProps {
  priceCheckedAt?: string | null;
  className?: string;
}

export function PriceDisclaimer({ priceCheckedAt, className }: PriceDisclaimerProps) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground",
        className
      )}
    >
      <p>
        Prices listed represent historical records uploaded by the creator;
        actual marketplace live values may vary depending on active platform
        campaigns.
      </p>
      {priceCheckedAt && (
        <p className="mt-1 font-medium">
          Last verified: {timeAgo(priceCheckedAt)}
        </p>
      )}
    </div>
  );
}
