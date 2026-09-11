import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getRespuestas } from "@/lib/queries";
import { calcularEstadisticas, formatoFecha } from "@/lib/stats";
import { SECCIONES, ITEMS_POR_SECCION } from "@/data/encuesta";
import { Barra, Card, Pill, nivelSeccion, ButtonLink } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function SeccionPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const idx = SECCIONES.findIndex((s) => s.id === id);
  if (idx < 0) notFound();

  const stats = calcularEstadisticas(await getRespuestas());
  const s = stats.secciones[idx];
  const nivel = nivelSeccion(s.promedio, s.requiereAtencion);
  const itemsOrdenados = [...s.items].sort((a, b) => a.porcentaje - b.porcentaje);
  const anterior = SECCIONES[idx - 1];
  const siguiente = SECCIONES[idx + 1];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-rotary-gold-dark font-semibold">
          Sección {idx + 1} de {SECCIONES.length}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-rotary-blue">{s.titulo}</h1>
          <Pill className={nivel.color}>{nivel.etiqueta}</Pill>
        </div>
        <p className="mt-1 text-sm text-rotary-gray">{SECCIONES[idx].descripcion}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-xs text-rotary-gray">Promedio del club</p>
          <p className="text-3xl font-bold text-rotary-blue">
            {s.promedio} <span className="text-base text-rotary-gray">/ {ITEMS_POR_SECCION}</span>
          </p>
        </Card>
        <Card>
          <p className="text-xs text-rotary-gray">Respuestas que marcan &quot;atender&quot;</p>
          <p className="text-3xl font-bold text-rotary-blue">
            {s.porcentajeAtencion}% <span className="text-base text-rotary-gray">({s.respuestasConAtencion} de {stats.total})</span>
          </p>
        </Card>
        <Card>
          <p className="text-xs text-rotary-gray">Comentarios recibidos</p>
          <p className="text-3xl font-bold text-rotary-blue">{s.comentarios.length}</p>
        </Card>
      </div>

      <Card>
        <h2 className="font-bold text-rotary-blue">Afirmaciones, de menor a mayor cumplimiento</h2>
        <p className="text-xs text-rotary-gray">Porcentaje de respuestas que marcaron la afirmación como verdadera.</p>
        <ol className="mt-4 space-y-4">
          {itemsOrdenados.map((it) => {
            const color =
              it.porcentaje < 40 ? "bg-rotary-cranberry" : it.porcentaje < 70 ? "bg-rotary-gold" : "bg-rotary-grass";
            return (
              <li key={it.indice} className="text-sm">
                <div className="flex justify-between gap-3">
                  <p>
                    <span className="text-rotary-gray mr-1">{it.indice + 1}.</span>
                    {it.texto}
                  </p>
                  <span className="font-bold whitespace-nowrap">
                    {it.porcentaje}% <span className="text-xs text-rotary-gray font-normal">({it.si})</span>
                  </span>
                </div>
                <Barra porcentaje={it.porcentaje} color={color} className="mt-1 h-2" />
              </li>
            );
          })}
        </ol>
      </Card>

      <Card>
        <h2 className="font-bold text-rotary-blue">Comentarios</h2>
        {s.comentarios.length === 0 ? (
          <p className="mt-2 text-sm text-rotary-gray">No hay comentarios en esta sección.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {s.comentarios.map((c, i) => (
              <li key={i} className="rounded-md bg-rotary-gray-light p-3 text-sm">
                <p className="whitespace-pre-wrap">{c.texto}</p>
                <p className="mt-1 text-xs text-rotary-gray">
                  {c.nombre ?? "Anónimo"} · {formatoFecha(c.fecha)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="flex justify-between">
        {anterior ? (
          <ButtonLink href={`/admin/seccion/${anterior.id}`} variant="outline">
            ← {anterior.titulo}
          </ButtonLink>
        ) : (
          <span />
        )}
        {siguiente ? (
          <ButtonLink href={`/admin/seccion/${siguiente.id}`} variant="outline">
            {siguiente.titulo} →
          </ButtonLink>
        ) : (
          <ButtonLink href="/admin" variant="outline">
            Volver al dashboard
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
