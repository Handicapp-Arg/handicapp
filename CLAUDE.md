# HandicApp — Project Guide

## What This Is
A horse management platform for stables (establecimientos), horse owners (propietarios), and platform admins. The app manages horses, events, tasks, staff assignments, and notifications.

This is a **simplified MVP** — every decision should reduce complexity, not add it.

---

## Tech Stack

### Backend (`back-handicapp/`)
| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript (ES2022, strict) |
| Framework | Express 5 |
| ORM | Sequelize |
| Database | PostgreSQL |
| Auth | JWT in httpOnly cookies (access token: 7 days) |
| Real-time | Socket.IO (WebSocket) |
| Email | Resend via `utils/emailSender.ts` |
| Validation | express-validator |
| Testing | Vitest |

### Frontend (`front-handicapp/`)
| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| UI | React 19 + TailwindCSS + shadcn/ui |
| Server state | TanStack Query v5 |
| Validation | Zod (manual — no react-hook-form) |
| Auth | AuthManager + AuthContext (JWT in httpOnly cookies, never localStorage) |
| Monitoring | Sentry |
| PWA | Web Push + manifest |
| Testing | Vitest |

---

## MVP Scope

### Active Roles (3 only)
| ID | Role | Access |
|---|---|---|
| 1 | admin | Full platform access |
| 2 | establecimiento | Own establishment, horses, events, tasks |
| 6 | propietario | Own horses, events, tasks across establishments |

**Deleted roles (never restore):** capataz (3), veterinario (4), empleado (5)

### Active Modules
`caballos` · `establecimientos` · `eventos` · `tareas` · `auth` · `notificaciones` · `adjuntos` · `qr-codes` · `auditoria` · `usuarios`

**Deleted modules (never restore):** `inventario` · `finanzas` · `personal/empleados` · `reportes` · `webcontact` · `departamentos` · `puestos`

---

## Repository Layout

```
handicapp/
├── back-handicapp/        # Express API
│   └── src/
│       ├── controllers/   # HTTP layer (thin — delegate to services)
│       ├── services/      # Business logic
│       ├── models/        # Sequelize models
│       ├── routes/        # Express routers
│       ├── middleware/    # auth, authorization, security, validation
│       ├── emails/        # Email templates
│       └── utils/         # response, errors, logger, emailSender
│
├── front-handicapp/       # Next.js app
│   └── src/
│       ├── app/
│       │   ├── (auth)/            # Login, register, forgot-password, etc.
│       │   ├── (dashboard)/
│       │   │   ├── admin/         # Role 1 pages
│       │   │   ├── establecimiento/  # Role 2 pages
│       │   │   └── propietario/   # Role 6 pages
│       │   └── _site/             # Public marketing page
│       ├── components/
│       │   ├── ui/        # Primitive UI (shadcn + custom base)
│       │   ├── layout/    # Navigation, sidebar, bottom nav
│       │   ├── common/    # Shared business components
│       │   ├── dashboard/ # Domain forms, lists, cards
│       │   ├── horses/    # Horse-specific components
│       │   ├── stables/   # Stable-specific components
│       │   ├── notifications/ # Notification components
│       │   ├── attachments/  # File attachment components
│       │   ├── owners/    # Owner-specific components
│       │   ├── settings/  # Settings layout
│       │   ├── error/     # Error boundaries
│       │   ├── pwa/       # PWA install/update prompts
│       │   └── providers/ # React context providers
│       ├── lib/
│       │   ├── auth/      # AuthManager (CRITICAL)
│       │   ├── services/  # HTTP client wrappers (one per domain)
│       │   ├── hooks/     # TanStack Query hooks (one per domain)
│       │   ├── schemas/   # Zod validation schemas
│       │   ├── contexts/  # AuthContext
│       │   ├── config/    # queryClient, seo
│       │   ├── constants/ # App-wide constants
│       │   ├── types/     # TypeScript types
│       │   └── utils/     # Utility functions
│       └── types/         # Global TS type declarations
│
├── docs/                  # Technical documentation
├── agents/                # AI agent definitions (see below)
└── CLAUDE.md              # This file
```

---

## Agent Team

The `agents/` folder defines an AI team that collaborates to keep this codebase clean and minimal.

```
agents/
├── architect.md    # System-wide structure, duplicate detection, MVP enforcement
├── frontend.md     # React components, CSS, data fetching, UI patterns
├── backend.md      # Express routes, controllers, services, DB queries
├── qa.md           # Bug scanning, runtime errors, security, test coverage
├── performance.md  # Bundle size, query efficiency, caching, re-renders
└── design.md       # Visual consistency, mobile UX, empty/error/loading states
```

### How Agents Collaborate

```
Architect
  ├── tells Frontend: which components to delete, merge, or migrate
  ├── tells Backend: which services/models to remove or consolidate
  ├── tells QA: structural patterns causing systematic bugs
  └── tells Performance: which modules to split or lazy-load

Frontend ←→ Backend
  └── Frontend tells Backend: API shape expectations
      Backend confirms: response structure, new endpoints

QA → all agents
  └── Reports bugs by severity, tagged [FRONTEND] [BACKEND] [BOTH]
      Each agent implements the fixes in their domain

Performance → Frontend + Backend
  └── Reports bundle regressions, slow queries, N+1 patterns
      Frontend: code splitting, lazy loading, render optimization
      Backend: indexes, query batching, Redis caching

Design → Frontend
  └── Reports CSS violations, missing states, mobile breakage
      Frontend implements the pixel-level fixes
```

### Agent Responsibilities Summary
| Agent | Primary concern |
|---|---|
| **Architect** | Big picture structure, eliminate duplication, enforce MVP boundaries |
| **Frontend** | React components, CSS cleanliness, data fetching hooks, UI patterns |
| **Backend** | REST API design, RBAC, service layer, query efficiency |
| **QA** | Runtime bugs, type safety, security, missing test coverage |
| **Performance** | Bundle size, DB query efficiency, caching strategy, re-renders |
| **Design** | Visual consistency, design system enforcement, mobile UX, UI states |

---

## Critical Rules

### Never do this
- Do not add roles 3, 4, or 5 back to the codebase
- Do not restore deleted modules (inventario, finanzas, personal, reportes, webcontact)
- Do not store JWT tokens in localStorage — cookies only
- Do not add backdrop-blur, gradient overlays, or CSS keyframe animations to UI
- Do not call `Model.findAll()` without a `limit` — always paginate
- Do not put business logic in controllers — use services
- Do not import hooks directly — always use `lib/hooks/index.ts` barrel
- Do not use react-hook-form — it is not installed
- Do not skip `authenticate` or `authorize` on protected routes

### Always do this
- Use the 3-state pattern: loading skeleton → error with retry → data or empty state
- Paginate all list queries (backend `limit`/`offset`, frontend `page`/`limit`)
- Load tab data lazily (only when the tab becomes active)
- Use `SimplePermissionGuard` for conditional UI by role
- Use the standard API response wrapper (`sendSuccess` / `sendError`)
- Wrap multi-table writes in `sequelize.transaction()`

---

## Key Files (Do Not Modify Without Full Understanding)

| File | Why it's sensitive |
|---|---|
| `back-handicapp/src/middleware/authorization.ts` | RBAC — wrong change breaks auth for all routes |
| `front-handicapp/src/lib/auth/AuthManager.ts` | JWT refresh logic — wrong change causes mass logouts |
| `front-handicapp/src/components/common/SimplePermissionGuard.tsx` | Only role guard — ensure backward compat |
| `front-handicapp/src/components/layout/VerticalNavbar.tsx` | ROLE_MENUS — role IDs hardcoded |
| `back-handicapp/src/models/roles.ts` | Role IDs referenced by frontend |

---

## Naming Conventions

### Route segments
Route folder names tied to auth roles stay in **Spanish** because the auth system references them:
- `app/(dashboard)/admin/`
- `app/(dashboard)/establecimiento/`
- `app/(dashboard)/propietario/`

Everything else (components, hooks, services, other route segments) in **English**.

### Renamed files (post-refactor)
| Old name (Spanish) | New name (English) |
|---|---|
| `caballoService` | `horseService` |
| `eventoService` | `eventService` |
| `tareaService` | `taskService` |
| `establecimientoService` | `stableService` |
| `notificacionService` | `notificationService` |
| `adjuntoService` | `attachmentService` |
| `propietarioService` | `ownerService` |
| `useCaballosQuery` | `useHorsesQuery` |
| `useEventosQuery` | `useEventsQuery` |
| `useTareasQuery` | `useTasksQuery` |
| `useEstablecimientosQuery` | `useStablesQuery` |

---

## Running the Project

### Backend
```bash
cd back-handicapp
cp .env.example .env   # fill in DB + JWT + Resend values
npm install
npm run dev            # ts-node-dev with hot reload
npm run seed           # seed demo data
```

### Frontend
```bash
cd front-handicapp
cp .env.example .env.local   # fill in NEXT_PUBLIC_API_URL + Sentry DSN
pnpm install
pnpm dev               # Next.js with Turbopack
pnpm test              # Vitest
pnpm build             # Production build
```

---

## Documentation
Full technical docs in `docs/`:
- `docs/architecture/TECH_STACK.md`
- `docs/backend/QUICK_START.md`
- `docs/backend/NOTIFICACIONES_TAREAS.md`
- `docs/development/GETTING_STARTED.md`
- `docs/frontend/ERROR_BOUNDARIES.md`
- More in `docs/README.md`

Role-specific Claude guides:
- `back-handicapp/CLAUDE.md` — backend dev guide
- `front-handicapp/CLAUDE.md` — frontend dev guide
- `docs/CLAUDE.md` — project context
