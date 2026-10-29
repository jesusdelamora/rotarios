import Link from "next/link";
import { requireVpa } from "@/lib/vpa-auth";
import { getAlumnos } from "@/lib/vpa-queries";
import { formatoFecha } from "@/lib/stats";
import { ButtonLink, Card, Input } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AlumnosPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireVpa(["rotario", "maestro"]);
  const { q } = await searchParams;
  const alumnos = await getAlumnos({ buscar: q });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-rotary-blue">Alumnos</h1>
        <ButtonLink href="/aprender/alumnos/nuevo" variant="gold">
          + Registrar alumno
        </ButtonLink>
      </div>

      <form className="flex gap-2" action="/aprender/alumnos">
        <Input name="q" defaultValue={q ?? ""} placeholder="Buscar por nombre, escuela o folio" />
        <button className="rounded-md border border-rotary-blue px-4 font-semibold text-rotary-blue">Buscar</button>
      </form>

      {alumnos.length === 0 ? (
        <Card className="text-center text-rotary-gray">
          {q ? "No hay alumnos que coincidan con la búsqueda." : "Aún no hay alumnos registrados."}
        </Card>
      ) : (
        <ul className="space-y-2">
          {alumnos.map((a) => (
            <li key={a.id}>
              <Link href={`/aprender/alumnos/${a.id}`} className="block">
                <Card className="flex items-center gap-3 hover:border-rotary-azure transition-colors py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-rotary-blue truncate">{a.nombre}</span>
                    <span className="block text-xs text-rotary-gray truncate">
                      {a.escuela || "Sin escuela"}
                      {a.edad != null && ` · ${a.edad} años`} · {formatoFecha(a.actualizadoEn)}
                    </span>
                  </span>
                  <span className="text-right shrink-0">
                    <span className="block font-mono text-sm font-bold tracking-widest text-rotary-blue-dark">{a.folio}</span>
                    <span className="block text-xs text-rotary-gray">
                      {a.cuestionarios} cuestionario{a.cuestionarios === 1 ? "" : "s"}
                    </span>
                  </span>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
