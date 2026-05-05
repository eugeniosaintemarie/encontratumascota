# Encontra Tu Mascota

A collaborative platform for finding lost pets, reporting found pets, and sharing adoption posts with the families and shelters who need them.

## What it does

- Browse the main feed of pet publications from the homepage.
- Explore lost-pet listings in the `buscadas` section with filters for species, breed, location, and date.
- Review reunited cases in the `reunidas` section.
- Discover shelters and rescue groups that publish adoption posts.
- Verify email addresses through the built-in verification flow.
- Support authenticated actions, public profile flows, image uploads, and location autocomplete.

## Tech stack

- Next.js 16 with React 19
- TypeScript
- Tailwind CSS 4
- Drizzle ORM with Neon
- Better Auth
- Radix UI and shadcn-style UI primitives
- Vercel Analytics, Resend, Google Maps, and reCAPTCHA integrations

## Getting started

### Prerequisites

- Node.js 22 or newer
- A PostgreSQL-compatible database URL
- The environment variables listed below

### Install dependencies

```bash
pnpm install
```

### Run the development server

```bash
pnpm dev
```

Open `http://localhost:3000` in your browser.

## Available scripts

- `pnpm dev` - start the local development server
- `pnpm build` - build the production app
- `pnpm start` - run the production server
- `pnpm lint` - run ESLint
- `pnpm lint:strict` - run ESLint with zero warnings allowed
- `pnpm typecheck` - run the TypeScript compiler without emitting files
- `pnpm analyze` - build with bundle analysis enabled
- `pnpm db:generate` - generate Drizzle migrations
- `pnpm db:migrate` - run database migrations
- `pnpm db:push` - push the schema to the database
- `pnpm db:studio` - open Drizzle Studio
- `pnpm db:seed` - seed the database

## Environment variables

Create a local `.env` file with the required values for your environment.

- `DATABASE_URL` - database connection string
- `NEON_AUTH_BASE_URL` - base URL for the auth service
- `NEON_AUTH_COOKIE_SECRET` - cookie secret used by auth
- `RESEND_API_KEY` - API key for email sending
- `RECAPTCHA_SECRET_KEY` - server-side reCAPTCHA secret
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - public reCAPTCHA site key
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - public Google Maps key used by autocomplete
- `GOOGLE_MAPS_SERVER_KEY` - server-side Google Maps key used for place validation
- `NOMINATIM_EMAIL` - email sent to the Nominatim service
- `NEXT_PUBLIC_NOMINATIM_EMAIL` - public fallback email for Nominatim requests
- `ADMIN_API_KEY` - admin key for privileged routes
- `ADMIN_EMAILS` - comma-separated list of admin emails
- `NEXT_PUBLIC_IS_DEMO` - optional flag to force demo mode
- `VERCEL_URL` - optional deployment URL fallback
- `VERCEL_PROJECT_PRODUCTION_URL` - optional production domain override
- `VERCEL_GIT_COMMIT_REF` - used to detect the demo branch in Vercel
- `ANALYZE` - set to `true` to enable bundle analysis

## Project structure

- `app/` - application routes, pages, and API endpoints
- `components/` - reusable UI and feature components
- `hooks/` - client-side hooks for publication flow, uploads, sharing, and pagination
- `lib/` - auth, database, sanitization, utilities, and shared types
- `data/` - local location datasets
- `drizzle/` - generated SQL migrations and metadata
- `public/` - static assets, PWA manifest, service worker, and icons

## Notes

- The app uses a service worker and splash screen for the production experience.
- The main layout includes SEO metadata, social sharing tags, and analytics wiring.
- Demo and production behavior are split through environment-aware host detection.

---

# Encontra Tu Mascota

Plataforma colaborativa para encontrar mascotas perdidas, publicar mascotas encontradas y compartir avisos de adopción con las familias y refugios que las necesitan.

## Qué hace

- Navegar el feed principal de publicaciones desde la home.
- Explorar publicaciones de mascotas perdidas en la sección `buscadas` con filtros por especie, raza, ubicación y fecha.
- Revisar los casos resueltos en `reunidas`.
- Descubrir refugios y grupos de rescate que publican mascotas en adopción.
- Verificar correos electrónicos con el flujo integrado de verificación.
- Soportar acciones autenticadas, perfiles públicos, carga de imágenes y autocompletado de ubicación.

## Stack tecnológico

- Next.js 16 con React 19
- TypeScript
- Tailwind CSS 4
- Drizzle ORM con Neon
- Better Auth
- Componentes UI basados en Radix y shadcn
- Integraciones con Vercel Analytics, Resend, Google Maps y reCAPTCHA

## Primeros pasos

### Requisitos previos

- Node.js 22 o superior
- Una URL de base de datos compatible con PostgreSQL
- Las variables de entorno listadas abajo

### Instalar dependencias

```bash
pnpm install
```

### Levantar el servidor de desarrollo

```bash
pnpm dev
```

Abrí `http://localhost:3000` en el navegador.

## Scripts disponibles

- `pnpm dev` - inicia el servidor local de desarrollo
- `pnpm build` - genera la build de producción
- `pnpm start` - ejecuta el servidor de producción
- `pnpm lint` - ejecuta ESLint
- `pnpm lint:strict` - ejecuta ESLint sin permitir warnings
- `pnpm typecheck` - corre TypeScript sin emitir archivos
- `pnpm analyze` - compila con análisis de bundle activado
- `pnpm db:generate` - genera migraciones de Drizzle
- `pnpm db:migrate` - ejecuta migraciones de base de datos
- `pnpm db:push` - aplica el schema en la base
- `pnpm db:studio` - abre Drizzle Studio
- `pnpm db:seed` - carga datos iniciales

## Variables de entorno

Creá un archivo local `.env` con los valores requeridos para tu entorno.

- `DATABASE_URL` - cadena de conexión a la base de datos
- `NEON_AUTH_BASE_URL` - URL base del servicio de autenticación
- `NEON_AUTH_COOKIE_SECRET` - secreto de cookies usado por auth
- `RESEND_API_KEY` - API key para envío de correos
- `RECAPTCHA_SECRET_KEY` - secreto de reCAPTCHA del lado servidor
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` - clave pública de reCAPTCHA
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - clave pública de Google Maps usada por el autocompletado
- `GOOGLE_MAPS_SERVER_KEY` - clave de Google Maps del servidor para validar lugares
- `NOMINATIM_EMAIL` - correo enviado al servicio Nominatim
- `NEXT_PUBLIC_NOMINATIM_EMAIL` - correo público de respaldo para Nominatim
- `ADMIN_API_KEY` - clave de admin para rutas privilegiadas
- `ADMIN_EMAILS` - lista separada por comas de correos administradores
- `NEXT_PUBLIC_IS_DEMO` - flag opcional para forzar modo demo
- `VERCEL_URL` - URL de despliegue de respaldo
- `VERCEL_PROJECT_PRODUCTION_URL` - dominio de producción opcional
- `VERCEL_GIT_COMMIT_REF` - se usa para detectar la rama demo en Vercel
- `ANALYZE` - poner en `true` para habilitar el análisis de bundle

## Estructura del proyecto

- `app/` - rutas de la aplicación, páginas y endpoints API
- `components/` - componentes reutilizables de UI y de funcionalidades
- `hooks/` - hooks del cliente para publicaciones, uploads, compartir y paginación
- `lib/` - auth, base de datos, sanitización, utilidades y tipos compartidos
- `data/` - datasets locales de ubicaciones
- `drizzle/` - migraciones SQL generadas y metadatos
- `public/` - assets estáticos, manifest PWA, service worker e íconos

## Notas

- La app usa service worker y splash screen en la experiencia de producción.
- El layout principal incluye metadatos SEO, tags para compartir y analytics.
- El comportamiento entre demo y producción se separa según el host y las variables de entorno.
