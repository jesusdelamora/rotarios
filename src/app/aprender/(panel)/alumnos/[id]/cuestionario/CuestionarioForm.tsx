"use client";

import { useActionState, useState } from "react";
import { crearCuestionario } from "../../../../actions";
import { PREGUNTAS_VPA, type RolVpa } from "@/data/vpa";
import { Button, ButtonLink, Input, Textarea } from "@/components/ui";

const AV = [
  { titulo: "AV lejana (3 metros)", campos: [["lejanaOD", "Ojo derecho (OD)"], ["lejanaOI", "Ojo izquierdo (OI)"], ["lejanaAO", "Ambos ojos (AO)"]] },
  { titulo: "AV cercana (40 cm)", campos: [["cercanaOD", "Ojo derecho (OD)"], ["cercanaOI", "Ojo izquierdo (OI)"], ["cercanaAO", "Ambos ojos (AO)"]] },
] as const;

export function CuestionarioForm({ alumnoId, rol, evaluadorInicial }: { alumnoId: string; rol: RolVpa; evaluadorInicial?: string }) {
  const [state, action, pending] = useActionState(crearCuestionario, undefined);
  const [respuestas, setRespuestas] = useState<("si" | "no" | null)[]>(() => PREGUNTAS_VPA.map(() => null));
  const contestadas = respuestas.filter(Boolean).length;
  const hoy = new Date().toISOString().slice(0, 10);
  const puedeAgudeza = rol !== "papa";

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="alumnoId" value={alumnoId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold">Fecha</span>
          <Input type="date" name="fecha" defaultValue={hoy} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">{rol === "papa" ? "¿Quién contesta?" : "Evaluador(a)"}</span>
          <Input name="evaluador" defaultValue={evaluadorInicial ?? ""} placeholder={rol === "papa" ? "Mamá, papá, tutor…" : ""} />
        </label>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <h2 className="font-bold text-rotary-blue">Cuestionario de signos y síntomas</h2>
          <span className="text-xs text-rotary-gray">
            {contestadas}/{PREGUNTAS_VPA.length}
          </span>
        </div>
        <p className="text-xs text-rotary-gray">Marca Sí o No en cada pregunta.</p>
        <ol className="mt-3 divide-y divide-rotary-gray-mid">
          {PREGUNTAS_VPA.map((p, i) => (
            <li key={i} className="py-2.5">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rotary-blue text-xs font-bold text-white">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm leading-snug">{p}</span>
              </div>
              <div className="mt-2 ml-9 flex gap-2">
                {(["si", "no"] as const).map((v) => {
                  const on = respuestas[i] === v;
                  return (
                    <label
                      key={v}
                      className={`flex-1 cursor-pointer rounded-md border px-3 py-2 text-center text-sm font-semibold transition-colors sm:flex-none sm:w-24 ${
                        on
                          ? v === "si"
                            ? "border-rotary-cranberry bg-rotary-cranberry text-white"
                            : "border-rotary-grass bg-rotary-grass text-white"
                          : "border-rotary-gray-mid bg-white text-rotary-gray hover:border-rotary-azure"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q${i}`}
                        value={v}
                        className="sr-only"
                        checked={on}
                        onChange={() => setRespuestas((prev) => prev.map((r, j) => (j === i ? v : r)))}
                      />
                      {v === "si" ? "Sí" : "No"}
                    </label>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {puedeAgudeza && (
        <>
          <div>
            <h2 className="font-bold text-rotary-blue">Agudeza visual</h2>
            <p className="text-xs text-rotary-gray">Opcional. Lo llena quien realiza la evaluación.</p>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {AV.map((bloque) => (
                <div key={bloque.titulo} className="rounded-md bg-rotary-gray-light p-3">
                  <p className="text-sm font-bold text-rotary-blue-dark">{bloque.titulo}</p>
                  <div className="mt-2 space-y-2">
                    {bloque.campos.map(([name, label]) => (
                      <label key={name} className="flex items-center gap-2 text-sm">
                        <span className="w-36 shrink-0 text-rotary-gray">{label}</span>
                        <Input name={name} placeholder="20/20" className="py-1" maxLength={20} />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="font-bold text-rotary-blue">Observaciones del evaluador</span>
            <Textarea name="observaciones" rows={4} className="mt-1" />
          </label>
        </>
      )}

      {state?.error && <p className="text-sm font-semibold text-rotary-cranberry">{state.error}</p>}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <ButtonLink href={`/aprender/alumnos/${alumnoId}`} variant="outline">
          Cancelar
        </ButtonLink>
        <Button type="submit" variant="gold" disabled={pending} className="py-3">
          {pending ? "Guardando…" : "Guardar cuestionario"}
        </Button>
      </div>
    </form>
  );
}
