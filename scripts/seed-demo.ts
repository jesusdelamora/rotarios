/**
 * Carga datos de prueba para "Ver para aprender": tres cuentas (una por rol),
 * cinco alumnos y varios cuestionarios. Es idempotente: si ya existen, no los duplica.
 *
 *   Local:       npm run seed:demo
 *   Producción:  vercel env pull --environment production .env.production.local
 *                npm run seed:demo -- --env .env.production.local
 *
 * Las contraseñas de las cuentas de prueba se generan al azar en cada corrida y se imprimen.
 * Opcional: --admin-password <nueva>  restablece la contraseña del usuario `admin`.
 */
import { createClient } from "@libsql/client";
import { hash } from "bcryptjs";
import { readFileSync } from "node:fs";
import { randomInt } from "node:crypto";

function leerEnv(ruta: string) {
  for (const linea of readFileSync(ruta, "utf8").split("\n")) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const v = m[2].replace(/^"(.*)"$/, "$1");
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
}

const args = process.argv.slice(2);
const envIdx = args.indexOf("--env");
leerEnv(envIdx >= 0 ? args[envIdx + 1] : ".env");
const adminIdx = args.indexOf("--admin-password");
const nuevaAdmin = adminIdx >= 0 ? args[adminIdx + 1] : null;

const url = process.env.TURSO_DATABASE_URL ?? "file:local.db";
const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
console.log(`Base: ${url.startsWith("file:") ? url : url.replace(/\/\/.*@/, "//")}`);

const ahora = Date.now();
const dia = 24 * 60 * 60 * 1000;

const clave = (pref: string) => `${pref}-${randomInt(1000, 9999)}`;
const USUARIOS = [
  { id: "demo-rotario", usuario: "rotario.demo", nombre: "Rotario de prueba", rol: "rotario", password: clave("rotario") },
  { id: "demo-maestro", usuario: "maestro.demo", nombre: "Laura Martínez (maestra)", rol: "maestro", password: clave("maestro") },
  { id: "demo-papa", usuario: "papa.demo", nombre: "María Pérez (mamá)", rol: "papa", password: clave("papa") },
];

const ESCUELA = "Primaria Benito Juárez";
const ALUMNOS = [
  { id: "demo-alumno-1", folio: "DEM2A3", nombre: "Sofía Ramírez López", edad: 8, tutor: "María Pérez", telefono: "844 100 0001" },
  { id: "demo-alumno-2", folio: "DEM2B4", nombre: "Mateo Ramírez López", edad: 10, tutor: "María Pérez", telefono: "844 100 0001" },
  { id: "demo-alumno-3", folio: "DEM2C5", nombre: "Valeria Torres Mendoza", edad: 7, tutor: "Ana Mendoza", telefono: "844 100 0003" },
  { id: "demo-alumno-4", folio: "DEM2D6", nombre: "Diego Hernández Soto", edad: 9, tutor: "Luis Hernández", telefono: "844 100 0004" },
  { id: "demo-alumno-5", folio: "DEM2E7", nombre: "Camila López Ruiz", edad: 6, tutor: "Rosa Ruiz", telefono: "844 100 0005" },
];

// Los dos hijos de la mamá de prueba.
const HIJOS_PAPA = ["demo-alumno-1", "demo-alumno-2"];

/** Respuestas de 20 preguntas: índices con "Sí". */
function respuestas(si: number[], sinContestar: number[] = []) {
  return JSON.stringify(
    Array.from({ length: 20 }, (_, i) => (sinContestar.includes(i) ? null : si.includes(i))),
  );
}
const agudezaVacia = JSON.stringify({ lejanaOD: "", lejanaOI: "", lejanaAO: "", cercanaOD: "", cercanaOI: "", cercanaAO: "" });
function agudeza(lejos: string, cerca: string) {
  return JSON.stringify({ lejanaOD: lejos, lejanaOI: lejos, lejanaAO: lejos, cercanaOD: cerca, cercanaOI: cerca, cercanaAO: cerca });
}

const CUESTIONARIOS = [
  // Sofía: dos evaluaciones, la primera de la maestra con agudeza, la segunda de la mamá.
  { id: "demo-c1", alumno: "demo-alumno-1", hace: 30, por: "demo-maestro", porNombre: "Laura Martínez (maestra)", evaluador: "Laura Martínez",
    respuestas: respuestas([0, 2, 4, 8, 13, 14, 16, 18]), agudeza: agudeza("20/40", "20/30"),
    observaciones: "Se acerca mucho al cuaderno. Se sugiere valoración optométrica." },
  { id: "demo-c2", alumno: "demo-alumno-1", hace: 3, por: "demo-papa", porNombre: "María Pérez (mamá)", evaluador: "María Pérez",
    respuestas: respuestas([0, 2, 8, 16]), agudeza: agudezaVacia, observaciones: null },
  // Mateo: sin síntomas.
  { id: "demo-c3", alumno: "demo-alumno-2", hace: 30, por: "demo-maestro", porNombre: "Laura Martínez (maestra)", evaluador: "Laura Martínez",
    respuestas: respuestas([15]), agudeza: agudeza("20/20", "20/20"), observaciones: "Sin hallazgos." },
  // Valeria: muchos síntomas, caso para canalizar.
  { id: "demo-c4", alumno: "demo-alumno-3", hace: 14, por: "demo-rotario", porNombre: "Rotario de prueba", evaluador: "Dr. Jorge Villarreal",
    respuestas: respuestas([0, 1, 2, 3, 4, 5, 6, 8, 9, 12, 13, 14, 16, 17, 18, 19]), agudeza: agudeza("20/70", "20/50"),
    observaciones: "Posible miopía. Canalizar a oftalmología pediátrica." },
  // Diego: cuestionario incompleto.
  { id: "demo-c5", alumno: "demo-alumno-4", hace: 7, por: "demo-maestro", porNombre: "Laura Martínez (maestra)", evaluador: "Laura Martínez",
    respuestas: respuestas([4, 5, 15], [17, 18, 19]), agudeza: agudeza("20/25", "20/20"), observaciones: null },
  // Camila: sin cuestionarios todavía.
];

async function main() {
  const tablas = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('usuarios','vpa_alumnos','vpa_cuestionarios','usuario_alumnos')");
  if (tablas.rows.length < 4) {
    console.error("Faltan tablas. Abre la app una vez (crea las tablas sola) y vuelve a correr el script.");
    process.exit(1);
  }

  for (const u of USUARIOS) {
    await client.execute({
      sql: `INSERT INTO usuarios (id, usuario, nombre, rol, password_hash, activo, intentos_fallidos, creado_en) VALUES (?, ?, ?, ?, ?, 1, 0, ?)
            ON CONFLICT(usuario) DO UPDATE SET password_hash = excluded.password_hash, activo = 1, intentos_fallidos = 0, bloqueado_hasta = NULL`,
      args: [u.id, u.usuario, u.nombre, u.rol, await hash(u.password, 10), ahora],
    });
    console.log(`cuenta   ${u.usuario.padEnd(14)} contraseña: ${u.password.padEnd(14)} (${u.rol})`);
  }

  for (const a of ALUMNOS) {
    const r = await client.execute({
      sql: `INSERT OR IGNORE INTO vpa_alumnos (id, folio, nombre, edad, escuela, telefono, tutor, evaluador, aviso_aceptado_en, creado_por, creado_por_nombre, creado_en, actualizado_en)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [a.id, a.folio, a.nombre, a.edad, ESCUELA, a.telefono, a.tutor, "Laura Martínez", ahora - 40 * dia, "demo-maestro", "Laura Martínez (maestra)", ahora - 40 * dia, ahora - 40 * dia],
    });
    console.log(`${r.rowsAffected ? "creado " : "existía"}  alumno ${a.folio} ${a.nombre}`);
  }

  for (const alumnoId of HIJOS_PAPA) {
    await client.execute({ sql: "INSERT OR IGNORE INTO usuario_alumnos (usuario_id, alumno_id) VALUES (?, ?)", args: ["demo-papa", alumnoId] });
  }
  console.log("vinculados  papa.demo → Sofía y Mateo");

  for (const c of CUESTIONARIOS) {
    const fecha = ahora - c.hace * dia;
    const r = await client.execute({
      sql: `INSERT OR IGNORE INTO vpa_cuestionarios (id, alumno_id, fecha, evaluador, respuestas, agudeza, observaciones, creado_por, creado_por_nombre, creado_en)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [c.id, c.alumno, fecha, c.evaluador, c.respuestas, c.agudeza, c.observaciones, c.por, c.porNombre, fecha],
    });
    console.log(`${r.rowsAffected ? "creado " : "existía"}  cuestionario ${c.id}`);
  }

  if (nuevaAdmin) {
    const r = await client.execute({
      sql: "UPDATE usuarios SET password_hash = ?, intentos_fallidos = 0, bloqueado_hasta = NULL, activo = 1 WHERE usuario = 'admin'",
      args: [await hash(nuevaAdmin, 10)],
    });
    console.log(r.rowsAffected ? "contraseña de admin restablecida" : "no existe el usuario admin (abre la app una vez para que se cree)");
  }
  console.log("Listo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
