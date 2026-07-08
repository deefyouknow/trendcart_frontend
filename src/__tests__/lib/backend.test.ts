import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildBackendUrl, clearAuthCookie, AUTH_COOKIE } from "@/lib/server/backend";

// Mock next/headers — must be before any import that uses it
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
  }),
}));

describe("buildBackendUrl", () => {
  const BACKEND_URL = "http://localhost:59123";

  beforeEach(() => {
    process.env.BACKEND_URL = BACKEND_URL;
  });

  it("builds URL from path segments + search string", () => {
    const url = buildBackendUrl(["api", "store", "products"], "?page=1&limit=3");
    expect(url).toBe(`${BACKEND_URL}/api/store/products?page=1&limit=3`);
  });

  it("handles empty search string", () => {
    const url = buildBackendUrl(["api", "store", "products"], "");
    expect(url).toBe(`${BACKEND_URL}/api/store/products`);
  });

  it("filters empty segments", () => {
    const url = buildBackendUrl(["api", "", "store", "products"], "");
    expect(url).toBe(`${BACKEND_URL}/api/store/products`);
  });

  it("handles single segment", () => {
    const url = buildBackendUrl(["redirect"], "?id=123");
    expect(url).toBe(`${BACKEND_URL}/redirect?id=123`);
  });

  it("handles deeply nested path", () => {
    const url = buildBackendUrl(["api", "admin", "products", "42"], "");
    expect(url).toBe(`${BACKEND_URL}/api/admin/products/42`);
  });
});

describe("clearAuthCookie", () => {
  it("returns cookie string with Max-Age=0", () => {
    const cookie = clearAuthCookie();
    expect(cookie).toContain(`${AUTH_COOKIE}=`);
    expect(cookie).toContain("Max-Age=0");
    expect(cookie).toContain("Path=/");
    expect(cookie).toContain("HttpOnly");
  });
});
