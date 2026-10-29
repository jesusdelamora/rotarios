import { notFound, redirect } from "next/navigation";
import { requireVpa, puedeVerAlumno } from "@/lib/vpa-auth";
import { getAlumno } from "@/lib/vpa-queries";
import { Card } from "@/components/ui";
import { CuestionarioForm } from "../CuestionarioForm";

export const dynamic = "force-dynamic";

export default async function NuevoCuestionario({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireVpa();
  const { id } = await params;
  if (!puedeVerAlumno(s, id)) redirect("/aprender");
  const alumno = await getAlumno(id);
  if (!alumno) notFound();
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-rotary-gold-dark font-semibold">Nuevo cuestionario</p>
        <h1 className="text-2xl font-bold text-rotary-blue">{alumno.nombre}</h1>
        {alumno.escuela && <p className="text-sm text-rotary-gray">{alumno.escuela}</p>}
      </div>
      <Card>
        <CuestionarioForm alumnoId={id} rol={s.rol} evaluadorInicial={s.rol === "papa" ? alumno.tutor ?? "" : alumno.evaluador ?? ""} />
      </Card>
    </div>
  );
}
