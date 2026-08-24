import { NextResponse, type NextRequest } from "next/server";

import { authenticated } from "@/lib/auth/server";

export async function middleware(request: NextRequest) {
  if (await authenticated(request.headers)) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", `${request.nextUrl.pathname}${request.nextUrl.search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/purchases/:path*", "/tickets/:path*", "/movies/:path*"],
};
