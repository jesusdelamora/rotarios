import { requireVpa } from "@/lib/vpa-auth";
import { Card } from "@/components/ui";
import { AlumnoForm } from "../AlumnoForm";

export const dynamic = "force-dynamic";

export default async function NuevoAlumno() {
  await requireVpa(["rotario", "maestro"]);
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-rotary-blue">Registrar alumno</h1>
      <p className="text-sm text-rotary-gray">Datos generales. Al guardar se genera un folio para que los padres puedan entrar.</p>
      <Card>
        <AlumnoForm />
      </Card>
    </div>
  );
}
