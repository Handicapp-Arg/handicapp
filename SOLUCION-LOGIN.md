# Solución: Login no redirigía después del cambio a cookies HttpOnly

## 🐛 Problema
Después de implementar cookies HttpOnly, el login devolvía 200 pero no redirigía al dashboard. El usuario veía "Verificando permisos..." y volvía al login.

## 🔍 Causa raíz
El middleware `requireAuth` del backend solo buscaba el token en el header `Authorization: Bearer <token>`, pero ahora el token está en cookies httpOnly que el frontend envía automáticamente.

## ✅ Solución aplicada

### 1. Backend - Actualizar middleware de autenticación
**Archivo:** `back-handicapp/src/middleware/auth.ts`

```typescript
// ANTES: Solo leía del header Authorization
const authHeader = req.headers.authorization;
if (!authHeader || !authHeader.startsWith('Bearer ')) {
  return 401;
}
const token = authHeader.substring(7);

// AHORA: Lee de cookie httpOnly primero, luego del header (fallback)
let token = req.cookies['auth-token'];

if (!token) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
}
```

### 2. Backend - Instalar cookie-parser
```bash
pnpm add cookie-parser
pnpm add -D @types/cookie-parser
```

### 3. Backend - Configurar cookie-parser en app.ts
```typescript
import cookieParser from 'cookie-parser';

app.use(cookieParser()); // Debe ir ANTES de las rutas
```

### 4. Frontend - Ajustar lectura del rol del usuario
**Archivo:** `front-handicapp/src/app/(site)/page.tsx`

```typescript
// El usuario ahora viene con estructura: user.rol.id (no user.rol_id)
const rolId = data.user.rol?.id || data.user.rol_id || 1;
```

## 📋 Pasos para aplicar

1. **Reiniciar el backend:**
   ```bash
   cd back-handicapp
   # Detener el servidor (Ctrl+C)
   pnpm dev
   ```

2. **Limpiar cookies viejas del navegador:**
   - F12 → Application → Cookies → Borrar todas de localhost
   - O usar modo incógnito

3. **Hacer login de nuevo**

## ✅ Resultado esperado

1. Login exitoso (200)
2. Backend setea cookies httpOnly:
   - `auth-token` (1 hora)
   - `refresh-token` (7 días)
3. Frontend redirige automáticamente al dashboard según rol
4. Requests subsiguientes envían las cookies automáticamente
5. Si el token expira, se renueva automáticamente sin que el usuario note

## 🔐 Ventajas del cambio

- ✅ Tokens en cookies HttpOnly (no accesibles por JavaScript)
- ✅ Protección contra XSS
- ✅ Renovación automática de tokens
- ✅ Experiencia fluida para el usuario
- ✅ Compatible con ambos métodos (cookie y Authorization header)

