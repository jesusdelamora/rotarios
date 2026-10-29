import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireVpa, puedeVerAlumno } from "@/lib/vpa-auth";
import { getAlumno, getCuestionariosDeAlumno } from "@/lib/vpa-queries";
import { formatoFecha } from "@/lib/stats";
import { NOMBRE_ROL, TOTAL_PREGUNTAS_VPA } from "@/data/vpa";
import { Button, ButtonLink, Card, Pill } from "@/components/ui";
import { eliminarAlumno } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function AlumnoPage({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireVpa();
  const { id } = await params;
  if (!puedeVerAlumno(s, id)) redirect("/aprender");
  const alumno = await getAlumno(id);
  if (!alumno) notFound();
  const cuestionarios = await getCuestionariosDeAlumno(id);
  const esPapa = s.rol === "papa";

  const datos: [string, string | null | undefined][] = [
    ["Edad", alumno.edad != null ? `${alumno.edad} años` : null],
    ["Escuela", alumno.escuela],
    ["Padre, madre o tutor(a)", alumno.tutor],
    ["Teléfono", alumno.telefono],
    ["Evaluador(a)", alumno.evaluador],
    ["Registrado", `${formatoFecha(alumno.creadoEn)} · ${NOMBRE_ROL[alumno.creadoPor as keyof typeof NOMBRE_ROL] ?? alumno.creadoPor}`],
  ];

  return (
    <div className="space-y-4">
      {!esPapa && (
        <Link href="/aprender/alumnos" className="text-sm text-rotary-azure hover:underline">
          ← Alumnos
        </Link>
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-widest text-rotary-gold-dark font-semibold">Alumno</p>
          <h1 className="text-2xl font-bold text-rotary-blue">{alumno.nombre}</h1>
        </div>
        <div className="rounded-lg bg-rotary-gray-light px-3 py-2 text-center">
          <p className="text-[10px] uppercase tracking-widest text-rotary-gray">Folio</p>
          <p className="font-mono text-xl font-bold tracking-widest text-rotary-blue-dark">{alumno.folio}</p>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-rotary-blue">Datos generales</h2>
          {!esPapa && (
            <Link href={`/aprender/alumnos/${id}/editar`} className="text-sm text-rotary-azure hover:underline">
              Editar
            </Link>
          )}
        </div>
        <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {datos.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-3 border-b border-rotary-gray-mid pb-1 sm:block sm:border-0 sm:pb-0">
              <dt className="text-rotary-gray">{k}</dt>
              <dd className="font-semibold text-right sm:text-left">{v || <span className="text-rotary-gray-mid">—</span>}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-rotary-blue">Cuestionarios ({cuestionarios.length})</h2>
        <ButtonLink href={`/aprender/alumnos/${id}/cuestionario/nuevo`} variant="gold">
          + Nuevo cuestionario
        </ButtonLink>
      </div>

      {cuestionarios.length === 0 ? (
        <Card className="text-center text-sm text-rotary-gray">
          Este alumno todavía no tiene cuestionarios. {esPapa ? "Puedes llenar el primero ahora." : ""}
        </Card>
      ) : (
        <ul className="space-y-2">
          {cuestionarios.map((c) => {
            const contestadas = c.respuestas.filter((r) => r !== null).length;
            const tieneAV = Object.values(c.agudeza).some(Boolean);
            return (
              <li key={c.id}>
                <Link href={`/aprender/alumnos/${id}/cuestionario/${c.id}`} className="block">
                  <Card className="flex items-center gap-3 py-3 hover:border-rotary-azure transition-colors">
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-rotary-blue">{formatoFecha(c.fecha)}</span>
                      <span className="block text-xs text-rotary-gray truncate">
                        {c.evaluador ? `${c.evaluador} · ` : ""}
                        {NOMBRE_ROL[c.creadoPor as keyof typeof NOMBRE_ROL] ?? c.creadoPor}
                        {tieneAV ? " · con agudeza visual" : ""}
                      </span>
                    </span>
                    <span className="text-right shrink-0">
                      <Pill className={c.totalSi >= 10 ? "bg-rotary-cranberry" : c.totalSi >= 5 ? "bg-rotary-gold" : "bg-rotary-grass"}>
                        {c.totalSi} Sí
                      </Pill>
                      <span className="block text-xs text-rotary-gray mt-1">
                        {contestadas}/{TOTAL_PREGUNTAS_VPA} contestadas
                      </span>
                    </span>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {s.rol === "rotario" && (
        <form
          action={eliminarAlumno}
          className="pt-4 border-t border-rotary-gray-mid flex justify-end"
        >
          <input type="hidden" name="id" value={id} />
          <Button type="submit" variant="danger" className="text-sm">
            Eliminar alumno y sus cuestionarios
          </Button>
        </form>
      )}
    </div>
  );
}
