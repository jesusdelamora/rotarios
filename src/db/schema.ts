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
