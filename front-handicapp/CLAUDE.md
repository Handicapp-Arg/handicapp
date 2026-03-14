# HandicApp — Frontend

## Stack

- **Framework:** Next.js 15.5.3 (App Router) + React 19 + TypeScript
- **Estilos:** TailwindCSS 3.4 + shadcn/ui (Radix UI) + `tailwind-merge` + `class-variance-authority`
- **Animaciones:** Framer Motion 12
- **Iconos:** Lucide React 0.544
- **Estado servidor:** TanStack React Query v5 (`@tanstack/react-query`)
- **Auth:** AuthManager (`src/lib/auth/AuthManager.ts`) — JWT en cookie, no en localStorage
- **Real-time:** Socket.IO client 4.8.1
- **Validación:** Zod 3.23 — schemas en `src/lib/schemas/`
- **Forms:** validación manual (react-hook-form NO está instalado)
- **Notificaciones:** react-hot-toast
- **Mapas:** Leaflet + react-leaflet
- **Gráficos:** Chart.js + react-chartjs-2
- **PDF/Excel:** jsPDF + xlsx
- **PWA:** @ducanh2912/next-pwa
- **Testing:** Vitest + Testing Library

## Correr el proyecto

```bash
# Desde front-handicapp/
pnpm run dev        # Puerto 3000
pnpm run build      # Compila para producción
pnpm run start      # Corre build de producción
pnpm run test       # Vitest
```

## Estructura de carpetas

```
src/
├── app/
│   ├── (auth)/                    # Login, register, forgot/reset-password, verify
│   └── (dashboard)/               # Dashboard por rol
│       ├── layout.tsx             # Layout compartido con VerticalNavbar
│       ├── loading.tsx            # Skeleton global del dashboard
│       ├── admin/                 # Rutas del admin
│       ├── capataz/               # ⚠️ FUERA DE SCOPE — no priorizar
│       ├── empleado/              # ✅ PRIORIDAD ACTUAL
│       ├── establecimiento/       # 🔄 Parcialmente funcional
│       ├── propietario/           # ✅ Más completo
│       └── veterinario/           # 🔄 Parcialmente funcional
├── components/
│   ├── common/
│   │   └── SimplePermissionGuard.tsx   # ÚNICO guard a usar
│   ├── layout/
│   │   └── VerticalNavbar.tsx          # Navegación + ROLE_MENUS
│   ├── skeletons/                      # Skeletons de carga
│   │   ├── DashboardSkeleton.tsx
│   │   ├── TableSkeleton.tsx
│   │   ├── CardGridSkeleton.tsx
│   │   ├── ProfileSkeleton.tsx
│   │   └── CaballoDetailSkeleton.tsx
│   ├── dashboard/                      # Componentes reutilizables de features
│   │   ├── CalendarioEventos.tsx
│   │   ├── EventoForm.tsx
│   │   └── ...
│   └── ui/                             # shadcn/ui components
├── lib/
│   ├── auth/
│   │   └── AuthManager.ts         # Gestor central de auth (leer antes de modificar)
│   ├── hooks/                     # React Query hooks por entidad
│   │   ├── index.ts               # Re-exports: useCaballos, useEventos, useTareas...
│   │   ├── useAuth.ts
│   │   ├── useCaballosQuery.ts
│   │   ├── useEventosQuery.ts
│   │   └── ...
│   ├── services/                  # Llamadas HTTP a la API
│   │   ├── apiClient.ts           # Cliente base con interceptors
│   │   ├── caballoService.ts
│   │   ├── eventoService.ts
│   │   ├── tareaService.ts
│   │   └── ...
│   ├── schemas/                   # Zod schemas para formularios
│   │   ├── caballo.ts
│   │   ├── tarea.ts
│   │   ├── evento.ts
│   │   ├── establecimiento.ts
│   │   └── auth.ts
│   ├── config.ts                  # Configuración de la app (API URL, etc.)
│   └── utils/                     # Helpers
└── types/                         # Tipos globales TypeScript
```

## Rutas por rol

| Rol | Ruta base | Estado |
|-----|-----------|--------|
| admin | `/admin` | ✅ 100% backend / 🔄 40% frontend |
| establecimiento | `/establecimiento` | ✅ 100% backend / 🔄 30% frontend |
| veterinario | `/veterinario` | ✅ 100% backend / 🔄 30% frontend |
| empleado | `/empleado` | ✅ 100% backend / ✅ 80% frontend — **PRIORIDAD** |
| propietario | `/propietario` | ✅ 100% backend / ✅ 95% frontend |
| capataz | `/capataz` | ❌ fuera de scope — NO tocar |

## Patrón de carga (skeleton-first)

**Regla:** NUNCA usar `<Loader />`. Usar siempre el skeleton apropiado:

```tsx
// Dashboard principal
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton';
if (loading) return <DashboardSkeleton />;

// Tablas (tareas, usuarios)
import TableSkeleton from '@/components/skeletons/TableSkeleton';
if (loading) return <TableSkeleton rows={8} columns={4} />;

// Grillas de cards (caballos, eventos)
import CardGridSkeleton from '@/components/skeletons/CardGridSkeleton';
if (loading) return <CardGridSkeleton cards={8} columns={4} />;

// Páginas de perfil
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
if (loading) return <ProfileSkeleton />;
```

## Guards de autorización

**Regla:** Solo usar `SimplePermissionGuard.tsx` — los otros guards fueron eliminados.

```tsx
import { SimpleRoleGuard, SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';

// Para páginas de rol específico
<SimpleRoleGuard roles={['empleado']}>
  <MiComponente />
</SimpleRoleGuard>

// Solo admins
<SimpleAdminOnly>
  <AdminComponente />
</SimpleAdminOnly>
```

## Navegación por rol (ROLE_MENUS)

El menú de cada rol está definido en `VerticalNavbar.tsx` en el objeto `ROLE_MENUS`.
Para agregar o quitar items del menú, modificar ese objeto directamente.

```typescript
// src/components/layout/VerticalNavbar.tsx
const ROLE_MENUS = {
  empleado: [
    { name: 'Dashboard', href: '/empleado', icon: Home },
    { name: 'Mis Tareas', href: '/empleado/tareas', icon: FileText },
    { name: 'Caballos', href: '/empleado/caballos', icon: ClipboardList },
    { name: 'Notificaciones', href: '/empleado/notificaciones', icon: Bell },
    { name: 'Perfil', href: '/empleado/perfil', icon: Users },
  ],
  // ... otros roles
};
```

## AuthManager — flujo de auth

**Archivo crítico:** `src/lib/auth/AuthManager.ts`

- Access token: **exclusivamente en cookie** (NO en localStorage)
- User data (nombre, rol, etc.): en `localStorage` bajo clave `handicapp_user`
- El rol en cookie se usa solo para UX (redirección). La autorización real la hace el backend
- Al refrescar token: usa `POST /auth/refresh` con cookie refresh automáticamente
- **NO modificar sin entender el flujo completo de auth**

## Data fetching con React Query

```tsx
// Usar hooks del índice
import { useCaballos, useEventos, useTareas } from '@/lib/hooks';

const { data, isLoading, refetch } = useCaballos({ page: 1, limit: 500 });
const { data: eventos = [] } = useEventos({ page: 1, limit: 500 });
```

Los hooks internamente usan `apiClient.ts` que apunta a `http://localhost:3001`.

## Diseño / Design system

- **Tema oscuro hero sections:** `bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900`
- **Color de acento por rol:**
  - Admin: azul (`blue-600`)
  - Empleado: azul (`blue-500`)
  - Veterinario: púrpura (`purple-600`)
  - Establecimiento: verde (`green-600`)
  - Propietario: dorado (`amber-600`)
- **Cards:** `rounded-2xl shadow-xl border border-slate-200`
- **Glassmorphism:** `backdrop-blur-sm bg-white/80`
- **No usar colores hardcodeados** — usar clases Tailwind

## Convenciones

- Imports absolutos con `@/` (configurado en `tsconfig.json`)
- Nombres de variables en español (dominio), patterns técnicos en inglés
- Componentes con `'use client'` solo si usan hooks o interactividad
- No usar `console.log` — no hay logger en frontend, omitir o usar `react-hot-toast` para feedback de usuario

## Schemas Zod (para formularios)

Los schemas están en `src/lib/schemas/`. **react-hook-form NO está instalado** — los formularios actuales validan manualmente. Los schemas existen para cuando se integre react-hook-form.

```typescript
import { caballoSchema } from '@/lib/schemas/caballo';
import { tareaSchema } from '@/lib/schemas/tarea';
import { eventoSchema } from '@/lib/schemas/evento';
import { establecimientoSchema } from '@/lib/schemas/establecimiento';
```

## Qué NO hacer

- No usar `<Loader />` — está deprecado, usar skeletons
- No usar `PermissionGuard` o `RouteProtector` — fueron eliminados
- No guardar el access token en `localStorage` — solo en cookie
- No tocar rutas de `capataz/` — fuera de scope
- No instalar `react-hook-form` sin planear la migración completa de formularios
- No modificar `AuthManager.ts` sin entender el flujo completo
- No usar `@radix-ui` directamente — usar los wrappers de `components/ui/` (shadcn)
