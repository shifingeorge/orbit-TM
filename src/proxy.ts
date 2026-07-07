import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Must match SESSION_COOKIE in src/lib/session.ts. Proxy runs before route
// code and cannot import the server-only session module, so it re-declares
// the name and only checks for cookie *presence* (optimistic redirect).
// Real verification happens in the route handlers via requireSession().
const SESSION_COOKIE = "orbit_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (!hasSession && pathname !== "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run on page routes only; API routes self-guard with JSON 401/403.
  // Exclude the PWA manifest + icons so they stay publicly fetchable (the
  // browser loads them without our session cookie during install).
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|icon-192.png|icon-512.png).*)",
  ],
};
