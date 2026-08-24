import { NextResponse, type NextRequest } from "next/server";

const apiEndpoint = "http://localhost:3000";

export async function middleware(request: NextRequest) {
  const authResponse = await fetch(`${apiEndpoint}/auth/state`, {
    method: "GET",
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  }).catch(() => null);

  if (authResponse?.ok) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", `${request.nextUrl.pathname}${request.nextUrl.search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/purchases/:path*", "/tickets/:path*"],
};
