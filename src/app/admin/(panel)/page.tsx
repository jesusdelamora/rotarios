import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getRespuestas } from "@/lib/queries";
import { calcularEstadisticas, formatoFecha } from "@/lib/stats";
import { ITEMS_POR_SECCION, MAX_SIN_MARCAR } from "@/data/encuesta";
import { Barra, Card, Pill, nivelSeccion, ButtonLink } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  await requireAdmin();
  const rs = await getRespuestas();
  const stats = calcularEstadisticas(rs);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-rotary-blue">Dashboard</h1>
          <p className="text-sm text-rotary-gray">
            {stats.total === 0
              ? "Aún no hay respuestas."
              : `${stats.total} respuesta${stats.total === 1 ? "" : "s"} · ${formatoFecha(stats.desde!)} – ${formatoFecha(stats.hasta!)}`}
          </p>
        </div>
        <ButtonLink href="/admin/resumenes" variant="gold">
          Generar resumen
        </ButtonLink>
      </div>

      {stats.total > 0 && (
        <Card className={stats.areasAtencion.length ? "border-rotary-cranberry" : "border-rotary-grass"}>
          {stats.areasAtencion.length ? (
            <p>
              <span className="font-bold text-rotary-cranberry">Áreas que requieren atención: </span>
              {stats.areasAtencion.join(", ")}.
              <span className="block text-xs text-rotary-gray mt-1">
                Regla de la encuesta: una sección con más de {MAX_SIN_MARCAR} casillas sin marcar debe atenderse.
              </span>
            </p>
          ) : (
            <p className="font-bold text-rotary-grass">Ninguna sección requiere atención según el promedio del club.</p>
          )}
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {stats.secciones.map((s, i) => {
          const nivel = nivelSeccion(s.promedio, s.requiereAtencion);
          return (
            <Link key={s.id} href={`/admin/seccion/${s.id}`} className="block">
              <Card className="h-full hover:border-rotary-azure transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-rotary-gold-dark font-semibold">Sección {i + 1}</p>
                    <h2 className="font-bold text-rotary-blue">{s.titulo}</h2>
                  </div>
                  <Pill className={nivel.color}>{nivel.etiqueta}</Pill>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-rotary-blue">{s.promedio}</span>
                  <span className="text-sm text-rotary-gray">/ {ITEMS_POR_SECCION} promedio</span>
                </div>
                <Barra porcentaje={s.porcentajePromedio} color={nivel.color} className="mt-2" />
                <p className="mt-2 text-xs text-rotary-gray">
                  {s.porcentajeAtencion}% de las respuestas marcan esta área para atender
                </p>
              </Card>
            </Link>
          );
        })}
      </div>

      {stats.total > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <h2 className="font-bold text-rotary-cranberry">5 puntos más débiles</h2>
            <ol className="mt-3 space-y-3">
              {stats.masDebiles.map((it) => (
                <li key={`${it.seccionId}-${it.indice}`} className="text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-xs text-rotary-gray">{it.seccionTitulo}</span>
                    <span className="font-bold">{it.porcentaje}%</span>
                  </div>
                  <p>{it.texto}</p>
                  <Barra porcentaje={it.porcentaje} color="bg-rotary-cranberry" className="mt-1 h-1.5" />
                </li>
              ))}
            </ol>
          </Card>
          <Card>
            <h2 className="font-bold text-rotary-grass">5 puntos más fuertes</h2>
            <ol className="mt-3 space-y-3">
              {stats.masFuertes.map((it) => (
                <li key={`${it.seccionId}-${it.indice}`} className="text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-xs text-rotary-gray">{it.seccionTitulo}</span>
                    <span className="font-bold">{it.porcentaje}%</span>
                  </div>
                  <p>{it.texto}</p>
                  <Barra porcentaje={it.porcentaje} color="bg-rotary-grass" className="mt-1 h-1.5" />
                </li>
              ))}
            </ol>
          </Card>
        </div>
      )}
    </div>
  );
}
