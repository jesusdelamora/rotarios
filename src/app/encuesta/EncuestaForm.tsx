"use client";

import { useEffect, useState, useTransition } from "react";
import { SECCIONES, ITEMS_POR_SECCION, MAX_SIN_MARCAR } from "@/data/encuesta";
import { Button, Card, Input, Textarea } from "@/components/ui";
import { enviarRespuesta } from "./actions";

type Paso = number; // 0 = datos, 1..5 = secciones, 6 = revisión

export const BORRADOR_KEY = "rotarios_encuesta_borrador";

type Borrador = {
  paso: number;
  nombre: string;
  cargo: string;
  respuestas: Record<string, boolean[]>;
  comentarios: Record<string, string>;
};

function leerBorrador(): Borrador | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(BORRADOR_KEY);
    return raw ? (JSON.parse(raw) as Borrador) : null;
  } catch {
    return null;
  }
}

export function EncuestaForm() {
  // Este componente se carga sin SSR (ver EncuestaCargador), así que puede leer
  // el borrador de localStorage al inicializar el estado.
  const [borrador] = useState<Borrador | null>(() => leerBorrador());
  const [paso, setPaso] = useState<Paso>(() =>
    Math.min(Math.max(borrador?.paso ?? 0, 0), SECCIONES.length + 1),
  );
  const [nombre, setNombre] = useState(borrador?.nombre ?? "");
  const [cargo, setCargo] = useState(borrador?.cargo ?? "");
  const [respuestas, setRespuestas] = useState<Record<string, boolean[]>>(() =>
    Object.fromEntries(
      SECCIONES.map((s) => {
        const guardado = borrador?.respuestas?.[s.id];
        const arr = Array.isArray(guardado) ? guardado.slice(0, ITEMS_POR_SECCION).map(Boolean) : [];
        while (arr.length < ITEMS_POR_SECCION) arr.push(false);
        return [s.id, arr];
      }),
    ),
  );
  const [comentarios, setComentarios] = useState<Record<string, string>>(() =>
    Object.fromEntries(SECCIONES.map((s) => [s.id, borrador?.comentarios?.[s.id] ?? ""])),
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Guarda el borrador en cada cambio.
  useEffect(() => {
    try {
      const b: Borrador = { paso, nombre, cargo, respuestas, comentarios };
      window.localStorage.setItem(BORRADOR_KEY, JSON.stringify(b));
    } catch {
      /* sin almacenamiento disponible: no pasa nada */
    }
  }, [paso, nombre, cargo, respuestas, comentarios]);

  const totalPasos = SECCIONES.length + 2;
  const progreso = Math.round((paso / (totalPasos - 1)) * 100);

  function toggle(seccionId: string, i: number) {
    setRespuestas((prev) => {
      const arr = [...prev[seccionId]];
      arr[i] = !arr[i];
      return { ...prev, [seccionId]: arr };
    });
  }

  function enviar() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await enviarRespuesta({ nombre, cargo, respuestas, comentarios });
        if (res?.error) setError(res.error);
      } catch (e) {
        // Si la app se actualizó mientras el formulario estaba abierto, la acción
        // del servidor ya no existe. Las respuestas están guardadas en el borrador:
        // basta con recargar y volver a enviar.
        const msg = e instanceof Error ? e.message : "";
        if (/server action|failed to find|not found/i.test(msg)) {
          window.location.reload();
          return;
        }
        setError("No se pudo enviar la encuesta. Tus respuestas están guardadas; revisa tu conexión e intenta de nuevo.");
      }
    });
  }

  function irA(p: Paso) {
    setPaso(p);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between text-xs text-rotary-gray mb-1">
          <span>
            Paso {paso + 1} de {totalPasos}
          </span>
          <span>{progreso}%</span>
        </div>
        <div className="h-2 rounded-full bg-rotary-gray-mid overflow-hidden">
          <div className="h-full bg-rotary-gold transition-all" style={{ width: `${progreso}%` }} />
        </div>
      </div>

      {paso === 0 && (
        <Card>
          <h1 className="text-2xl font-bold text-rotary-blue">Antes de empezar</h1>
          <p className="mt-2 text-rotary-gray text-sm">
            Estos datos son opcionales. Puedes responder de forma anónima.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold">Nombre (opcional)</span>
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" />
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Cargo en el club (opcional)</span>
              <Input value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Socio, secretario, presidente…" />
            </label>
          </div>
          <div className="mt-6 flex justify-end">
            <Button type="button" onClick={() => irA(1)}>
              Continuar
            </Button>
          </div>
        </Card>
      )}

      {paso >= 1 && paso <= SECCIONES.length && (() => {
        const s = SECCIONES[paso - 1];
        const marcadas = respuestas[s.id].filter(Boolean).length;
        return (
          <Card>
            <p className="text-xs uppercase tracking-widest text-rotary-gold-dark font-semibold">
              Sección {paso} de {SECCIONES.length}
            </p>
            <h1 className="text-2xl font-bold text-rotary-blue">{s.titulo}</h1>
            <p className="mt-2 text-rotary-gray text-sm leading-relaxed">{s.descripcion}</p>
            <p className="mt-3 text-sm font-semibold">
              Marca las afirmaciones que consideres verdaderas, basándote en los últimos 12 meses.
            </p>
            <ul className="mt-4 divide-y divide-rotary-gray-mid">
              {s.items.map((texto, i) => {
                const on = respuestas[s.id][i];
                return (
                  <li key={i}>
                    <label className="flex cursor-pointer items-start gap-3 py-3 hover:bg-rotary-gray-light -mx-2 px-2 rounded">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => toggle(s.id, i)}
                        className="mt-1 h-5 w-5 shrink-0 accent-rotary-blue"
                      />
                      <span className={`text-sm leading-relaxed ${on ? "font-semibold text-rotary-blue-dark" : ""}`}>
                        {texto}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <p className="mt-2 text-xs text-rotary-gray">
              {marcadas} de {ITEMS_POR_SECCION} marcadas
            </p>
            <label className="mt-5 block">
              <span className="text-sm font-semibold">Comentarios (opcional)</span>
              <Textarea
                rows={3}
                value={comentarios[s.id]}
                onChange={(e) => setComentarios((prev) => ({ ...prev, [s.id]: e.target.value }))}
                placeholder="¿Algo que quieras agregar sobre esta sección?"
              />
            </label>
            <div className="mt-6 flex justify-between">
              <Button type="button" variant="outline" onClick={() => irA(paso - 1)}>
                Atrás
              </Button>
              <Button type="button" onClick={() => irA(paso + 1)}>
                {paso === SECCIONES.length ? "Revisar" : "Siguiente"}
              </Button>
            </div>
          </Card>
        );
      })()}

      {paso === totalPasos - 1 && (
        <Card>
          <h1 className="text-2xl font-bold text-rotary-blue">Revisa tus respuestas</h1>
          <p className="mt-2 text-rotary-gray text-sm">
            {nombre ? `Respondiendo como ${nombre}${cargo ? ` (${cargo})` : ""}.` : "Respuesta anónima."}
          </p>
          <ul className="mt-4 space-y-2">
            {SECCIONES.map((s, i) => {
              const m = respuestas[s.id].filter(Boolean).length;
              const atender = ITEMS_POR_SECCION - m > MAX_SIN_MARCAR;
              return (
                <li key={s.id} className="flex items-center justify-between rounded-md bg-rotary-gray-light px-3 py-2">
                  <button type="button" className="text-left text-sm font-semibold hover:underline" onClick={() => irA(i + 1)}>
                    {s.titulo}
                  </button>
                  <span className={`text-sm font-semibold ${atender ? "text-rotary-cranberry" : "text-rotary-grass"}`}>
                    {m}/{ITEMS_POR_SECCION}
                  </span>
                </li>
              );
            })}
          </ul>
          {error && (
            <div className="mt-4 rounded-md border border-rotary-cranberry bg-pink-50 p-3 text-sm">
              <p className="font-semibold text-rotary-cranberry">{error}</p>
              <button type="button" className="mt-1 text-rotary-azure underline" onClick={() => window.location.reload()}>
                Recargar la página (se conservan tus respuestas)
              </button>
            </div>
          )}
          <div className="mt-6 flex justify-between">
            <Button type="button" variant="outline" onClick={() => irA(paso - 1)} disabled={pending}>
              Atrás
            </Button>
            <Button type="button" variant="gold" onClick={enviar} disabled={pending}>
              {pending ? "Enviando…" : "Enviar encuesta"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
