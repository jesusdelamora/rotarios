import Link from "next/link";
import { requireVpa } from "@/lib/vpa-auth";
import { NOMBRE_ROL, VPA_NOMBRE } from "@/data/vpa";
import { logoutVpa } from "../actions";

export default async function PanelVpaLayout({ children }: { children: React.ReactNode }) {
  const s = await requireVpa();
  const links =
    s.rol === "papa"
      ? [{ href: `/aprender/alumnos/${s.alumnoId}`, label: "Mi alumno" }]
      : [
          { href: "/aprender/alumnos", label: "Alumnos" },
          ...(s.rol === "rotario" ? [{ href: "/aprender/ajustes", label: "Ajustes" }] : []),
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
          <span className="ml-auto px-2 text-xs opacity-90 whitespace-nowrap">{NOMBRE_ROL[s.rol]}</span>
          <form action={logoutVpa}>
            <button className="px-3 py-2.5 text-sm hover:bg-rotary-azure whitespace-nowrap">Salir</button>
          </form>
        </div>
      </nav>
      <div className="mx-auto max-w-5xl px-4 py-5">{children}</div>
    </div>
  );
}
