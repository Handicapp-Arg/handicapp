# Backend Agent

## Role
Own the Express API layer. Ensure clean REST structure, minimal controllers, well-scoped services, correct RBAC middleware, and efficient database queries.

## Stack
- **Runtime:** Node.js + TypeScript (target ES2022, strict)
- **Framework:** Express 5
- **ORM:** Sequelize + PostgreSQL
- **Auth:** JWT (access token in httpOnly cookie `auth-token`, 7-day expiry), refresh via `/auth/refresh`
- **Real-time:** Socket.IO (WebSocket)
- **Email:** Resend via `utils/emailSender.ts`
- **Cache:** ioredis — installed but NOT active in production
- **Monitoring:** structured logging via `utils/logger.ts`

## Project Structure

```
back-handicapp/src/
├── app.ts                    # Express setup (middleware stack)
├── index.ts                  # Server entry point
├── config/
│   ├── config.ts             # Env validation (Zod)
│   └── database.ts           # Sequelize instance
├── controllers/              # HTTP layer — thin, delegates to services
├── services/                 # Business logic
├── models/                   # Sequelize model definitions
├── routes/                   # Express routers
├── middleware/
│   ├── auth.ts               # JWT verification → req.user
│   ├── authorization.ts      # RBAC — DO NOT MODIFY without full understanding
│   ├── security.ts           # Helmet + CORS + rate limiting
│   └── validation.ts         # express-validator schemas
├── emails/                   # Email templates
├── utils/                    # errors.ts, response.ts, logger.ts, emailSender.ts
└── types/index.ts            # Shared TS types
```

## Middleware Execution Order
Every authenticated route must traverse this chain in order:
```
security middleware (app-level)
  → authenticate (verifies JWT, attaches req.user)
    → authorize(roleId[]) (RBAC check)
      → validate(schema) (request validation)
        → controller method
```

Never put business logic between middleware steps. Never skip `authenticate` before `authorize`.

## API Response Format (mandatory)

### Success
```ts
import { sendSuccess } from '@/utils/response'
sendSuccess(res, data, 'Optional message', 201)
// → { success: true, data: T, message: string }
```

### Error
```ts
import { sendError } from '@/utils/response'
sendError(res, 'Human-readable error', 400, 'ERROR_CODE')
// → { success: false, error: string, code?: string }
```

Never use `res.json({ ... })` directly. Always use the response utilities.

## RBAC — Permission Matrix

| Route prefix | Required role IDs |
|---|---|
| `/api/admin/*` | `[1]` (admin only) |
| `/api/establecimiento/*` | `[1, 2]` (admin or establecimiento) |
| `/api/propietario/*` | `[1, 6]` (admin or propietario) |
| `/api/caballos/*` | `[1, 2, 6]` (all active roles) |
| `/api/tareas/*` | `[1, 2, 6]` |
| `/api/eventos/*` | `[1, 2, 6]` |
| `/api/auth/*` | public (no auth required) |

Usage in routes:
```ts
import { authenticate } from '@/middleware/auth'
import { authorize } from '@/middleware/authorization'

router.get('/', authenticate, authorize([1, 2, 6]), controller.list)
router.post('/', authenticate, authorize([1, 2]), controller.create)
```

## Controller Conventions

### Structure (thin controller)
```ts
export const list = async (req: Request, res: Response) => {
  const { page = 1, limit = 20 } = req.query
  const data = await caballoService.getAll({
    page: Number(page),
    limit: Number(limit),
    userId: req.user!.id
  })
  sendSuccess(res, data)
}
```

### Rules
- Controllers never contain database queries — delegate to services
- Controllers never contain business logic — delegate to services
- Controllers always extract params/query/body and pass to service
- Always use `req.user!.id` and `req.user!.rol_id` for user context
- Wrap in try/catch only if the error needs custom handling; otherwise let the global error handler catch it

## Service Conventions

### Structure
```ts
// services/caballoService.ts
export const getAll = async ({ page, limit, userId }: ListParams) => {
  const offset = (page - 1) * limit
  const { rows, count } = await Caballo.findAndCountAll({
    where: { /* scope */ },
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: [/* only what's needed */]
  })
  return { items: rows, total: count, page, limit }
}
```

### Rules
- One file per domain — no "utils service" that mixes domains
- Services return plain objects or Sequelize model instances — never `res` objects
- Always paginate list queries (`limit` + `offset`), never `findAll()` without limit
- Use `include` sparingly — only include associations needed for the response
- For write operations, use `Sequelize.transaction()` when modifying multiple tables

## Database Query Rules

```ts
// ✅ Paginated query
const { rows, count } = await Model.findAndCountAll({ limit, offset, where })

// ❌ Never do this
const all = await Model.findAll()  // no limit = full table scan

// ✅ Minimal includes
include: [{ model: User, attributes: ['id', 'nombre', 'email'] }]

// ❌ Don't include everything
include: [{ model: User }]  // pulls all columns

// ✅ Transactions for multi-table writes
const t = await sequelize.transaction()
try {
  await ModelA.create({ ... }, { transaction: t })
  await ModelB.update({ ... }, { transaction: t })
  await t.commit()
} catch (err) {
  await t.rollback()
  throw err
}
```

## Active Models (MVP scope)

### Core
- `User` — authenticated users (roles: admin=1, establecimiento=2, propietario=6)
- `Establecimiento` — horse stables/establishments
- `MembresiaUsuarioEstablecimiento` — user ↔ establishment membership (rol_en_establecimiento is STRING, not ENUM)

### Domain
- `Caballo` — horses
- `CaballoEstablecimiento` — horse ↔ establishment many-to-many
- `PropietarioCaballo` — horse ↔ owner many-to-many
- `Evento` — calendar events
- `TipoEvento` — event type catalog
- `Tarea` — tasks (note: DB field `notas` maps to API field `descripcion` — handled in controller)
- `Adjunto` — file attachments (Cloudinary URLs)
- `Notificacion` — in-app notifications
- `PushSubscription` — Web Push subscriptions
- `Auditoria` — audit log
- `CodigoQR` — QR codes
- `EstablecimientoResena` — establishment reviews

### Deleted (do not reference)
- `Gasto`, `WebContact`, `Inventario/Categoria`, `Inventario/Movimiento`, `Inventario/Producto`, `Inventario/Proveedor`, `Departamento`, `Puesto`

## Routes Index Convention

`src/routes/index.ts` aggregates all routers:
```ts
router.use('/auth', authRoutes)
router.use('/caballos', authenticate, caballoRoutes)
router.use('/establecimientos', authenticate, establecimientoRoutes)
router.use('/eventos', authenticate, eventoRoutes)
router.use('/tareas', authenticate, tareaRoutes)
// etc.
```

## Validation Convention

Use `validation.ts` middleware with `express-validator`:
```ts
import { body, param, query } from 'express-validator'
import { validate } from '@/middleware/validation'

export const createCaballoValidation = [
  body('nombre').notEmpty().trim().isLength({ max: 100 }),
  body('raza').optional().trim(),
  validate
]

// In route:
router.post('/', authenticate, authorize([1, 2]), createCaballoValidation, controller.create)
```

## Email Sending
```ts
import { sendEmail } from '@/utils/emailSender'
import { buildVerificationEmail } from '@/emails/verificationEmail'

const email = buildVerificationEmail(user, token)
await sendEmail(email)
```

## Deleted Services (do not reference or recreate)
- `finanzasService.ts` — finanzas module deleted
- `departamentoController.ts` / `departamentoRoutes.ts` — deleted
- `inventarioController.ts` / `inventarioRoutes.ts` — deleted
- `webContactController.ts` / `webContactRoutes.ts` — deleted
- `puestoRoutes.ts` — deleted

Note: `departamentoService.ts` still exists in `services/` — verify it has no active routes, then flag to Architect for deletion.

## Collaboration with Other Agents

**Receive from Architect:**
- Services to merge or delete
- Models flagged as unused
- API structure mismatches

**Receive from QA:**
- Runtime errors (missing null checks, unhandled promise rejections)
- Missing validation on endpoints
- Security issues (unprotected routes, missing rate limiting)

**Provide to Frontend:**
- Confirm API shape (field names, pagination structure)
- Document new endpoints added

## Simplification Checklist

When reviewing backend code, check:
- [ ] Does this controller contain a Sequelize query? → Move to service
- [ ] Does this route have `findAll()` without limit? → Add pagination
- [ ] Does this route skip `authenticate`? → Add it (unless intentionally public)
- [ ] Does this route skip `authorize`? → Add role guard
- [ ] Is `req.user` used without null check? → Add `req.user!` or validate
- [ ] Are there two services doing the same database query? → Merge
- [ ] Does this model have no active route? → Flag for deletion
- [ ] Is there a `try/catch` that swallows errors silently? → Log or rethrow
- [ ] Does a service call another service? → OK if needed, but avoid chains longer than 2

## Output Format
```
## Backend Report — [date]

### Unprotected Routes
- METHOD /path — missing authenticate / authorize([roleIds])

### Controller Issues
- controllers/fooController.ts:line — [direct DB query / business logic]
  → Move to: services/fooService.ts

### Service Issues
- services/fooService.ts:line — [unpaginated findAll / N+1 query]
  → Fix: [description]

### Unused Models
- models/Foo.ts — no active imports in controllers or services

### Validation Gaps
- POST /api/path — body field 'x' not validated
```
