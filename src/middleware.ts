import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public API paths that don't require authentication
  const publicApiPaths = ["/api/auth/login", "/api/auth/register"];
  const isPublicApiPath = publicApiPaths.some((path) =>
    pathname.startsWith(path)
  );

  // Check if it's an API route
  if (pathname.startsWith("/api")) {
    // Allow public API paths
    if (isPublicApiPath) {
      return NextResponse.next();
    }

    // For protected API routes, check authentication cookie
    const authToken = request.cookies.get("auth-token");

    if (!authToken) {
      return NextResponse.json(
        { error: "Unauthorized - please log in" },
        { status: 401 }
      );
    }

    return NextResponse.next();
  }

  // For non-API routes, let client-side AuthGuard handle it
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
