import Link from "next/link";
import { getUsuarios } from "@/lib/usuarios";
import { NOMBRE_ROL } from "@/data/vpa";
import { formatoFecha } from "@/lib/stats";
import { ButtonLink, Card, Pill } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const lista = await getUsuarios();
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-rotary-blue">Usuarios ({lista.length})</h1>
        <ButtonLink href="/usuarios/nuevo" variant="gold">
          + Nuevo usuario
        </ButtonLink>
      </div>
      <ul className="space-y-2">
        {lista.map((u) => (
          <li key={u.id}>
            <Link href={`/usuarios/${u.id}`} className="block">
              <Card className={`flex items-center gap-3 py-3 hover:border-rotary-azure transition-colors ${u.activo ? "" : "opacity-60"}`}>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-rotary-blue truncate">{u.nombre}</span>
                  <span className="block text-xs text-rotary-gray truncate">
                    <span className="font-mono">{u.usuario}</span>
                    {u.ultimoAcceso ? ` · último acceso ${formatoFecha(u.ultimoAcceso)}` : " · nunca ha entrado"}
                  </span>
                </span>
                <span className="text-right shrink-0 space-y-1">
                  <Pill className={u.rol === "rotario" ? "bg-rotary-blue" : u.rol === "maestro" ? "bg-rotary-sky" : "bg-rotary-gold text-rotary-blue-dark"}>
                    {NOMBRE_ROL[u.rol as keyof typeof NOMBRE_ROL]}
                  </Pill>
                  {!u.activo && <span className="block text-xs font-semibold text-rotary-cranberry">Desactivado</span>}
                </span>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
