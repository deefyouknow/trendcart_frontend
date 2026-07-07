import { clearAuthCookie } from "@/lib/server/backend";

export const dynamic = "force-dynamic";

export async function POST() {
  return new Response(JSON.stringify({ message: "Logged out" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": clearAuthCookie(),
    },
  });
}
