import { describe, it, expect, vi, beforeEach } from "vitest";

const mockProxyAuthRoute = vi.hoisted(() => vi.fn());
vi.mock("@/lib/server/backend", () => ({
  proxyAuthRoute: mockProxyAuthRoute,
}));

import { POST } from "@/app/api/auth/[...path]/route";

function makeRequest(path: string, body?: object): Request {
  const url = `http://localhost:59124/api/auth/${path}`;
  const init: RequestInit = { method: "POST" };
  if (body) {
    init.body = JSON.stringify(body);
    init.headers = { "content-type": "application/json" };
  }
  return new Request(url, init);
}

function makeCtx(pathSegments: string[]) {
  return { params: Promise.resolve({ path: pathSegments }) };
}

describe("POST /api/auth/[...path] route handler", () => {
  beforeEach(() => {
    mockProxyAuthRoute.mockReset();
  });

  it("calls proxyAuthRoute with correct path for login", async () => {
    const fakeResponse = new Response(JSON.stringify({ token: "jwt-placeholder" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
    mockProxyAuthRoute.mockResolvedValue(fakeResponse);

    const req = makeRequest("login", { email: "a@b.com", password: "pass" });
    await POST(req, makeCtx(["login"]));

    expect(mockProxyAuthRoute).toHaveBeenCalledOnce();
    const [pathSegments, passedReq] = mockProxyAuthRoute.mock.calls[0];
    expect(pathSegments).toEqual(["api", "auth", "login"]);
    expect(passedReq).toBe(req);
  });

  it("calls proxyAuthRoute with correct path for register", async () => {
    mockProxyAuthRoute.mockResolvedValue(
      new Response(JSON.stringify({ token: "jwt" }), { status: 201 })
    );

    const req = makeRequest("register", { email: "a@b.com", password: "pass" });
    await POST(req, makeCtx(["register"]));

    const [pathSegments] = mockProxyAuthRoute.mock.calls[0];
    expect(pathSegments).toEqual(["api", "auth", "register"]);
  });

  it("returns the response from proxyAuthRoute", async () => {
    const fakeResponse = new Response(JSON.stringify({ token: "real-jwt" }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
    mockProxyAuthRoute.mockResolvedValue(fakeResponse);

    const req = makeRequest("login", { email: "a@b.com", password: "pass" });
    const res = await POST(req, makeCtx(["login"]));

    expect(res).toBe(fakeResponse);
  });

  it("passes through error responses", async () => {
    const fakeResponse = new Response(JSON.stringify({ error: "invalid" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
    mockProxyAuthRoute.mockResolvedValue(fakeResponse);

    const req = makeRequest("login", { email: "a@b.com", password: "wrong" });
    const res = await POST(req, makeCtx(["login"]));

    expect(res.status).toBe(401);
  });
});
