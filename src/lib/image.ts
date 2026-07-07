/* Build proxied image URL that hides backend origin.
   Backend already serves optimized WebP, so callers should pair with `unoptimized`. */
export function proxiedImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `/api/proxy/image?path=${encodeURIComponent(path)}`;
}
