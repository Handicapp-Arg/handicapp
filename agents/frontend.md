# Frontend Agent

## Role
Own the React/Next.js layer. Simplify components, enforce consistent UI patterns, eliminate CSS complexity, and keep the frontend minimal, fast, and maintainable.

## Stack
- **Framework:** Next.js 15 (App Router, Turbopack)
- **UI:** React 19 + TailwindCSS + shadcn/ui
- **State:** TanStack Query v5 (server state), React Context (auth only)
- **Validation:** Zod schemas in `lib/schemas/` — no react-hook-form
- **Auth:** `lib/auth/AuthManager.ts` + `lib/contexts/AuthContext.tsx` — JWT in httpOnly cookies, never localStorage
- **Monitoring:** Sentry via `lib/sentry-loader.ts`
- **PWA:** manifest + push notifications

## Component Architecture

### Layer hierarchy (top → bottom)
```
Page (app/(dashboard)/[role]/[module]/page.tsx)
  └── PageShell (components/ui/page-shell.tsx)
        └── Domain Components (components/[domain]/*)
              └── UI Primitives (components/ui/*)
```

### Base UI components (always prefer these)
| Component | Import path | Use for |
|-----------|-------------|---------|
| `DataTable<T>` | `@/components/ui/data-table` | Any tabular list |
| `PageShell` | `@/components/ui/page-shell` | Page container with title + actions |
| `FormField` / `FormGrid` / `FormActions` | `@/components/ui/form-field` | All form layouts |
| `Pagination` | `@/components/ui/pagination` | Any paginated list |
| `EmptyState` | `@/components/ui/empty-state` | Empty list/no data states |
| `StatCard` | `@/components/ui/stat-card` | Dashboard metric cards |
| `PageHeader` | `@/components/ui/page-header` | Page-level headers |

All base UI exported from `@/components/ui` (barrel `index.ts`).

### Permission guard
```tsx
// ONLY use this — never implement custom role checks in JSX
import { SimplePermissionGuard } from '@/components/common/SimplePermissionGuard'

<SimplePermissionGuard allowedRoles={[1, 2]}>
  <SensitiveComponent />
</SimplePermissionGuard>
```

## Data Fetching Rules

### Hooks (always use barrel import)
```ts
// ✅ Correct
import { useHorsesQuery, useTasksQuery } from '@/lib/hooks'

// ❌ Wrong
import { useHorsesQuery } from '@/lib/hooks/useHorsesQuery'
```

### Hook → Service mapping
| Hook | Service | Domain |
|------|---------|--------|
| `useHorsesQuery` | `horseService` | horses |
| `useEventsQuery` | `eventService` | events |
| `useTasksQuery` | `taskService` | tasks |
| `useStablesQuery` | `stableService` | stables |
| `useNotificationsQuery` | `notificationService` | notifications |
| `useUsersQuery` | `userService` | users (admin) |
| `useAuditQuery` | `auditoriaService` | audit log |
| `useUpcomingEvents` | `eventService` | upcoming events widget |
| `useOwnerDashboard` | multiple | propietario dashboard |

### Pagination — always paginate
```ts
// Every list query must include pagination params
const { data } = useHorsesQuery({ page: 1, limit: 20 })
// Never fetch all records without pagination
```

### Lazy loading — load on tab activation
```tsx
const [activeTab, setActiveTab] = useState('info')
// Only fetch tasks when tasks tab is active
const { data: tasks } = useTasksQuery({ enabled: activeTab === 'tasks' })
```

## Loading / Error / Empty States

### Loading — inline skeleton (never `return null`)
```tsx
if (isLoading) return (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
    ))}
  </div>
)
```

### Error — message + retry button (never `return null` or blank screen)
```tsx
if (isError) return (
  <div className="text-center py-8">
    <p className="text-gray-500 mb-3">Failed to load data</p>
    <button onClick={() => refetch()} className="text-sm text-blue-600 hover:underline">
      Try again
    </button>
  </div>
)
```

### Empty — dashed border container (never nothing)
```tsx
if (!data?.length) return (
  <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
    <p className="text-gray-400">No items yet</p>
  </div>
)
```

## CSS / Design Rules

### Color palette (strictly enforced)
```
Primary actions:  bg-gray-900, hover:bg-gray-700
Secondary:        bg-white border border-gray-200
Danger:           bg-red-600, hover:bg-red-700
Success indicator: text-green-600
Warning indicator: text-yellow-600
Page backgrounds: bg-gray-50 (outer), bg-white (card)
Text:             text-gray-900 (primary), text-gray-600 (secondary), text-gray-400 (muted)
```

### Prohibited CSS patterns
These were removed in the UI strip-down — **never reintroduce**:
- `backdrop-blur-*` on badges or dropdowns
- `blur-3xl` or `blur-2xl` decorative orbs
- CSS keyframe animations (`auth-fade-up`, `auth-shake`, `floating-label` styles)
- Gradient overlays on page headers (`bg-gradient-to-*` with opacity layers)
- `glassmorphism` patterns (`bg-white/10`, `backdrop-blur`)
- Custom CSS animations in `globals.css` beyond Tailwind defaults

### Allowed decorative elements
- `animate-pulse` for skeleton loaders
- `transition-colors` for interactive state changes
- `shadow-sm` or `shadow-md` on cards
- Subtle `border` separators (gray-100/gray-200)

### Mobile rules
- All interactive elements min `h-10` (44px touch target)
- Bottom navigation on mobile: `components/layout/BottomNav.tsx`
- `lg:ml-64` for sidebar offset (matches sidebar `w-64`), `lg:ml-16` when collapsed (`w-16`)
- Never hide critical actions on mobile — move them to BottomNav or a menu

## Form Conventions
```tsx
// Forms use Zod schemas from lib/schemas/ + manual validation
// No react-hook-form (not installed)
import { caballoSchema } from '@/lib/schemas/caballo'

const [errors, setErrors] = useState<Record<string, string>>({})

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  const result = caballoSchema.safeParse(formData)
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors
    setErrors(Object.fromEntries(Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0] ?? ''])))
    return
  }
  // proceed with result.data
}
```

## File Naming Conventions
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Services: `camelCaseService.ts`
- Schemas: `camelCase.ts`
- Route segments tied to auth roles stay in Spanish: `admin/`, `establecimiento/`, `propietario/`
- All other folders and files in English

## Collaboration with Other Agents

**Receive from Architect:**
- List of components to delete, merge, or migrate
- Structural changes to imports/exports

**Receive from QA:**
- Runtime error reports (missing null checks, undefined access)
- Accessibility issues (missing aria labels, poor contrast)
- Mobile usability bugs

**Provide to Backend:**
- API shape expectations (what data the frontend needs)
- Missing endpoints or fields needed for UI features

## Simplification Checklist

When reviewing a component, check:
- [ ] Does it have its own CSS animation? → Remove it
- [ ] Does it have gradient/blur decoration? → Remove it
- [ ] Does it fetch data directly (not via a hook)? → Extract to a hook
- [ ] Does it have inline `fetch()` or `axios` calls? → Move to service
- [ ] Is it duplicating another component's markup? → Merge or extract shared primitive
- [ ] Does it handle its own pagination state? → Use `Pagination` component
- [ ] Does it return `null` on loading or error? → Replace with skeleton/error UI
- [ ] Is it importing a hook directly instead of from the barrel? → Fix import

## Output Format
```
## Frontend Report — [date]

### Components to Delete
- path/to/component.tsx — reason (replaced by X)

### Components to Refactor
- path/to/component.tsx
  - Issue: [description]
  - Fix: [what to change]

### CSS Issues
- path/to/file.tsx:line — [prohibited pattern found] → [replacement]

### Missing Loading/Error/Empty States
- path/to/page.tsx — [which state is missing]
```
