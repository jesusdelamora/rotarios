"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, ensureSchema } from "@/db";
import { usuarioAlumnos, vpaAlumnos, vpaCuestionarios } from "@/db/schema";
import { assertVpa, puedeVerAlumno } from "@/lib/vpa-auth";
import { getAlumno } from "@/lib/vpa-queries";
import { AGUDEZA_VACIA, TOTAL_PREGUNTAS_VPA, generarFolio, type AgudezaVisual, type RespuestasVpa } from "@/data/vpa";

type Estado = { error?: string } | undefined;

/* ---------- Alumnos ---------- */

const alumnoSchema = z.object({
  nombre: z.string().trim().min(2, "Escribe el nombre del alumno.").max(150),
  edad: z.coerce.number().int().min(0).max(25).optional().or(z.literal("").transform(() => undefined)),
  escuela: z.string().trim().max(150).optional(),
  telefono: z.string().trim().max(40).optional(),
  tutor: z.string().trim().max(150).optional(),
  evaluador: z.string().trim().max(150).optional(),
});

function leerAlumno(formData: FormData) {
  return alumnoSchema.safeParse({
    nombre: formData.get("nombre"),
    edad: formData.get("edad") ?? "",
    escuela: formData.get("escuela") ?? "",
    telefono: formData.get("telefono") ?? "",
    tutor: formData.get("tutor") ?? "",
    evaluador: formData.get("evaluador") ?? "",
  });
}

export async function crearAlumno(_prev: Estado, formData: FormData): Promise<Estado> {
  const s = await assertVpa(["rotario", "maestro"]);
  const parsed = leerAlumno(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  if (formData.get("aviso") !== "on") {
    return { error: "Confirma que el padre, madre o tutor conoce el aviso de privacidad y autoriza el registro." };
  }
  const d = parsed.data;
  await ensureSchema();

  // Reintenta si el folio generado ya existe (muy improbable).
  let id = "";
  for (let intento = 0; intento < 5; intento++) {
    const folio = generarFolio();
    try {
      id = crypto.randomUUID();
      const ahora = new Date();
      await db.insert(vpaAlumnos).values({
        id,
        folio,
        nombre: d.nombre,
        edad: d.edad ?? null,
        escuela: d.escuela || null,
        telefono: d.telefono || null,
        tutor: d.tutor || null,
        evaluador: d.evaluador || null,
        avisoAceptadoEn: ahora,
        creadoPor: s.rol,
        creadoPorNombre: s.nombre,
        creadoEn: ahora,
        actualizadoEn: ahora,
      });
      break;
    } catch (e) {
      if (intento === 4) {
        console.error("Error al crear alumno:", e);
        return { error: "No se pudo guardar el alumno. Intenta de nuevo." };
      }
    }
  }
  revalidatePath("/aprender/alumnos");
  redirect(`/aprender/alumnos/${id}`);
}

export async function editarAlumno(_prev: Estado, formData: FormData): Promise<Estado> {
  const s = await assertVpa(["rotario", "maestro"]);
  const id = String(formData.get("id") ?? "");
  const parsed = leerAlumno(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  const d = parsed.data;
  const existente = await getAlumno(id);
  if (!existente || !puedeVerAlumno(s, id)) return { error: "Alumno no encontrado." };
  await db
    .update(vpaAlumnos)
    .set({
      nombre: d.nombre,
      edad: d.edad ?? null,
      escuela: d.escuela || null,
      telefono: d.telefono || null,
      tutor: d.tutor || null,
      evaluador: d.evaluador || null,
      actualizadoEn: new Date(),
    })
    .where(eq(vpaAlumnos.id, id));
  revalidatePath("/aprender/alumnos");
  redirect(`/aprender/alumnos/${id}`);
}

export async function eliminarAlumno(formData: FormData) {
  await assertVpa(["rotario"]);
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await ensureSchema();
  await db.delete(vpaCuestionarios).where(eq(vpaCuestionarios.alumnoId, id));
  await db.delete(usuarioAlumnos).where(eq(usuarioAlumnos.alumnoId, id));
  await db.delete(vpaAlumnos).where(eq(vpaAlumnos.id, id));
  revalidatePath("/aprender/alumnos");
  redirect("/aprender/alumnos");
}

/* ---------- Cuestionarios ---------- */

export async function crearCuestionario(_prev: Estado, formData: FormData): Promise<Estado> {
  const s = await assertVpa();
  const alumnoId = String(formData.get("alumnoId") ?? "");
  if (!alumnoId || !puedeVerAlumno(s, alumnoId)) return { error: "Alumno no encontrado." };
  const alumno = await getAlumno(alumnoId);
  if (!alumno) return { error: "Alumno no encontrado." };

  const respuestas: RespuestasVpa = [];
  for (let i = 0; i < TOTAL_PREGUNTAS_VPA; i++) {
    const v = formData.get(`q${i}`);
    respuestas.push(v === "si" ? true : v === "no" ? false : null);
  }
  const contestadas = respuestas.filter((r) => r !== null).length;
  if (contestadas === 0) return { error: "Contesta al menos una pregunta del cuestionario." };

  const puedeAgudeza = s.rol !== "papa";
  const agudeza: AgudezaVisual = { ...AGUDEZA_VACIA };
  if (puedeAgudeza) {
    for (const k of Object.keys(AGUDEZA_VACIA) as (keyof AgudezaVisual)[]) {
      agudeza[k] = String(formData.get(k) ?? "").trim().slice(0, 20);
    }
  }
  const observaciones = puedeAgudeza ? String(formData.get("observaciones") ?? "").trim().slice(0, 3000) : "";
  const evaluador = String(formData.get("evaluador") ?? "").trim().slice(0, 150);
  const fechaStr = String(formData.get("fecha") ?? "").trim();
  const fecha = fechaStr ? new Date(`${fechaStr}T12:00:00`) : new Date();

  const id = crypto.randomUUID();
  await ensureSchema();
  await db.insert(vpaCuestionarios).values({
    id,
    alumnoId,
    fecha: isNaN(fecha.getTime()) ? new Date() : fecha,
    evaluador: evaluador || null,
    respuestas: JSON.stringify(respuestas),
    agudeza: JSON.stringify(agudeza),
    observaciones: observaciones || null,
    creadoPor: s.rol,
    creadoPorNombre: s.nombre,
    creadoEn: new Date(),
  });
  await db.update(vpaAlumnos).set({ actualizadoEn: new Date() }).where(eq(vpaAlumnos.id, alumnoId));
  revalidatePath(`/aprender/alumnos/${alumnoId}`);
  redirect(`/aprender/alumnos/${alumnoId}/cuestionario/${id}`);
}

export async function eliminarCuestionario(formData: FormData) {
  await assertVpa(["rotario"]);
  const id = String(formData.get("id") ?? "");
  const alumnoId = String(formData.get("alumnoId") ?? "");
  if (!id) return;
  await ensureSchema();
  await db.delete(vpaCuestionarios).where(eq(vpaCuestionarios.id, id));
  revalidatePath(`/aprender/alumnos/${alumnoId}`);
  redirect(`/aprender/alumnos/${alumnoId}`);
}
