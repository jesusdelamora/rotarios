import { requireVpa } from "@/lib/vpa-auth";
import { getClaves } from "@/lib/vpa-queries";
import { Card } from "@/components/ui";
import { ClavesForm } from "./ClavesForm";

export const dynamic = "force-dynamic";

export default async function AjustesVpa() {
  await requireVpa(["rotario"]);
  const claves = await getClaves();
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-rotary-blue">Ajustes</h1>
      <Card>
        <h2 className="font-bold text-rotary-blue">Claves de acceso</h2>
        <p className="mt-1 text-sm text-rotary-gray">
          Cada tipo de usuario entra con su clave. Compártela solo con quien corresponda; si se filtra, cámbiala aquí.
          Los padres además necesitan el folio de su alumno.
        </p>
        <ClavesForm claves={claves} />
      </Card>
    </div>
  );
}
