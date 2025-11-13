# 🐎 HandicApp - Sistema de Gestión Equina

> **Versión**: 2.0.0  
> **Estado**: ✅ Producción Ready  
> **Actualizado**: 10 de noviembre de 2025

**Sistema integral de gestión para establecimientos equinos** - Plataforma completa para la administración de caballos, eventos, usuarios y tareas con control avanzado de roles y permisos.

📚 **Documentación**: [`docs/INDEX.md`](docs/INDEX.md) | [`docs/TECH_STACK.md`](docs/TECH_STACK.md)

---

## ✨ Características Destacadas

- ✅ **6 roles completos** (Admin, Propietario, Establecimiento, Veterinario, Capataz, Empleado)
- ✅ **53 endpoints REST** documentados
- ✅ **WebSockets en tiempo real** (Socket.IO)
- ✅ **Performance optimizado** (Lighthouse 85-90/100)
- ✅ **TypeScript strict** (0 errores)
- ✅ **React Query** para state management
- ✅ **Responsive design** (mobile-first)

---

## 🏗️ Stack Tecnológico

### Backend
- **Node.js 20+**, Express 5.1, PostgreSQL 15+
- **Sequelize ORM**, JWT + bcrypt
- **Socket.IO 4.8** (WebSockets)
- **Compression** (gzip/brotli)
- **Vitest** (testing)

### Frontend
- **Next.js 15.5.3**, React 19.1.0, TypeScript 5.9
- **TailwindCSS 3.4**, shadcn/ui, Lucide Icons
- **TanStack Query v5**, React Hook Form
- **Sentry** (error tracking)

Consulta **[TECH_STACK.md](docs/TECH_STACK.md)** para detalles completos.

---

##  Inicio Rápido

### Requisitos
- Node.js >= 20.0.0
- pnpm >= 8.0.0
- PostgreSQL >= 15.0

### 1. Clonar e Instalar
```bash
git clone https://github.com/Handicapp-Arg/handicapp.git
cd handicapp
pnpm install
```

### 2. Configurar Base de Datos
```bash
# Crear base de datos
psql -U postgres -c "CREATE DATABASE handicapp_db;"
psql -U postgres -c "CREATE USER handicapp_user WITH PASSWORD 'tu_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE handicapp_db TO handicapp_user;"
```

### 3. Backend Setup
```bash
cd back-handicapp
cp .env.example .env  # Configurar variables de entorno
pnpm run dev          # Puerto 3001
```

### 4. Frontend Setup
```bash
cd front-handicapp
cp .env.local.example .env.local  # Configurar variables
pnpm run dev                       # Puerto 3000
```

### Credenciales de Prueba
| Rol | Email | Password |
|-----|-------|----------|
| Admin | admin@handicapp.com | admin123 |

**Acceso**: http://localhost:3000/login

---

## 🏃‍♂️ Scripts Disponibles

### Backend (`back-handicapp/`)
```bash
pnpm run dev          # Desarrollo con hot reload
pnpm run build        # Compilar TypeScript
pnpm run start        # Producción
pnpm run test         # Ejecutar tests
pnpm run lint         # Linting
```

### Frontend (`front-handicapp/`)
```bash
pnpm run dev          # Desarrollo (Turbopack)
pnpm run build        # Build de producción
pnpm run start        # Servir build
pnpm run lint         # ESLint
```

---

## 📚 Documentación

- **[INDEX.md](docs/INDEX.md)** - Índice maestro
- **[TECH_STACK.md](docs/TECH_STACK.md)** - Stack tecnológico detallado
- **[GETTING_STARTED.md](docs/GETTING_STARTED.md)** - Guía de inicio
- **[API_REFERENCE.md](docs/backend/API_REFERENCE.md)** - 53 endpoints documentados

---

## 🛡️ Seguridad

- ✅ JWT con httpOnly cookies
- ✅ RBAC (6 roles, permisos granulares)
- ✅ bcrypt hashing (12 rounds)
- ✅ Rate limiting
- ✅ CORS + Helmet
- ✅ Input validation (Zod + express-validator)

---

## 📜 Licencia

ISC License

---

**🐴 Desarrollado para la comunidad ecuestre argentina**

**Estado**: ✅ Producción Ready | **Versión**: 2.0.0 | **Actualizado**: Noviembre 2025