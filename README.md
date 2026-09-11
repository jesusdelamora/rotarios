# Encuesta sobre la Salud del Club — Club Rotarios Saltillo Industrial

Aplicación web para aplicar la *Encuesta sobre la Salud del Club* de Rotary International
(5 secciones × 15 afirmaciones + comentarios), ver resultados y generar resúmenes.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS 4
- Drizzle ORM + libSQL: archivo `local.db` en desarrollo, [Turso](https://turso.tech) en producción
- Deploy en Vercel

## Desarrollo local

```bash
npm install
cp .env.example .env      # edita ADMIN_PASSWORD y SESSION_SECRET
npm run db:push           # crea las tablas en local.db
npm run dev               # http://localhost:3000
```

Rutas:

| Ruta | Descripción |
|---|---|
| `/` | Portada pública |
| `/encuesta` | Formulario (5 pasos) |
| `/admin` | Panel de la directiva (password) |
| `/admin/seccion/[id]` | Detalle por sección |
| `/admin/respuestas` | Lista y detalle de respuestas |
| `/admin/resumenes` | Generar y consultar resúmenes (imprimibles a PDF) |
| `/api/admin/export` | Exportar todas las respuestas a CSV |

Para empezar de cero en local: borra `local.db`; las tablas se vuelven a crear solas (o corre `npm run db:push`).

## Variables de entorno

| Variable | Descripción |
|---|---|
| `ADMIN_PASSWORD` | Password del panel `/admin` |
| `SESSION_SECRET` | Cadena aleatoria para firmar la cookie de sesión |
| `TURSO_DATABASE_URL` | URL `libsql://…` de la base en Turso (en local se omite) |
| `TURSO_AUTH_TOKEN` | Token de Turso (en local se omite) |

## Deploy en Vercel

Producción: https://rotarios-saltillo.vercel.app (proyecto `rotarios`, equipo dyceasoftware). Cada push a `main` despliega.

1. La base es una Turso creada desde la integración de Vercel (Storage). La integración inyecta
   `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`; están marcadas como sensibles y no se pueden descargar con `vercel env pull`.
2. `ADMIN_PASSWORD` y `SESSION_SECRET` se configuran en las variables de entorno del proyecto.
3. Las tablas se crean solas en el primer acceso a la base (`ensureSchema` en `src/db/index.ts`), así que no hace
   falta correr `db:push` contra Turso. Si cambias `src/db/schema.ts`, actualiza también el SQL de `ensureSchema`.

## Regla de diagnóstico

Como en el PDF original: si en una sección quedan **más de 5 casillas sin marcar** (promedio menor a 10 de 15),
esa área se marca como **Atender**. Entre 10 y 11.9 se marca **Mejorable**; 12 o más, **Saludable**.
