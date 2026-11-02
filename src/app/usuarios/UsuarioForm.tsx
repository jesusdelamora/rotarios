"use client";

import { useActionState, useState } from "react";
import { crearUsuario } from "./actions";
import { ROLES_VPA, type RolVpa } from "@/data/vpa";
import { Button, ButtonLink, Input } from "@/components/ui";

export function UsuarioForm() {
  const [state, action, pending] = useActionState(crearUsuario, undefined);
  const [rol, setRol] = useState<RolVpa>("maestro");
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="text-sm font-semibold">Nombre completo *</span>
        <Input name="nombre" required autoFocus />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold">Nombre de usuario *</span>
          <span className="block text-xs text-rotary-gray">Minúsculas, sin espacios. Ej. maria.lopez</span>
          <Input name="usuario" required pattern="[a-z0-9._-]{3,30}" autoCapitalize="none" autoComplete="off" className="font-mono" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Contraseña inicial *</span>
          <span className="block text-xs text-rotary-gray">Mínimo 6 caracteres. La persona puede cambiarla después.</span>
          <Input name="password" required minLength={6} autoComplete="new-password" />
        </label>
      </div>
      <fieldset>
        <legend className="text-sm font-semibold">Tipo de usuario *</legend>
        <div className="mt-1 grid gap-2 sm:grid-cols-3">
          {ROLES_VPA.map((r) => (
            <label
              key={r.id}
              className={`cursor-pointer rounded-md border p-3 text-sm ${rol === r.id ? "border-rotary-blue bg-blue-50" : "border-rotary-gray-mid"}`}
            >
              <input type="radio" name="rol" value={r.id} checked={rol === r.id} onChange={() => setRol(r.id)} className="mr-2 accent-rotary-blue" />
              <span className="font-semibold">{r.nombre}</span>
              <span className="mt-1 block text-xs text-rotary-gray">{r.descripcion}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {rol === "papa" && (
        <label className="block">
          <span className="text-sm font-semibold">Folios de sus hijos</span>
          <span className="block text-xs text-rotary-gray">Separados por coma. Se pueden agregar después.</span>
          <Input name="folios" placeholder="K7PQ2M, E5VYSP" className="uppercase tracking-widest" autoComplete="off" />
        </label>
      )}
      {state?.error && <p className="text-sm font-semibold text-rotary-cranberry">{state.error}</p>}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <ButtonLink href="/usuarios" variant="outline">
          Cancelar
        </ButtonLink>
        <Button type="submit" variant="gold" disabled={pending}>
          {pending ? "Creando…" : "Crear usuario"}
        </Button>
      </div>
    </form>
  );
}
