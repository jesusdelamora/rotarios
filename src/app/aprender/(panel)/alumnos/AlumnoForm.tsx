"use client";

import { useActionState } from "react";
import { crearAlumno, editarAlumno } from "../../actions";
import { Button, ButtonLink, Input } from "@/components/ui";
import type { VpaAlumnoRow } from "@/db/schema";

export function AlumnoForm({ alumno }: { alumno?: VpaAlumnoRow }) {
  const [state, action, pending] = useActionState(alumno ? editarAlumno : crearAlumno, undefined);
  return (
    <form action={action} className="space-y-4">
      {alumno && <input type="hidden" name="id" value={alumno.id} />}
      <label className="block">
        <span className="text-sm font-semibold">Nombre del alumno *</span>
        <Input name="nombre" required defaultValue={alumno?.nombre ?? ""} autoFocus={!alumno} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold">Edad</span>
          <Input name="edad" type="number" min={0} max={25} inputMode="numeric" defaultValue={alumno?.edad ?? ""} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Escuela</span>
          <Input name="escuela" defaultValue={alumno?.escuela ?? ""} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Padre, madre o tutor(a)</span>
          <Input name="tutor" defaultValue={alumno?.tutor ?? ""} />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Teléfono de contacto</span>
          <Input name="telefono" type="tel" inputMode="tel" defaultValue={alumno?.telefono ?? ""} />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold">Evaluador(a)</span>
          <Input name="evaluador" defaultValue={alumno?.evaluador ?? ""} />
        </label>
      </div>
      {state?.error && <p className="text-sm font-semibold text-rotary-cranberry">{state.error}</p>}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <ButtonLink href={alumno ? `/aprender/alumnos/${alumno.id}` : "/aprender/alumnos"} variant="outline">
          Cancelar
        </ButtonLink>
        <Button type="submit" variant="gold" disabled={pending}>
          {pending ? "Guardando…" : alumno ? "Guardar cambios" : "Registrar alumno"}
        </Button>
      </div>
    </form>
  );
}
