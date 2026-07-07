import { getAuthToken } from "@/lib/server/backend";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:59123";

/* Proxy /api/proxy/image?path=/uploads/... — hides backend origin from client */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const imagePath = url.searchParams.get("path");

  if (!imagePath) {
    return Response.json(
      { error: "Invalid path", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  // Normalize and block path traversal
  const normalizedPath = decodeURIComponent(imagePath).normalize("NFC");
  if (!normalizedPath.startsWith("/uploads/") || normalizedPath.includes("..")) {
    return Response.json(
      { error: "Invalid path", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const headers = new Headers();
  const token = await getAuthToken();
  if (token) headers.set("authorization", `Bearer ${token}`);

  const res = await fetch(`${BACKEND_URL}${imagePath}`, { headers });

  if (!res.ok) {
    return new Response(null, { status: res.status });
  }

  // Stream image bytes back with content-type from backend
  const responseHeaders = new Headers();
  const contentType = res.headers.get("content-type");
  if (contentType) responseHeaders.set("content-type", contentType);
  responseHeaders.set("Cache-Control", "private, max-age=3600");

  return new Response(res.body, {
    status: 200,
    headers: responseHeaders,
  });
}
