import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";
import { hash } from "bcryptjs";

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
          // ---- Usuarios ----
          `CREATE TABLE IF NOT EXISTS usuarios (
            id TEXT PRIMARY KEY,
            usuario TEXT NOT NULL UNIQUE,
            nombre TEXT NOT NULL,
            rol TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            activo INTEGER NOT NULL DEFAULT 1,
            intentos_fallidos INTEGER NOT NULL DEFAULT 0,
            bloqueado_hasta INTEGER,
            creado_en INTEGER NOT NULL,
            ultimo_acceso INTEGER
          )`,
          `CREATE TABLE IF NOT EXISTS usuario_alumnos (
            usuario_id TEXT NOT NULL,
            alumno_id TEXT NOT NULL,
            PRIMARY KEY (usuario_id, alumno_id)
          )`,
          // ---- Ver para aprender ----
          `CREATE TABLE IF NOT EXISTS vpa_alumnos (
            id TEXT PRIMARY KEY,
            folio TEXT NOT NULL UNIQUE,
            nombre TEXT NOT NULL,
            edad INTEGER,
            escuela TEXT,
            telefono TEXT,
            tutor TEXT,
            evaluador TEXT,
            aviso_aceptado_en INTEGER,
            creado_por TEXT NOT NULL,
            creado_por_nombre TEXT,
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
            creado_por_nombre TEXT,
            creado_en INTEGER NOT NULL
          )`,
          `CREATE INDEX IF NOT EXISTS vpa_cuestionarios_alumno ON vpa_cuestionarios (alumno_id)`,
        ],
        "write",
      )
      .then(() => seedAdmin())
      .catch((e) => {
        listo = null; // permite reintentar en la siguiente petición
        throw e;
      });
  }
  return listo;
}

/**
 * Si no existe ningún usuario, crea el rotario inicial `admin` con la contraseña
 * de ADMIN_PASSWORD (o "admin2026" si no está definida). Cámbiala desde "Mi cuenta".
 */
async function seedAdmin(): Promise<void> {
  const r = await client.execute("SELECT count(*) AS n FROM usuarios");
  if (Number(r.rows[0]?.n ?? 0) > 0) return;
  const password = (process.env.ADMIN_PASSWORD || "admin2026").trim();
  await client.execute({
    sql: "INSERT OR IGNORE INTO usuarios (id, usuario, nombre, rol, password_hash, activo, intentos_fallidos, creado_en) VALUES (?, ?, ?, ?, ?, 1, 0, ?)",
    args: [crypto.randomUUID(), "admin", "Administrador", "rotario", await hash(password, 10), Date.now()],
  });
}
