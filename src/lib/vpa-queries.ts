import { and, desc, eq, inArray, like, or, sql } from "drizzle-orm";
import { db, ensureSchema } from "@/db";
import { vpaAlumnos, vpaCuestionarios, type VpaAlumnoRow, type VpaCuestionarioRow } from "@/db/schema";
import { AGUDEZA_VACIA, TOTAL_PREGUNTAS_VPA, type AgudezaVisual, type RespuestasVpa } from "@/data/vpa";

export async function getAlumnos(opts?: {
  buscar?: string;
  /** Si se indica, solo estos alumnos (para padres). Lista vacía => sin resultados. */
  soloIds?: string[];
}): Promise<(VpaAlumnoRow & { cuestionarios: number })[]> {
  await ensureSchema();
  if (opts?.soloIds && opts.soloIds.length === 0) return [];
  const q = opts?.buscar?.trim();
  const conds = [];
  if (q) conds.push(or(like(vpaAlumnos.nombre, `%${q}%`), like(vpaAlumnos.escuela, `%${q}%`), like(vpaAlumnos.folio, `%${q.toUpperCase()}%`)));
  if (opts?.soloIds) conds.push(inArray(vpaAlumnos.id, opts.soloIds));
  const where = conds.length ? and(...conds) : undefined;
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
