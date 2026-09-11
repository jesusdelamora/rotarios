"use client";

import { useActionState } from "react";
import { login } from "../actions";
import { Button, Input } from "@/components/ui";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="mt-5 space-y-4">
      <label className="block">
        <span className="text-sm font-semibold">Password</span>
        <Input type="password" name="password" required autoFocus autoComplete="current-password" />
      </label>
      {state?.error && <p className="text-sm font-semibold text-rotary-cranberry">{state.error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
