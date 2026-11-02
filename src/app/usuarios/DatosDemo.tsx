"use client";

import { useActionState } from "react";
import { borrarDemo, cargarDemo, type EstadoDemo } from "./actions";
import { NOMBRE_ROL } from "@/data/vpa";
import { Button, Card } from "@/components/ui";

async function cargar(): Promise<EstadoDemo> {
  return cargarDemo();
}
async function borrar(): Promise<EstadoDemo> {
  if (!confirm("¿Borrar las cuentas, alumnos y cuestionarios de prueba?")) return undefined;
  return borrarDemo();
}

export function DatosDemo({ hayDemo }: { hayDemo: boolean }) {
  const [state, cargarAction, cargando] = useActionState(cargar, undefined);
  const [stateBorrar, borrarAction, borrando] = useActionState(borrar, undefined);
  const msg = state ?? stateBorrar;

  return (
    <Card className="mt-6">
      <h2 className="text-base font-bold text-rotary-blue">Datos de prueba</h2>
      <p className="mt-1 text-sm text-rotary-gray">
        Crea tres cuentas (rotario, maestro y papá), cinco alumnos de la Primaria Benito Juárez y varios cuestionarios para
        probar la app. Se puede repetir: no duplica nada y asigna contraseñas nuevas a las cuentas de prueba.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <form action={cargarAction}>
          <Button type="submit" variant="outline" disabled={cargando || borrando}>
            {cargando ? "Cargando…" : hayDemo ? "Volver a cargar datos de prueba" : "Cargar datos de prueba"}
          </Button>
        </form>
        {hayDemo && (
          <form action={borrarAction}>
            <Button type="submit" variant="outline" disabled={cargando || borrando} className="text-rotary-cranberry border-rotary-cranberry">
              {borrando ? "Borrando…" : "Borrar datos de prueba"}
            </Button>
          </form>
        )}
      </div>
      {msg?.error && <p className="mt-3 text-sm font-semibold text-rotary-cranberry">{msg.error}</p>}
      {msg?.ok && <p className="mt-3 text-sm font-semibold text-rotary-grass">{msg.ok}</p>}
      {state?.cuentas && (
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-rotary-gray">
              <th className="py-1">Usuario</th>
              <th className="py-1">Contraseña</th>
              <th className="py-1">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {state.cuentas.map((c) => (
              <tr key={c.usuario} className="border-t border-rotary-gray-light">
                <td className="py-1 font-mono">{c.usuario}</td>
                <td className="py-1 font-mono font-bold text-rotary-blue whitespace-nowrap">{c.password}</td>
                <td className="py-1">{NOMBRE_ROL[c.rol as keyof typeof NOMBRE_ROL]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
