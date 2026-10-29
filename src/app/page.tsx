import Link from "next/link";
import { CLUB } from "@/data/encuesta";

const APPS = [
  {
    href: "/encuesta",
    titulo: "Encuesta",
    descripcion: "Encuesta sobre la salud del club. Responde en unos 10 minutos.",
    color: "bg-rotary-blue",
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 sm:h-12 sm:w-12">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 3.5h6v2H9z" fill="currentColor" stroke="none" />
        <path d="M8.5 11l2 2 4-4" />
        <path d="M8.5 16.5h7" />
      </svg>
    ),
  },
  {
    href: "/aprender",
    titulo: "Ver para aprender",
    descripcion: "Salud visual pediátrica: registro de alumnos y cuestionarios.",
    color: "bg-rotary-gold",
    icono: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-10 w-10 sm:h-12 sm:w-12">
        <circle cx="7" cy="14" r="3.5" />
        <circle cx="17" cy="14" r="3.5" />
        <path d="M10.5 14h3" />
        <path d="M3.5 14l2-6h2" />
        <path d="M20.5 14l-2-6h-2" />
      </svg>
    ),
  },
] as const;

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-widest text-rotary-gold-dark font-semibold">Bienvenido</p>
        <h1 className="mt-1 text-2xl sm:text-4xl font-bold text-rotary-blue">{CLUB}</h1>
        <p className="mt-2 text-sm text-rotary-gray">¿Qué quieres hacer hoy?</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {APPS.map((app) => (
          <Link
            key={app.href}
            href={app.href}
            className="group flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm border border-rotary-gray-mid active:scale-[0.98] transition-transform hover:border-rotary-azure sm:flex-col sm:items-start sm:gap-3 sm:p-6"
          >
            <span
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white sm:h-20 sm:w-20 ${app.color} ${
                app.color === "bg-rotary-gold" ? "text-rotary-blue-dark" : ""
              }`}
            >
              {app.icono}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-lg font-bold text-rotary-blue sm:text-xl">{app.titulo}</span>
              <span className="mt-0.5 block text-sm text-rotary-gray leading-snug">{app.descripcion}</span>
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 shrink-0 text-rotary-gray-mid group-hover:text-rotary-azure sm:hidden">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-rotary-gray">
        <a href="/admin" className="hover:underline">
          Acceso para la directiva
        </a>
      </p>
    </div>
  );
}
