import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSesion } from "@/lib/auth";
import { getAlumnosDeUsuario, getUsuario } from "@/lib/usuarios";
import { NOMBRE_ROL } from "@/data/vpa";
import { formatoFechaHora } from "@/lib/stats";
import { Button, Card, Pill } from "@/components/ui";
import { cambiarActivo, quitarVinculo } from "../actions";
import { EditarUsuarioForm, ResetPasswordForm, VincularForm } from "./forms";

export const dynamic = "force-dynamic";

export default async function UsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const s = await requireSesion(["rotario"], "/usuarios");
  const { id } = await params;
  const u = await getUsuario(id);
  if (!u) notFound();
  const alumnos = u.rol === "papa" ? await getAlumnosDeUsuario(id) : [];
  const esYo = u.id === s.id;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Link href="/usuarios" className="text-sm text-rotary-azure hover:underline">
        ← Usuarios
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-rotary-blue">{u.nombre}</h1>
          <p className="text-sm text-rotary-gray">
            <span className="font-mono">{u.usuario}</span> · {NOMBRE_ROL[u.rol as keyof typeof NOMBRE_ROL]}
            {esYo && " · esta es tu cuenta"}
          </p>
          <p className="text-xs text-rotary-gray">
            Creado {formatoFechaHora(u.creadoEn)}
            {u.ultimoAcceso ? ` · último acceso ${formatoFechaHora(u.ultimoAcceso)}` : " · nunca ha entrado"}
          </p>
        </div>
        {u.activo ? <Pill className="bg-rotary-grass">Activo</Pill> : <Pill className="bg-rotary-cranberry">Desactivado</Pill>}
      </div>

      <Card>
        <h2 className="font-bold text-rotary-blue">Datos</h2>
        <EditarUsuarioForm id={u.id} nombre={u.nombre} rol={u.rol} />
      </Card>

      {u.rol === "papa" && (
        <Card>
          <h2 className="font-bold text-rotary-blue">Hijos vinculados</h2>
          {alumnos.length === 0 ? (
            <p className="mt-1 text-sm text-rotary-gray">Sin alumnos vinculados todavía.</p>
          ) : (
            <ul className="mt-2 divide-y divide-rotary-gray-mid text-sm">
              {alumnos.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-2">
                  <span>
                    <Link href={`/aprender/alumnos/${a.id}`} className="font-semibold text-rotary-azure hover:underline">
                      {a.nombre}
                    </Link>
                    <span className="ml-2 font-mono text-xs text-rotary-gray">{a.folio}</span>
                  </span>
                  <form action={quitarVinculo}>
                    <input type="hidden" name="id" value={u.id} />
                    <input type="hidden" name="alumnoId" value={a.id} />
                    <button className="text-xs text-rotary-cranberry hover:underline">Quitar</button>
                  </form>
                </li>
              ))}
            </ul>
          )}
          <VincularForm id={u.id} />
        </Card>
      )}

      <Card>
        <h2 className="font-bold text-rotary-blue">Restablecer contraseña</h2>
        <p className="text-xs text-rotary-gray">Para cuando la persona la olvide. También desbloquea la cuenta si tuvo muchos intentos fallidos.</p>
        <ResetPasswordForm id={u.id} />
      </Card>

      {!esYo && (
        <form action={cambiarActivo} className="flex justify-end">
          <input type="hidden" name="id" value={u.id} />
          <input type="hidden" name="activo" value={u.activo ? "0" : "1"} />
          <Button type="submit" variant={u.activo ? "danger" : "outline"}>
            {u.activo ? "Desactivar cuenta" : "Reactivar cuenta"}
          </Button>
        </form>
      )}
    </div>
  );
}
