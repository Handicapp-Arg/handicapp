# Guía de ejecucion sin Docker

Este documento describe como levantar HandicApp de forma manual, ejecutando el backend y el frontend directamente en tu maquina.

## 1. Requisitos previos

- Node.js 18 o superior
- pnpm (recomendado) o npm/yarn
- PostgreSQL 13+ en ejecucion
- Redis 6+ en ejecucion
- Git y un terminal con soporte para scripts de shell

> Asegurate de que PostgreSQL y Redis esten disponibles en `localhost` o ajusta las variables de entorno para apuntar al host correcto.

## 2. Variables de entorno

Cada proyecto incluye un archivo `.env` base. Duplica los ejemplos y actualiza los valores necesarios.

```bash
# Backendcd back-handicapp
cp .env.example .env   # si no lo hiciste aun

# Frontend
cd front-handicapp
cp .env.example .env   # si corresponde
```

Variables importantes en el backend:

- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `REDIS_HOST`, `REDIS_PORT`
- `JWT_SECRET`

Ajusta estos valores para que coincidan con tus servicios locales.

## 3. Preparar servicios de datos

1. **PostgreSQL**: crea la base de datos configurada en tu `.env` y verifica que el usuario tenga permisos.
2. **Redis**: inicia el servicio en el puerto definido (6379 por defecto).

## 4. Backend (API)

```bash
cd back-handicapp
pnpm install
pnpm run db:migrate    # ejecuta las migraciones
pnpm run db:seed       # opcional: carga datos iniciales
pnpm run dev           # servidor en http://localhost:3003
```

Para produccion:

```bash
pnpm run build
pnpm start
```

## 5. Frontend (Next.js)

```bash
cd front-handicapp
pnpm install
pnpm dev               # servidor en http://localhost:3000
```

Configura los servicios externos (API, Auth, etc.) mediante variables de entorno como `NEXT_PUBLIC_API_URL` para apuntar al backend.

## 6. Flujo de trabajo recomendado

1. Levanta PostgreSQL y Redis.
2. Ejecuta el backend en modo desarrollo (`pnpm run dev`).
3. Ejecuta el frontend en modo desarrollo (`pnpm dev`).
4. Corre pruebas cuando las necesites:
   - Backend: `pnpm run test`
   - Frontend: `pnpm run test`

## 7. Limpieza y mantenimiento

- Usa comandos de PostgreSQL para reiniciar la base si lo necesitas (`dropdb`, `createdb`).
- Limpia caches de pnpm con `pnpm store prune` si notas problemas de dependencias.

Con estos pasos tu entorno queda listo sin depender de Docker.