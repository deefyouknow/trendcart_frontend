import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCookies = vi.hoisted(() => vi.fn());
vi.mock("next/headers", () => ({
  cookies: mockCookies,
}));

const mockFetch = vi.hoisted(() => vi.fn());
vi.stubGlobal("fetch", mockFetch);

import { GET } from "@/app/api/auth/session/route";

describe("GET /api/auth/session", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockCookies.mockReset();
    process.env.BACKEND_URL = "http://localhost:59123";
  });

  it("returns 401 when no token cookie", async () => {
    mockCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    });

    const res = await GET();
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.authenticated).toBe(false);
  });

  it("verifies token against backend and returns 200 if valid", async () => {
    mockCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "valid-token" }),
    });
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ products: [] }), { status: 200 })
    );

    const res = await GET();
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.authenticated).toBe(true);

    const [calledUrl, init] = mockFetch.mock.calls[0];
    expect(calledUrl).toBe("http://localhost:59123/api/admin/products?limit=1");
    expect(init.headers.authorization).toBe("Bearer valid-token");
  });

  it("returns 401 when backend rejects token", async () => {
    mockCookies.mockResolvedValue({
      get: vi.fn().mockReturnValue({ value: "expired-token" }),
    });
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 })
    );

    const res = await GET();
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.authenticated).toBe(false);
  });
});
