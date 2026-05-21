import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "admin_session";
const SESSION_TOKEN = "cuc-admin-nvillami-2026";

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const session = req.cookies.get(SESSION_COOKIE);
    if (session?.value !== SESSION_TOKEN) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
