import { proxyToBackend } from "@/lib/server/backend";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Backend exposes /redirect (no /api prefix) for the storefront click tracking
  return proxyToBackend(["redirect"], request);
}
