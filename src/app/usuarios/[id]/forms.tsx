"use client";

import { useActionState } from "react";
import { editarUsuario, resetearPassword, vincularPorFolio } from "../actions";
import { ROLES_VPA } from "@/data/vpa";
import { Button, Input } from "@/components/ui";

function Mensajes({ state }: { state: { error?: string; ok?: string } | undefined }) {
  if (!state) return null;
  if (state.error) return <p className="text-sm font-semibold text-rotary-cranberry">{state.error}</p>;
  if (state.ok) return <p className="text-sm font-semibold text-rotary-grass">{state.ok}</p>;
  return null;
}

export function EditarUsuarioForm({ id, nombre, rol }: { id: string; nombre: string; rol: string }) {
  const [state, action, pending] = useActionState(editarUsuario, undefined);
  return (
    <form action={action} className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto_auto] sm:items-end">
      <input type="hidden" name="id" value={id} />
      <label className="block">
        <span className="text-xs font-semibold">Nombre</span>
        <Input name="nombre" defaultValue={nombre} required />
      </label>
      <label className="block">
        <span className="text-xs font-semibold">Tipo</span>
        <select name="rol" defaultValue={rol} className="w-full rounded-md border border-rotary-gray-mid px-3 py-2 bg-white">
          {ROLES_VPA.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "…" : "Guardar"}
      </Button>
      <div className="sm:col-span-3">
        <Mensajes state={state} />
      </div>
    </form>
  );
}

export function ResetPasswordForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(resetearPassword, undefined);
  return (
    <form action={action} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
      <input type="hidden" name="id" value={id} />
      <label className="block flex-1">
        <span className="text-xs font-semibold">Contraseña nueva</span>
        <Input name="password" required minLength={6} autoComplete="new-password" />
      </label>
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "…" : "Restablecer"}
      </Button>
      <div className="sm:basis-full">
        <Mensajes state={state} />
      </div>
    </form>
  );
}

export function VincularForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(vincularPorFolio, undefined);
  return (
    <form action={action} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
      <input type="hidden" name="id" value={id} />
      <label className="block flex-1">
        <span className="text-xs font-semibold">Vincular alumno por folio</span>
        <Input name="folio" required placeholder="K7PQ2M" className="uppercase tracking-widest" autoComplete="off" />
      </label>
      <Button type="submit" variant="outline" disabled={pending}>
        {pending ? "…" : "Vincular"}
      </Button>
      <div className="sm:basis-full">
        <Mensajes state={state} />
      </div>
    </form>
  );
}
