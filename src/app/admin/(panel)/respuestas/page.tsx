import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getRespuestas } from "@/lib/queries";
import { puntajeSeccion, requiereAtencion, formatoFechaHora } from "@/lib/stats";
import { SECCIONES } from "@/data/encuesta";
import { Card } from "@/components/ui";
import { BorrarTodas } from "./BorrarTodas";
import { BorrarFila } from "./BorrarFila";

export const dynamic = "force-dynamic";

export default async function RespuestasPage() {
  await requireAdmin();
  const rs = await getRespuestas();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-rotary-blue">Respuestas ({rs.length})</h1>
        <BorrarTodas total={rs.length} />
      </div>
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-rotary-gray-light text-left text-xs uppercase text-rotary-gray">
            <tr>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Nombre</th>
              {SECCIONES.map((s, i) => (
                <th key={s.id} className="px-2 py-2 text-center" title={s.titulo}>
                  S{i + 1}
                </th>
              ))}
              <th className="px-4 py-2 text-center">Total</th>
              <th className="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rotary-gray-mid">
            {rs.length === 0 && (
              <tr>
                <td colSpan={SECCIONES.length + 4} className="px-4 py-6 text-center text-rotary-gray">
                  Aún no hay respuestas.
                </td>
              </tr>
            )}
            {rs.map((r) => {
              const puntajes = SECCIONES.map((s) => puntajeSeccion(r.respuestas, s.id));
              const total = puntajes.reduce((a, b) => a + b, 0);
              return (
                <tr key={r.id} className="hover:bg-rotary-gray-light">
                  <td className="px-4 py-2 whitespace-nowrap">
                    <Link href={`/admin/respuestas/${r.id}`} className="text-rotary-azure hover:underline">
                      {formatoFechaHora(r.creadoEn)}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    {r.nombre ?? <span className="text-rotary-gray">Anónimo</span>}
                    {r.cargo && <span className="text-xs text-rotary-gray"> · {r.cargo}</span>}
                  </td>
                  {puntajes.map((p, i) => (
                    <td
                      key={i}
                      className={`px-2 py-2 text-center font-semibold ${requiereAtencion(p) ? "text-rotary-cranberry" : ""}`}
                    >
                      {p}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-center font-bold">{total}/75</td>
                  <td className="px-2 py-2 text-right">
                    <BorrarFila id={r.id} etiqueta={`${r.nombre ?? "Anónimo"} (${formatoFechaHora(r.creadoEn)})`} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
