# Plan — Encuesta sobre la Salud del Club
## Club Rotarios Saltillo Industrial

## 1. Tecnología

El repositorio está vacío, así que no hay stack previo que reutilizar. Propuesta:

| Capa | Elección | Motivo |
|---|---|---|
| Framework | Next.js 15 (App Router) + TypeScript | Formulario público y panel admin en un solo proyecto, con API routes incluidas |
| Estilos | Tailwind CSS | Rápido de aplicar la paleta Rotary como tokens |
| Base de datos | Turso (libSQL) en producción, archivo SQLite local en desarrollo, vía Drizzle ORM + `@libsql/client` | Ya tienes la integración Turso en Vercel; mismo SQL en local y producción |
| Gráficas | Barras en CSS (sin librería) | Ligeras, imprimen bien y bastan para porcentajes por sección e ítem |
| Auth admin | Password único en variable de entorno + cookie firmada (iron-session) | "Password simple" como se pidió, sin usuarios ni registro |
| Exportar | CSV nativo y PDF vía vista de impresión del navegador | Para compartir resultados con la directiva sin dependencias extra |
| Hosting | Vercel | Deploy directo desde el repo de GitHub |

## 2. Paleta Rotary (Brand Center)

| Nombre | Hex | Uso |
|---|---|---|
| Rotary Royal Blue | `#17458F` | Encabezados, botones primarios, barra superior |
| Rotary Gold | `#F7A81B` | Acentos, checkboxes activos, rueda del logo |
| Azure | `#0067C8` | Enlaces y estados hover |
| Sky Blue | `#019FCB` | Gráficas secundarias |
| Cranberry | `#D41367` | Alertas de "área a atender" |
| Gris cálido | `#54565A` / `#F4F4F4` | Texto secundario y fondos |

Tipografía: Open Sans (la que usa Rotary en web). El nombre **Club Rotarios Saltillo Industrial** va en el encabezado de todas las páginas junto al logo de Rotary.

## 3. Estructura de la encuesta (del PDF)

5 secciones × 15 afirmaciones (casilla sí/no) + un campo de comentarios por sección:

1. Experiencia en el club
2. Proyectos de servicio y eventos sociales
3. Socios
4. Imagen
5. Operaciones

Regla del PDF: si en una sección quedan **más de 5 casillas sin marcar**, esa área debe atenderse. Esta regla se usa en el panel admin para marcar secciones en rojo.

Las preguntas se guardan en un archivo `src/data/encuesta.ts` como fuente única de verdad; formulario, base de datos y reportes leen de ahí.

## 4. Módulos

### 4.1 Formulario público (`/`)
- Página de bienvenida con el texto introductorio del PDF y el nombre del club.
- Un paso por sección (5 pasos) con barra de progreso; cada afirmación es un checkbox grande, fácil de usar en celular.
- Campo de comentarios al final de cada sección.
- Datos opcionales al inicio: nombre y cargo en el club (se puede dejar anónimo).
- Al enviar: guarda la respuesta y muestra pantalla de agradecimiento.
- Una respuesta por envío, sin login.

### 4.2 Admin (`/admin`)
- Login con un solo campo de password (`ADMIN_PASSWORD` en `.env`). Sesión en cookie firmada, 7 días.
- **Dashboard**: total de respuestas, puntaje promedio por sección (0–15), semáforo por sección según la regla de las 5 casillas.
- **Detalle por sección**: porcentaje de "sí" por cada afirmación, ordenado de menor a mayor para ver rápido los puntos débiles, y los comentarios de esa sección.
- **Lista de respuestas**: tabla con fecha, nombre (o "Anónimo"), puntaje por sección; se puede abrir cada una y borrarla.
- Exportar todo a CSV.

### 4.3 Resúmenes (summaries)
- Botón "Generar resumen" en el dashboard. Se puede filtrar por rango de fechas.
- El resumen incluye: número de respuestas, tabla de puntajes por sección, las 5 afirmaciones más débiles y las 5 más fuertes del club, áreas a atender y todos los comentarios agrupados por sección.
- Se guarda en la tabla `Resumen` con fecha y título para consultarlo después.
- Botón "Imprimir / Guardar PDF" con estilos de impresión y la paleta Rotary, listo para mandar por WhatsApp.
- Fase 2 (opcional): redacción narrativa del resumen con la API de Claude (modelo `claude-sonnet-5`), a partir de las estadísticas y comentarios.

## 5. Modelo de datos (Drizzle)

```
Respuesta   id, creadoEn, nombre?, cargo?, respuestas (JSON: {seccion: {item: bool}}),
            comentarios (JSON: {seccion: string})
Resumen     id, creadoEn, titulo, desde?, hasta?, totalRespuestas, contenido (JSON)
```

## 6. Rutas

```
/                    formulario público
/gracias             confirmación
/admin/login         password
/admin               dashboard
/admin/seccion/[n]   detalle por sección
/admin/respuestas    lista y detalle
/admin/resumenes     resúmenes guardados y generación
/api/respuestas      POST público
/api/admin/*         protegidas por sesión
```

## 7. Fases de trabajo

Estado: fases 1–5 terminadas (11 sep 2026). Producción en https://rotarios-saltillo.vercel.app. Opcional pendiente: fase 6.

1. **Base**: crear proyecto Next.js, Tailwind con paleta Rotary, layout con logo y nombre del club, Drizzle con SQLite local.
2. **Formulario público**: datos de la encuesta, wizard de 5 pasos, guardado y página de gracias.
3. **Admin**: login, dashboard, detalle por sección, lista de respuestas, CSV.
4. **Resúmenes**: generación, guardado, export a PDF.
5. **Deploy**: crear base `rotarios` en la integración Turso de Vercel, variables `TURSO_DATABASE_URL` / `TURSO_AUTH_TOKEN` / `ADMIN_PASSWORD`, README con instrucciones.
6. *(Opcional)* Resumen narrativo con IA.

## 8. Pendientes por confirmar

- ¿Se permite responder anónimo o siempre se pide nombre?
- ¿El logo de Rotary se usa tal cual o el club tiene un logo propio con su nombre?
- ¿Hace falta bloquear respuestas duplicadas (por ejemplo, una por persona con un código)?
