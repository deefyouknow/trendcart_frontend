import { proxyToBackend } from "@/lib/server/backend";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return proxyToBackend(["api", "postback"], request);
}
