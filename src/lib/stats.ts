import {
  SECCIONES,
  ITEMS_POR_SECCION,
  MAX_SIN_MARCAR,
  type Respuestas,
  type Comentarios,
} from "@/data/encuesta";
import type { RespuestaRow } from "@/db/schema";

export type RespuestaParsed = {
  id: string;
  creadoEn: Date;
  nombre: string | null;
  cargo: string | null;
  respuestas: Respuestas;
  comentarios: Comentarios;
};

export function parseRespuesta(row: RespuestaRow): RespuestaParsed {
  return {
    id: row.id,
    creadoEn: row.creadoEn,
    nombre: row.nombre,
    cargo: row.cargo,
    respuestas: JSON.parse(row.respuestas) as Respuestas,
    comentarios: JSON.parse(row.comentarios) as Comentarios,
  };
}

/** Puntaje de una sección en una respuesta: número de casillas marcadas (0–15). */
export function puntajeSeccion(r: Respuestas, seccionId: string): number {
  return (r[seccionId] ?? []).filter(Boolean).length;
}

/** Regla del PDF: más de 5 sin marcar => atender. */
export function requiereAtencion(puntaje: number): boolean {
  return ITEMS_POR_SECCION - puntaje > MAX_SIN_MARCAR;
}

export type ItemStat = {
  seccionId: string;
  seccionTitulo: string;
  indice: number;
  texto: string;
  si: number;
  porcentaje: number; // 0–100
};

export type SeccionStat = {
  id: string;
  titulo: string;
  promedio: number; // 0–15
  porcentajePromedio: number; // 0–100
  respuestasConAtencion: number;
  porcentajeAtencion: number; // 0–100 de respuestas que marcan "atender"
  requiereAtencion: boolean; // según el promedio
  items: ItemStat[];
  comentarios: { nombre: string | null; texto: string; fecha: string }[];
};

export type Estadisticas = {
  total: number;
  desde: string | null;
  hasta: string | null;
  secciones: SeccionStat[];
  masDebiles: ItemStat[];
  masFuertes: ItemStat[];
  areasAtencion: string[];
};

export function calcularEstadisticas(rs: RespuestaParsed[]): Estadisticas {
  const total = rs.length;
  const fechas = rs.map((r) => r.creadoEn.getTime());
  const secciones: SeccionStat[] = SECCIONES.map((s) => {
    const puntajes = rs.map((r) => puntajeSeccion(r.respuestas, s.id));
    const suma = puntajes.reduce((a, b) => a + b, 0);
    const promedio = total ? suma / total : 0;
    const conAtencion = puntajes.filter(requiereAtencion).length;
    const items: ItemStat[] = s.items.map((texto, i) => {
      const si = rs.filter((r) => r.respuestas[s.id]?.[i]).length;
      return {
        seccionId: s.id,
        seccionTitulo: s.titulo,
        indice: i,
        texto,
        si,
        porcentaje: total ? Math.round((si / total) * 100) : 0,
      };
    });
    const comentarios = rs
      .filter((r) => (r.comentarios[s.id] ?? "").trim())
      .map((r) => ({
        nombre: r.nombre,
        texto: r.comentarios[s.id].trim(),
        fecha: r.creadoEn.toISOString(),
      }));
    return {
      id: s.id,
      titulo: s.titulo,
      promedio: Math.round(promedio * 10) / 10,
      porcentajePromedio: Math.round((promedio / ITEMS_POR_SECCION) * 100),
      respuestasConAtencion: conAtencion,
      porcentajeAtencion: total ? Math.round((conAtencion / total) * 100) : 0,
      requiereAtencion: total > 0 && requiereAtencion(promedio),
      items,
      comentarios,
    };
  });
  const todos = secciones.flatMap((s) => s.items);
  const ordenados = [...todos].sort((a, b) => a.porcentaje - b.porcentaje);
  return {
    total,
    desde: total ? new Date(Math.min(...fechas)).toISOString() : null,
    hasta: total ? new Date(Math.max(...fechas)).toISOString() : null,
    secciones,
    masDebiles: ordenados.slice(0, 5),
    masFuertes: [...ordenados].reverse().slice(0, 5),
    areasAtencion: secciones.filter((s) => s.requiereAtencion).map((s) => s.titulo),
  };
}

export function formatoFecha(d: Date | string): string {
  return new Date(d).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatoFechaHora(d: Date | string): string {
  return new Date(d).toLocaleString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
