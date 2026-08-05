import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rotas que qualquer usuário autenticado pode acessar
const PUBLIC_ROUTES = ["/login", "/mfa", "/api/auth"];

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

export default auth((req: NextRequest & { auth: any }) => {
  const { pathname } = req.nextUrl;

  // Permite rotas públicas
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  if (isPublic) return NextResponse.next();

  // Usuário não autenticado
  if (!req.auth) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = (req.auth.user as any)?.role;

  // Raiz → redireciona para dashboard correto
  if (pathname === "/") {
    const dashboardUrl = ROLE_DEFAULT_ROUTES[role] || "/login";
    return NextResponse.redirect(new URL(dashboardUrl, req.url));
  }

  // Verifica se o usuário tem permissão para acessar a rota
  const allowedRoutes = ROLE_ROUTES[role] || [];
  const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route));

  if (!hasAccess) {
    const dashboardUrl = ROLE_DEFAULT_ROUTES[role] || "/login";
    return NextResponse.redirect(new URL(dashboardUrl, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
