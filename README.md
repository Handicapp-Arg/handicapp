# handicapp

Aplicacion web para la gestion de handicaps deportivos.

## Estructura del proyecto

- `back-handicapp/`: API Node.js + TypeScript
- `front-handicapp/`: Frontend Next.js + TypeScript

## Requisitos

- Node.js 18 o superior
- pnpm (o npm/yarn si lo prefieres)
- PostgreSQL 13+ en ejecucion
- Redis 6+ en ejecucion

## Configuracion inicial

1. Crea los archivos `.env` en `back-handicapp/` y `front-handicapp/` tomando como base los ejemplos incluidos.
2. Asegurate de que PostgreSQL y Redis esten corriendo y que las credenciales coincidan con tus variables de entorno.

## Backend (API)

```bash
cd back-handicapp
pnpm install          # instala dependencias
pnpm run db:migrate   # aplica migraciones
pnpm run dev          # inicia modo desarrollo en http://localhost:3003
```

Para modo produccion:

```bash
pnpm run build
pnpm start
```

## Frontend (Next.js)

```bash
cd front-handicapp
pnpm install
pnpm dev              # inicia modo desarrollo en http://localhost:3000
```

## Pruebas y tareas utiles

- Backend: `pnpm run test`, `pnpm run lint`, `pnpm run type-check`
- Frontend: `pnpm run lint`, `pnpm run test`

Sin Docker: el proyecto ahora se ejecuta levantando backend y frontend manualmente. Manteno los servicios de base de datos y cache activos antes de iniciar los servidores.