import type {
  ApiError,
  Category,
  LoginResponse,
  PaginationParams,
  ProductDetail,
  ProductListResponse,
  StoreProductDetail,
  StoreProductListResponse,
  UploadResponse,
} from "./types";

/* ============================================
   API Client — TrendCart Frontend (direct to Rust backend)
   Cookies are sent automatically via credentials: 'include'
   ============================================ */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:59123";

class ApiClient {
  /** Prevents infinite refresh loops — true while a refresh is in flight. */
  private _refreshing = false;
  /** Queue of callers waiting for the in-flight refresh to resolve. */
  private _refreshWaiters: Array<() => void> = [];

  private async request<T>(
    path: string,
    options: RequestInit = {},
    _isRetry = false,
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    const hasBody = options.body !== undefined && options.body !== null;
    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;
    if (hasBody && !isFormData && !headers["Content-Type"] && !headers["content-type"]) {
      headers["Content-Type"] = "application/json";
    }

    const url = `${BACKEND_URL}${path}`;
    const res = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    // On 401 — try a silent refresh (unless this is already a retry or the request IS the refresh)
    if (res.status === 401 && !_isRetry && path !== "/api/auth/refresh") {
      const refreshed = await this._tryRefresh();
      if (refreshed) {
        // Retry the original request once
        return this.request<T>(path, options, true);
      }
    }

    if (!res.ok) {
      const error: ApiError = await res.json().catch(() => ({
        error: `HTTP ${res.status}`,
        code: null,
      }));
      throw new ApiRequestError(error.error, res.status, error.code);
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return res.json();
  }

  /**
   * Attempt a token refresh. Coalesces concurrent callers so only one
   * request hits the backend. Returns true if a new access token was issued.
   */
  private async _tryRefresh(): Promise<boolean> {
    // If another refresh is already in flight, wait for it
    if (this._refreshing) {
      return new Promise<boolean>((resolve) => {
        this._refreshWaiters.push(() => resolve(true));
      });
    }

    this._refreshing = true;
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({}),
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      this._refreshing = false;
      // Wake all waiters
      for (const w of this._refreshWaiters) w();
      this._refreshWaiters = [];
    }
  }

  // --- Auth ---
  async register(data: {
    email: string;
    password: string;
    display_name: string;
  }) {
    return this.request<{ id: string; email: string; display_name: string; created_at: string }>(
      "/api/auth/register",
      { method: "POST", body: JSON.stringify(data) }
    );
  }

  async login(data: { email: string; password: string }) {
    return this.request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async refresh() {
    return this.request<LoginResponse>("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({}),
    });
  }

  async logout() {
    await this.request<{ message: string }>("/api/auth/logout", {
      method: "POST",
    });
  }

  async loginWithGoogle(idToken: string) {
    return this.request<LoginResponse>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ id_token: idToken }),
    });
  }

  async loginWithGitHub(code: string) {
    return this.request<LoginResponse>("/api/auth/github", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  }

  // --- Store (Public) ---
  async getStoreProducts(params: PaginationParams = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.category) searchParams.set("category", params.category);
    if (params.search) searchParams.set("search", params.search);

    const qs = searchParams.toString();
    return this.request<StoreProductListResponse>(
      `/api/store/products${qs ? `?${qs}` : ""}`
    );
  }

  async getStoreProduct(id: string) {
    return this.request<StoreProductDetail>(`/api/store/products/${id}`);
  }

  async getCategories() {
    return this.request<Category[]>("/api/store/products/categories");
  }

  // --- Admin Products ---
  async getAdminProducts(params: PaginationParams & { search?: string } = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.category) searchParams.set("category", params.category);
    if (params.search) searchParams.set("search", params.search);

    const qs = searchParams.toString();
    return this.request<ProductListResponse>(
      `/api/admin/products${qs ? `?${qs}` : ""}`
    );
  }

  async getAdminProduct(id: string) {
    return this.request<ProductDetail>(`/api/admin/products/${id}`);
  }

  async createProduct(data: {
    title: string;
    description?: string;
    category?: string;
    images?: string[];
  }) {
    return this.request<ProductDetail>("/api/admin/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateProduct(
    id: string,
    data: {
      title?: string;
      description?: string;
      category?: string;
      images?: string[];
    }
  ) {
    return this.request<ProductDetail>(`/api/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteProduct(id: string) {
    return this.request<{ message: string }>(`/api/admin/products/${id}`, {
      method: "DELETE",
    });
  }

  // --- Admin Merchant Links ---
  async createMerchantLink(
    productId: string,
    data: {
      platform: string;
      store_name: string;
      affiliate_url: string;
      is_price_estimated?: boolean;
      variants: {
        variant_name: string;
        price: number;
        currency?: string;
        stock_status?: string;
      }[];
    }
  ) {
    return this.request<import("./types").MerchantLink>(
      `/api/admin/products/${productId}/merchant-links`,
      { method: "POST", body: JSON.stringify(data) }
    );
  }

  async updateMerchantLink(
    id: string,
    data: {
      store_name?: string;
      affiliate_url?: string;
      is_price_estimated?: boolean;
      price_checked_at?: string;
    }
  ) {
    return this.request<import("./types").MerchantLink>(
      `/api/admin/merchant-links/${id}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
  }

  async deleteMerchantLink(id: string) {
    return this.request<{ message: string }>(
      `/api/admin/merchant-links/${id}`,
      { method: "DELETE" }
    );
  }

  // --- Admin Variants ---
  async createVariant(
    merchantLinkId: string,
    data: {
      variant_name: string;
      price: number;
      currency?: string;
      stock_status?: string;
    }
  ) {
    return this.request<import("./types").Variant>(
      `/api/admin/merchant-links/${merchantLinkId}/variants`,
      { method: "POST", body: JSON.stringify(data) }
    );
  }

  async updateVariant(
    id: string,
    data: {
      variant_name?: string;
      price?: number;
      currency?: string;
      stock_status?: string;
    }
  ) {
    return this.request<import("./types").Variant>(
      `/api/admin/variants/${id}`,
      { method: "PUT", body: JSON.stringify(data) }
    );
  }

  async deleteVariant(id: string) {
    return this.request<{ message: string }>(`/api/admin/variants/${id}`, {
      method: "DELETE",
    });
  }

  // --- Upload ---
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${BACKEND_URL}/api/uploads`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!res.ok) {
      const error: ApiError = await res.json().catch(() => ({
        error: `HTTP ${res.status}`,
        code: null,
      }));
      throw new ApiRequestError(error.error, res.status, error.code);
    }

    return res.json() as Promise<UploadResponse>;
  }

  // --- Admin Scrape Sources ---
  async getScrapeSources(params: PaginationParams = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));

    const qs = searchParams.toString();
    return this.request<import("./types").ScrapeSourceListResponse>(
      `/api/admin/scrape-sources${qs ? `?${qs}` : ""}`
    );
  }

  async createScrapeSource(data: {
    name: string;
    platform: string;
    source_url: string;
    scrape_config?: Record<string, unknown>;
    scrape_interval_hours?: number;
  }) {
    return this.request<import("./types").ScrapeSource>("/api/admin/scrape-sources", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateScrapeSource(
    id: string,
    data: {
      name?: string;
      platform?: string;
      source_url?: string;
      scrape_config?: Record<string, unknown>;
      is_active?: boolean;
      scrape_interval_hours?: number;
    }
  ) {
    return this.request<import("./types").ScrapeSource>(`/api/admin/scrape-sources/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteScrapeSource(id: string) {
    return this.request<{ message: string }>(`/api/admin/scrape-sources/${id}`, {
      method: "DELETE",
    });
  }

  async triggerScrapeJob(sourceId: string) {
    return this.request<import("./types").ScrapeJob>(
      `/api/admin/scrape-sources/${sourceId}/trigger`,
      { method: "POST" }
    );
  }

  // --- Admin Scrape Jobs ---
  async getScrapeJobs(params: PaginationParams = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));

    const qs = searchParams.toString();
    return this.request<import("./types").ScrapeJobListResponse>(
      `/api/admin/scrape-jobs${qs ? `?${qs}` : ""}`
    );
  }

  async getScrapeJob(id: string) {
    return this.request<import("./types").ScrapeJobDetail>(`/api/admin/scrape-jobs/${id}`);
  }

  // --- Admin Conversions ---
  async getConversions(params: PaginationParams & { status?: string; platform?: string } = {}) {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set("page", String(params.page));
    if (params.limit) searchParams.set("limit", String(params.limit));
    if (params.status) searchParams.set("status", params.status);
    if (params.platform) searchParams.set("platform", params.platform);

    const qs = searchParams.toString();
    return this.request<import("./types").ConversionListResponse>(
      `/api/admin/conversions${qs ? `?${qs}` : ""}`
    );
  }

  async getConversion(id: string) {
    return this.request<import("./types").Conversion>(`/api/admin/conversions/${id}`);
  }

  async updateConversionStatus(id: string, status: string) {
    return this.request<import("./types").Conversion>(`/api/admin/conversions/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  async approveConversion(id: string) {
    return this.request<import("./types").Conversion>(`/api/admin/conversions/${id}/approve`, {
      method: "POST",
    });
  }

  async rejectConversion(id: string) {
    return this.request<import("./types").Conversion>(`/api/admin/conversions/${id}/reject`, {
      method: "POST",
    });
  }
}

/* ============================================
   Custom Error Class
   ============================================ */
export class ApiRequestError extends Error {
  status: number;
  code: string | null;

  constructor(message: string, status: number, code: string | null) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

/* ============================================
   Singleton API Client
   ============================================ */
export const api = new ApiClient();
