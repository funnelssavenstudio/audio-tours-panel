import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const PUBLIC_PATHS = ["/login", "/access-denied"];

const isPublicPath = (pathname: string) =>
  PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

const landingForRoles = (roles: string[]) => {
  if (roles.includes("administrator")) return "/backoffice";
  if (roles.includes("tour_guide")) return "/agent";
  return "/access-denied";
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (isPublicPath(pathname)) return;

  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const roles = session.user.roles ?? [];

  if (pathname === "/") {
    return NextResponse.redirect(new URL(landingForRoles(roles), req.url));
  }

  if (pathname.startsWith("/backoffice") && !roles.includes("administrator")) {
    return NextResponse.redirect(new URL("/access-denied", req.url));
  }

  if (
    pathname.startsWith("/agent") &&
    !roles.includes("tour_guide") &&
    !roles.includes("administrator")
  ) {
    return NextResponse.redirect(new URL("/access-denied", req.url));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|fonts).*)"],
};
