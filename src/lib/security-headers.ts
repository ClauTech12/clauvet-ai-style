// Security headers applied to every response, added at the single
// choke-point in server.ts so nothing can accidentally skip them.
//
// Note on Content-Security-Policy: script-src includes 'unsafe-inline'
// deliberately conservative — SSR frameworks like TanStack Start commonly
// inject a small inline hydration script, and getting this wrong would
// break the entire app (blank page) with no easy way to detect it without
// a real browser. Every other directive is locked down as tightly as the
// app's actual external dependencies (Google Fonts, Supabase, Sentry,
// Unsplash) allow. If something on the site stops working after this
// ships, check the browser console for a CSP violation message first —
// it will name the exact blocked resource.

const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co",
  "connect-src 'self' https://*.supabase.co https://*.sentry.io https://*.ingest.de.sentry.io https://*.ingest.sentry.io",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

export function applySecurityHeaders(response: Response, request: Request): Response {
  const headers = new Headers(response.headers);

  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  headers.set("Content-Security-Policy", CSP_DIRECTIVES);

  // Only set HSTS over an actual HTTPS connection — setting it on plain
  // http:// (e.g. local Workers preview) has no effect but is cleaner to
  // just skip entirely.
  if (new URL(request.url).protocol === "https:") {
    headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
