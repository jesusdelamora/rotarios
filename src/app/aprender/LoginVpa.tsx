"use client";

import { useActionState } from "react";
import { loginVpa } from "./actions";
import { Button, Input } from "@/components/ui";

export function LoginVpa() {
  const [state, action, pending] = useActionState(loginVpa, undefined);
  return (
    <form action={action} className="mt-4 space-y-4">
      <label className="block">
        <span className="text-sm font-semibold">Clave de acceso</span>
        <Input type="password" name="clave" required autoFocus autoComplete="off" className="text-lg" />
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Folio del alumno</span>
        <span className="block text-xs text-rotary-gray">Solo para padres, madres o tutores. Lo entrega la escuela.</span>
        <Input name="folio" autoComplete="off" placeholder="Ej. K7PQ2M" className="uppercase tracking-widest" maxLength={8} />
      </label>
      {state?.error && <p className="text-sm font-semibold text-rotary-cranberry">{state.error}</p>}
      <Button type="submit" className="w-full py-3 text-base" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
