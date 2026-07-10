import { getAuthToken } from "./backend";
import type { Category, ProductListResponse, StoreProductListResponse } from "../types";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:59123";

async function fetchFromBackend<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }
  
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store" // ensure we don't aggressively cache dynamic data, or use next: { revalidate }
  });

  if (!res.ok) {
    let errorMessage = `Backend Error: ${res.status}`;
    try {
      const errorBody = await res.json();
      if (errorBody.error) {
        errorMessage = errorBody.error;
      }
    } catch {
      // Response body is not JSON, use default message
    }
    throw new Error(errorMessage);
  }

  return res.json();
}

export const serverApi = {
  getStoreProducts: (searchParams: string = "") => 
    fetchFromBackend<StoreProductListResponse>(`/api/store/products${searchParams ? `?${searchParams}` : ""}`),
  getCategories: () =>
    fetchFromBackend<Category[]>("/api/store/products/categories"),
  getAdminProducts: (searchParams: string = "") =>
    fetchFromBackend<ProductListResponse>(`/api/admin/products${searchParams ? `?${searchParams}` : ""}`),
};
