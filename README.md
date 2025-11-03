# 🐎 HandicApp - Sistema de Gestión Equina

> **Versión**: 2.0.0  
> **Estado**: ✅ Producción Ready  
> **Actualizado**: 31 de octubre de 2025

**Sistema integral de gestión para establecimientos equinos** - Plataforma completa para la administración de caballos, eventos, usuarios y tareas con control avanzado de roles y permisos.

📚 **Documentación**: [`docs/INDEX.md`](docs/INDEX.md) | [`docs/TECH_STACK.md`](docs/TECH_STACK.md) | [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md)

---

## � Características Destacadas

- ✅ **6 roles completos** (Admin, Propietario, Establecimiento, Veterinario, Capataz, Empleado)
- ✅ **53 endpoints REST** documentados
- ✅ **WebSockets en tiempo real** (Socket.IO)
- ✅ **Performance optimizado** (-80% bundle, -81% load time)
- ✅ **TypeScript strict** (0 errores)
- ✅ **React Query** para state management
- ✅ **Responsive design** (mobile-first)

---

## 🏗️ Stack Tecnológico

### Backend
- **Node.js 20+**, Express 4.21, PostgreSQL 15+
- **Sequelize ORM**, JWT + bcrypt
- **Socket.IO 4.8** (WebSockets)
- **Vitest** (testing)

### Frontend
- **Next.js 15.5.3**, React 19.1.0, TypeScript 5.7
- **TailwindCSS 3.4**, shadcn/ui, Lucide Icons
- **React Query v5**, React Hook Form
- **Turbopack** (dev server)

Consulta **[TECH_STACK.md](docs/TECH_STACK.md)** para detalles completos.

---

## 📊 Métricas de Performance

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Bundle Size | 2.1 MB | 420 KB | -80% |
| Load Time | 9.0s | 1.8s | -81% |
| Re-renders | 245 | 32 | -87% |
| Memory Leaks | 18 | 3 | -83% |

---

## 🚀 Inicio Rápido

### Requisitos
- Node.js >= 20.0.0
- pnpm >= 8.0.0
- PostgreSQL >= 15.0

### Instalación
```bash
git clone https://github.com/Handicapp-Arg/handicapp.git
cd handicapp
```

### 2. Configurar Base de Datos
```bash
# Iniciar PostgreSQL (método depende de tu SO)
# Windows: Iniciar servicio desde Services.msc
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Crear base de datos
psql -U postgres -c "CREATE DATABASE handicapp_db;"
psql -U postgres -c "CREATE USER handicapp_user WITH PASSWORD 'HandicApp!234';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE handicapp_db TO handicapp_user;"
```

### 3. Configurar Backend
```bash
```bash
# 1. Clonar repositorio
git clone https://github.com/Handicapp-Arg/handicapp.git
cd handicapp

# 2. Instalar dependencias
pnpm install

# 3. Configurar base de datos PostgreSQL
createdb handicapp_db

# 4. Backend setup
cd back-handicapp
cp .env.example .env  # Configurar credenciales
pnpm run dev          # Puerto 3001

# 5. Frontend setup (nueva terminal)
cd front-handicapp
cp .env.local.example .env.local
pnpm run dev          # Puerto 3000
```

### Credenciales de Prueba
| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@handicapp.com | admin123 |

**Acceso**: http://localhost:3000/login

---

## 📁 Estructura del Proyecto

```
handicapp/
├── back-handicapp/      # Backend (Node.js + Express)
│   ├── src/
│   │   ├── controllers/ # 15+ controladores
│   │   ├── models/      # 13 modelos Sequelize
│   │   ├── routes/      # 53 endpoints
│   │   ├── services/    # Business logic
│   │   └── middleware/  # Auth, RBAC, validation
│   └── migrations/      # DB versioning
│
├── front-handicapp/     # Frontend (Next.js + React)
│   ├── src/
│   │   ├── app/         # 6 roles dashboards
│   │   ├── components/  # 50+ componentes
│   │   ├── hooks/       # 15+ custom hooks
│   │   └── lib/         # Utils, API, React Query
│   └── public/
│
└── docs/                # Documentación completa
    ├── INDEX.md         # Índice maestro
    ├── TECH_STACK.md    # Stack tecnológico
    └── PROJECT_STATUS.md # Estado del proyecto
```

---

## 🛡️ Seguridad

- ✅ JWT con httpOnly cookies
- ✅ RBAC (6 roles, permisos granulares)
- ✅ bcrypt hashing (12 rounds)
- ✅ Rate limiting
- ✅ CORS + Helmet
- ✅ Input validation (Zod + express-validator)

---

## 📚 API Endpoints

### Principales
- **Auth**: `/api/v1/auth/*` (login, logout, profile)
- **Usuarios**: `/api/v1/users/*` (CRUD, search, stats)
- **Establecimientos**: `/api/v1/establecimientos/*`
- **Caballos**: `/api/v1/caballos/*`
- **Eventos**: `/api/v1/eventos/*`
- **Tareas**: `/api/v1/tareas/*`

**Documentación completa**: [API_REFERENCE.md](docs/backend/API_REFERENCE.md)

---

## 🏃‍♂️ Scripts

### Backend (`back-handicapp/`)
```bash
pnpm run dev          # Desarrollo con hot reload
pnpm run build        # Compilar TypeScript
pnpm run start        # Producción
pnpm run test         # Ejecutar tests
pnpm run lint         # Linting
pnpm run type-check   # Verificar tipos
```

### Frontend (`front-handicapp/`)
```bash
pnpm run dev          # Desarrollo
pnpm run build        # Construir para producción
```bash
# Backend
pnpm run dev      # Desarrollo con hot reload
pnpm run build    # Build de producción
pnpm run start    # Ejecutar producción
pnpm run test     # Tests con Vitest

# Frontend
pnpm run dev      # Desarrollo (Turbopack)
pnpm run build    # Build de producción
pnpm run start    # Servir build
pnpm run lint     # ESLint
```

---

## � Documentación Completa

- **[INDEX.md](docs/INDEX.md)** - Índice maestro
- **[TECH_STACK.md](docs/TECH_STACK.md)** - Stack tecnológico detallado
- **[PROJECT_STATUS.md](docs/PROJECT_STATUS.md)** - Estado del proyecto
- **[GETTING_STARTED.md](docs/GETTING_STARTED.md)** - Guía de inicio
- **[API_REFERENCE.md](docs/backend/API_REFERENCE.md)** - 53 endpoints documentados

---

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'feat: agregar nueva funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

---

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/Handicapp-Arg/handicapp/issues)
- **Documentación**: Ver carpeta `/docs`
- **Email**: desarrollo@handicapp.com

---

## 📜 Licencia

ISC License - Ver `LICENSE` para detalles

---

**� Desarrollado para la comunidad ecuestre argentina**

**Estado**: ✅ Producción Ready | **Versión**: 2.0.0 | **Actualizado**: Octubre 2025