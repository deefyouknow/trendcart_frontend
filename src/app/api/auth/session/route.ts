import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/server/backend";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:59123";

/* Lightweight session check — verifies JWT by hitting a protected endpoint */
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  if (!token) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Verify token against a real protected backend endpoint
  const res = await fetch(`${BACKEND_URL}/api/admin/products?limit=1`, {
    headers: { authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    return new Response(JSON.stringify({ authenticated: false }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ authenticated: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
