import { requireSesion } from "@/lib/auth";
import { NOMBRE_ROL } from "@/data/vpa";
import { ButtonLink, Card } from "@/components/ui";
import { CambiarPasswordForm } from "./CambiarPasswordForm";
import { cerrarSesion } from "../auth-actions";

export const dynamic = "force-dynamic";

export default async function CuentaPage() {
  const s = await requireSesion(undefined, "/cuenta");
  return (
    <div className="mx-auto max-w-md px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold text-rotary-blue">Mi cuenta</h1>
      <Card>
        <dl className="text-sm space-y-1">
          <div className="flex justify-between"><dt className="text-rotary-gray">Nombre</dt><dd className="font-semibold">{s.nombre}</dd></div>
          <div className="flex justify-between"><dt className="text-rotary-gray">Usuario</dt><dd className="font-mono">{s.usuario}</dd></div>
          <div className="flex justify-between"><dt className="text-rotary-gray">Tipo</dt><dd className="font-semibold">{NOMBRE_ROL[s.rol]}</dd></div>
        </dl>
      </Card>
      <Card>
        <h2 className="font-bold text-rotary-blue">Cambiar contraseña</h2>
        <CambiarPasswordForm />
      </Card>
      <div className="flex justify-between">
        <ButtonLink href={s.rol === "rotario" ? "/" : "/aprender"} variant="outline">
          Volver
        </ButtonLink>
        <form action={cerrarSesion}>
          <button className="rounded-md px-4 py-2 font-semibold text-rotary-cranberry hover:bg-pink-50">Cerrar sesión</button>
        </form>
      </div>
    </div>
  );
}
