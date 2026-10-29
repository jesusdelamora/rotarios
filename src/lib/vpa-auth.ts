import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signPayload, verifyPayload, SESSION_MAX_AGE } from "./session";
import type { RolVpa } from "@/data/vpa";

export const VPA_COOKIE = "rotarios_vpa";

export type SesionVpa = {
  rol: RolVpa;
  /** Solo para padres: id del alumno al que tienen acceso. */
  alumnoId?: string;
};

export async function getSesionVpa(): Promise<SesionVpa | null> {
  const store = await cookies();
  const p = await verifyPayload<SesionVpa & { exp: number }>(store.get(VPA_COOKIE)?.value);
  if (!p || !["rotario", "maestro", "papa"].includes(p.rol)) return null;
  return { rol: p.rol, alumnoId: p.alumnoId };
}

export async function setSesionVpa(sesion: SesionVpa): Promise<void> {
  const store = await cookies();
  store.set(VPA_COOKIE, await signPayload(sesion), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSesionVpa(): Promise<void> {
  const store = await cookies();
  store.delete(VPA_COOKIE);
}

/** Para páginas: exige sesión (y opcionalmente ciertos roles); si no, redirige al login. */
export async function requireVpa(roles?: RolVpa[]): Promise<SesionVpa> {
  const s = await getSesionVpa();
  if (!s) redirect("/aprender");
  if (roles && !roles.includes(s.rol)) redirect(s.rol === "papa" && s.alumnoId ? `/aprender/alumnos/${s.alumnoId}` : "/aprender/alumnos");
  return s;
}

/** Para server actions: lanza error si no hay sesión o el rol no está permitido. */
export async function assertVpa(roles?: RolVpa[]): Promise<SesionVpa> {
  const s = await getSesionVpa();
  if (!s) throw new Error("No autorizado");
  if (roles && !roles.includes(s.rol)) throw new Error("No autorizado");
  return s;
}

/** Un padre solo puede ver/editar al alumno de su sesión. */
export function puedeVerAlumno(s: SesionVpa, alumnoId: string): boolean {
  return s.rol !== "papa" || s.alumnoId === alumnoId;
}
