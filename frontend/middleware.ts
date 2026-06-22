import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Accessible without logging in
const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password"];
// Logged-in users don't need these — send them to the app
const AUTH_REDIRECT_PATHS = ["/login", "/register", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has("fuel_session");

  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  // Unauthenticated user trying to access a protected page → login
  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user on login/register/forgot-password → dashboard
  // Note: "/" (landing page) is intentionally NOT in this list — anyone can view it
  const isAuthPage = AUTH_REDIRECT_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
