import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the backend module directly — this is what the route handler calls
const mockProxyToBackend = vi.hoisted(() => vi.fn());
vi.mock("@/lib/server/backend", () => ({
  proxyToBackend: mockProxyToBackend,
}));

import { GET } from "@/app/api/store/[...path]/route";

function makeRequest(path: string): Request {
  const url = `http://localhost:59124/api/store/${path}`;
  return new Request(url, { method: "GET" });
}

function makeCtx(pathSegments: string[]) {
  return { params: Promise.resolve({ path: pathSegments }) };
}

describe("GET /api/store/[...path] route handler", () => {
  beforeEach(() => {
    mockProxyToBackend.mockReset();
  });

  it("calls proxyToBackend with correct path segments", async () => {
    const fakeResponse = new Response(JSON.stringify({ products: [] }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
    mockProxyToBackend.mockResolvedValue(fakeResponse);

    const req = makeRequest("products?page=1&limit=3");
    await GET(req, makeCtx(["products"]));

    expect(mockProxyToBackend).toHaveBeenCalledOnce();
    const [pathSegments, passedReq] = mockProxyToBackend.mock.calls[0];
    expect(pathSegments).toEqual(["api", "store", "products"]);
    expect(passedReq).toBe(req);
  });

  it("builds path segments for categories", async () => {
    mockProxyToBackend.mockResolvedValue(new Response("[]", { status: 200 }));

    const req = makeRequest("products/categories");
    await GET(req, makeCtx(["products", "categories"]));

    const [pathSegments] = mockProxyToBackend.mock.calls[0];
    expect(pathSegments).toEqual(["api", "store", "products", "categories"]);
  });

  it("builds path segments for product detail", async () => {
    mockProxyToBackend.mockResolvedValue(
      new Response(JSON.stringify({ id: 42 }), { status: 200 })
    );

    const req = makeRequest("products/42");
    await GET(req, makeCtx(["products", "42"]));

    const [pathSegments] = mockProxyToBackend.mock.calls[0];
    expect(pathSegments).toEqual(["api", "store", "products", "42"]);
  });

  it("returns the response from proxyToBackend", async () => {
    const fakeResponse = new Response(JSON.stringify({ error: "not found" }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
    mockProxyToBackend.mockResolvedValue(fakeResponse);

    const req = makeRequest("products/999");
    const res = await GET(req, makeCtx(["products", "999"]));

    expect(res).toBe(fakeResponse);
  });
});
