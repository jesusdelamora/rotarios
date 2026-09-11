"use client";

import { useActionState } from "react";
import { generarResumen } from "../../actions";
import { Button, Input } from "@/components/ui";

export function ResumenForm() {
  const [state, action, pending] = useActionState(generarResumen, undefined);
  return (
    <form action={action} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
      <label className="block">
        <span className="text-xs font-semibold">Título (opcional)</span>
        <Input name="titulo" placeholder="Resumen enero 2026" />
      </label>
      <label className="block">
        <span className="text-xs font-semibold">Desde</span>
        <Input type="date" name="desde" />
      </label>
      <label className="block">
        <span className="text-xs font-semibold">Hasta</span>
        <Input type="date" name="hasta" />
      </label>
      <Button type="submit" variant="gold" disabled={pending}>
        {pending ? "Generando…" : "Generar"}
      </Button>
      {state?.error && (
        <p className="sm:col-span-4 text-sm font-semibold text-rotary-cranberry">{state.error}</p>
      )}
    </form>
  );
}
