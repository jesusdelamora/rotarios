import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signPayload, verifyPayload, SESSION_MAX_AGE } from "./session";
import { getUsuario, type Rol } from "./usuarios";

export const SESSION_COOKIE = "rotarios_sesion";

export type Sesion = {
  id: string;
  usuario: string;
  nombre: string;
  rol: Rol;
};

type Payload = { uid: string; exp: number };

/** Lee la cookie y confirma contra la base que el usuario sigue activo. */
export async function getSesion(): Promise<Sesion | null> {
  const store = await cookies();
  const p = await verifyPayload<Payload>(store.get(SESSION_COOKIE)?.value);
  if (!p?.uid) return null;
  const u = await getUsuario(p.uid);
  if (!u || !u.activo) return null;
  return { id: u.id, usuario: u.usuario, nombre: u.nombre, rol: u.rol as Rol };
}

export async function setSesion(usuarioId: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, await signPayload({ uid: usuarioId }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSesion(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Página de inicio según el rol. */
export function inicioDeRol(rol: Rol): string {
  return rol === "rotario" ? "/" : rol === "maestro" ? "/aprender/alumnos" : "/aprender";
}

/** Para páginas: exige sesión y, opcionalmente, ciertos roles. */
export async function requireSesion(roles?: Rol[], next?: string): Promise<Sesion> {
  const s = await getSesion();
  if (!s) redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  if (roles && !roles.includes(s.rol)) redirect(inicioDeRol(s.rol));
  return s;
}

/** Para server actions y route handlers: lanza error si no hay sesión o el rol no aplica. */
export async function assertSesion(roles?: Rol[]): Promise<Sesion> {
  const s = await getSesion();
  if (!s) throw new Error("No autorizado");
  if (roles && !roles.includes(s.rol)) throw new Error("No autorizado");
  return s;
}

/* ---- Compatibilidad con el panel de la encuesta (solo rotarios) ---- */

export async function isAdmin(): Promise<boolean> {
  const s = await getSesion();
  return s?.rol === "rotario";
}

export async function requireAdmin(): Promise<Sesion> {
  return requireSesion(["rotario"], "/admin");
}

export async function assertAdmin(): Promise<Sesion> {
  return assertSesion(["rotario"]);
}
