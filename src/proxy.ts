import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyPayload } from "@/lib/session";

const COOKIE = "rotarios_sesion";

/**
 * Comprobación optimista de sesión: si no hay cookie válida, manda al login.
 * El rol y el estado del usuario se verifican en cada página y acción.
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const p = await verifyPayload<{ uid: string }>(request.cookies.get(COOKIE)?.value);
  const ok = !!p?.uid;

  if (pathname === "/login") {
    return NextResponse.next();
  }
  if (pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/login?next=/admin", request.url));
  }
  if (!ok) {
    if (pathname.startsWith("/api/")) return new NextResponse("No autorizado", { status: 401 });
    const next = encodeURIComponent(pathname + search);
    return NextResponse.redirect(new URL(`/login?next=${next}`, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/aprender/alumnos/:path*", "/usuarios/:path*", "/cuenta"],
};
