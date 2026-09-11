import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

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
