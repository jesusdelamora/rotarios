import type { Client } from "@libsql/client";
import { hash } from "bcryptjs";
import { randomInt } from "node:crypto";

/**
 * Datos de prueba para "Ver para aprender": tres cuentas (una por rol), cinco alumnos
 * y varios cuestionarios. Es idempotente: alumnos y cuestionarios no se duplican; a las
 * cuentas de prueba se les asigna una contraseña nueva al azar en cada corrida.
 */

export type CuentaDemo = { usuario: string; password: string; rol: string; nombre: string };

const DIA = 24 * 60 * 60 * 1000;

const clave = (pref: string) => `${pref}-${randomInt(1000, 9999)}`;

const ESCUELA = "Primaria Benito Juárez";
const ALUMNOS = [
  { id: "demo-alumno-1", folio: "DEM2A3", nombre: "Sofía Ramírez López", edad: 8, tutor: "María Pérez", telefono: "844 100 0001" },
  { id: "demo-alumno-2", folio: "DEM2B4", nombre: "Mateo Ramírez López", edad: 10, tutor: "María Pérez", telefono: "844 100 0001" },
  { id: "demo-alumno-3", folio: "DEM2C5", nombre: "Valeria Torres Mendoza", edad: 7, tutor: "Ana Mendoza", telefono: "844 100 0003" },
  { id: "demo-alumno-4", folio: "DEM2D6", nombre: "Diego Hernández Soto", edad: 9, tutor: "Luis Hernández", telefono: "844 100 0004" },
  { id: "demo-alumno-5", folio: "DEM2E7", nombre: "Camila López Ruiz", edad: 6, tutor: "Rosa Ruiz", telefono: "844 100 0005" },
];

/** Los dos hijos de la mamá de prueba. */
const HIJOS_PAPA = ["demo-alumno-1", "demo-alumno-2"];

/** Respuestas de 20 preguntas: índices con "Sí"; el resto "No" salvo los sin contestar. */
function respuestas(si: number[], sinContestar: number[] = []) {
  return JSON.stringify(Array.from({ length: 20 }, (_, i) => (sinContestar.includes(i) ? null : si.includes(i))));
}
const agudezaVacia = JSON.stringify({ lejanaOD: "", lejanaOI: "", lejanaAO: "", cercanaOD: "", cercanaOI: "", cercanaAO: "" });
function agudeza(lejos: string, cerca: string) {
  return JSON.stringify({ lejanaOD: lejos, lejanaOI: lejos, lejanaAO: lejos, cercanaOD: cerca, cercanaOI: cerca, cercanaAO: cerca });
}

const CUESTIONARIOS = [
  // Sofía: dos evaluaciones, la primera de la maestra con agudeza, la segunda de la mamá.
  { id: "demo-c1", alumno: "demo-alumno-1", hace: 30, por: "demo-maestro", porNombre: "Laura Martínez", evaluador: "Laura Martínez",
    respuestas: respuestas([0, 2, 4, 8, 13, 14, 16, 18]), agudeza: agudeza("20/40", "20/30"),
    observaciones: "Se acerca mucho al cuaderno. Se sugiere valoración optométrica." },
  { id: "demo-c2", alumno: "demo-alumno-1", hace: 3, por: "demo-papa", porNombre: "María Pérez", evaluador: "María Pérez",
    respuestas: respuestas([0, 2, 8, 16]), agudeza: agudezaVacia, observaciones: null },
  // Mateo: sin síntomas.
  { id: "demo-c3", alumno: "demo-alumno-2", hace: 30, por: "demo-maestro", porNombre: "Laura Martínez", evaluador: "Laura Martínez",
    respuestas: respuestas([15]), agudeza: agudeza("20/20", "20/20"), observaciones: "Sin hallazgos." },
  // Valeria: muchos síntomas, caso para canalizar.
  { id: "demo-c4", alumno: "demo-alumno-3", hace: 14, por: "demo-rotario", porNombre: "Rotario de prueba", evaluador: "Dr. Jorge Villarreal",
    respuestas: respuestas([0, 1, 2, 3, 4, 5, 6, 8, 9, 12, 13, 14, 16, 17, 18, 19]), agudeza: agudeza("20/70", "20/50"),
    observaciones: "Posible miopía. Canalizar a oftalmología pediátrica." },
  // Diego: cuestionario incompleto.
  { id: "demo-c5", alumno: "demo-alumno-4", hace: 7, por: "demo-maestro", porNombre: "Laura Martínez", evaluador: "Laura Martínez",
    respuestas: respuestas([4, 5, 15], [17, 18, 19]), agudeza: agudeza("20/25", "20/20"), observaciones: null },
  // Camila: sin cuestionarios todavía.
];

export async function cargarDatosDemo(client: Client, log: (m: string) => void = () => {}): Promise<CuentaDemo[]> {
  const ahora = Date.now();
  const cuentas: CuentaDemo[] = [
    { usuario: "rotario.demo", nombre: "Rotario de prueba", rol: "rotario", password: clave("rotario") },
    { usuario: "maestro.demo", nombre: "Laura Martínez", rol: "maestro", password: clave("maestro") },
    { usuario: "papa.demo", nombre: "María Pérez", rol: "papa", password: clave("papa") },
  ];
  const ids: Record<string, string> = { "rotario.demo": "demo-rotario", "maestro.demo": "demo-maestro", "papa.demo": "demo-papa" };

  for (const u of cuentas) {
    await client.execute({
      sql: `INSERT INTO usuarios (id, usuario, nombre, rol, password_hash, activo, intentos_fallidos, creado_en) VALUES (?, ?, ?, ?, ?, 1, 0, ?)
            ON CONFLICT(usuario) DO UPDATE SET password_hash = excluded.password_hash, nombre = excluded.nombre, activo = 1, intentos_fallidos = 0, bloqueado_hasta = NULL`,
      args: [ids[u.usuario], u.usuario, u.nombre, u.rol, await hash(u.password, 10), ahora],
    });
    log(`cuenta   ${u.usuario.padEnd(14)} contraseña: ${u.password.padEnd(14)} (${u.rol})`);
  }

  const registro = ahora - 40 * DIA;
  for (const a of ALUMNOS) {
    const r = await client.execute({
      sql: `INSERT OR IGNORE INTO vpa_alumnos (id, folio, nombre, edad, escuela, telefono, tutor, evaluador, aviso_aceptado_en, creado_por, creado_por_nombre, creado_en, actualizado_en)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [a.id, a.folio, a.nombre, a.edad, ESCUELA, a.telefono, a.tutor, "Laura Martínez", registro, "demo-maestro", "Laura Martínez", registro, registro],
    });
    log(`${r.rowsAffected ? "creado " : "existía"}  alumno ${a.folio} ${a.nombre}`);
  }

  for (const alumnoId of HIJOS_PAPA) {
    await client.execute({ sql: "INSERT OR IGNORE INTO usuario_alumnos (usuario_id, alumno_id) VALUES (?, ?)", args: ["demo-papa", alumnoId] });
  }
  log("vinculados  papa.demo → Sofía y Mateo");

  for (const c of CUESTIONARIOS) {
    const fecha = ahora - c.hace * DIA;
    const r = await client.execute({
      sql: `INSERT OR IGNORE INTO vpa_cuestionarios (id, alumno_id, fecha, evaluador, respuestas, agudeza, observaciones, creado_por, creado_por_nombre, creado_en)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [c.id, c.alumno, fecha, c.evaluador, c.respuestas, c.agudeza, c.observaciones, c.por, c.porNombre, fecha],
    });
    log(`${r.rowsAffected ? "creado " : "existía"}  cuestionario ${c.id}`);
  }

  return cuentas;
}

/** Borra todo lo creado por `cargarDatosDemo` (cuentas, alumnos, vínculos y cuestionarios). */
export async function borrarDatosDemo(client: Client): Promise<void> {
  await client.batch(
    [
      "DELETE FROM vpa_cuestionarios WHERE id LIKE 'demo-c%' OR alumno_id LIKE 'demo-alumno-%'",
      "DELETE FROM usuario_alumnos WHERE usuario_id IN ('demo-rotario','demo-maestro','demo-papa') OR alumno_id LIKE 'demo-alumno-%'",
      "DELETE FROM vpa_alumnos WHERE id LIKE 'demo-alumno-%'",
      "DELETE FROM usuarios WHERE id IN ('demo-rotario','demo-maestro','demo-papa')",
    ],
    "write",
  );
}
