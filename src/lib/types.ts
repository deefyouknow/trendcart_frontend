/* ============================================
   TrendCart API Types
   Matches backend API contract
   ============================================ */

// --- Auth ---
export interface Creator {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
}

export interface LoginResponse {
  token?: string;
  creator: Creator;
}

// --- Products ---
export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface ProductListItem extends Product {
  merchant_links_count: number;
}

export interface ProductListResponse {
  products: ProductListItem[];
  total: number;
  page: number;
  limit: number;
}

// --- Storefront Product (with price) ---
export interface StoreProductListItem {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  min_price: number;
  min_currency: string | null;
  platforms: string[];
  created_at: string;
}

export interface StoreProductListResponse {
  products: StoreProductListItem[];
  total: number;
  page: number;
  limit: number;
}

// --- Product Detail (with merchant links) ---
export interface ProductDetail extends Product {
  merchant_links: MerchantLink[];
}

export interface StoreProductDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  merchant_links: StoreMerchantLink[];
  created_at: string;
}

// --- Merchant Links ---
export interface MerchantLink {
  id: string;
  platform: Platform;
  store_name: string;
  affiliate_url: string;
  is_price_estimated: boolean;
  price_checked_at: string | null;
  variants: Variant[];
}

export interface StoreMerchantLink {
  id: string;
  platform: Platform;
  store_name: string;
  platform_price: number;
  currency: string;
  is_price_estimated: boolean;
  price_checked_at: string | null;
  variants: Variant[];
}

// --- Variants ---
export interface Variant {
  id: string;
  variant_name: string;
  price: number;
  currency: string;
  stock_status: StockStatus;
}

// --- Enums ---
export type Platform = "shopee" | "lazada" | "tiktok" | "other";
export type StockStatus = "in_stock" | "out_of_stock" | "unknown";

// --- Categories ---
export interface Category {
  name: string;
  product_count: number;
}

// Backend returns raw array: Category[]
// Frontend wrapper for server-side fetching:
export type CategoriesResponse = Category[];

// --- Pagination ---
export interface PaginationParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}

// --- Upload ---
export interface UploadResponse {
  path: string;
  width: number;
  height: number;
}

// --- Error ---
export interface ApiError {
  error: string;
  code: string | null;
}

// --- Scrape Sources ---
export interface ScrapeSource {
  id: string;
  name: string;
  platform: string;
  source_url: string;
  scrape_config: Record<string, unknown>;
  is_active: boolean;
  scrape_interval_hours: number;
  last_scraped_at: string | null;
  created_at: string;
}

export interface ScrapeSourceListResponse {
  items: ScrapeSource[];
  total: number;
  page: number;
  limit: number;
}

// --- Scrape Jobs ---
export type ScrapeJobStatus = "pending" | "running" | "completed" | "failed";

export interface ScrapeJob {
  id: string;
  source_id: string;
  status: ScrapeJobStatus;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  items_found: number;
  items_ingested: number;
  created_at: string;
}

export interface ScrapeJobListResponse {
  items: ScrapeJob[];
  total: number;
  page: number;
  limit: number;
}

export interface ScrapeJobDetail extends ScrapeJob {
  source_name: string;
  results: ScrapeResult[];
}

// --- Scrape Results ---
export interface ScrapeResult {
  id: string;
  job_id: string;
  raw_data: Record<string, unknown>;
  ingested_at: string | null;
  product_id: string | null;
  merchant_link_id: string | null;
  created_at: string;
}

// --- Conversions ---
export type ConversionStatus = "pending" | "approved" | "rejected" | "cancelled";
export type ConversionType = "sale" | "lead" | "install";

export interface Conversion {
  id: string;
  click_id: string;
  merchant_link_id: string;
  platform: string;
  order_id: string | null;
  order_amount: number | null;
  currency: string;
  commission: number | null;
  status: ConversionStatus;
  conversion_type: ConversionType;
  product_name: string | null;
  raw_data: Record<string, unknown>;
  postback_at: string;
  created_at: string;
}

export interface ConversionListResponse {
  items: Conversion[];
  total: number;
  page: number;
  limit: number;
}
