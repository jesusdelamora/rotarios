import { isAdmin } from "@/lib/auth";
import { getRespuestas } from "@/lib/queries";
import { puntajeSeccion } from "@/lib/stats";
import { SECCIONES } from "@/data/encuesta";

export const dynamic = "force-dynamic";

function celda(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  if (!(await isAdmin())) return new Response("No autorizado", { status: 401 });
  const rs = await getRespuestas();

  const encabezado = [
    "id",
    "fecha",
    "nombre",
    "cargo",
    ...SECCIONES.map((s) => `puntaje_${s.id}`),
    ...SECCIONES.flatMap((s) => s.items.map((_, i) => `${s.id}_${i + 1}`)),
    ...SECCIONES.map((s) => `comentario_${s.id}`),
  ];
  const filas = rs.map((r) => [
    r.id,
    r.creadoEn.toISOString(),
    r.nombre ?? "",
    r.cargo ?? "",
    ...SECCIONES.map((s) => puntajeSeccion(r.respuestas, s.id)),
    ...SECCIONES.flatMap((s) => s.items.map((_, i) => (r.respuestas[s.id]?.[i] ? 1 : 0))),
    ...SECCIONES.map((s) => r.comentarios[s.id] ?? ""),
  ]);
  const csv = "﻿" + [encabezado, ...filas].map((f) => f.map(celda).join(",")).join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="encuesta-salud-club-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
