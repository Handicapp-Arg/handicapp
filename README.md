# 🐎 HandicApp - Sistema de Gestión Equina

**Sistema integral de gestión para establecimientos equinos** - Plataforma completa para la administración de caballos, eventos, usuarios y tareas con control avanzado de roles y permisos.

## 🏇 Descripción

HandicApp es una plataforma integral que permite la gestión eficiente de:
- **Usuarios**: Sistema de roles completo (Admin, Establecimiento, Capataz, Veterinario, Empleado, Propietario)
- **Establecimientos**: Gestión completa de centros ecuestres con búsqueda y filtros
- **Caballos**: Registro y seguimiento de ejemplares con genealogía
- **Eventos**: 50+ tipos de eventos médicos, deportivos y administrativos predefinidos
- **Tareas**: Sistema de asignación y seguimiento de tareas
- **Auditoría**: Logging completo de todas las acciones del sistema

## 🏗️ Arquitectura del Sistema

### Backend (Express.js + TypeScript)
- **API RESTful** con 38 endpoints completamente funcionales
- **Base de datos**: PostgreSQL con Sequelize ORM
- **Autenticación**: JWT con cookies HTTPOnly
- **Sistema de roles**: Admin, Establecimiento, Capataz, Veterinario, Empleado, Propietario
- **Logging**: Winston con rotación de archivos
- **Validación**: Middleware de validación personalizado
- **Seguridad**: Rate limiting, CORS, sanitización

### Frontend (Next.js 14 + TypeScript)
- **Dashboard por roles** con navegación dinámica
- **Autenticación**: Sistema basado en cookies
- **UI Components**: Sistema de componentes reutilizables con Tailwind CSS
- **Gestión de permisos**: Guards de protección por rol
- **Responsive**: Diseño adaptable para todos los dispositivos

### Estructura del Proyecto

```
handicapp/
├── 📁 back-handicapp/           # Backend API
│   ├── src/
│   │   ├── controllers/         # Controladores de API (8 controllers)
│   │   ├── services/            # Lógica de negocio
│   │   ├── models/              # Modelos de Sequelize (14 modelos)
│   │   ├── routes/              # Definición de rutas
│   │   ├── middleware/          # Middleware personalizado
│   │   ├── utils/               # Utilidades y helpers
│   │   └── config/              # Configuración
│   └── package.json
│
├── 📁 front-handicapp/          # Frontend Next.js
│   ├── src/
│   │   ├── app/                 # App Router de Next.js
│   │   │   ├── (auth)/          # Rutas de autenticación
│   │   │   ├── (dashboard)/     # Dashboard por roles
│   │   │   └── (site)/          # Página pública
│   │   ├── components/          # Componentes React
│   │   │   ├── ui/              # Componentes base
│   │   │   ├── common/          # Componentes comunes
│   │   │   ├── dashboard/       # Componentes del dashboard
│   │   │   └── layout/          # Componentes de layout
│   │   └── lib/                 # Configuración y utilidades
│   └── package.json
│
├── 📄 README.md                 # Este archivo
├── 📄 SEGURIDAD.md             # Guías de seguridad
└── 📄 DOCUMENTACION-ORGANIZADA.md  # Documentación técnica
```

## 🚀 Características Principales

### ✅ Fase 2 - Backend Completo
- [x] **Gestión de Usuarios**: CRUD completo con roles y permisos
- [x] **Gestión de Establecimientos**: Búsqueda, filtros y asociaciones
- [x] **Gestión de Caballos**: Registro completo con genealogía
- [x] **Sistema de Eventos**: 50+ tipos de eventos predefinidos
- [x] **Tareas y Asignaciones**: Sistema de gestión de tareas
- [x] **Autenticación y Autorización**: JWT + middleware de roles
- [x] **Auditoría**: Logging completo de acciones del sistema

### ✅ Fase 3 - Frontend Dashboard
- [x] **Login/Logout**: Autenticación completa con manejo de errores
- [x] **Dashboard por Roles**: Vistas específicas según permisos
- [x] **Gestión de Establecimientos**: Lista, creación y edición funcional
- [x] **Sistema de Navegación**: Sidebar y navbar responsivos
- [x] **UI Components**: Card, Badge, Input, Button y más
- [x] **Guards de Permisos**: Protección de rutas por rol

### 🔄 En Desarrollo Activo
- Gestión completa de caballos (frontend)
- Sistema de eventos médicos
- Reportes y estadísticas
- Notificaciones en tiempo real

### 📋 Próximas Funcionalidades
- App móvil React Native
- Sistema de QR codes
- Integración con dispositivos IoT
- Dashboard de analíticas avanzadas

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js 18+** + **TypeScript** - Runtime y tipado estático
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos relacional
- **Sequelize** - ORM para PostgreSQL
- **JWT** - Autenticación con tokens
- **Winston** - Sistema de logging
- **bcrypt** - Hash de contraseñas (12 rounds)
- **Helmet** + **CORS** - Seguridad HTTP

### Frontend
- **Next.js 14** - Framework React con App Router
- **React 18** - Biblioteca de interfaces de usuario
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Framework de estilos utilitarios
- **Heroicons** - Iconografía SVG
- **class-variance-authority** - Gestión de clases CSS

## 🔧 Requisitos Técnicos

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (gestor de paquetes recomendado)
- **PostgreSQL** >= 13.0
- **Git** para control de versiones

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio
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
cd back-handicapp
pnpm install

# Copiar y configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones de base de datos

# Iniciar servidor backend con auto-recarga
pnpm run dev
# ✅ Backend disponible en http://localhost:3001
```

### 4. Configurar Frontend
```bash
# En otra terminal
cd front-handicapp
pnpm install

# Copiar y configurar variables de entorno
cp .env.local.example .env.local
# Editar .env.local con la URL del backend

# Iniciar servidor frontend
pnpm run dev
# ✅ Frontend disponible en http://localhost:3000
```

## 🎯 Inicio Rápido

## 🎯 Inicio Rápido

### Configuración Automática
El sistema incluye seeds automáticos que crean:
- **Roles básicos**: Admin, Establecimiento, Capataz, Veterinario, Empleado, Propietario
- **Usuario admin**: `admin@handicapp.com` / `admin123`
- **50+ tipos de eventos** predefinidos (médicos, deportivos, administrativos)

### Credenciales de Prueba
| Rol | Email | Password | Dashboard |
|-----|-------|----------|----------|
| **Admin** | `admin@handicapp.com` | `admin123` | `/admin` |
| **Veterinario** | `vet@test.com` | `vet123` | `/veterinario` |

### Acceso a la Aplicación
1. Ir a `http://localhost:3000/login`
2. Usar credenciales de prueba
3. Navegar según el rol asignado

## 📊 Base de Datos

### Modelos Principales
- **User**: Gestión de usuarios y autenticación
- **Establecimiento**: Establecimientos equinos con ubicación y contacto
- **Caballo**: Registro de caballos con genealogía completa
- **Evento**: Eventos médicos, deportivos y administrativos
- **Tarea**: Sistema de tareas y asignaciones por rol
- **Rol**: Sistema de roles y permisos granular

## 🛡️ Sistema de Seguridad

### Autenticación y Autorización
- **JWT tokens** con expiración de 2 horas
- **Cookies HTTPOnly** con SameSite=Strict
- **Rate limiting** activo (5 intentos/15min)
- **Middleware de autorización** por roles
- **Validaciones robustas** en frontend y backend

### Roles y Permisos
1. **Admin**: Acceso completo al sistema y gestión de usuarios
2. **Establecimiento**: Gestión de su establecimiento y caballos
3. **Capataz**: Supervisión de tareas y operaciones diarias
4. **Veterinario**: Gestión de eventos médicos y sanitarios
5. **Empleado**: Tareas básicas asignadas por superiores
6. **Propietario**: Vista de sus caballos y eventos relacionados

### Características de Seguridad
- **Hashing seguro** de contraseñas con bcrypt (12 rounds)
- **Sanitización** de inputs para prevenir XSS
- **CORS configurado** para prevenir ataques cross-origin
- **Helmet.js** para headers de seguridad HTTP

## 📚 Endpoints de la API

### 🔐 Autenticación
- `POST /api/v1/auth/login` - Iniciar sesión
- `GET /api/v1/auth/profile` - Obtener perfil
- `POST /api/v1/auth/logout` - Cerrar sesión

### 👥 Gestión de Usuarios (Admin)
- `GET /api/v1/users` - Listar usuarios
- `POST /api/v1/users` - Crear usuario
- `PUT /api/v1/users/:id` - Actualizar usuario
- `DELETE /api/v1/users/:id` - Eliminar usuario
- `GET /api/v1/users/search` - Buscar usuarios
- `GET /api/v1/users/stats` - Estadísticas

### 🔧 Sistema
- `GET /api/v1/health` - Health check
- `GET /api/v1/roles` - Obtener roles del sistema

## 🏃‍♂️ Scripts Disponibles

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
pnpm run start        # Servir build de producción
pnpm run lint         # Linting
```

## 🐛 Solución de Problemas

### Backend no inicia
```bash
# Verificar PostgreSQL
psql -U postgres -c "SELECT version();"

# Verificar configuración .env
cat back-handicapp/.env

# Limpiar y reinstalar
cd back-handicapp
rm -rf node_modules package-lock.json
pnpm install
```

### Frontend no carga
```bash
# Verificar puerto disponible
netstat -ano | findstr ":3000"

# Limpiar caché de Next.js
cd front-handicapp
rm -rf .next
pnpm run dev
```

### Problemas de base de datos
```bash
# Reiniciar base de datos
cd back-handicapp
pnpm run db:reset
pnpm run dev
```

## 📊 Tecnologías Utilizadas

### Backend
- **Node.js + TypeScript** - Runtime y tipado
- **Express.js** - Framework web
- **PostgreSQL** - Base de datos relacional
- **Sequelize** - ORM
- **JWT** - Autenticación
- **bcrypt** - Hashing de contraseñas
- **Helmet + CORS** - Seguridad

### Frontend
- **Next.js 15** - Framework React
- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Cookies** - Almacenamiento seguro

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📞 Soporte

- **Issues**: [GitHub Issues](https://github.com/Handicapp-Arg/handicapp/issues)
- **Documentación**: Revisar archivos `.md` en el proyecto
- **Wiki**: [Documentación técnica](https://github.com/Handicapp-Arg/handicapp/wiki)

## 📜 Licencia

Este proyecto está bajo la Licencia ISC. Ver `LICENSE` para más detalles.

---

**🚀 Desarrollado con ❤️ para la comunidad ecuestre argentina**

*Estado del proyecto: ✅ **Activo y en desarrollo***