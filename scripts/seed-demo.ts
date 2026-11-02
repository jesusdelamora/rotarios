/**
 * Carga los datos de prueba de "Ver para aprender" (ver src/lib/seed-demo.ts) en la base
 * que indiquen las variables de entorno. Las contraseñas de las cuentas de prueba se
 * generan al azar en cada corrida y se imprimen.
 *
 *   npm run seed:demo                       # base local (.env)
 *   npm run seed:demo -- --env otro.env     # otra base
 *   npm run seed:demo -- --borrar           # elimina los datos de prueba
 *   npm run seed:demo -- --admin-password X # restablece además la contraseña de `admin`
 *
 * En producción las variables de Turso son sensibles y no se pueden descargar: usa el
 * botón "Cargar datos de prueba" en /usuarios, que corre la misma lógica dentro de Vercel.
 */
import { readFileSync } from "node:fs";

function leerEnv(ruta: string) {
  for (const linea of readFileSync(ruta, "utf8").split("\n")) {
    const m = linea.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    const v = m[2].replace(/^"(.*)"$/, "$1");
    if (!process.env[m[1]]) process.env[m[1]] = v;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const envIdx = args.indexOf("--env");
  leerEnv(envIdx >= 0 ? args[envIdx + 1] : ".env");
  const adminIdx = args.indexOf("--admin-password");
  const nuevaAdmin = adminIdx >= 0 ? args[adminIdx + 1] : null;

  // Importes dinámicos para que lean las variables ya cargadas.
  const { createClient } = await import("@libsql/client");
  const { hash } = await import("bcryptjs");
  const { cargarDatosDemo, borrarDatosDemo } = await import("../src/lib/seed-demo");

  const url = process.env.TURSO_DATABASE_URL ?? "file:local.db";
  if (url.includes("SENSITIVE")) {
    console.error("TURSO_DATABASE_URL es sensible en Vercel y no se puede descargar. Usa el botón de datos de prueba en /usuarios.");
    process.exit(1);
  }
  const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  console.log(`Base: ${url.startsWith("file:") ? url : url.replace(/\/\/.*@/, "//")}`);

  const tablas = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('usuarios','vpa_alumnos','vpa_cuestionarios','usuario_alumnos')",
  );
  if (tablas.rows.length < 4) {
    console.error("Faltan tablas. Abre la app una vez (crea las tablas sola) y vuelve a correr el script.");
    process.exit(1);
  }

  if (args.includes("--borrar")) {
    await borrarDatosDemo(client);
    console.log("Datos de prueba eliminados.");
  } else {
    await cargarDatosDemo(client, console.log);
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
