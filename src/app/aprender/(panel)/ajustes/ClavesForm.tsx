"use client";

import { useActionState } from "react";
import { actualizarClaves } from "../../actions";
import { ROLES_VPA, type RolVpa } from "@/data/vpa";
import { Button, Input } from "@/components/ui";

export function ClavesForm({ claves }: { claves: Record<RolVpa, string> }) {
  const [state, action, pending] = useActionState(actualizarClaves, undefined);
  const guardado = state !== undefined && !state.error;
  return (
    <form action={action} className="mt-4 space-y-4">
      {ROLES_VPA.map((r) => (
        <label key={r.id} className="block">
          <span className="text-sm font-semibold">{r.nombre}</span>
          <span className="block text-xs text-rotary-gray">{r.descripcion}</span>
          <Input name={r.id} defaultValue={claves[r.id]} required minLength={4} autoComplete="off" className="font-mono" />
        </label>
      ))}
      {state?.error && <p className="text-sm font-semibold text-rotary-cranberry">{state.error}</p>}
      {guardado && <p className="text-sm font-semibold text-rotary-grass">Claves guardadas.</p>}
      <Button type="submit" variant="gold" disabled={pending}>
        {pending ? "Guardando…" : "Guardar claves"}
      </Button>
    </form>
  );
}
