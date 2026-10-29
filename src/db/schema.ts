import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const respuestas = sqliteTable("respuestas", {
  id: text("id").primaryKey(),
  creadoEn: integer("creado_en", { mode: "timestamp_ms" }).notNull(),
  nombre: text("nombre"),
  cargo: text("cargo"),
  /** JSON: { [seccionId]: boolean[] } */
  respuestas: text("respuestas").notNull(),
  /** JSON: { [seccionId]: string } */
  comentarios: text("comentarios").notNull(),
});

export const resumenes = sqliteTable("resumenes", {
  id: text("id").primaryKey(),
  creadoEn: integer("creado_en", { mode: "timestamp_ms" }).notNull(),
  titulo: text("titulo").notNull(),
  desde: integer("desde", { mode: "timestamp_ms" }),
  hasta: integer("hasta", { mode: "timestamp_ms" }),
  totalRespuestas: integer("total_respuestas").notNull(),
  /** JSON: ResumenContenido */
  contenido: text("contenido").notNull(),
});

export type RespuestaRow = typeof respuestas.$inferSelect;
export type ResumenRow = typeof resumenes.$inferSelect;

/* ---------- Ver para aprender ---------- */

export const vpaAccesos = sqliteTable("vpa_accesos", {
  rol: text("rol").primaryKey(), // rotario | maestro | papa
  clave: text("clave").notNull(),
  actualizadoEn: integer("actualizado_en", { mode: "timestamp_ms" }).notNull(),
});

export const vpaAlumnos = sqliteTable("vpa_alumnos", {
  id: text("id").primaryKey(),
  folio: text("folio").notNull().unique(),
  nombre: text("nombre").notNull(),
  edad: integer("edad"),
  escuela: text("escuela"),
  telefono: text("telefono"),
  tutor: text("tutor"),
  evaluador: text("evaluador"),
  creadoPor: text("creado_por").notNull(), // rol
  creadoEn: integer("creado_en", { mode: "timestamp_ms" }).notNull(),
  actualizadoEn: integer("actualizado_en", { mode: "timestamp_ms" }).notNull(),
});

export const vpaCuestionarios = sqliteTable("vpa_cuestionarios", {
  id: text("id").primaryKey(),
  alumnoId: text("alumno_id").notNull(),
  fecha: integer("fecha", { mode: "timestamp_ms" }).notNull(),
  evaluador: text("evaluador"),
  /** JSON: (boolean | null)[20] */
  respuestas: text("respuestas").notNull(),
  /** JSON: AgudezaVisual */
  agudeza: text("agudeza").notNull(),
  observaciones: text("observaciones"),
  creadoPor: text("creado_por").notNull(), // rol
  creadoEn: integer("creado_en", { mode: "timestamp_ms" }).notNull(),
});

export type VpaAlumnoRow = typeof vpaAlumnos.$inferSelect;
export type VpaCuestionarioRow = typeof vpaCuestionarios.$inferSelect;
