import { notFound } from "next/navigation";
import { requireVpa } from "@/lib/vpa-auth";
import { getAlumno } from "@/lib/vpa-queries";
import { Card } from "@/components/ui";
import { AlumnoForm } from "../../AlumnoForm";

export const dynamic = "force-dynamic";

export default async function EditarAlumno({ params }: { params: Promise<{ id: string }> }) {
  await requireVpa(["rotario", "maestro"]);
  const { id } = await params;
  const alumno = await getAlumno(id);
  if (!alumno) notFound();
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-rotary-blue">Editar alumno</h1>
      <Card>
        <AlumnoForm alumno={alumno} />
      </Card>
    </div>
  );
}
