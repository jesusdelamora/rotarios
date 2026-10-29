/**
 * Sesión de administrador basada en una cookie firmada con HMAC-SHA256.
 * Usa Web Crypto para funcionar tanto en proxy.ts como en el servidor.
 */
export const SESSION_COOKIE = "rotarios_admin";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 días

function secret(): string {
  // Un SESSION_SECRET vacío (por ejemplo, creado sin valor en Vercel) cae al ADMIN_PASSWORD.
  const s = (process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "").trim();
  if (!s) throw new Error("Falta SESSION_SECRET o ADMIN_PASSWORD en el entorno");
  return s;
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return toHex(sig);
}

/** Crea el valor de la cookie: "<expira>.<firma>" */
export async function createSessionToken(): Promise<string> {
  const expira = Date.now() + SESSION_MAX_AGE * 1000;
  const payload = `admin.${expira}`;
  const sig = await hmac(payload);
  return `${expira}.${sig}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [expiraStr, sig] = token.split(".");
  const expira = Number(expiraStr);
  if (!expira || !sig || expira < Date.now()) return false;
  const expected = await hmac(`admin.${expira}`);
  if (expected.length !== sig.length) return false;
  // comparación en tiempo constante
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return diff === 0;
}

/* ---------- Tokens firmados genéricos (usados por "Ver para aprender") ---------- */

function b64url(s: string): string {
  return Buffer.from(s, "utf8").toString("base64url");
}
function unb64url(s: string): string {
  return Buffer.from(s, "base64url").toString("utf8");
}

/** Crea un token "<payload-b64url>.<firma>" con expiración incluida en el payload. */
export async function signPayload(payload: Record<string, unknown>, maxAgeSeconds = SESSION_MAX_AGE): Promise<string> {
  const data = b64url(JSON.stringify({ ...payload, exp: Date.now() + maxAgeSeconds * 1000 }));
  return `${data}.${await hmac(data)}`;
}

/** Verifica firma y expiración; devuelve el payload o null. */
export async function verifyPayload<T extends Record<string, unknown>>(token: string | undefined): Promise<T | null> {
  if (!token) return null;
  const idx = token.lastIndexOf(".");
  if (idx <= 0) return null;
  const data = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = await hmac(data);
  if (expected.length !== sig.length) return null;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  if (diff !== 0) return null;
  try {
    const obj = JSON.parse(unb64url(data)) as T & { exp?: number };
    if (!obj.exp || obj.exp < Date.now()) return null;
    return obj;
  } catch {
    return null;
  }
}
