import { redirect } from "next/navigation";
import { getSesion, type Sesion } from "./auth";
import { getIdsAlumnosDeUsuario } from "./usuarios";
import type { RolVpa } from "@/data/vpa";

export type SesionVpa = Sesion & {
  /** Para padres: ids de los alumnos vinculados. */
  alumnoIds: string[];
};

export async function getSesionVpa(): Promise<SesionVpa | null> {
  const s = await getSesion();
  if (!s) return null;
  const alumnoIds = s.rol === "papa" ? await getIdsAlumnosDeUsuario(s.id) : [];
  return { ...s, alumnoIds };
}

/** Para páginas: exige sesión (y opcionalmente ciertos roles); si no, redirige al login. */
export async function requireVpa(roles?: RolVpa[], next = "/aprender"): Promise<SesionVpa> {
  const s = await getSesionVpa();
  if (!s) redirect(`/login?next=${encodeURIComponent(next)}`);
  if (roles && !roles.includes(s.rol)) redirect("/aprender");
  return s;
}

/** Para server actions: lanza error si no hay sesión o el rol no está permitido. */
export async function assertVpa(roles?: RolVpa[]): Promise<SesionVpa> {
  const s = await getSesionVpa();
  if (!s) throw new Error("No autorizado");
  if (roles && !roles.includes(s.rol)) throw new Error("No autorizado");
  return s;
}

/** Un padre solo puede ver/editar a los alumnos vinculados a su cuenta. */
export function puedeVerAlumno(s: SesionVpa, alumnoId: string): boolean {
  return s.rol !== "papa" || s.alumnoIds.includes(alumnoId);
}
