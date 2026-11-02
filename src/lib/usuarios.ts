import { and, asc, eq, sql } from "drizzle-orm";
import { compare, hash } from "bcryptjs";
import { db, ensureSchema } from "@/db";
import { usuarios, usuarioAlumnos, vpaAlumnos, type UsuarioRow } from "@/db/schema";
import type { RolVpa } from "@/data/vpa";

export type Rol = RolVpa;
export const ROLES: Rol[] = ["rotario", "maestro", "papa"];

const MAX_INTENTOS = 5;
const BLOQUEO_MIN = 10;

export function normalizarUsuario(u: string): string {
  return u.trim().toLowerCase();
}

export async function hashPassword(p: string): Promise<string> {
  return hash(p, 10);
}

export async function getUsuarios(): Promise<UsuarioRow[]> {
  await ensureSchema();
  return db.select().from(usuarios).orderBy(asc(usuarios.rol), asc(usuarios.nombre));
}

export async function getUsuario(id: string): Promise<UsuarioRow | null> {
  await ensureSchema();
  const rows = await db.select().from(usuarios).where(eq(usuarios.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getUsuarioPorNombre(usuario: string): Promise<UsuarioRow | null> {
  await ensureSchema();
  const rows = await db.select().from(usuarios).where(eq(usuarios.usuario, normalizarUsuario(usuario))).limit(1);
  return rows[0] ?? null;
}

export type ResultadoLogin = { ok: true; usuario: UsuarioRow } | { ok: false; error: string };

/** Verifica usuario y contraseña, con bloqueo temporal tras varios intentos fallidos. */
export async function verificarCredenciales(usuario: string, password: string): Promise<ResultadoLogin> {
  const generico = "Usuario o contraseña incorrectos.";
  const u = await getUsuarioPorNombre(usuario);
  if (!u || !u.activo) return { ok: false, error: generico };

  if (u.bloqueadoHasta && u.bloqueadoHasta.getTime() > Date.now()) {
    const min = Math.ceil((u.bloqueadoHasta.getTime() - Date.now()) / 60000);
    return { ok: false, error: `Demasiados intentos. Espera ${min} minuto${min === 1 ? "" : "s"} e intenta de nuevo.` };
  }

  const coincide = await compare(password, u.passwordHash);
  if (!coincide) {
    const intentos = u.intentosFallidos + 1;
    await db
      .update(usuarios)
      .set({
        intentosFallidos: intentos >= MAX_INTENTOS ? 0 : intentos,
        bloqueadoHasta: intentos >= MAX_INTENTOS ? new Date(Date.now() + BLOQUEO_MIN * 60000) : null,
      })
      .where(eq(usuarios.id, u.id));
    return { ok: false, error: generico };
  }

  await db
    .update(usuarios)
    .set({ intentosFallidos: 0, bloqueadoHasta: null, ultimoAcceso: new Date() })
    .where(eq(usuarios.id, u.id));
  return { ok: true, usuario: u };
}

export async function getAlumnosDeUsuario(usuarioId: string): Promise<{ id: string; nombre: string; folio: string }[]> {
  await ensureSchema();
  return db
    .select({ id: vpaAlumnos.id, nombre: vpaAlumnos.nombre, folio: vpaAlumnos.folio })
    .from(usuarioAlumnos)
    .innerJoin(vpaAlumnos, eq(usuarioAlumnos.alumnoId, vpaAlumnos.id))
    .where(eq(usuarioAlumnos.usuarioId, usuarioId))
    .orderBy(asc(vpaAlumnos.nombre));
}

export async function getIdsAlumnosDeUsuario(usuarioId: string): Promise<string[]> {
  await ensureSchema();
  const rows = await db.select({ id: usuarioAlumnos.alumnoId }).from(usuarioAlumnos).where(eq(usuarioAlumnos.usuarioId, usuarioId));
  return rows.map((r) => r.id);
}

export async function vincularAlumno(usuarioId: string, alumnoId: string): Promise<void> {
  await db.insert(usuarioAlumnos).values({ usuarioId, alumnoId }).onConflictDoNothing();
}

export async function desvincularAlumno(usuarioId: string, alumnoId: string): Promise<void> {
  await db.delete(usuarioAlumnos).where(and(eq(usuarioAlumnos.usuarioId, usuarioId), eq(usuarioAlumnos.alumnoId, alumnoId)));
}

/** Padres vinculados a un alumno (para mostrarlos en la ficha). */
export async function getTutoresDeAlumno(alumnoId: string): Promise<{ id: string; nombre: string; usuario: string }[]> {
  await ensureSchema();
  return db
    .select({ id: usuarios.id, nombre: usuarios.nombre, usuario: usuarios.usuario })
    .from(usuarioAlumnos)
    .innerJoin(usuarios, eq(usuarioAlumnos.usuarioId, usuarios.id))
    .where(eq(usuarioAlumnos.alumnoId, alumnoId));
}

export async function contarRotariosActivos(): Promise<number> {
  const r = await db
    .select({ n: sql<number>`count(*)` })
    .from(usuarios)
    .where(and(eq(usuarios.rol, "rotario"), eq(usuarios.activo, true)));
  return Number(r[0]?.n ?? 0);
}
