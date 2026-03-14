# HandicApp — Contexto del Proyecto

## ¿Qué es HandicApp?
Aplicación web para la gestión integral de caballos y establecimientos equinos (haras, clubes hípicos). Permite registrar caballos, eventos médicos y deportivos, tareas operativas, y gestionar personal con diferentes niveles de acceso.

## Monorepo
```
handicapp/
├── back-handicapp/     # API REST — Node.js + Express 5 + TypeScript
├── front-handicapp/    # Web App — Next.js 15 + React 19 + TypeScript
├── docs/               # Documentación técnica extensa
└── CLAUDE.md           # Este archivo
```

**Package manager:** pnpm 10.17.1
**Node requerido:** ≥ 25.0.0

## Cómo correr el proyecto

```bash
# Instalar dependencias (desde raíz)
pnpm install

# Backend (puerto 3001)
cd back-handicapp && pnpm run dev

# Frontend (puerto 3000)
cd front-handicapp && pnpm run dev
```

## Roles del sistema (6 roles)

| ID | Clave | Nombre | Descripción |
|----|-------|--------|-------------|
| 1 | `admin` | Administrador | Acceso total al sistema |
| 2 | `establecimiento` | Establecimiento | Gestiona su haras, caballos alojados, personal |
| 3 | `capataz` | Capataz | Supervisión operativa (**fuera de scope actual**) |
| 4 | `veterinario` | Veterinario | Acceso a información médica de caballos |
| 5 | `empleado` | Empleado | Tareas asignadas, solo lectura de caballos |
| 6 | `propietario` | Propietario | Gestiona sus propios caballos |

> **Capataz está fuera del roadmap actual.** No priorizar ni implementar nuevas funcionalidades para ese rol.

## Entidades principales

- **Caballo**: registro completo — datos básicos, físicos, genealogía (padre/madre), documentación oficial (RP, SBA, ADN, FEI, UELN), estado de salud, disciplina
- **Establecimiento**: haras/club hípico — datos, ubicación, miembros, caballos alojados
- **Evento**: registro de actividades — veterinarias (vacunas, dentista, herrero), deportivas, competencias. Flujo: `draft → pending_review → approved`
- **Tarea**: trabajo operativo — alimentación, limpieza, entrenamiento. Estados: `pendiente → en_progreso → completada`
- **Usuario**: con rol asignado, puede ser propietario de caballos y/o miembro de establecimientos

## Estado de implementación

| Módulo | Backend | Frontend |
|--------|---------|----------|
| Auth | ✅ 100% | ✅ 100% |
| Propietario | ✅ 100% | ✅ 95% |
| Admin | ✅ 100% | 🔄 40% (scope reducido) |
| Veterinario | ✅ 100% | 🔄 30% (scope reducido) |
| Establecimiento | ✅ 100% | 🔄 30% (scope reducido) |
| Empleado | ✅ 100% | ✅ 80% |
| Capataz | ✅ 100% | ❌ fuera de scope |
| Inventario | ✅ 100% | ❌ fuera de scope |

## Decisiones de arquitectura

- El **access token JWT no se guarda en localStorage** — solo en cookie client-side. Corregido en `AuthManager.ts`.
- El **rol del usuario en cookie** se usa solo para UX (redirección). La verificación real es siempre en el backend.
- **Redis** está instalado (`ioredis`) pero no activo en producción todavía.
- **Zod** se usa en backend para validar env vars. En frontend hay schemas creados pero formularios aún usan validación manual (pendiente migrar con react-hook-form).

## Convenciones de código

- Lenguaje: TypeScript estricto en ambas partes
- Imports absolutos con `@/` en frontend
- Nombres de variables y funciones en español (dominio), inglés para patterns técnicos
- Commits en español o inglés, formato convencional

## Qué NO hacer sin consultar

- No modificar el esquema de la base de datos sin crear una migración
- No cambiar la estructura de respuesta de la API (puede romper el frontend)
- No eliminar roles de la tabla `roles` (tienen IDs hardcodeados en el frontend)
- No modificar `AuthManager.ts` sin entender el flujo completo de auth
- No instalar nuevas dependencias grandes sin evaluar el impacto en bundle size
