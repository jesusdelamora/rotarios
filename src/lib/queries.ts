import { and, desc, gte, lte, eq } from "drizzle-orm";
import { db, ensureSchema } from "@/db";
import { respuestas, resumenes } from "@/db/schema";
import { parseRespuesta, type RespuestaParsed } from "./stats";

export async function getRespuestas(opts?: {
  desde?: Date;
  hasta?: Date;
}): Promise<RespuestaParsed[]> {
  await ensureSchema();
  const conds = [];
  if (opts?.desde) conds.push(gte(respuestas.creadoEn, opts.desde));
  if (opts?.hasta) conds.push(lte(respuestas.creadoEn, opts.hasta));
  const rows = await db
    .select()
    .from(respuestas)
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(desc(respuestas.creadoEn));
  return rows.map(parseRespuesta);
}

export async function getRespuesta(id: string): Promise<RespuestaParsed | null> {
  await ensureSchema();
  const rows = await db.select().from(respuestas).where(eq(respuestas.id, id)).limit(1);
  return rows[0] ? parseRespuesta(rows[0]) : null;
}

export async function getResumenes() {
  await ensureSchema();
  return db.select().from(resumenes).orderBy(desc(resumenes.creadoEn));
}

export async function getResumen(id: string) {
  await ensureSchema();
  const rows = await db.select().from(resumenes).where(eq(resumenes.id, id)).limit(1);
  return rows[0] ?? null;
}
