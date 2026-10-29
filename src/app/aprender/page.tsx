import { redirect } from "next/navigation";
import { getSesionVpa } from "@/lib/vpa-auth";
import { VPA_NOMBRE, VPA_PROGRAMA, ROLES_VPA } from "@/data/vpa";
import { Card } from "@/components/ui";
import { LoginVpa } from "./LoginVpa";

export const dynamic = "force-dynamic";

export default async function AprenderInicio() {
  const s = await getSesionVpa();
  if (s) redirect(s.rol === "papa" && s.alumnoId ? `/aprender/alumnos/${s.alumnoId}` : "/aprender/alumnos");

  return (
    <div className="mx-auto max-w-md px-4 py-6 sm:py-10">
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-widest text-rotary-gold-dark font-semibold">{VPA_NOMBRE}</p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-rotary-blue">{VPA_PROGRAMA}</h1>
      </div>
      <Card>
        <h2 className="font-bold text-rotary-blue">Entrar</h2>
        <p className="mt-1 text-sm text-rotary-gray">Escribe la clave de acceso que te dieron.</p>
        <LoginVpa />
      </Card>
      <Card className="mt-4">
        <h2 className="text-sm font-bold text-rotary-blue">¿Quién puede entrar?</h2>
        <ul className="mt-2 space-y-2 text-sm text-rotary-gray">
          {ROLES_VPA.map((r) => (
            <li key={r.id}>
              <span className="font-semibold text-rotary-blue-dark">{r.nombre}:</span> {r.descripcion}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
