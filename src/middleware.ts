import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Rotas que qualquer usuário autenticado pode acessar
const PUBLIC_ROUTES = ["/login", "/mfa", "/api/auth", "/api/debug"];

// Mapeamento de rotas por role
const ROLE_ROUTES: Record<string, string[]> = {
  ADMIN: ["/admin", "/secretary", "/teacher", "/parent", "/student"],
  SECRETARY: ["/secretary", "/student"],
  TEACHER: ["/teacher"],
  PARENT: ["/parent"],
  STUDENT: ["/student"],
};

// Redirecionamento padrão por role
const ROLE_DEFAULT_ROUTES: Record<string, string> = {
  ADMIN: "/admin",
  SECRETARY: "/secretary",
  TEACHER: "/teacher",
  PARENT: "/parent",
  STUDENT: "/student",
};

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  if (isPublic) return NextResponse.next();

  const token = await getToken({ req, secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "cepi-super-secret-key-change-in-production-2024" });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string;

  if (pathname === "/") {
    const dashboardUrl = ROLE_DEFAULT_ROUTES[role] || "/login";
    return NextResponse.redirect(new URL(dashboardUrl, req.url));
  }

  const allowedRoutes = ROLE_ROUTES[role] || [];
  const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route));

  if (!hasAccess) {
    const dashboardUrl = ROLE_DEFAULT_ROUTES[role] || "/login";
    return NextResponse.redirect(new URL(dashboardUrl, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
