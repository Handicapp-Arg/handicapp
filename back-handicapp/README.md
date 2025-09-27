# ⚙️ HandicApp Backend API# ⚙️ H## 🚀 Tecnologías



**API de HandicApp** - Backend robusto construido con Node.js, TypeScript, Express y PostgreSQL.- **Node.js + TypeScript** - Runtime y tipado

- **Express.js** - Framework web

## 🚀 Tecnologías- **PostgreSQL + Sequelize** - Base de datos y ORM

- **JWT + bcrypt** - Autenticación segura

- **Node.js + TypeScript** - Runtime y tipado- **Helmet + CORS + Rate Limiting** - Seguridadnd API

- **Express.js** - Framework web

- **PostgreSQL + Sequelize** - Base de datos y ORM**API de HandicApp** - Backend robusto construido con Node.js, TypeScript, Express y PostgreSQL.andicApp Backend API

- **JWT + bcrypt** - Autenticación segura

- **Helmet + CORS + Rate Limiting** - SeguridadUna API robusta y escalable construida con Node.js, TypeScript, Express, PostgreSQL y Sequelize, siguiendo las mejores prÃ¡cticas de seguridad, rendimiento y escalabilidad.



## 🚀 Inicio Rápido## ðŸš€ CaracterÃ­sticas



```bash- **TypeScript**: Tipado estÃ¡tico para mayor seguridad y mantenibilidad

# Instalar dependencias- **Express.js**: Framework web rÃ¡pido y minimalista

pnpm install- **PostgreSQL**: Base de datos relacional robusta

- **Sequelize**: ORM con soporte para migraciones y validaciones

# Iniciar servidor de desarrollo- **JWT**: AutenticaciÃ³n basada en tokens

pnpm run dev- **Rate Limiting**: ProtecciÃ³n contra ataques de fuerza bruta

```- **Helmet**: Headers de seguridad

- **CORS**: ConfiguraciÃ³n de polÃ­ticas de origen cruzado

🔗 **Ver instalación completa** en el [README principal](../README.md).- **Logging**: Sistema de logging estructurado con Pino

- **ValidaciÃ³n**: ValidaciÃ³n de datos con Zod

## 📚 API Endpoints- **Testing**: Suite de tests con Jest

- **ESLint & Prettier**: Linting y formateo de cÃ³digo

### 🔐 Autenticación

- `POST /api/v1/auth/login` - Iniciar sesión## ðŸ“‹ Requisitos

- `GET /api/v1/auth/profile` - Obtener perfil

- `POST /api/v1/auth/logout` - Cerrar sesión- Node.js >= 18.0.0

- PostgreSQL >= 13.0

### 👥 Usuarios (Admin)- npm >= 8.0.0

- `GET /api/v1/users` - Listar usuarios

- `POST /api/v1/users` - Crear usuario## ðŸ› ï¸ InstalaciÃ³n

- `PUT /api/v1/users/:id` - Actualizar usuario

- `DELETE /api/v1/users/:id` - Eliminar usuario1. **Clonar el repositorio**

- `GET /api/v1/users/search` - Buscar usuarios   ```bash

- `GET /api/v1/users/stats` - Estadísticas   git clone <repository-url>

   cd back-handicapp

### ⚙️ Sistema   ```

- `GET /api/v1/health` - Health check

- `GET /api/v1/roles` - Obtener roles2. **Instalar dependencias**

   ```bash

## 🏃‍♂️ Scripts Disponibles   npm install

   ```

```bash

pnpm run dev          # Desarrollo con hot reload3. **Configurar variables de entorno**

pnpm run build        # Compilar TypeScript   ```bash

pnpm run start        # Producción   cp .env.example .env

pnpm run test         # Ejecutar tests   ```

pnpm run lint         # Linting   

pnpm run type-check   # Verificar tipos   Editar el archivo `.env` con tus configuraciones:

```   ```env

   NODE_ENV=development

## 🗂️ Estructura   PORT=3000

   DB_HOST=localhost

```   DB_PORT=5432

src/   DB_NAME=handicapp_db

├── config/          # Configuraciones   DB_USER=postgres

├── controllers/     # Controladores de rutas   DB_PASSWORD=tu_password

├── middleware/      # Middlewares personalizados   JWT_SECRET=tu_jwt_secret_super_seguro

├── models/          # Modelos de Sequelize   ```

├── routes/          # Definición de rutas

├── services/        # Lógica de negocio4. **Configurar la base de datos**

├── types/           # Tipos TypeScript   ```bash

├── utils/           # Utilidades   # Crear la base de datos

├── validators/      # Validadores con Zod   npm run db:create

├── app.ts           # Configuración de Express   

└── index.ts         # Punto de entrada   # Ejecutar migraciones

```   npm run db:migrate

   

## 📧 Variables de Entorno   # (Opcional) Ejecutar seeders

   npm run db:seed

```env   ```

NODE_ENV=development

PORT=3001## ðŸš€ Uso

DB_HOST=localhost

DB_PORT=5432### Desarrollo

DB_NAME=handicapp_db```bash

DB_USER=handicapp_usernpm run dev

DB_PASSWORD=HandicApp!234```

JWT_SECRET=HnD1c4pP_$3cUr3_K3y_2025_...

JWT_EXPIRES_IN=2h### ProducciÃ³n

``````bash

npm run build

---npm start

```

🔗 **Documentación completa**: [README principal](../README.md)
### Scripts disponibles
```bash
npm run dev          # Desarrollo con hot reload
npm run build        # Compilar TypeScript
npm start           # Iniciar en producciÃ³n
npm test            # Ejecutar tests
npm run test:watch  # Tests en modo watch
npm run test:coverage # Tests con cobertura
npm run lint        # Linting
npm run lint:fix    # Linting con auto-fix
npm run format      # Formatear cÃ³digo
npm run type-check  # Verificar tipos
```

## ðŸ“š API Endpoints

### AutenticaciÃ³n
- `POST /api/v1/auth/register` - Registrar usuario
- `POST /api/v1/auth/login` - Iniciar sesiÃ³n
- `POST /api/v1/auth/logout` - Cerrar sesiÃ³n
- `POST /api/v1/auth/refresh-token` - Renovar token
- `POST /api/v1/auth/change-password` - Cambiar contraseÃ±a
- `GET /api/v1/auth/profile` - Obtener perfil

### Usuarios
- `GET /api/v1/users` - Listar usuarios (Admin)
- `GET /api/v1/users/:id` - Obtener usuario (Admin)
- `PUT /api/v1/users/:id` - Actualizar usuario (Admin)
- `DELETE /api/v1/users/:id` - Eliminar usuario (Admin)
- `PATCH /api/v1/users/:id/toggle-status` - Activar/Desactivar usuario (Admin)
- `GET /api/v1/users/search` - Buscar usuarios (Admin)
- `GET /api/v1/users/stats` - EstadÃ­sticas de usuarios (Admin)
- `GET /api/v1/users/profile` - Obtener perfil propio
- `PUT /api/v1/users/profile` - Actualizar perfil propio

### Sistema
- `GET /api/v1/health` - Health check
- `GET /` - InformaciÃ³n de la API

## ðŸ”’ Seguridad

- **AutenticaciÃ³n JWT**: Tokens seguros con expiraciÃ³n
- **Rate Limiting**: ProtecciÃ³n contra ataques de fuerza bruta
- **Helmet**: Headers de seguridad
- **CORS**: PolÃ­ticas de origen cruzado configuradas
- **ValidaciÃ³n**: ValidaciÃ³n estricta de datos de entrada
- **Hashing**: ContraseÃ±as hasheadas con bcrypt
- **Soft Delete**: EliminaciÃ³n lÃ³gica de registros
- **Logging**: Registro de actividades y errores

## ðŸ§ª Testing

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:coverage

# Tests unitarios
npm run test -- --testPathPattern=unit

# Tests de integraciÃ³n
npm run test -- --testPathPattern=integration
```

## ðŸ“Š Base de Datos

### Migraciones
```bash
npm run db:migrate        # Ejecutar migraciones
npm run db:migrate:undo   # Revertir Ãºltima migraciÃ³n
```

### Seeders
```bash
npm run db:seed           # Ejecutar seeders
npm run db:seed:undo      # Revertir seeders
```

## ðŸ—ï¸ Arquitectura

```
src/
â”œâ”€â”€ config/          # Configuraciones
â”œâ”€â”€ controllers/     # Controladores de rutas
â”œâ”€â”€ middleware/      # Middlewares personalizados
â”œâ”€â”€ models/          # Modelos de Sequelize
â”œâ”€â”€ routes/          # DefiniciÃ³n de rutas
â”œâ”€â”€ services/        # LÃ³gica de negocio
â”œâ”€â”€ types/           # Tipos TypeScript
â”œâ”€â”€ utils/           # Utilidades
â”œâ”€â”€ validators/      # Validadores con Zod
â”œâ”€â”€ app.ts           # ConfiguraciÃ³n de Express
â””â”€â”€ index.ts         # Punto de entrada
```

## ðŸ”§ ConfiguraciÃ³n

### Variables de Entorno

| Variable | DescripciÃ³n | Valor por defecto |
|----------|-------------|-------------------|
| `NODE_ENV` | Entorno de ejecuciÃ³n | `development` |
| `PORT` | Puerto del servidor | `3000` |
| `DB_HOST` | Host de la base de datos | `localhost` |
| `DB_PORT` | Puerto de la base de datos | `5432` |
| `DB_NAME` | Nombre de la base de datos | - |
| `DB_USER` | Usuario de la base de datos | - |
| `DB_PASSWORD` | ContraseÃ±a de la base de datos | - |
| `JWT_SECRET` | Secreto para JWT | - |
| `JWT_EXPIRES_IN` | ExpiraciÃ³n del token | `24h` |
| `REDIS_HOST` | Host de Redis | `localhost` |
| `REDIS_PORT` | Puerto de Redis | `6379` |

## ðŸ“ˆ Rendimiento

- **CompresiÃ³n**: CompresiÃ³n gzip habilitada
- **Rate Limiting**: Control de velocidad de requests
- **Connection Pooling**: Pool de conexiones a la base de datos
- **Indexing**: Ãndices optimizados en la base de datos
- **Caching**: Preparado para implementar Redis

## ðŸš€ Despliegue

### PM2
```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicaciÃ³n
pm2 start dist/index.js --name handicapp-api

# Monitorear
pm2 monit
```

## ðŸ¤ ContribuciÃ³n

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## ðŸ“ Licencia

Este proyecto estÃ¡ bajo la Licencia ISC.

## ðŸ†˜ Soporte

Si tienes alguna pregunta o problema, por favor abre un issue en el repositorio.

---

**Desarrollado con â¤ï¸ para HandicApp**

