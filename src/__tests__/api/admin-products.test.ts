import { describe, it, expect, vi, beforeEach } from "vitest";

const mockProxyToBackend = vi.hoisted(() => vi.fn());
vi.mock("@/lib/server/backend", () => ({
  proxyToBackend: mockProxyToBackend,
}));

import { GET, POST, PUT, DELETE } from "@/app/api/admin/[...path]/route";

function makeRequest(path: string, method = "GET", body?: object): Request {
  const url = `http://localhost:59124/api/admin/${path}`;
  const init: RequestInit = { method };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { "content-type": "application/json" };
  }
  return new Request(url, init);
}

function makeCtx(pathSegments: string[]) {
  return { params: Promise.resolve({ path: pathSegments }) };
}

describe("GET /api/admin/[...path] route handler", () => {
  beforeEach(() => {
    mockProxyToBackend.mockReset();
  });

  it("calls proxyToBackend with correct path for products list", async () => {
    mockProxyToBackend.mockResolvedValue(
      new Response(JSON.stringify({ products: [] }), { status: 200 })
    );

    const req = makeRequest("products?page=1&limit=10");
    await GET(req, makeCtx(["products"]));

    const [pathSegments, passedReq] = mockProxyToBackend.mock.calls[0];
    expect(pathSegments).toEqual(["api", "admin", "products"]);
    expect(passedReq).toBe(req);
  });

  it("calls proxyToBackend with correct path for product detail", async () => {
    mockProxyToBackend.mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), { status: 200 })
    );

    const req = makeRequest("products/1");
    await GET(req, makeCtx(["products", "1"]));

    const [pathSegments] = mockProxyToBackend.mock.calls[0];
    expect(pathSegments).toEqual(["api", "admin", "products", "1"]);
  });

  it("POST calls proxyToBackend with correct path", async () => {
    mockProxyToBackend.mockResolvedValue(
      new Response(JSON.stringify({ id: 2 }), { status: 201 })
    );

    const req = makeRequest("products", "POST", { name: "New Product" });
    await POST(req, makeCtx(["products"]));

    const [pathSegments, passedReq] = mockProxyToBackend.mock.calls[0];
    expect(pathSegments).toEqual(["api", "admin", "products"]);
    expect(passedReq.method).toBe("POST");
  });

  it("PUT calls proxyToBackend with correct path", async () => {
    mockProxyToBackend.mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), { status: 200 })
    );

    const req = makeRequest("products/1", "PUT", { name: "Updated" });
    await PUT(req, makeCtx(["products", "1"]));

    const [pathSegments] = mockProxyToBackend.mock.calls[0];
    expect(pathSegments).toEqual(["api", "admin", "products", "1"]);
  });

  it("DELETE calls proxyToBackend with correct path", async () => {
    mockProxyToBackend.mockResolvedValue(new Response(null, { status: 204 }));

    const req = makeRequest("products/1", "DELETE");
    await DELETE(req, makeCtx(["products", "1"]));

    const [pathSegments] = mockProxyToBackend.mock.calls[0];
    expect(pathSegments).toEqual(["api", "admin", "products", "1"]);
  });
});
