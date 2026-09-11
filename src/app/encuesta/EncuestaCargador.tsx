"use client";

import dynamic from "next/dynamic";

// El formulario guarda y restaura un borrador en localStorage, así que se
// renderiza solo en el cliente para evitar diferencias con el HTML del servidor.
const EncuestaForm = dynamic(() => import("./EncuestaForm").then((m) => m.EncuestaForm), {
  ssr: false,
  loading: () => <p className="text-center text-rotary-gray py-10">Cargando la encuesta…</p>,
});

export function EncuestaCargador() {
  return <EncuestaForm />;
}
