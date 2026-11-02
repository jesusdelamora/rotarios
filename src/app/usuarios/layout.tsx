import Link from "next/link";
import { requireSesion } from "@/lib/auth";
import { cerrarSesion } from "../auth-actions";

export default async function UsuariosLayout({ children }: { children: React.ReactNode }) {
  const s = await requireSesion(["rotario"], "/usuarios");
  return (
    <div>
      <nav className="no-print bg-rotary-blue text-white">
        <div className="mx-auto max-w-5xl px-4 flex items-center gap-1 overflow-x-auto">
          <Link href="/" className="px-3 py-2.5 text-sm font-semibold hover:bg-rotary-blue-dark whitespace-nowrap">Inicio</Link>
          <Link href="/usuarios" className="px-3 py-2.5 text-sm font-semibold hover:bg-rotary-blue-dark whitespace-nowrap">Usuarios</Link>
          <Link href="/cuenta" className="px-3 py-2.5 text-sm font-semibold hover:bg-rotary-blue-dark whitespace-nowrap">Mi cuenta</Link>
          <span className="ml-auto px-2 text-xs opacity-90 whitespace-nowrap">{s.nombre}</span>
          <form action={cerrarSesion}>
            <button className="px-3 py-2.5 text-sm hover:bg-rotary-blue-dark whitespace-nowrap">Salir</button>
          </form>
        </div>
      </nav>
      <div className="mx-auto max-w-5xl px-4 py-5">{children}</div>
    </div>
  );
}
