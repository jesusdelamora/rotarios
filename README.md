# Club Rotarios Saltillo Industrial — apps

Aplicación web con dos módulos:

- **Encuesta**: la *Encuesta sobre la Salud del Club* de Rotary International
  (5 secciones × 15 afirmaciones + comentarios), con panel de resultados y resúmenes.
- **Ver para aprender**: programa de salud visual pediátrica. Registro de alumnos (datos generales)
  y cuestionarios de signos y síntomas (20 preguntas), agudeza visual y observaciones, con acceso por
  tipo de usuario (rotario, maestro, padre/madre/tutor) mediante claves compartidas, sin correos.

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
| `/` | Inicio con los dos módulos |
| `/encuesta` | Portada de la encuesta |
| `/encuesta/responder` | Formulario (5 pasos) |
| `/admin` | Panel de resultados de la encuesta (rotarios) |
| `/admin/seccion/[id]` | Detalle por sección |
| `/admin/respuestas` | Lista y detalle de respuestas |
| `/admin/resumenes` | Generar y consultar resúmenes (imprimibles a PDF) |
| `/api/admin/export` | Exportar todas las respuestas a CSV |
| `/login` | Inicio de sesión (usuario y contraseña) |
| `/cuenta` | Mi cuenta: cambiar contraseña |
| `/usuarios` | Administración de usuarios (solo rotario) |
| `/aviso-de-privacidad` | Aviso de privacidad |
| `/aprender` | Ver para aprender: portada |
| `/aprender/alumnos` | Alumnos (rotario y maestro) o "Mis hijos" (padres) |
| `/aprender/alumnos/[id]` | Ficha del alumno y sus cuestionarios |
| `/aprender/alumnos/[id]/cuestionario/nuevo` | Nuevo cuestionario |

### Usuarios y login

Un solo login (`/login`) con usuario y contraseña para toda la app. No usa correos: las cuentas las crea un rotario
desde `/usuarios`, y cada persona puede cambiar su contraseña en `/cuenta`.

| Tipo | Qué puede hacer |
|---|---|
| Rotario | Todo: panel de la encuesta, alumnos, cuestionarios con agudeza visual, usuarios |
| Maestro | Registrar y editar alumnos, llenar cuestionarios con agudeza visual |
| Padre, madre o tutor | Solo sus hijos vinculados; llena el cuestionario de signos y síntomas |

- **Primer usuario**: si la tabla de usuarios está vacía, la app crea `admin` (rotario) con la contraseña de
  `ADMIN_PASSWORD` (o `admin2026` si no existe). Cámbiala en `/cuenta` la primera vez.
- Las contraseñas se guardan con bcrypt. Tras 5 intentos fallidos la cuenta se bloquea 10 minutos.
- Para vincular a un padre con su hijo, el rotario escribe el **folio** del alumno (código de 6 caracteres que se
  genera al registrarlo) en la ficha del usuario.
- Al registrar un alumno se exige confirmar que el tutor conoce el **aviso de privacidad** (`/aviso-de-privacidad`);
  la fecha de aceptación queda guardada. Completa los datos de contacto del club en `src/data/privacidad.ts`.

Para empezar de cero en local: borra `local.db`; las tablas se vuelven a crear solas (o corre `npm run db:push`).

## Variables de entorno

| Variable | Descripción |
|---|---|
| `ADMIN_PASSWORD` | Contraseña inicial del usuario `admin` (solo se usa al crear el primer usuario) |
| `SESSION_SECRET` | Cadena aleatoria para firmar la cookie de sesión |
| `TURSO_DATABASE_URL` | URL `libsql://…` de la base en Turso (en local se omite) |
| `TURSO_AUTH_TOKEN` | Token de Turso (en local se omite) |

## Deploy en Vercel

Producción: https://rotarios-crsi.vercel.app (proyecto `rotarios`, equipo dyceasoftware). Cada push a `main` despliega.

1. La base es una Turso creada desde la integración de Vercel (Storage). La integración inyecta
   `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN`; están marcadas como sensibles y no se pueden descargar con `vercel env pull`.
2. `ADMIN_PASSWORD` y `SESSION_SECRET` se configuran en las variables de entorno del proyecto.
3. Las tablas se crean solas en el primer acceso a la base (`ensureSchema` en `src/db/index.ts`), así que no hace
   falta correr `db:push` contra Turso. Si cambias `src/db/schema.ts`, actualiza también el SQL de `ensureSchema`.

## Regla de diagnóstico

Como en el PDF original: si en una sección quedan **más de 5 casillas sin marcar** (promedio menor a 10 de 15),
esa área se marca como **Atender**. Entre 10 y 11.9 se marca **Mejorable**; 12 o más, **Saludable**.
