# 🚀 Instrucciones de Despliegue - HandicApp

## 📋 Requisitos Previos

Tu compañero necesita tener instalado:
- **Docker** y **Docker Compose**
- **Git**
- **Node.js** (opcional, para desarrollo local)

## 🔧 Configuración Inicial

### 1. Clonar el Repositorio
```bash
git clone [URL_DEL_REPOSITORIO]
cd handicapp
```

### 2. Crear Archivos de Entorno

#### Archivo Principal: `.env` (en la raíz del proyecto)
```env
# Variables para Docker Compose
DB_PASSWORD=devpassword
POSTGRES_PASSWORD=devpassword
JWT_SECRET=3a0f9f7e3c0c4a2b8e8f1c9d6a7b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8
NEXT_PUBLIC_API_BASE_URL=http://localhost:3003/api/v1
NEXT_PUBLIC_APP_ENV=development
NODE_ENV=development
```

#### Backend: `back-handicapp/.env`
```env
# Configuración del Backend
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
DB_HOST=postgres
DB_PORT=5432
DB_NAME=handicapp_db
DB_USER=postgres
DB_PASSWORD=devpassword
DB_DIALECT=postgres
DB_LOGGING=false
JWT_SECRET=3a0f9f7e3c0c4a2b8e8f1c9d6a7b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true
LOG_LEVEL=info
LOG_FILE=logs/app.log
API_VERSION=v1
API_PREFIX=/api
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads/
```

#### Frontend: `front-handicapp/.env`
```env
# Configuración del Frontend
NODE_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3003/api/v1
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_REQUEST_TIMEOUT_MS=10000
NEXT_PUBLIC_REQUEST_MAX_RETRIES=3
```

## 🚀 Despliegue

### Opción 1: Scripts Automáticos (Recomendado)

#### En Linux/Mac:
```bash
chmod +x start-app.sh
./start-app.sh
```

#### En Windows:
```cmd
start-app.bat
```

### Opción 2: Comandos Manuales

```bash
# Limpiar contenedores previos
docker-compose -f docker-compose.yml -f docker-compose.override.yml down -v

# Iniciar servicios
docker-compose -f docker-compose.yml -f docker-compose.override.yml up -d

# Ver logs
docker-compose -f docker-compose.yml -f docker-compose.override.yml logs -f
```

## 🌐 URLs de Acceso

Una vez desplegado, la aplicación estará disponible en:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3003
- **PostgreSQL**: localhost:5434
- **Redis**: localhost:6381

## 🛑 Detener la Aplicación

### Con Scripts:
```bash
# Linux/Mac
./stop-app.sh

# Windows
stop-app.bat
```

### Manual:
```bash
docker-compose -f docker-compose.yml -f docker-compose.override.yml down -v
```

## 🔍 Verificación

1. **Frontend**: Abrir http://localhost:3000
2. **Backend**: Verificar http://localhost:3003/api/v1/health (si existe endpoint)
3. **Logs**: `docker-compose logs -f` para ver logs en tiempo real

## 🐛 Solución de Problemas

### Si hay errores de permisos:
```bash
sudo chmod +x start-app.sh
sudo chmod +x stop-app.sh
```

### Si hay conflictos de puertos:
```bash
# Verificar qué está usando los puertos
netstat -tulpn | grep :3000
netstat -tulpn | grep :3003
```

### Si hay problemas con Docker:
```bash
# Limpiar todo
docker system prune -a
docker volume prune
```

## 📁 Estructura de Archivos Importantes

```
handicapp/
├── .env                          # Variables principales
├── docker-compose.yml            # Configuración de producción
├── docker-compose.override.yml   # Configuración de desarrollo
├── start-app.sh                  # Script de inicio (Linux/Mac)
├── start-app.bat                 # Script de inicio (Windows)
├── stop-app.sh                   # Script de parada (Linux/Mac)
├── stop-app.bat                  # Script de parada (Windows)
├── INSTRUCCIONES-DESPLIEGUE.md   # Este archivo
├── back-handicapp/
│   ├── .env                      # Variables del backend
│   ├── src/
│   │   ├── config/               # Configuración centralizada
│   │   ├── constants/            # Constantes de la aplicación
│   │   ├── controllers/          # Controladores de rutas
│   │   ├── middleware/           # Middleware personalizado
│   │   ├── models/               # Modelos de base de datos
│   │   ├── routes/               # Definición de rutas
│   │   ├── services/             # Lógica de negocio
│   │   ├── types/                # Tipos TypeScript
│   │   ├── utils/                # Utilidades
│   │   └── validators/           # Validadores
│   └── init-roles.sql            # Script de inicialización
└── front-handicapp/
    ├── .env                      # Variables del frontend
    └── src/
        ├── app/                  # App Router de Next.js
        ├── components/           # Componentes reutilizables
        ├── lib/
        │   ├── constants/        # Constantes de la aplicación
        │   ├── schemas/          # Esquemas de validación
        │   ├── services/         # Servicios de API
        │   └── types/            # Tipos TypeScript
        └── types/                # Tipos globales
```

## ⚠️ Notas Importantes

1. **Los archivos `.env` NO están en Git** - tu compañero debe crearlos manualmente
2. **El JWT_SECRET debe ser el mismo** en todos los archivos `.env`
3. **Los scripts automáticamente inicializan** los roles básicos en la base de datos
4. **En desarrollo**, los cambios en el código se reflejan automáticamente (hot-reload)

## 🆘 Soporte

Si hay problemas, revisar:
1. Logs de Docker: `docker-compose logs -f`
2. Estado de contenedores: `docker-compose ps`
3. Variables de entorno: `docker-compose config`
