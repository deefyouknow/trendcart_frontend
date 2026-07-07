import { cn } from "@/lib/utils";

interface AffiliateDisclosureProps {
  variant?: "inline" | "banner";
  className?: string;
}

export function AffiliateDisclosure({
  variant = "inline",
  className,
}: AffiliateDisclosureProps) {
  if (variant === "banner") {
    return (
      <div
        className={cn(
          "rounded-lg border border-accent/20 bg-accent/5 p-4 text-sm text-muted-foreground",
          className
        )}
      >
        <div className="flex items-start gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 shrink-0 text-accent"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <p>
            <strong className="text-foreground">Affiliate Disclosure:</strong>{" "}
            Purchases through this site may earn the creator a commission. This
            comes at no extra cost to you.
          </p>
        </div>
      </div>
    );
  }

  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      Affiliate disclosure: Purchases through this site may earn the creator a
      commission.
    </p>
  );
}
