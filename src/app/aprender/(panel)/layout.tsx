import Link from "next/link";
import { requireVpa } from "@/lib/vpa-auth";
import { NOMBRE_ROL, VPA_NOMBRE } from "@/data/vpa";
import { cerrarSesion } from "../../auth-actions";

export default async function PanelVpaLayout({ children }: { children: React.ReactNode }) {
  const s = await requireVpa();
  const links = [
    { href: "/", label: "Inicio" },
    { href: "/aprender/alumnos", label: s.rol === "papa" ? "Mis hijos" : "Alumnos" },
    ...(s.rol === "rotario" ? [{ href: "/usuarios", label: "Usuarios" }] : []),
  ];
  return (
    <div>
      <nav className="no-print bg-rotary-sky text-white">
        <div className="mx-auto max-w-5xl px-4 flex items-center gap-1 overflow-x-auto">
          <span className="hidden sm:inline px-3 py-2.5 text-sm font-bold whitespace-nowrap">{VPA_NOMBRE}</span>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="px-3 py-2.5 text-sm font-semibold hover:bg-rotary-azure whitespace-nowrap">
              {l.label}
            </Link>
          ))}
          <Link href="/cuenta" className="ml-auto px-2 py-2.5 text-xs whitespace-nowrap hover:underline" title={NOMBRE_ROL[s.rol]}>
            {s.nombre}
          </Link>
          <form action={cerrarSesion}>
            <button className="px-3 py-2.5 text-sm hover:bg-rotary-azure whitespace-nowrap">Salir</button>
          </form>
        </div>
      </nav>
      <div className="mx-auto max-w-5xl px-4 py-5">{children}</div>
    </div>
  );
}
