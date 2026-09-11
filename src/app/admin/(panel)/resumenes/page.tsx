import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getResumenes } from "@/lib/queries";
import { formatoFecha, formatoFechaHora } from "@/lib/stats";
import { Card } from "@/components/ui";
import { ResumenForm } from "./ResumenForm";

export const dynamic = "force-dynamic";

export default async function ResumenesPage() {
  await requireAdmin();
  const lista = await getResumenes();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-rotary-blue">Resúmenes</h1>
      <Card>
        <h2 className="font-bold text-rotary-blue">Generar un resumen nuevo</h2>
        <p className="text-sm text-rotary-gray">
          Toma las respuestas del rango de fechas (o todas, si lo dejas vacío), calcula los resultados y guarda una
          fotografía que puedes consultar e imprimir después.
        </p>
        <ResumenForm />
      </Card>
      <Card className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-rotary-gray-light text-left text-xs uppercase text-rotary-gray">
            <tr>
              <th className="px-4 py-2">Título</th>
              <th className="px-4 py-2">Generado</th>
              <th className="px-4 py-2">Rango</th>
              <th className="px-4 py-2 text-center">Respuestas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-rotary-gray-mid">
            {lista.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-rotary-gray">
                  Aún no se ha generado ningún resumen.
                </td>
              </tr>
            )}
            {lista.map((r) => (
              <tr key={r.id} className="hover:bg-rotary-gray-light">
                <td className="px-4 py-2">
                  <Link href={`/admin/resumenes/${r.id}`} className="font-semibold text-rotary-azure hover:underline">
                    {r.titulo}
                  </Link>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">{formatoFechaHora(r.creadoEn)}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  {r.desde || r.hasta
                    ? `${r.desde ? formatoFecha(r.desde) : "inicio"} – ${r.hasta ? formatoFecha(r.hasta) : "hoy"}`
                    : "Todas"}
                </td>
                <td className="px-4 py-2 text-center">{r.totalRespuestas}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
