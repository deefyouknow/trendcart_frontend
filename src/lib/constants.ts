import type { Platform } from "./types";

export const PLATFORM_CONFIG: Record<
  Platform,
  { label: string; color: string; bgClass: string; textClass: string }
> = {
  shopee: {
    label: "Shopee",
    color: "#ee4d2d",
    bgClass: "bg-shopee/10",
    textClass: "text-shopee",
  },
  lazada: {
    label: "Lazada",
    color: "#0f146d",
    bgClass: "bg-lazada/10",
    textClass: "text-lazada",
  },
  tiktok: {
    label: "TikTok Shop",
    color: "#000000",
    bgClass: "bg-tiktok/10",
    textClass: "text-tiktok",
  },
  other: {
    label: "Other",
    color: "#737373",
    bgClass: "bg-muted",
    textClass: "text-muted-foreground",
  },
};

export const STOCK_STATUS_LABELS: Record<string, string> = {
  in_stock: "In Stock",
  out_of_stock: "Out of Stock",
  unknown: "Unknown",
};

export const STOCK_STATUS_COLORS: Record<string, string> = {
  in_stock: "bg-accent/10 text-accent",
  out_of_stock: "bg-destructive/10 text-destructive",
  unknown: "bg-muted text-muted-foreground",
};

export const ITEMS_PER_PAGE = 20;
