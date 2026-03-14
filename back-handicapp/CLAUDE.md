# HandicApp — Backend

## Stack
- **Runtime:** Node.js ≥ 25
- **Framework:** Express 5.1 + TypeScript 5.9
- **ORM:** Sequelize 6.37 + PostgreSQL 15
- **Auth:** JWT (`jsonwebtoken`) + bcrypt 12 rounds
- **Real-time:** Socket.IO 4.8
- **Cola/caché:** ioredis (instalado, no activo en prod aún)
- **Emails:** Resend (principal) + Nodemailer (fallback SMTP)
- **Storage:** Cloudinary para imágenes + Sharp para procesamiento
- **Logging:** Pino estructurado
- **Validación:** express-validator + Zod (para config/env)
- **Tests:** Vitest

## Correr el proyecto

```bash
# Desarrollo
pnpm run dev          # ts-node-dev con hot reload en puerto 3001

# Base de datos
pnpm run seed         # Seed inicial con roles y datos de prueba
pnpm run reset:db     # CUIDADO: borra y recrea toda la BD
pnpm run migrate      # Corre migraciones pendientes

# Producción
pnpm run build        # Compila TypeScript → dist/
pnpm run start        # Corre desde dist/
```

## Variables de entorno requeridas (.env)

```env
NODE_ENV=development
PORT=3001
HOST=localhost

# Base de datos (una de las dos formas)
DATABASE_URL=postgresql://user:pass@localhost:5432/handicapp
# O por separado:
DB_HOST=localhost
DB_PORT=5432
DB_NAME=handicapp
DB_USER=postgres
DB_PASSWORD=password

# JWT — mínimo 32 caracteres
JWT_SECRET=tu_secreto_muy_largo_minimo_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Seguridad
BCRYPT_ROUNDS=12
CORS_ORIGIN=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# Opcional pero recomendado
RESEND_API_KEY=re_xxx
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

## Estructura de carpetas

```
src/
├── index.ts              # Entry point — HTTP server + Socket.IO setup
├── app.ts                # Express config, middleware, rutas
├── config/
│   ├── config.ts         # Validación de env vars con Zod (fuente única de verdad)
│   └── database.ts       # Sequelize config + connection pool + retry
├── controllers/          # Reciben req/res, delegan a services
├── services/             # Lógica de negocio — 21 servicios
├── models/               # Entidades Sequelize — 20+ tablas
├── routes/               # Definición de endpoints y middlewares por ruta
├── middleware/
│   ├── auth.ts           # requireAuth — verifica JWT, adjunta req.user
│   ├── authorization.ts  # requirePermission — RBAC granular
│   ├── security.ts       # Helmet + rate limiting
│   └── validation.ts     # express-validator schemas
├── jobs/                 # Cron jobs (notificaciones de tareas)
├── emails/               # Templates HTML de emails
├── utils/
│   ├── logger.ts         # Pino logger configurado
│   ├── errors.ts         # Clases de error personalizadas
│   └── response.ts       # Helpers de respuesta estandarizada
└── types/                # Tipos globales de TypeScript
```

## Modelos de la base de datos

### Core
| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Auth + perfil + rol |
| `roles` | 6 roles predefinidos (IDs fijos: 1-6) |
| `establecimientos` | Haras/clubes hípicos |
| `membresias_usuario_establecimiento` | Usuarios ↔ Establecimientos |

### Caballos
| Tabla | Descripción |
|-------|-------------|
| `caballos` | Registro completo con datos médicos, documentación, genealogía |
| `propietarios_caballos` | N:M Usuarios ↔ Caballos |
| `caballos_establecimientos` | N:M Caballos ↔ Establecimientos |

### Eventos y Tareas
| Tabla | Descripción |
|-------|-------------|
| `eventos` | Actividades médicas/deportivas de caballos |
| `tipos_eventos` | Catálogo de tipos (50+ predefinidos) |
| `tareas` | Trabajo operativo con asignación y seguimiento |

### Soporte
| Tabla | Descripción |
|-------|-------------|
| `adjuntos` | Documentos y archivos |
| `notificaciones` | Alertas del sistema |
| `codigos_qr` | QR codes por caballo |
| `auditorias` | Log inmutable de cambios |

### Inventario
| Tabla | Descripción |
|-------|-------------|
| `productos`, `categorias`, `movimientos`, `proveedores` | Gestión de insumos |

## Sistema de autenticación

**Flujo de login:**
1. `POST /auth/login` con `{ email, password }`
2. Backend verifica contraseña con bcrypt
3. Genera access token (15m) y refresh token (7d)
4. Tokens se envían en httpOnly cookies + access token en response body
5. Frontend guarda access token en cookie client-side (NO localStorage)

**Middleware `requireAuth`** (`middleware/auth.ts`):
- Extrae token de `Authorization: Bearer` header o cookie `auth-token`
- Verifica firma JWT
- Carga usuario desde BD y adjunta como `req.user`

**Middleware `requirePermission`** (`middleware/authorization.ts`):
- Recibe array de permisos requeridos
- Verifica contra la matriz de permisos del rol
- 401 si no autenticado, 403 si sin permisos

## Permisos por rol

| Permiso | admin | establecimiento | veterinario | empleado | propietario |
|---------|-------|-----------------|-------------|----------|-------------|
| `users:read` | ✅ | ✅ | - | - | - |
| `users:write` | ✅ | ✅ | - | - | - |
| `horses:read` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `horses:write` | ✅ | ✅ | - | - | ✅ |
| `horses:view_medical` | ✅ | ✅ | ✅ | - | ✅ |
| `horses:edit_medical` | ✅ | - | ✅ | - | - |
| `events:create_medical` | ✅ | - | ✅ | - | - |
| `tasks:assign` | ✅ | ✅ | - | - | - |
| `tasks:complete` | ✅ | ✅ | ✅ | ✅ | - |
| `admin:full_access` | ✅ | - | - | - | - |

## Formato de respuesta API

```typescript
// Éxito
{ success: true, message: "...", data: {...} }
{ success: true, message: "...", data: [...], total: 100, page: 1, limit: 20 }

// Error
{ success: false, message: "Error description", errors: [...] }
```

## Convenciones de código

- **Controladores**: solo manejan req/res, no tienen lógica de negocio
- **Servicios**: contienen toda la lógica, no importan nada de Express
- **Errores**: usar las clases de `utils/errors.ts` — `NotFoundError`, `UnauthorizedError`, etc.
- **Logging**: usar `logger` de `utils/logger.ts`, nunca `console.log` en producción
- **Validación**: express-validator en las rutas, no en los controladores
- **Soft deletes**: tablas importantes tienen campo `eliminado_el`, usar `paranoid: true` en Sequelize

## Endpoints principales

```
POST   /auth/login
POST   /auth/logout
POST   /auth/register
GET    /auth/profile
POST   /auth/refresh

GET    /caballos              ?page &limit &search &estado &establecimiento
POST   /caballos
GET    /caballos/:id
PUT    /caballos/:id
GET    /caballos/:id/pedigree
GET    /caballos/:id/historial-medico

GET    /establecimientos
POST   /establecimientos
GET    /establecimientos/:id
GET    /establecimientos/:id/miembros

GET    /eventos               ?caballo_id &tipo &estado &fecha_desde &fecha_hasta
POST   /eventos
PATCH  /eventos/:id/validate

GET    /tareas                ?estado &asignado_a &caballo_id
POST   /tareas
PATCH  /tareas/:id/complete
PATCH  /tareas/:id/assign

GET    /users
POST   /users
PUT    /users/:id
DELETE /users/:id

GET    /health
```

## Qué NO hacer

- No usar `sequelize.sync({ force: true })` en ningún ambiente — destruye datos
- No exponer el JWT_SECRET ni credenciales de BD en logs
- No saltear el middleware de auth en rutas que modifican datos
- No retornar la contraseña hasheada en ninguna respuesta
- No cambiar los IDs de la tabla `roles` — están hardcodeados en el frontend
