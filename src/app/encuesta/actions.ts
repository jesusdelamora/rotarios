"use server";

import { z } from "zod";
import { db, ensureSchema } from "@/db";
import { respuestas } from "@/db/schema";
import { SECCIONES, ITEMS_POR_SECCION } from "@/data/encuesta";

const schema = z.object({
  nombre: z.string().trim().max(120).optional(),
  cargo: z.string().trim().max(120).optional(),
  respuestas: z.record(z.string(), z.array(z.boolean()).length(ITEMS_POR_SECCION)),
  comentarios: z.record(z.string(), z.string().trim().max(3000)),
});

export type EnvioEncuesta = z.infer<typeof schema>;

export async function enviarRespuesta(payload: EnvioEncuesta): Promise<{ ok: true } | { error: string }> {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) return { error: "Los datos de la encuesta no son válidos." };
  const data = parsed.data;

  // Normaliza: solo secciones conocidas, siempre 15 booleanos.
  const resp: Record<string, boolean[]> = {};
  const com: Record<string, string> = {};
  for (const s of SECCIONES) {
    resp[s.id] = (data.respuestas[s.id] ?? []).slice(0, ITEMS_POR_SECCION).map(Boolean);
    while (resp[s.id].length < ITEMS_POR_SECCION) resp[s.id].push(false);
    com[s.id] = data.comentarios[s.id] ?? "";
  }

  try {
    await ensureSchema();
    await db.insert(respuestas).values({
      id: crypto.randomUUID(),
      creadoEn: new Date(),
      nombre: data.nombre || null,
      cargo: data.cargo || null,
      respuestas: JSON.stringify(resp),
      comentarios: JSON.stringify(com),
    });
  } catch (e) {
    console.error("Error al guardar la respuesta:", e);
    return { error: "No se pudo guardar tu respuesta. Intenta de nuevo en un momento." };
  }

  return { ok: true };
}
