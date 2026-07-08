import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock getAuthToken — image proxy uses it directly (not through proxyToBackend)
const mockGetAuthToken = vi.hoisted(() => vi.fn().mockResolvedValue(null));
vi.mock("@/lib/server/backend", () => ({
  getAuthToken: mockGetAuthToken,
}));

const mockFetch = vi.hoisted(() => vi.fn());
vi.stubGlobal("fetch", mockFetch);

import { GET } from "@/app/api/proxy/image/route";

function makeRequest(pathParam: string | null): Request {
  const base = "http://localhost:59124/api/proxy/image";
  const url = pathParam !== null ? `${base}?path=${encodeURIComponent(pathParam)}` : base;
  return new Request(url, { method: "GET" });
}

describe("GET /api/proxy/image", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockGetAuthToken.mockReset();
    mockGetAuthToken.mockResolvedValue(null);
    process.env.BACKEND_URL = "http://localhost:59123";
  });

  it("returns 400 when path param is missing", async () => {
    const req = makeRequest(null);
    const res = await GET(req);
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  it("returns 400 when path does not start with /uploads/", async () => {
    const req = makeRequest("/etc/passwd");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("blocks path traversal with 400", async () => {
    const req = makeRequest("/uploads/../../../etc/passwd");
    const res = await GET(req);

    expect(res.status).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
    const body = await res.json();
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  it("fetches from backend with correct path", async () => {
    const imageBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47]);
    mockFetch.mockResolvedValue(
      new Response(imageBytes, {
        status: 200,
        headers: { "content-type": "image/png" },
      })
    );

    const req = makeRequest("/uploads/products/photo.png");
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
    expect(res.headers.get("cache-control")).toBe("private, max-age=3600");

    const [calledUrl] = mockFetch.mock.calls[0];
    expect(calledUrl).toBe("http://localhost:59123/uploads/products/photo.png");
  });

  it("passes auth token to backend when present", async () => {
    mockGetAuthToken.mockResolvedValue("my-jwt-token");
    mockFetch.mockResolvedValue(
      new Response(new Uint8Array([0x89]), {
        status: 200,
        headers: { "content-type": "image/png" },
      })
    );

    const req = makeRequest("/uploads/products/photo.png");
    await GET(req);

    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers.get("authorization")).toBe("Bearer my-jwt-token");
  });

  it("passes through backend error status", async () => {
    mockFetch.mockResolvedValue(new Response(null, { status: 404 }));

    const req = makeRequest("/uploads/products/missing.jpg");
    const res = await GET(req);

    expect(res.status).toBe(404);
  });
});
