import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getRespuesta } from "@/lib/queries";
import { puntajeSeccion, requiereAtencion, formatoFechaHora } from "@/lib/stats";
import { SECCIONES, ITEMS_POR_SECCION } from "@/data/encuesta";
import { Button, ButtonLink, Card, Pill } from "@/components/ui";
import { eliminarRespuesta } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function RespuestaPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const r = await getRespuesta(id);
  if (!r) notFound();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-rotary-blue">{r.nombre ?? "Respuesta anónima"}</h1>
          <p className="text-sm text-rotary-gray">
            {r.cargo && <>{r.cargo} · </>}
            {formatoFechaHora(r.creadoEn)}
          </p>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/admin/respuestas" variant="outline">
            Volver
          </ButtonLink>
          <form action={eliminarRespuesta}>
            <input type="hidden" name="id" value={r.id} />
            <Button type="submit" variant="danger">
              Eliminar
            </Button>
          </form>
        </div>
      </div>

      {SECCIONES.map((s, i) => {
        const p = puntajeSeccion(r.respuestas, s.id);
        const atender = requiereAtencion(p);
        return (
          <Card key={s.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-bold text-rotary-blue">
                {i + 1}. {s.titulo}
              </h2>
              <div className="flex items-center gap-2">
                <span className="font-bold">
                  {p}/{ITEMS_POR_SECCION}
                </span>
                {atender && <Pill className="bg-rotary-cranberry">Atender</Pill>}
              </div>
            </div>
            <ul className="mt-3 space-y-1.5 text-sm">
              {s.items.map((texto, j) => {
                const on = r.respuestas[s.id]?.[j];
                return (
                  <li key={j} className={`flex gap-2 ${on ? "" : "text-rotary-gray"}`}>
                    <span className={`shrink-0 font-bold ${on ? "text-rotary-grass" : "text-rotary-cranberry"}`}>
                      {on ? "✓" : "✗"}
                    </span>
                    <span>{texto}</span>
                  </li>
                );
              })}
            </ul>
            {r.comentarios[s.id]?.trim() && (
              <div className="mt-3 rounded-md bg-rotary-gray-light p-3 text-sm">
                <p className="text-xs font-semibold text-rotary-gray mb-1">Comentario</p>
                <p className="whitespace-pre-wrap">{r.comentarios[s.id]}</p>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
