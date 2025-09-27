# Documentación de Seguridad - HandicApp

## Sistema de Autenticación y Autorización

### Arquitectura de Seguridad

El sistema implementa una arquitectura de seguridad multicapa:

1. **Autenticación JWT**: Tokens firmados con secreto configurable
2. **Cookies Seguras**: Configuración con SameSite=strict en producción
3. **Protección de Rutas**: Componente client-side + middleware server-side
4. **Validación de Roles**: Sistema granular de permisos por área

### Componentes de Seguridad

#### 1. Backend (`back-handicapp`)
- **JWT Secret**: Configurado en variables de entorno (mínimo 32 caracteres)
- **Bcrypt**: Hash de contraseñas con 12 rounds
- **Rate Limiting**: Configuración de límites de peticiones
- **CORS**: Configuración restrictiva para producción

#### 2. Frontend (`front-handicapp`)
- **ProtectedRoute**: Componente de protección client-side
- **Middleware**: Verificación server-side (respaldo)
- **CookieService**: Manejo seguro de tokens de sesión

### Flujo de Autenticación

1. **Login** → Validación de credenciales → Generación JWT → Cookie segura
2. **Acceso a Dashboard** → ProtectedRoute verifica rol → Redirección automática
3. **Cambio de URL** → Validación en tiempo real → Bloqueo/Redirección

### Roles del Sistema

| ID | Rol | Ruta Autorizada |
|----|-----|----------------|
| 1 | Admin | /admin |
| 2 | Establecimiento | /establecimiento |
| 3 | Capataz | /capataz |
| 4 | Veterinario | /veterinario |
| 5 | Empleado | /empleado |
| 6 | Propietario | /propietario |

### Configuración de Producción

#### Backend
```env
JWT_SECRET=tu_secreto_super_seguro_de_minimo_32_caracteres
JWT_EXPIRES_IN=1h
NODE_ENV=production
CORS_ORIGIN=https://tu-dominio.com
```

#### Frontend
```env
NEXT_PUBLIC_API_BASE_URL=https://api.tu-dominio.com/v1
NEXT_PUBLIC_APP_ENV=production
```

### Notas de Seguridad

- ✅ Tokens JWT con expiración de 1 hora
- ✅ Cookies con SameSite=strict en producción  
- ✅ Validación de roles en tiempo real
- ✅ Redirección automática si acceso no autorizado
- ✅ Hash seguro de contraseñas (bcrypt 12 rounds)
- ✅ Rate limiting configurado
- ✅ Headers de seguridad implementados

### Usuarios de Prueba (Solo Desarrollo)

- **Admin**: admin@test.com / admin123
- **Veterinario**: vet@test.com / admin123

**⚠️ IMPORTANTE**: Eliminar usuarios de prueba en producción.