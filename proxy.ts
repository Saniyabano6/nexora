import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = ["/workspace", "/profile", "/settings"];
const ADMIN_PATHS = ["/admin"];

const matches = (pathname: string, paths: string[]) =>
  paths.some((p) => pathname === p || pathname.startsWith(p + "/"));

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value; // e.g. "admin" | "user"

  const isProtected = matches(pathname, PROTECTED_PATHS);
  const isAdmin = matches(pathname, ADMIN_PATHS);

  // Login nahi hai -> /login, aur wapas aane ke liye redirect param
  if ((isProtected || isAdmin) && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin path pe sirf admin role
  if (isAdmin && role !== "admin") {
    return NextResponse.redirect(new URL("/workspace", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/workspace/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/admin/:path*",
  ],
};