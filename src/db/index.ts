import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import { CLAVES_INICIALES } from "@/data/vpa";

const url = process.env.TURSO_DATABASE_URL ?? "file:local.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });

export const db = drizzle(client, { schema });
export { schema };

/**
 * Crea las tablas si no existen. Se ejecuta una vez por proceso, en el primer
 * acceso a la base. Así el deploy en Vercel/Turso no necesita un paso manual
 * de migración. Debe mantenerse en sincronía con ./schema.ts.
 */
let listo: Promise<void> | null = null;
export function ensureSchema(): Promise<void> {
  if (!listo) {
    listo = client
      .batch(
        [
          `CREATE TABLE IF NOT EXISTS respuestas (
            id TEXT PRIMARY KEY,
            creado_en INTEGER NOT NULL,
            nombre TEXT,
            cargo TEXT,
            respuestas TEXT NOT NULL,
            comentarios TEXT NOT NULL
          )`,
          `CREATE TABLE IF NOT EXISTS resumenes (
            id TEXT PRIMARY KEY,
            creado_en INTEGER NOT NULL,
            titulo TEXT NOT NULL,
            desde INTEGER,
            hasta INTEGER,
            total_respuestas INTEGER NOT NULL,
            contenido TEXT NOT NULL
          )`,
          // ---- Ver para aprender ----
          `CREATE TABLE IF NOT EXISTS vpa_accesos (
            rol TEXT PRIMARY KEY,
            clave TEXT NOT NULL,
            actualizado_en INTEGER NOT NULL
          )`,
          `CREATE TABLE IF NOT EXISTS vpa_alumnos (
            id TEXT PRIMARY KEY,
            folio TEXT NOT NULL UNIQUE,
            nombre TEXT NOT NULL,
            edad INTEGER,
            escuela TEXT,
            telefono TEXT,
            tutor TEXT,
            evaluador TEXT,
            creado_por TEXT NOT NULL,
            creado_en INTEGER NOT NULL,
            actualizado_en INTEGER NOT NULL
          )`,
          `CREATE TABLE IF NOT EXISTS vpa_cuestionarios (
            id TEXT PRIMARY KEY,
            alumno_id TEXT NOT NULL,
            fecha INTEGER NOT NULL,
            evaluador TEXT,
            respuestas TEXT NOT NULL,
            agudeza TEXT NOT NULL,
            observaciones TEXT,
            creado_por TEXT NOT NULL,
            creado_en INTEGER NOT NULL
          )`,
          `CREATE INDEX IF NOT EXISTS vpa_cuestionarios_alumno ON vpa_cuestionarios (alumno_id)`,
          // Claves de acceso iniciales (no sobrescribe las que ya existan)
          {
            sql: `INSERT OR IGNORE INTO vpa_accesos (rol, clave, actualizado_en) VALUES (?, ?, ?), (?, ?, ?), (?, ?, ?)`,
            args: [
              "rotario", CLAVES_INICIALES.rotario, Date.now(),
              "maestro", CLAVES_INICIALES.maestro, Date.now(),
              "papa", CLAVES_INICIALES.papa, Date.now(),
            ],
          },
        ],
        "write",
      )
      .then(() => undefined)
      .catch((e) => {
        listo = null; // permite reintentar en la siguiente petición
        throw e;
      });
  }
  return listo;
}
