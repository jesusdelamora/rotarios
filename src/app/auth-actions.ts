"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import { db } from "@/db";
import { usuarios } from "@/db/schema";
import { assertSesion, clearSesion, inicioDeRol, setSesion } from "@/lib/auth";
import { hashPassword, verificarCredenciales } from "@/lib/usuarios";

type Estado = { error?: string; ok?: boolean; usuario?: string } | undefined;

/** Solo rutas internas, para evitar redirecciones a otros sitios. */
function destinoSeguro(next: unknown): string | null {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : null;
}

export async function iniciarSesion(_prev: Estado, formData: FormData): Promise<Estado> {
  const usuario = String(formData.get("usuario") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!usuario.trim() || !password) return { error: "Escribe tu usuario y contraseña.", usuario };

  let r;
  try {
    r = await verificarCredenciales(usuario, password);
  } catch (e) {
    console.error("Error al iniciar sesión:", e);
    return { error: "No se pudo iniciar sesión. Intenta de nuevo en un momento.", usuario };
  }
  if (!r.ok) return { error: r.error, usuario };

  await setSesion(r.usuario.id);
  redirect(destinoSeguro(formData.get("next")) ?? inicioDeRol(r.usuario.rol as "rotario" | "maestro" | "papa"));
}

export async function cerrarSesion() {
  await clearSesion();
  redirect("/login");
}

export async function cambiarMiPassword(_prev: Estado, formData: FormData): Promise<Estado> {
  const s = await assertSesion();
  const actual = String(formData.get("actual") ?? "");
  const nueva = String(formData.get("nueva") ?? "");
  const confirmar = String(formData.get("confirmar") ?? "");
  if (nueva.length < 6) return { error: "La contraseña nueva debe tener al menos 6 caracteres." };
  if (nueva !== confirmar) return { error: "La confirmación no coincide." };

  const rows = await db.select().from(usuarios).where(eq(usuarios.id, s.id)).limit(1);
  const u = rows[0];
  if (!u || !(await compare(actual, u.passwordHash))) return { error: "La contraseña actual es incorrecta." };

  await db.update(usuarios).set({ passwordHash: await hashPassword(nueva) }).where(eq(usuarios.id, s.id));
  return { ok: true };
}
