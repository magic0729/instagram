import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE_NAME = "ji_token";

async function getRole(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return typeof payload.role === "string" ? payload.role : null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/creator")) {
    if (pathname === "/creator/login") return NextResponse.next();
    const role = await getRole(req);
    if (role !== "creator") return NextResponse.redirect(new URL("/creator/login", req.url));
  }

  if (pathname.startsWith("/brand")) {
    if (pathname === "/brand/login" || pathname === "/brand/register") return NextResponse.next();
    const role = await getRole(req);
    if (role !== "brand") return NextResponse.redirect(new URL("/brand/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/creator/:path*", "/brand/:path*"],
};

