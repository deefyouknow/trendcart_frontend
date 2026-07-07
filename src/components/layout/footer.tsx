import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg">TrendCart</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Compare product prices from multiple platforms in one place.
            </p>
          </div>

          {/* Affiliate Disclosure */}
          <div>
            <h4 className="font-semibold text-sm mb-2">Affiliate Disclosure</h4>
            <p className="text-sm text-muted-foreground">
              Purchases through this site may earn the creator a commission.
              This comes at no extra cost to you.
            </p>
          </div>

          {/* Price Disclaimer */}
          <div>
            <h4 className="font-semibold text-sm mb-2">Price Disclaimer</h4>
            <p className="text-sm text-muted-foreground">
              Prices listed represent historical records uploaded by the creator;
              actual marketplace live values may vary depending on active platform
              campaigns.
            </p>
          </div>
        </div>

        <Separator className="my-6" />

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} TrendCart. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Shopee</span>
            <span>Lazada</span>
            <span>TikTok Shop</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
