# HandicApp Backend API

Una API robusta y escalable construida con Node.js, TypeScript, Express, PostgreSQL y Sequelize, siguiendo las mejores prácticas de seguridad, rendimiento y escalabilidad.

## 🚀 Características

- **TypeScript**: Tipado estático para mayor seguridad y mantenibilidad
- **Express.js**: Framework web rápido y minimalista
- **PostgreSQL**: Base de datos relacional robusta
- **Sequelize**: ORM con soporte para migraciones y validaciones
- **JWT**: Autenticación basada en tokens
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **Helmet**: Headers de seguridad
- **CORS**: Configuración de políticas de origen cruzado
- **Logging**: Sistema de logging estructurado con Pino
- **Validación**: Validación de datos con Zod
- **Testing**: Suite de tests con Jest
- **ESLint & Prettier**: Linting y formateo de código

## 📋 Requisitos

- Node.js >= 18.0.0
- PostgreSQL >= 13.0
- npm >= 8.0.0

## 🛠️ Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd back-handicapp
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Editar el archivo `.env` con tus configuraciones:
   ```env
   NODE_ENV=development
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=handicapp_db
   DB_USER=postgres
   DB_PASSWORD=tu_password
   JWT_SECRET=tu_jwt_secret_super_seguro
   ```

4. **Configurar la base de datos**
   ```bash
   # Crear la base de datos
   npm run db:create
   
   # Ejecutar migraciones
   npm run db:migrate
   
   # (Opcional) Ejecutar seeders
   npm run db:seed
   ```

## 🚀 Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

### Scripts disponibles
```bash
npm run dev          # Desarrollo con hot reload
npm run build        # Compilar TypeScript
npm start           # Iniciar en producción
npm test            # Ejecutar tests
npm run test:watch  # Tests en modo watch
npm run test:coverage # Tests con cobertura
npm run lint        # Linting
npm run lint:fix    # Linting con auto-fix
npm run format      # Formatear código
npm run type-check  # Verificar tipos
```

## 📚 API Endpoints

### Autenticación
- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/login` - Iniciar sesión
- `POST /api/v1/auth/logout` - Cerrar sesión
- `POST /api/v1/auth/refresh-token` - Renovar token
- `POST /api/v1/auth/change-password` - Cambiar contraseña
- `GET /api/v1/auth/profile` - Obtener perfil

### Usuarios
- `GET /api/v1/users` - Listar usuarios (Admin)
- `GET /api/v1/users/:id` - Obtener usuario (Admin)
- `PUT /api/v1/users/:id` - Actualizar usuario (Admin)
- `DELETE /api/v1/users/:id` - Eliminar usuario (Admin)
- `PATCH /api/v1/users/:id/toggle-status` - Activar/Desactivar usuario (Admin)
- `GET /api/v1/users/search` - Buscar usuarios (Admin)
- `GET /api/v1/users/stats` - Estadísticas de usuarios (Admin)
- `GET /api/v1/users/profile` - Obtener perfil propio
- `PUT /api/v1/users/profile` - Actualizar perfil propio

### Sistema
- `GET /api/v1/health` - Health check
- `GET /` - Información de la API

## 🔒 Seguridad

- **Autenticación JWT**: Tokens seguros con expiración
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **Helmet**: Headers de seguridad
- **CORS**: Políticas de origen cruzado configuradas
- **Validación**: Validación estricta de datos de entrada
- **Hashing**: Contraseñas hasheadas con bcrypt
- **Soft Delete**: Eliminación lógica de registros
- **Logging**: Registro de actividades y errores

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:coverage

# Tests unitarios
npm run test -- --testPathPattern=unit

# Tests de integración
npm run test -- --testPathPattern=integration
```

## 📊 Base de Datos

### Migraciones
```bash
npm run db:migrate        # Ejecutar migraciones
npm run db:migrate:undo   # Revertir última migración
```

### Seeders
```bash
npm run db:seed           # Ejecutar seeders
npm run db:seed:undo      # Revertir seeders
```

## 🏗️ Arquitectura

```
src/
├── config/          # Configuraciones
├── controllers/     # Controladores de rutas
├── middleware/      # Middlewares personalizados
├── models/          # Modelos de Sequelize
├── routes/          # Definición de rutas
├── services/        # Lógica de negocio
├── types/           # Tipos TypeScript
├── utils/           # Utilidades
├── validators/      # Validadores con Zod
├── app.ts           # Configuración de Express
└── index.ts         # Punto de entrada
```

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| `NODE_ENV` | Entorno de ejecución | `development` |
| `PORT` | Puerto del servidor | `3000` |
| `DB_HOST` | Host de la base de datos | `localhost` |
| `DB_PORT` | Puerto de la base de datos | `5432` |
| `DB_NAME` | Nombre de la base de datos | - |
| `DB_USER` | Usuario de la base de datos | - |
| `DB_PASSWORD` | Contraseña de la base de datos | - |
| `JWT_SECRET` | Secreto para JWT | - |
| `JWT_EXPIRES_IN` | Expiración del token | `24h` |
| `REDIS_HOST` | Host de Redis | `localhost` |
| `REDIS_PORT` | Puerto de Redis | `6379` |

## 📈 Rendimiento

- **Compresión**: Compresión gzip habilitada
- **Rate Limiting**: Control de velocidad de requests
- **Connection Pooling**: Pool de conexiones a la base de datos
- **Indexing**: Índices optimizados en la base de datos
- **Caching**: Preparado para implementar Redis

## 🚀 Despliegue

### Docker (Recomendado)
```bash
# Construir imagen
docker build -t handicapp-api .

# Ejecutar contenedor
docker run -p 3000:3000 --env-file .env handicapp-api
```

### PM2
```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicación
pm2 start dist/index.js --name handicapp-api

# Monitorear
pm2 monit
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia ISC.

## 🆘 Soporte

Si tienes alguna pregunta o problema, por favor abre un issue en el repositorio.

---

**Desarrollado con ❤️ para HandicApp**
