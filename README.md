# 🐎 HandicApp

**Sistema de gestión de handicaps deportivos** - Aplicación web completa para la administración y seguimiento de handicaps en eventos ecuestres.

## 📋 Descripción

HandicApp es una plataforma integral que permite la gestión eficiente de:
- **Usuarios**: Sistema de roles (Admin, Establecimiento, Capataz, Veterinario, Empleado, Propietario)
- **Caballos**: Registro y seguimiento de ejemplares
- **Eventos**: Organización y administración de competencias
- **Handicaps**: Cálculo y asignación de handicaps deportivos
- **Establecimientos**: Gestión de centros ecuestres

## 🏗️ Arquitectura del Proyecto

```
handicapp/
├── 📁 back-handicapp/     # API Backend (Node.js + TypeScript + PostgreSQL)
├── 📁 front-handicapp/    # Frontend (Next.js + React + TypeScript)
├── 📄 README.md          # Documentación principal (este archivo)
├── 📄 OPTIMIZACIONES.md  # Registro de mejoras de seguridad
├── 📄 SEGURIDAD.md       # Guías de seguridad
└── 📄 INSTRUCCIONES-DESPLIEGUE.md  # Guías de deployment
```

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
# Editar .env con tus configuraciones

# Iniciar servidor backend
pnpm run dev
# ✅ Backend disponible en http://localhost:3001
```

### 4. Configurar Frontend
```bash
# En otra terminal
cd front-handicapp
pnpm install

# Iniciar servidor frontend
pnpm run dev
# ✅ Frontend disponible en http://localhost:3000
```

## 🎯 Inicio Rápido

### Credenciales de Prueba
El sistema crea automáticamente usuarios de ejemplo:

| Rol | Email | Password | Dashboard |
|-----|-------|----------|----------|
| **Admin** | `admin@handicapp.com` | `admin123` | `/admin` |
| **Veterinario** | `vet@test.com` | `vet123` | `/veterinario` |

### Acceso a la Aplicación
1. Ir a `http://localhost:3000/login`
2. Usar credenciales de prueba
3. Navegar según el rol asignado

## 🛡️ Características de Seguridad

- **Autenticación JWT** con tokens de corta duración (2h)
- **Rate Limiting** activo (5 intentos/15min)
- **Protección de rutas** basada en roles
- **Cookies seguras** con SameSite=Strict
- **Validaciones robustas** en frontend y backend
- **Hashing seguro** de contraseñas con bcrypt (12 rounds)

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