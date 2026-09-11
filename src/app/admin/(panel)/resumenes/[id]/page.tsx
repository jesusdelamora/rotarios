import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getResumen } from "@/lib/queries";
import { formatoFecha, formatoFechaHora, type Estadisticas } from "@/lib/stats";
import { CLUB, TITULO_ENCUESTA, ITEMS_POR_SECCION, MAX_SIN_MARCAR } from "@/data/encuesta";
import { RotaryLogo } from "@/components/RotaryLogo";
import { Barra, Button, ButtonLink, Card, Pill, nivelSeccion } from "@/components/ui";
import { PrintButton } from "@/components/PrintButton";
import { eliminarResumen } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function ResumenPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const r = await getResumen(id);
  if (!r) notFound();
  const stats = JSON.parse(r.contenido) as Estadisticas;

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <ButtonLink href="/admin/resumenes" variant="outline">
          ← Resúmenes
        </ButtonLink>
        <div className="flex gap-2">
          <PrintButton />
          <form action={eliminarResumen}>
            <input type="hidden" name="id" value={r.id} />
            <Button type="submit" variant="danger">
              Eliminar
            </Button>
          </form>
        </div>
      </div>

      {/* Encabezado del reporte (visible también al imprimir) */}
      <div className="flex items-center gap-4 border-b-4 border-rotary-gold pb-4">
        <RotaryLogo className="h-12 w-auto" />
        <div>
          <p className="font-bold text-rotary-blue">{CLUB}</p>
          <p className="text-sm text-rotary-gray">{TITULO_ENCUESTA}</p>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-rotary-blue">{r.titulo}</h1>
        <p className="text-sm text-rotary-gray">
          Generado el {formatoFechaHora(r.creadoEn)} · {r.totalRespuestas} respuesta{r.totalRespuestas === 1 ? "" : "s"}
          {stats.desde && stats.hasta && ` · ${formatoFecha(stats.desde)} – ${formatoFecha(stats.hasta)}`}
        </p>
      </div>

      <Card className={stats.areasAtencion.length ? "border-rotary-cranberry" : "border-rotary-grass"}>
        <h2 className="font-bold text-rotary-blue">Diagnóstico</h2>
        {stats.areasAtencion.length ? (
          <p className="mt-1">
            <span className="font-bold text-rotary-cranberry">Áreas que requieren atención: </span>
            {stats.areasAtencion.join(", ")}.
          </p>
        ) : (
          <p className="mt-1 font-semibold text-rotary-grass">Ninguna sección requiere atención según el promedio del club.</p>
        )}
        <p className="mt-1 text-xs text-rotary-gray">
          Regla de la encuesta: una sección con más de {MAX_SIN_MARCAR} casillas sin marcar (promedio menor a{" "}
          {ITEMS_POR_SECCION - MAX_SIN_MARCAR}) debe atenderse.
        </p>
      </Card>

      <Card>
        <h2 className="font-bold text-rotary-blue">Puntaje por sección</h2>
        <table className="mt-3 w-full text-sm">
          <thead className="text-left text-xs uppercase text-rotary-gray">
            <tr>
              <th className="py-1">Sección</th>
              <th className="py-1 text-center">Promedio</th>
              <th className="py-1 w-1/3">Cumplimiento</th>
              <th className="py-1 text-center">Marcan atender</th>
              <th className="py-1 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rotary-gray-mid">
            {stats.secciones.map((s, i) => {
              const nivel = nivelSeccion(s.promedio, s.requiereAtencion);
              return (
                <tr key={s.id}>
                  <td className="py-2 font-semibold">
                    {i + 1}. {s.titulo}
                  </td>
                  <td className="py-2 text-center font-bold">
                    {s.promedio}/{ITEMS_POR_SECCION}
                  </td>
                  <td className="py-2 pr-3">
                    <Barra porcentaje={s.porcentajePromedio} color={nivel.color} />
                  </td>
                  <td className="py-2 text-center">{s.porcentajeAtencion}%</td>
                  <td className="py-2 text-center">
                    <Pill className={nivel.color}>{nivel.etiqueta}</Pill>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="font-bold text-rotary-cranberry">5 puntos más débiles</h2>
          <ol className="mt-3 space-y-2 text-sm list-decimal pl-5">
            {stats.masDebiles.map((it) => (
              <li key={`${it.seccionId}-${it.indice}`}>
                <span className="font-bold">{it.porcentaje}%</span> · {it.texto}{" "}
                <span className="text-xs text-rotary-gray">({it.seccionTitulo})</span>
              </li>
            ))}
          </ol>
        </Card>
        <Card>
          <h2 className="font-bold text-rotary-grass">5 puntos más fuertes</h2>
          <ol className="mt-3 space-y-2 text-sm list-decimal pl-5">
            {stats.masFuertes.map((it) => (
              <li key={`${it.seccionId}-${it.indice}`}>
                <span className="font-bold">{it.porcentaje}%</span> · {it.texto}{" "}
                <span className="text-xs text-rotary-gray">({it.seccionTitulo})</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      {stats.secciones.map((s, i) => (
        <Card key={s.id} className="break-inside-avoid">
          <h2 className="font-bold text-rotary-blue">
            {i + 1}. {s.titulo}
          </h2>
          <ol className="mt-3 space-y-1.5 text-sm">
            {s.items.map((it) => (
              <li key={it.indice} className="flex gap-3">
                <span className="w-12 shrink-0 text-right font-bold">{it.porcentaje}%</span>
                <span className="w-24 shrink-0 pt-1.5">
                  <Barra
                    porcentaje={it.porcentaje}
                    color={it.porcentaje < 40 ? "bg-rotary-cranberry" : it.porcentaje < 70 ? "bg-rotary-gold" : "bg-rotary-grass"}
                    className="h-2"
                  />
                </span>
                <span>{it.texto}</span>
              </li>
            ))}
          </ol>
          {s.comentarios.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-rotary-gray">Comentarios</h3>
              <ul className="mt-1 space-y-2 text-sm">
                {s.comentarios.map((c, j) => (
                  <li key={j} className="rounded-md bg-rotary-gray-light p-2">
                    <p className="whitespace-pre-wrap">{c.texto}</p>
                    <p className="text-xs text-rotary-gray">
                      {c.nombre ?? "Anónimo"} · {formatoFecha(c.fecha)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
