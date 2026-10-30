import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { cerrarSesion } from "../../auth-actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const s = await requireAdmin();
  const links = [
    { href: "/", label: "Inicio" },
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/respuestas", label: "Respuestas" },
    { href: "/admin/resumenes", label: "Resúmenes" },
  ] as const;
  return (
    <div>
      <nav className="no-print bg-rotary-blue text-white">
        <div className="mx-auto max-w-5xl px-4 flex items-center gap-1 overflow-x-auto">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="px-3 py-2.5 text-sm font-semibold hover:bg-rotary-blue-dark whitespace-nowrap">
              {l.label}
            </Link>
          ))}
          <a href="/api/admin/export" className="px-3 py-2.5 text-sm font-semibold hover:bg-rotary-blue-dark whitespace-nowrap">
            Exportar CSV
          </a>
          <Link href="/usuarios" className="px-3 py-2.5 text-sm font-semibold hover:bg-rotary-blue-dark whitespace-nowrap">
            Usuarios
          </Link>
          <Link href="/cuenta" className="ml-auto px-2 py-2.5 text-xs whitespace-nowrap hover:underline">
            {s.nombre}
          </Link>
          <form action={cerrarSesion}>
            <button className="px-3 py-2.5 text-sm hover:bg-rotary-blue-dark whitespace-nowrap">Salir</button>
          </form>
        </div>
      </nav>
      <div className="mx-auto max-w-5xl px-4 py-6">{children}</div>
    </div>
  );
}
