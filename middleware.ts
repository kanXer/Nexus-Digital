import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "admin_session";

// Lightweight shape check: token.sig (64 hex chars token + "." + 64 hex sig).
// Full cryptographic validation happens server-side in the protected layout & API routes.
function looksLikeSignedToken(value: string | undefined): boolean {
  if (!value) return false;
  const dot = value.lastIndexOf(".");
  if (dot <= 0) return false;
  const token = value.slice(0, dot);
  const sig = value.slice(dot + 1);
  return /^[a-f0-9]{64}$/.test(token) && /^[a-f0-9]{64}$/.test(sig);
}

export function middleware(request: NextRequest) {
  // Protect all /admin routes except /admin (login page) and API routes needed for login
  const isProtectedAdminRoute = request.nextUrl.pathname.startsWith("/admin/") && !request.nextUrl.pathname.startsWith("/admin/login");
  const isProtectedApiRoute = request.nextUrl.pathname.startsWith("/api/admin/") &&
    !["/api/admin/login", "/api/admin/register", "/api/admin/session", "/api/admin/verify-admin"].includes(request.nextUrl.pathname);

  if (isProtectedAdminRoute || isProtectedApiRoute) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE);

    if (!looksLikeSignedToken(sessionCookie?.value)) {
      if (request.nextUrl.pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*"
  ]
};
