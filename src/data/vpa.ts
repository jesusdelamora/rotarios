/** "Ver para aprender" — programa de salud visual pediátrica (Viendo por la Infancia). */

export const VPA_NOMBRE = "Ver para aprender";
export const VPA_PROGRAMA = "Programa de salud visual pediátrica";

export type RolVpa = "rotario" | "maestro" | "papa";

export const ROLES_VPA: { id: RolVpa; nombre: string; descripcion: string }[] = [
  { id: "rotario", nombre: "Rotario", descripcion: "Acceso completo: alumnos, cuestionarios, agudeza visual y ajustes." },
  { id: "maestro", nombre: "Maestro", descripcion: "Registra alumnos de su escuela y llena cuestionarios." },
  { id: "papa", nombre: "Padre, madre o tutor", descripcion: "Llena el cuestionario de su hijo o hija usando el folio del alumno." },
];

export const NOMBRE_ROL: Record<RolVpa, string> = {
  rotario: "Rotario",
  maestro: "Maestro",
  papa: "Padre / madre / tutor",
};

/** Claves de acceso iniciales. Se guardan en la base al crear las tablas y se pueden cambiar en Ajustes. */
export const CLAVES_INICIALES: Record<RolVpa, string> = {
  rotario: process.env.VPA_CLAVE_ROTARIO || "rotario2026",
  maestro: process.env.VPA_CLAVE_MAESTRO || "maestro2026",
  papa: process.env.VPA_CLAVE_PAPA || "papa2026",
};

/** Cuestionario de signos y síntomas (20 preguntas, Sí / No). */
export const PREGUNTAS_VPA: string[] = [
  "¿Sus ojos se sienten cansados cuando lee o trabaja de cerca?",
  "¿Se siente incómodo cuando lee o trabaja de cerca?",
  "¿Le duele la cabeza cuando lee o trabaja de cerca?",
  "¿Siente sueño cuando lee o trabaja de cerca?",
  "¿Pierde la concentración cuando lee o trabaja de cerca?",
  "¿Tiene problemas para recordar lo que leyó?",
  "¿Presenta visión doble cuando lee o trabaja de cerca?",
  "¿Siente que las palabras se mueven, nadan o flotan cuando lee o trabaja de cerca?",
  "¿Siente que lee despacio?",
  "¿Sus ojos duelen cuando lee o trabaja de cerca?",
  "¿Siente sus ojos inflamados cuando lee o trabaja de cerca?",
  "¿Siente “tirones o punzadas” cuando lee o trabaja de cerca?",
  "¿Nota que las palabras se emborronan cuando lee o trabaja de cerca?",
  "¿Pierde el lugar en que iba leyendo?",
  "¿Tiene que releer la misma línea de palabras cuando lee?",
  "¿Sabe leer?",
  "¿Se acerca al libro para ver mejor?",
  "¿Usa el dedo para no perderse entre renglones?",
  "¿Entrecierra los ojos para alcanzar a ver?",
  "¿Su aprendizaje es menor a la media de sus compañeros?",
];

export const TOTAL_PREGUNTAS_VPA = PREGUNTAS_VPA.length;

/** Respuesta por pregunta: true = Sí, false = No, null = sin contestar. */
export type RespuestasVpa = (boolean | null)[];

export type AgudezaVisual = {
  lejanaOD: string;
  lejanaOI: string;
  lejanaAO: string;
  cercanaOD: string;
  cercanaOI: string;
  cercanaAO: string;
};

export const AGUDEZA_VACIA: AgudezaVisual = {
  lejanaOD: "",
  lejanaOI: "",
  lejanaAO: "",
  cercanaOD: "",
  cercanaOI: "",
  cercanaAO: "",
};

/** Folio corto y legible para identificar a cada alumno (sin caracteres ambiguos). */
export function generarFolio(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}
