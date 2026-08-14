import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Gates everything under /admin except the login page itself.
 * Runs on the Edge runtime — keep this file free of Node-only imports
 * (no Prisma, no bcrypt); auth() reads the JWT session cookie only.
 */
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  const isProtectedAdminRoute = pathname.startsWith("/admin") && !isLoginPage;

  if (isProtectedAdminRoute && !req.auth) {
    const loginUrl = new URL("/admin/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin API routes get the same treatment — a missing session should
  // 401, not silently fall through to a Prisma call.
  const isProtectedApiRoute =
    pathname.startsWith("/api/projects") ||
    pathname.startsWith("/api/blog") ||
    pathname.startsWith("/api/embeddings") ||
    pathname.startsWith("/api/upload");
  const isMutation = req.method !== "GET";

  if (isProtectedApiRoute && isMutation && !req.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
});

export const config = {
  matcher: ["/admin/:path*", "/api/projects/:path*", "/api/blog/:path*", "/api/embeddings/:path*", "/api/upload/:path*"],
};
