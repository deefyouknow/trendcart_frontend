import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:59123";
export const AUTH_COOKIE = "tc_token";
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function buildAuthCookie(token: string): string {
  const isProd = process.env.NODE_ENV === "production";
  const parts = [
    `${AUTH_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${AUTH_COOKIE_MAX_AGE}`,
  ];
  if (isProd) parts.push("Secure");
  return parts.join("; ");
}

export function clearAuthCookie(): string {
  return `${AUTH_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value ?? null;
}

/* Build backend URL from incoming request path + query */
export function buildBackendUrl(pathSegments: string[], search: string): string {
  const path = "/" + pathSegments.filter(Boolean).join("/");
  return `${BACKEND_URL}${path}${search}`;
}

/* Build init for fetch(): method, headers (auth + content-type), body */
export async function buildBackendInit(
  request: Request,
  passthroughBody: boolean
): Promise<RequestInit> {
  const headers = new Headers();

  const ct = request.headers.get("content-type");
  if (ct) headers.set("content-type", ct);

  const token = await getAuthToken();
  if (token) headers.set("authorization", `Bearer ${token}`);

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (passthroughBody && request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
    // @ts-expect-error duplex required for streaming body in Node 18+
    init.duplex = "half";
  }

  return init;
}

/* Forward request to backend and return raw Response (passthrough) */
export async function proxyToBackend(
  pathSegments: string[],
  request: Request
): Promise<Response> {
  const url = new URL(request.url);
  const backendUrl = buildBackendUrl(pathSegments, url.search);
  const init = await buildBackendInit(request, true);

  const res = await fetch(backendUrl, init);

  // Stream response back, keep only content-type (drop hop-by-hop headers)
  const responseHeaders = new Headers();
  const contentType = res.headers.get("content-type");
  if (contentType) responseHeaders.set("content-type", contentType);
  
  const location = res.headers.get("location");
  if (location) responseHeaders.set("location", location);

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
  });
}

/* Forward auth-related request; if response body has a token, set httpOnly cookie */
export async function proxyAuthRoute(
  pathSegments: string[],
  request: Request
): Promise<Response> {
  const url = new URL(request.url);
  const backendUrl = buildBackendUrl(pathSegments, url.search);
  const init = await buildBackendInit(request, true);

  const res = await fetch(backendUrl, init);
  const responseHeaders = new Headers();
  const contentType = res.headers.get("content-type");
  if (contentType) responseHeaders.set("content-type", contentType);

  if (res.ok) {
    const cloned = res.clone();
    try {
      const body = (await cloned.json()) as { token?: string };
      if (body.token) {
        responseHeaders.append("Set-Cookie", buildAuthCookie(body.token));
      }
    } catch {
      // non-JSON response, ignore
    }
  }

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
  });
}
