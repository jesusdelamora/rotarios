import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { db, ensureSchema } from "@/db";
import { vpaAccesos, vpaAlumnos, vpaCuestionarios, type VpaAlumnoRow, type VpaCuestionarioRow } from "@/db/schema";
import { AGUDEZA_VACIA, TOTAL_PREGUNTAS_VPA, type AgudezaVisual, type RespuestasVpa, type RolVpa } from "@/data/vpa";

export async function getClaves(): Promise<Record<RolVpa, string>> {
  await ensureSchema();
  const rows = await db.select().from(vpaAccesos);
  const out = { rotario: "", maestro: "", papa: "" } as Record<RolVpa, string>;
  for (const r of rows) out[r.rol as RolVpa] = r.clave;
  return out;
}

export async function rolPorClave(clave: string): Promise<RolVpa | null> {
  const claves = await getClaves();
  const c = clave.trim();
  if (!c) return null;
  for (const rol of ["rotario", "maestro", "papa"] as RolVpa[]) {
    if (claves[rol] && claves[rol] === c) return rol;
  }
  return null;
}

export async function getAlumnos(opts?: { buscar?: string }): Promise<(VpaAlumnoRow & { cuestionarios: number })[]> {
  await ensureSchema();
  const q = opts?.buscar?.trim();
  const where = q
    ? or(like(vpaAlumnos.nombre, `%${q}%`), like(vpaAlumnos.escuela, `%${q}%`), like(vpaAlumnos.folio, `%${q.toUpperCase()}%`))
    : undefined;
  const rows = await db
    .select({
      alumno: vpaAlumnos,
      cuestionarios: sql<number>`(SELECT count(*) FROM vpa_cuestionarios c WHERE c.alumno_id = ${vpaAlumnos.id})`,
    })
    .from(vpaAlumnos)
    .where(where)
    .orderBy(desc(vpaAlumnos.actualizadoEn));
  return rows.map((r) => ({ ...r.alumno, cuestionarios: Number(r.cuestionarios) }));
}

export async function getAlumno(id: string): Promise<VpaAlumnoRow | null> {
  await ensureSchema();
  const rows = await db.select().from(vpaAlumnos).where(eq(vpaAlumnos.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function getAlumnoPorFolio(folio: string): Promise<VpaAlumnoRow | null> {
  await ensureSchema();
  const f = folio.trim().toUpperCase();
  if (!f) return null;
  const rows = await db.select().from(vpaAlumnos).where(eq(vpaAlumnos.folio, f)).limit(1);
  return rows[0] ?? null;
}

export type CuestionarioParsed = Omit<VpaCuestionarioRow, "respuestas" | "agudeza"> & {
  respuestas: RespuestasVpa;
  agudeza: AgudezaVisual;
  totalSi: number;
};

export function parseCuestionario(row: VpaCuestionarioRow): CuestionarioParsed {
  let respuestas: RespuestasVpa = [];
  let agudeza: AgudezaVisual = { ...AGUDEZA_VACIA };
  try {
    respuestas = JSON.parse(row.respuestas) as RespuestasVpa;
  } catch {
    /* vacío */
  }
  try {
    agudeza = { ...AGUDEZA_VACIA, ...(JSON.parse(row.agudeza) as Partial<AgudezaVisual>) };
  } catch {
    /* vacío */
  }
  while (respuestas.length < TOTAL_PREGUNTAS_VPA) respuestas.push(null);
  return { ...row, respuestas, agudeza, totalSi: respuestas.filter((r) => r === true).length };
}

export async function getCuestionariosDeAlumno(alumnoId: string): Promise<CuestionarioParsed[]> {
  await ensureSchema();
  const rows = await db
    .select()
    .from(vpaCuestionarios)
    .where(eq(vpaCuestionarios.alumnoId, alumnoId))
    .orderBy(desc(vpaCuestionarios.fecha));
  return rows.map(parseCuestionario);
}

export async function getCuestionario(id: string): Promise<CuestionarioParsed | null> {
  await ensureSchema();
  const rows = await db.select().from(vpaCuestionarios).where(eq(vpaCuestionarios.id, id)).limit(1);
  return rows[0] ? parseCuestionario(rows[0]) : null;
}

export async function getCuestionarioDeAlumno(alumnoId: string, id: string): Promise<CuestionarioParsed | null> {
  await ensureSchema();
  const rows = await db
    .select()
    .from(vpaCuestionarios)
    .where(and(eq(vpaCuestionarios.id, id), eq(vpaCuestionarios.alumnoId, alumnoId)))
    .limit(1);
  return rows[0] ? parseCuestionario(rows[0]) : null;
}
