import { proxyToBackend } from "@/lib/server/backend";
import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

async function handle(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  return proxyToBackend(["api", "admin", ...path], request);
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE };
