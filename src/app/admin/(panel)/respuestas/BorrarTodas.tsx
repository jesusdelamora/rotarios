"use client";

import { useState } from "react";
import { eliminarTodasLasRespuestas } from "../../actions";
import { Button, Input } from "@/components/ui";

export function BorrarTodas({ total }: { total: number }) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  if (total === 0) return null;
  if (!abierto) {
    return (
      <Button type="button" variant="danger" onClick={() => setAbierto(true)}>
        Borrar todas las respuestas
      </Button>
    );
  }
  return (
    <form
      action={eliminarTodasLasRespuestas}
      className="rounded-md border border-rotary-cranberry bg-pink-50 p-3 text-sm sm:flex sm:items-end sm:gap-3"
    >
      <label className="block">
        <span className="font-semibold text-rotary-cranberry">
          Se eliminarán {total} respuesta{total === 1 ? "" : "s"} de forma permanente. Escribe BORRAR para confirmar:
        </span>
        <Input name="confirmar" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="BORRAR" autoFocus />
      </label>
      <div className="mt-2 flex gap-2 sm:mt-0">
        <Button type="submit" variant="danger" disabled={texto !== "BORRAR"}>
          Borrar todo
        </Button>
        <Button type="button" variant="outline" onClick={() => { setAbierto(false); setTexto(""); }}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
