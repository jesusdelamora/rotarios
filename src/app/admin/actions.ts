"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db, ensureSchema } from "@/db";
import { respuestas, resumenes } from "@/db/schema";
import { assertAdmin } from "@/lib/auth";
import { createSessionToken, SESSION_COOKIE, SESSION_MAX_AGE } from "@/lib/session";
import { getRespuestas } from "@/lib/queries";
import { calcularEstadisticas } from "@/lib/stats";

export async function login(_prev: { error?: string } | undefined, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const esperado = process.env.ADMIN_PASSWORD;
  if (!esperado) return { error: "ADMIN_PASSWORD no está configurado en el servidor." };
  if (password !== esperado) return { error: "Password incorrecto." };

  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect("/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function eliminarRespuesta(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await ensureSchema();
  await db.delete(respuestas).where(eq(respuestas.id, id));
  revalidatePath("/admin");
  redirect("/admin/respuestas");
}

function parseFecha(v: FormDataEntryValue | null, finDeDia = false): Date | undefined {
  const s = String(v ?? "").trim();
  if (!s) return undefined;
  const d = new Date(finDeDia ? `${s}T23:59:59.999` : `${s}T00:00:00`);
  return isNaN(d.getTime()) ? undefined : d;
}

export async function generarResumen(_prev: { error?: string } | undefined, formData: FormData) {
  await assertAdmin();
  const desde = parseFecha(formData.get("desde"));
  const hasta = parseFecha(formData.get("hasta"), true);
  const tituloForm = String(formData.get("titulo") ?? "").trim();

  const rs = await getRespuestas({ desde, hasta });
  if (rs.length === 0) return { error: "No hay respuestas en el rango seleccionado." };

  const stats = calcularEstadisticas(rs);
  const titulo =
    tituloForm ||
    `Resumen ${new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}`;
  const id = crypto.randomUUID();
  await ensureSchema();
  await db.insert(resumenes).values({
    id,
    creadoEn: new Date(),
    titulo,
    desde: desde ?? null,
    hasta: hasta ?? null,
    totalRespuestas: rs.length,
    contenido: JSON.stringify(stats),
  });
  revalidatePath("/admin/resumenes");
  redirect(`/admin/resumenes/${id}`);
}

export async function eliminarResumen(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await ensureSchema();
  await db.delete(resumenes).where(eq(resumenes.id, id));
  revalidatePath("/admin/resumenes");
  redirect("/admin/resumenes");
}
