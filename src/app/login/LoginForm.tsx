"use client";

import { useActionState } from "react";
import { iniciarSesion } from "../auth-actions";
import { Button, Input } from "@/components/ui";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(iniciarSesion, undefined);
  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <label className="block">
        <span className="text-sm font-semibold">Usuario</span>
        <Input name="usuario" required autoFocus autoComplete="username" autoCapitalize="none" className="text-lg" defaultValue={state?.usuario ?? ""} />
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Contraseña</span>
        <Input type="password" name="password" required autoComplete="current-password" className="text-lg" />
      </label>
      {state?.error && <p className="text-sm font-semibold text-rotary-cranberry">{state.error}</p>}
      <Button type="submit" className="w-full py-3 text-base" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
