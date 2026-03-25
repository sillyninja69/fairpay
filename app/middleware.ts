import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "./src/lib/auth";

const PROTECTED_PATHS = ["/post-job", "/jobs", "/job"];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PATHS.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

  if (!isProtected) {
    return NextResponse.next();
  }

  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);
  if (hasSession) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", path);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/post-job/:path*", "/jobs/:path*", "/job/:path*"],
};
