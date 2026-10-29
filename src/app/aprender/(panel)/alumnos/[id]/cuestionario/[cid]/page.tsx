import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireVpa, puedeVerAlumno } from "@/lib/vpa-auth";
import { getAlumno, getCuestionarioDeAlumno } from "@/lib/vpa-queries";
import { formatoFecha, formatoFechaHora } from "@/lib/stats";
import { NOMBRE_ROL, PREGUNTAS_VPA, VPA_NOMBRE, VPA_PROGRAMA, CLUB } from "@/data/vpa-club";
import { RotaryLogo } from "@/components/RotaryLogo";
import { Button, Card, Pill } from "@/components/ui";
import { PrintButton } from "@/components/PrintButton";
import { eliminarCuestionario } from "../../../../../actions";

export const dynamic = "force-dynamic";

export default async function CuestionarioPage({ params }: { params: Promise<{ id: string; cid: string }> }) {
  const s = await requireVpa();
  const { id, cid } = await params;
  if (!puedeVerAlumno(s, id)) redirect("/aprender");
  const alumno = await getAlumno(id);
  if (!alumno) notFound();
  const c = await getCuestionarioDeAlumno(id, cid);
  if (!c) notFound();
  const tieneAV = Object.values(c.agudeza).some(Boolean);

  const datos: [string, string | null | undefined][] = [
    ["Alumno", alumno.nombre],
    ["Edad", alumno.edad != null ? `${alumno.edad} años` : null],
    ["Escuela", alumno.escuela],
    ["Fecha", formatoFecha(c.fecha)],
    ["Teléfono de contacto", alumno.telefono],
    ["Padre, madre o tutor(a)", alumno.tutor],
    ["Evaluador(a)", c.evaluador || alumno.evaluador],
    ["Folio", alumno.folio],
  ];

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <Link href={`/aprender/alumnos/${id}`} className="text-sm text-rotary-azure hover:underline">
          ← {alumno.nombre}
        </Link>
        <div className="flex gap-2">
          <PrintButton />
          {s.rol === "rotario" && (
            <form action={eliminarCuestionario}>
              <input type="hidden" name="id" value={c.id} />
              <input type="hidden" name="alumnoId" value={id} />
              <Button type="submit" variant="danger">
                Eliminar
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 border-b-4 border-rotary-gold pb-3">
        <RotaryLogo className="h-10 w-auto" />
        <div className="min-w-0">
          <p className="font-bold text-rotary-blue truncate">{CLUB}</p>
          <p className="text-xs text-rotary-gray">
            {VPA_NOMBRE} · {VPA_PROGRAMA}
          </p>
        </div>
      </div>

      <Card>
        <h2 className="font-bold text-rotary-blue">Datos generales</h2>
        <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
          {datos.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-b border-rotary-gray-mid py-1 sm:border-0 sm:py-0.5">
              <dt className="text-rotary-gray">{k}</dt>
              <dd className="font-semibold text-right">{v || "—"}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-rotary-blue">Cuestionario de signos y síntomas</h2>
          <Pill className={c.totalSi >= 10 ? "bg-rotary-cranberry" : c.totalSi >= 5 ? "bg-rotary-gold" : "bg-rotary-grass"}>
            {c.totalSi} Sí de {PREGUNTAS_VPA.length}
          </Pill>
        </div>
        <ol className="mt-3 divide-y divide-rotary-gray-mid text-sm">
          {PREGUNTAS_VPA.map((p, i) => {
            const r = c.respuestas[i];
            return (
              <li key={i} className="flex items-center gap-3 py-1.5">
                <span className="w-6 shrink-0 text-right text-xs text-rotary-gray">{i + 1}.</span>
                <span className="flex-1">{p}</span>
                <span
                  className={`w-12 shrink-0 text-center text-xs font-bold rounded px-1 py-0.5 ${
                    r === true ? "bg-rotary-cranberry text-white" : r === false ? "bg-rotary-grass text-white" : "bg-rotary-gray-light text-rotary-gray"
                  }`}
                >
                  {r === true ? "Sí" : r === false ? "No" : "—"}
                </span>
              </li>
            );
          })}
        </ol>
      </Card>

      {(tieneAV || c.observaciones) && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <h2 className="font-bold text-rotary-blue">Agudeza visual</h2>
            <table className="mt-2 w-full text-sm">
              <thead className="text-left text-xs uppercase text-rotary-gray">
                <tr>
                  <th className="py-1"></th>
                  <th className="py-1">OD</th>
                  <th className="py-1">OI</th>
                  <th className="py-1">AO</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-rotary-gray-mid">
                  <td className="py-1 font-semibold">Lejana (3 m)</td>
                  <td>{c.agudeza.lejanaOD || "—"}</td>
                  <td>{c.agudeza.lejanaOI || "—"}</td>
                  <td>{c.agudeza.lejanaAO || "—"}</td>
                </tr>
                <tr className="border-t border-rotary-gray-mid">
                  <td className="py-1 font-semibold">Cercana (40 cm)</td>
                  <td>{c.agudeza.cercanaOD || "—"}</td>
                  <td>{c.agudeza.cercanaOI || "—"}</td>
                  <td>{c.agudeza.cercanaAO || "—"}</td>
                </tr>
              </tbody>
            </table>
          </Card>
          <Card>
            <h2 className="font-bold text-rotary-blue">Observaciones del evaluador</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm">{c.observaciones || "—"}</p>
          </Card>
        </div>
      )}

      <p className="text-xs text-rotary-gray">
        Registrado el {formatoFechaHora(c.creadoEn)} por {NOMBRE_ROL[c.creadoPor as keyof typeof NOMBRE_ROL] ?? c.creadoPor}.
      </p>
    </div>
  );
}
