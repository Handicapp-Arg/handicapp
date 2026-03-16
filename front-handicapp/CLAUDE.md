# Frontend — HandicApp

## Stack

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript
- **Styles:** TailwindCSS 3.4 + shadcn/ui (Radix UI) + `tailwind-merge` + `class-variance-authority`
- **Icons:** Heroicons 24/outline (primary) + Lucide React (secondary, already imported in some files)
- **Server state:** TanStack React Query v5
- **Auth:** `src/lib/auth/AuthManager.ts` — JWT in httpOnly cookie, never localStorage
- **Real-time:** Socket.IO client (`useWebSocket`, `useNotifications` hooks)
- **Validation:** Zod — schemas in `src/lib/schemas/`
- **Forms:** Manual validation (react-hook-form NOT installed)
- **Toasts:** `useToaster` from `@/components/ui/toaster` (internal) OR `react-hot-toast` (already in some files — both are fine)
- **PWA:** @ducanh2912/next-pwa

## Run

```bash
# from front-handicapp/
pnpm run dev     # port 3000
pnpm run build
pnpm run test
```

## Folder structure

```
src/
├── app/
│   ├── (auth)/          # login, register, forgot-password, reset-password, verify
│   ├── (dashboard)/
│   │   ├── layout.tsx   # shared layout with VerticalNavbar
│   │   ├── admin/
│   │   │   ├── horses/ + horses/[id]/
│   │   │   ├── stables/ + stables/[id]/
│   │   │   ├── events/
│   │   │   ├── tasks/
│   │   │   ├── notifications/
│   │   │   ├── settings/
│   │   │   └── users/
│   │   ├── establecimiento/
│   │   │   ├── horses/ + horses/[id]/
│   │   │   ├── events/
│   │   │   ├── tasks/
│   │   │   ├── notifications/
│   │   │   └── settings/
│   │   └── propietario/
│   │       ├── horses/ + horses/[id]/ + horses/nuevo/ + horses/[id]/editar/
│   │       ├── stables/ + stables/[id]/
│   │       ├── events/
│   │       ├── tasks/ + tasks/[id]/editar/
│   │       ├── notifications/
│   │       └── settings/
│   └── _site/           # public marketing page (intentionally kept as-is)
├── components/
│   ├── attachments/     # AttachmentsList
│   ├── common/          # SimplePermissionGuard (ONLY guard to use), FileUpload, QrCanvas, UserManagement/, UserModal/
│   ├── dashboard/       # CaballoForm, CaballoList, CaballoCardModern, EventoForm, TareaForm, TareaKanban, TareaList, EstablecimientoForm, EstablecimientoList, EstablecimientoDetailView, PageHeader
│   ├── error/           # ErrorBoundary
│   ├── horses/          # HorseProfile, HorseTasksTab
│   ├── layout/          # VerticalNavbar, HorizontalNavbar, BottomNav, DashboardLayout
│   ├── notifications/   # NotificationsPage
│   ├── owners/          # OwnersList
│   ├── providers/       # QueryProvider, NotificationProvider
│   ├── pwa/
│   ├── qr/              # QRCodeDisplay
│   ├── settings/        # SettingsLayout
│   ├── stables/         # StableCard
│   └── ui/              # shadcn/ui + HandicApp base components (DataTable, PageShell, FormField, Pagination)
├── lib/
│   ├── auth/
│   │   └── AuthManager.ts   # CRITICAL — read before touching
│   ├── hooks/
│   │   ├── index.ts          # barrel export — ALWAYS import from here
│   │   ├── useHorsesQuery.ts
│   │   ├── useEventsQuery.ts
│   │   ├── useTasksQuery.ts
│   │   ├── useStablesQuery.ts
│   │   ├── useNotificationsQuery.ts
│   │   ├── useUsersQuery.ts
│   │   ├── useAuditQuery.ts
│   │   ├── useUpcomingEvents.ts
│   │   ├── useOwnerDashboard.ts
│   │   ├── useAuthNew.ts
│   │   ├── usePermissions.ts
│   │   ├── useNotifications.ts  # push/realtime
│   │   └── useWebSocket.ts
│   ├── services/
│   │   ├── apiClient.ts         # base HTTP client — credentials: 'include' always
│   │   ├── horseService.ts
│   │   ├── eventService.ts
│   │   ├── taskService.ts
│   │   ├── stableService.ts
│   │   ├── notificationService.ts
│   │   ├── attachmentService.ts
│   │   ├── ownerService.ts
│   │   ├── userService.ts
│   │   └── authService.ts
│   ├── schemas/          # Zod schemas for manual validation
│   ├── config.ts
│   └── utils/
└── types/
```

## Roles & routes

| Role | Base route | Notes |
|------|-----------|-------|
| admin | `/admin` | Full access |
| establecimiento | `/establecimiento` | Stable management |
| propietario | `/propietario` | Horse owners |
| capataz/empleado/veterinario | — | OUT OF SCOPE — do not touch |

Role route segments (admin, establecimiento, propietario) stay in Spanish — tied to auth redirects. Sub-routes are in English (horses, events, tasks, etc.).

## Auth guard — use ONLY this

```tsx
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';

<SimpleRoleGuard roles={['propietario']} fallback={<div className="p-6">Sin permisos</div>}>
  <MyPage />
</SimpleRoleGuard>
```

## Data fetching — performance rules

**Always paginate. Never fetch all records.**

```tsx
// ✅ Correcto: paginado, solo campos necesarios
const { data } = useHorses({ page: 1, limit: 20, establecimiento_id: id });

// ❌ Incorrecto: trae todo
const { data } = useHorses();
```

**Tab lazy loading — fetch only when tab is active:**
```tsx
const [activeTab, setActiveTab] = useState('ficha');

// Solo carga eventos cuando el usuario abre la pestaña historial
useEffect(() => {
  if (activeTab === 'historial' && !loaded) {
    loadEvents();
  }
}, [activeTab]);
```

**Import from barrel — never directly:**
```tsx
import { useHorses, useEvents, useTasks } from '@/lib/hooks';
```

## Loading pattern

Use **inline skeleton divs** — no external skeleton component files exist.

```tsx
// Skeleton simple y rápido
if (loading) return (
  <div className="space-y-3">
    {[1,2,3,4].map(i => (
      <div key={i} className="h-16 bg-gray-100 rounded-md animate-pulse" />
    ))}
  </div>
);

// Para cards en grid
if (loading) return (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {[1,2,3,4,5,6].map(i => (
      <div key={i} className="h-40 bg-gray-100 rounded-md animate-pulse" />
    ))}
  </div>
);

// Para listas con texto
if (loading) return (
  <div className="space-y-2">
    {[1,2,3].map(i => (
      <div key={i} className="flex gap-3 p-4 border border-gray-200 rounded-md animate-pulse">
        <div className="w-10 h-10 bg-gray-200 rounded-md flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
);
```

## Error handling pattern

**Siempre manejar errores en la UI. Nunca dejar pantalla en blanco.**

```tsx
// En páginas con fetch
const [error, setError] = useState<string | null>(null);

if (error) return (
  <div className="text-center py-12">
    <p className="text-gray-500 text-sm mb-4">{error}</p>
    <button onClick={retry} className="text-sm text-gray-700 underline">Reintentar</button>
  </div>
);

// En formularios — mostrar error inline
const [submitError, setSubmitError] = useState<string | null>(null);

{submitError && (
  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
    {submitError}
  </p>
)}

// Error messages estándar a mostrar al usuario
const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) return err.message;
  return 'Error inesperado. Intenta de nuevo.';
};
```

**Empty states — siempre mostrar algo cuando no hay datos:**
```tsx
if (items.length === 0) return (
  <div className="text-center py-12 border border-dashed border-gray-200 rounded-md">
    <p className="text-gray-500 text-sm">No hay elementos todavía.</p>
  </div>
);
```

## Design system

```
Buttons primarios:    bg-gray-900 text-white hover:bg-gray-700 rounded-md
Buttons secundarios:  border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md
Buttons destructivos: bg-red-600 text-white hover:bg-red-700 rounded-md

Cards:   bg-white border border-gray-200 rounded-md
Inputs:  border border-gray-300 rounded-md px-3 py-2.5 text-base focus:ring-2 focus:ring-gray-300 focus:border-gray-400
Headers: bg-gray-900 text-white (no gradients)

Badges activo:    bg-green-50 text-green-700 border border-green-200
Badges inactivo:  bg-amber-50 text-amber-700 border border-amber-200
Badges neutro:    bg-gray-100 text-gray-700
```

**Mobile-first — touch targets mínimos 44px:**
```tsx
// Botón móvil correcto
<button className="px-4 py-2.5 ...">  // py-2.5 = ~44px con text-base
```

**Modales — siempre scroll en móvil:**
```tsx
<DialogContent className="max-h-[90vh] overflow-y-auto w-full sm:max-w-2xl">
```

**Inputs — usar text-base para evitar zoom automático en iOS:**
```tsx
<input className="... text-base" type="date" />  // text-base evita zoom en iOS
```

## DO NOT

- Use `PermissionGuard` or `RouteProtector` — deleted
- Store access token in `localStorage` — cookie only
- Touch `capataz/`, `empleado/`, `veterinario/` routes — out of scope
- Install `react-hook-form` without planning full migration
- Modify `AuthManager.ts` without reading it completely first
- Import hooks directly from their files — always use `@/lib/hooks` barrel
- Fetch ALL records without pagination — use `limit` always
- Leave loading state as `return null` — show skeleton instead
- Leave error state as `return null` — show error message + retry
- Use `rounded-xl`, `rounded-lg` — use `rounded-md`
- Use `shadow-lg`, `shadow-xl` — use `shadow-sm` or none
- Use `transition-all duration-200/300/500` — remove all transitions
- Use `animate-in`, `fade-in`, `slide-in` — remove all animations
- Use `bg-gradient-*`, `backdrop-blur-*` — flat design only
- Use `text-blue-*`, `text-indigo-*` for UI text — use `text-gray-*`
- Use `focus:ring-blue-*`, `focus:ring-accent`, `focus:ring-primary` — use `focus:ring-gray-300`
