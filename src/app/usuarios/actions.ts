"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, ensureSchema } from "@/db";
import { usuarios, usuarioAlumnos } from "@/db/schema";
import { assertSesion } from "@/lib/auth";
import {
  ROLES,
  contarRotariosActivos,
  desvincularAlumno,
  getUsuario,
  getUsuarioPorNombre,
  hashPassword,
  normalizarUsuario,
  vincularAlumno,
  type Rol,
} from "@/lib/usuarios";
import { getAlumnoPorFolio } from "@/lib/vpa-queries";

type Estado = { error?: string; ok?: string } | undefined;

const USUARIO_RE = /^[a-z0-9._-]{3,30}$/;

export async function crearUsuario(_prev: Estado, formData: FormData): Promise<Estado> {
  await assertSesion(["rotario"]);
  const usuario = normalizarUsuario(String(formData.get("usuario") ?? ""));
  const nombre = String(formData.get("nombre") ?? "").trim();
  const rol = String(formData.get("rol") ?? "") as Rol;
  const password = String(formData.get("password") ?? "");
  const folios = String(formData.get("folios") ?? "")
    .split(/[\s,;]+/)
    .map((f) => f.trim().toUpperCase())
    .filter(Boolean);

  if (!USUARIO_RE.test(usuario)) return { error: "El usuario debe tener de 3 a 30 caracteres: letras minúsculas, números, punto, guion o guion bajo." };
  if (nombre.length < 2) return { error: "Escribe el nombre de la persona." };
  if (!ROLES.includes(rol)) return { error: "Elige un tipo de usuario." };
  if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres." };
  if (await getUsuarioPorNombre(usuario)) return { error: "Ese nombre de usuario ya existe." };

  const alumnoIds: string[] = [];
  if (rol === "papa") {
    for (const f of folios) {
      const a = await getAlumnoPorFolio(f);
      if (!a) return { error: `No existe un alumno con el folio ${f}.` };
      alumnoIds.push(a.id);
    }
  }

  await ensureSchema();
  const id = crypto.randomUUID();
  await db.insert(usuarios).values({
    id,
    usuario,
    nombre,
    rol,
    passwordHash: await hashPassword(password),
    activo: true,
    intentosFallidos: 0,
    creadoEn: new Date(),
  });
  for (const alumnoId of alumnoIds) await vincularAlumno(id, alumnoId);
  revalidatePath("/usuarios");
  redirect(`/usuarios/${id}`);
}

export async function resetearPassword(_prev: Estado, formData: FormData): Promise<Estado> {
  await assertSesion(["rotario"]);
  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres." };
  const u = await getUsuario(id);
  if (!u) return { error: "Usuario no encontrado." };
  await db
    .update(usuarios)
    .set({ passwordHash: await hashPassword(password), intentosFallidos: 0, bloqueadoHasta: null })
    .where(eq(usuarios.id, id));
  return { ok: "Contraseña actualizada. Compártela con la persona de forma segura." };
}

export async function cambiarActivo(formData: FormData) {
  const s = await assertSesion(["rotario"]);
  const id = String(formData.get("id") ?? "");
  const activo = String(formData.get("activo") ?? "") === "1";
  const u = await getUsuario(id);
  if (!u) return;
  if (!activo && u.id === s.id) return; // no te desactives a ti mismo
  if (!activo && u.rol === "rotario" && (await contarRotariosActivos()) <= 1) return; // siempre debe quedar un rotario
  await db.update(usuarios).set({ activo, intentosFallidos: 0, bloqueadoHasta: null }).where(eq(usuarios.id, id));
  revalidatePath("/usuarios");
  redirect(`/usuarios/${id}`);
}

export async function editarUsuario(_prev: Estado, formData: FormData): Promise<Estado> {
  const s = await assertSesion(["rotario"]);
  const id = String(formData.get("id") ?? "");
  const nombre = String(formData.get("nombre") ?? "").trim();
  const rol = String(formData.get("rol") ?? "") as Rol;
  if (nombre.length < 2) return { error: "Escribe el nombre." };
  if (!ROLES.includes(rol)) return { error: "Elige un tipo de usuario." };
  const u = await getUsuario(id);
  if (!u) return { error: "Usuario no encontrado." };
  if (u.id === s.id && rol !== "rotario") return { error: "No puedes quitarte a ti mismo el rol de rotario." };
  if (u.rol === "rotario" && rol !== "rotario" && (await contarRotariosActivos()) <= 1) {
    return { error: "Debe quedar al menos un rotario activo." };
  }
  await db.update(usuarios).set({ nombre, rol }).where(eq(usuarios.id, id));
  if (rol !== "papa") await db.delete(usuarioAlumnos).where(eq(usuarioAlumnos.usuarioId, id));
  revalidatePath("/usuarios");
  return { ok: "Datos guardados." };
}

export async function vincularPorFolio(_prev: Estado, formData: FormData): Promise<Estado> {
  await assertSesion(["rotario"]);
  const id = String(formData.get("id") ?? "");
  const folio = String(formData.get("folio") ?? "").trim().toUpperCase();
  const u = await getUsuario(id);
  if (!u || u.rol !== "papa") return { error: "Solo se vinculan alumnos a cuentas de padres o tutores." };
  const a = await getAlumnoPorFolio(folio);
  if (!a) return { error: `No existe un alumno con el folio ${folio}.` };
  await vincularAlumno(id, a.id);
  revalidatePath(`/usuarios/${id}`);
  return { ok: `${a.nombre} vinculado.` };
}

export async function quitarVinculo(formData: FormData) {
  await assertSesion(["rotario"]);
  const id = String(formData.get("id") ?? "");
  const alumnoId = String(formData.get("alumnoId") ?? "");
  if (id && alumnoId) await desvincularAlumno(id, alumnoId);
  revalidatePath(`/usuarios/${id}`);
  redirect(`/usuarios/${id}`);
}
