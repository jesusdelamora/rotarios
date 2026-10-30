import { Card } from "@/components/ui";
import { UsuarioForm } from "../UsuarioForm";

export const dynamic = "force-dynamic";

export default function NuevoUsuario() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold text-rotary-blue">Nuevo usuario</h1>
      <Card>
        <UsuarioForm />
      </Card>
    </div>
  );
}
