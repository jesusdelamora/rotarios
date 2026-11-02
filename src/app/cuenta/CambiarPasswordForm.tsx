"use client";

import { useActionState } from "react";
import { cambiarMiPassword } from "../auth-actions";
import { Button, Input } from "@/components/ui";

export function CambiarPasswordForm() {
  const [state, action, pending] = useActionState(cambiarMiPassword, undefined);
  return (
    <form action={action} className="mt-3 space-y-3">
      <label className="block">
        <span className="text-sm font-semibold">Contraseña actual</span>
        <Input type="password" name="actual" required autoComplete="current-password" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Contraseña nueva</span>
        <Input type="password" name="nueva" required minLength={6} autoComplete="new-password" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Confirmar contraseña nueva</span>
        <Input type="password" name="confirmar" required minLength={6} autoComplete="new-password" />
      </label>
      {state?.error && <p className="text-sm font-semibold text-rotary-cranberry">{state.error}</p>}
      {state?.ok && <p className="text-sm font-semibold text-rotary-grass">Contraseña actualizada.</p>}
      <Button type="submit" variant="gold" disabled={pending}>
        {pending ? "Guardando…" : "Guardar"}
      </Button>
    </form>
  );
}
