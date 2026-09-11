"use client";

import { eliminarRespuesta } from "../../actions";

export function BorrarFila({ id, etiqueta }: { id: string; etiqueta: string }) {
  return (
    <form
      action={eliminarRespuesta}
      onSubmit={(e) => {
        if (!window.confirm(`¿Eliminar la respuesta de ${etiqueta}? Esta acción no se puede deshacer.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="rounded px-2 py-1 text-xs font-semibold text-rotary-cranberry hover:bg-pink-50"
        title="Eliminar esta respuesta"
      >
        Eliminar
      </button>
    </form>
  );
}
