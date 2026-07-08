import { describe, it, expect, vi } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue(undefined),
  }),
}));

import { POST } from "@/app/api/auth/logout/route";

describe("POST /api/auth/logout", () => {
  it("returns 200 with Set-Cookie clearing tc_token", async () => {
    const res = await POST();

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.message).toBe("Logged out");

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("tc_token=");
    expect(setCookie).toContain("Max-Age=0");
    expect(setCookie).toContain("HttpOnly");
  });
});
