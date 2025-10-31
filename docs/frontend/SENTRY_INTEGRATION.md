# 📊 Sentry Integration - HandicApp

## 🎯 Resumen Ejecutivo

Sistema completo de **monitoring con Sentry** implementado para HandicApp MVP.

**Estado:** ✅ **IMPLEMENTADO** y listo para configurar  
**Tiempo:** ~1 hora  
**Siguiente paso:** Obtener DSN de Sentry.io

---

## 📦 Lo que se implementó

### 1. Instalación de Sentry
```bash
✅ pnpm add @sentry/nextjs
```

### 2. Archivos de Configuración (3 archivos)

#### `sentry.client.config.ts`
- Configuración para el navegador (cliente)
- Session Replay activado
- Filtros de errores comunes
- Solo activo en producción

#### `sentry.server.config.ts`
- Configuración para el servidor (Node.js)
- Captura errores de API routes
- Solo activo en producción

#### `sentry.edge.config.ts`
- Configuración para Edge Runtime
- Middleware y funciones edge
- Solo activo en producción

### 3. Integración en Next.js

**`next.config.ts`** actualizado con:
- `withSentryConfig` wrapper
- Upload automático de source maps
- Variables de entorno para org y project

### 4. Error Logger Actualizado

**`src/lib/errorLogger.ts`** ahora incluye:
- ✅ Integración completa con Sentry
- ✅ Mapeo de severidades
- ✅ Contexto enriquecido (user, route, component)
- ✅ Tags automáticos
- ✅ Auto-enabled en producción

### 5. Utilidades de Sentry

**`src/lib/sentry.ts`** - Helpers listos para usar:
```typescript
- captureError()        // Capturar error manual
- captureMessage()      // Log de mensajes
- addBreadcrumb()       // Rastro de navegación
- setUser()             // Identificar usuario
- clearUser()           // Limpiar sesión
- identifyUser()        // Login integration
- captureApiError()     // Errores de API
- captureComponentError() // Errores de componente
- captureCritical()     // Eventos críticos
```

### 6. Variables de Entorno

**`.env.example`** creado con:
- Instrucciones completas de configuración
- Todas las variables necesarias
- Documentación inline

---

## 🚀 Cómo Configurar Sentry

### Paso 1: Crear Cuenta en Sentry

1. Ve a https://sentry.io
2. Regístrate (es **GRATIS** para proyectos pequeños)
3. Plan FREE incluye:
   - ✅ 5,000 errores/mes
   - ✅ 1 proyecto
   - ✅ 1 usuario
   - ✅ 30 días de retención

### Paso 2: Crear Proyecto

1. Click en **"Create Project"**
2. Selecciona plataforma: **Next.js**
3. Nombre del proyecto: `handicapp-frontend`
4. Click **"Create Project"**

### Paso 3: Obtener el DSN

Después de crear el proyecto, verás algo así:

```
Your DSN:
https://a1b2c3d4e5f6g7h8i9j0@o123456.ingest.sentry.io/789012
```

**¡Copia ese DSN!**

### Paso 4: Configurar Variables de Entorno

Crea `.env.local` en la raíz del proyecto frontend:

```bash
# En el directorio front-handicapp/
cp .env.example .env.local
```

Edita `.env.local` y pega tu DSN:

```env
# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@o123456.ingest.sentry.io/123456

# Opcional (para source maps en producción)
SENTRY_ORG=tu-organizacion
SENTRY_PROJECT=handicapp-frontend
SENTRY_AUTH_TOKEN=tu-token-aqui
```

### Paso 5: Reiniciar el Servidor

```bash
# Detener servidor (Ctrl+C)
# Reiniciar
pnpm dev
```

### Paso 6: Probar

1. Navega a `/test-errors`
2. Genera algunos errores de prueba
3. Ve a tu dashboard de Sentry
4. ¡Deberías ver los errores aparecer!

---

## 🎨 Features Implementadas

### ✅ Captura Automática

**Sin código adicional**, Sentry captura:

1. **Errores de React** (via ErrorBoundary)
   ```tsx
   // Ya implementado en layouts
   <ErrorBoundary onError={(error) => {
     errorLogger.logCriticalError(error);
   }}>
   ```

2. **Errores de API** (via http.ts)
   ```typescript
   // Automático en todas las llamadas API
   catch (error) {
     errorLogger.logApiError(error, '/api/endpoint', 'POST', 500);
   }
   ```

3. **Errores no capturados**
   - Promises rechazadas
   - Errores globales
   - Errores en event handlers

### ✅ Información Contextual

Cada error incluye:

- 📍 **URL/Route** donde ocurrió
- 👤 **Usuario** (id, email, rol) si está logueado
- 🧩 **Componente** donde falló
- 🏷️ **Tags** personalizados
- 📊 **Stack trace** completo
- 🌐 **User Agent** (navegador, OS)
- ⏰ **Timestamp** exacto

### ✅ Severidades

Los errores se clasifican automáticamente:

| Nuestra Severidad | Sentry Level | Cuándo |
|-------------------|--------------|--------|
| `low` | info | Errores menores |
| `medium` | warning | Errores de features |
| `high` | error | Errores importantes |
| `critical` | fatal | Crashes de app |

### ✅ Filtros Inteligentes

**Ya configurados** para ignorar:

- Extensiones de navegador
- Errores de red comunes
- AbortError (requests cancelados)
- Errores de Facebook/plugins
- Random scripts de terceros

---

## 📖 Guía de Uso

### Caso 1: Error Ya Capturado (Automático)

Si usas `ErrorBoundary` o `errorLogger`, ya está integrado:

```tsx
import { SafeComponent } from '@/components/error';

// ✅ Errores se envían automáticamente a Sentry
<SafeComponent componentName="MyComponent">
  <MyComponent />
</SafeComponent>
```

### Caso 2: Captura Manual

```typescript
import { captureError } from '@/lib/sentry';

try {
  // operación riesgosa
  dangerousOperation();
} catch (error) {
  captureError(error, {
    action: 'dangerousOperation',
    userId: user.id,
  });
}
```

### Caso 3: Identificar Usuario (Login)

```typescript
import { identifyUser } from '@/lib/sentry';

// Cuando el usuario inicia sesión
function handleLogin(user) {
  identifyUser({
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    rol: user.rol,
  });
}
```

### Caso 4: Breadcrumbs (Rastro)

```typescript
import { addBreadcrumb } from '@/lib/sentry';

// Registrar acciones importantes
function handleCreateProduct() {
  addBreadcrumb('User clicked create product', 'user-action');
  
  // ... crear producto
}
```

### Caso 5: Mensajes Informativos

```typescript
import { captureMessage } from '@/lib/sentry';

// Para logs importantes (no errores)
captureMessage('Payment processed successfully', 'info');
```

### Caso 6: Eventos Críticos

```typescript
import { captureCritical } from '@/lib/sentry';

// Para errores que necesitan atención INMEDIATA
try {
  await processPayment();
} catch (error) {
  captureCritical(error, {
    userId: user.id,
    amount: payment.amount,
  });
}
```

---

## 🧪 Testing en Desarrollo

### Opción 1: Habilitar Sentry en Dev

En `.env.local`:
```env
# Cambiar temporalmente
NODE_ENV=production
```

Luego reinicia el servidor.

### Opción 2: Forzar Habilitación

```typescript
// En cualquier parte del código (temporal)
import { errorLogger } from '@/lib/errorLogger';

errorLogger.enableSentry();
```

### Opción 3: Usar Página de Test

1. Ve a `/test-errors`
2. Genera errores
3. Verifica en Sentry dashboard

---

## 📊 Dashboard de Sentry

### Qué verás en Sentry.io:

1. **Issues** - Lista de errores agrupados
   - Frecuencia
   - Usuarios afectados
   - First seen / Last seen
   - Stack trace

2. **Performance** - Métricas de rendimiento
   - Tiempo de carga de páginas
   - API calls lentos
   - Transacciones

3. **Releases** - Versiones de tu app
   - Errores por versión
   - Deploy tracking

4. **Alerts** - Notificaciones
   - Email cuando hay errores nuevos
   - Slack integration
   - Pagerduty para críticos

---

## 🔧 Configuración Avanzada

### Source Maps (Producción)

Para ver código original en stack traces:

1. Obtén Auth Token de Sentry:
   - Settings > Auth Tokens
   - Create New Token
   - Permisos: `project:read`, `project:releases`

2. Agregar a `.env.local`:
   ```env
   SENTRY_AUTH_TOKEN=tu-token-aqui
   ```

3. En build de producción:
   ```bash
   pnpm build
   ```
   
   Los source maps se subirán automáticamente.

### Releases Tracking

Agregar en `package.json`:
```json
{
  "scripts": {
    "sentry:release": "sentry-cli releases new $npm_package_version",
    "sentry:finalize": "sentry-cli releases finalize $npm_package_version"
  }
}
```

### Slack Notifications

1. En Sentry: Settings > Integrations
2. Add Slack
3. Configurar canal y alertas

---

## 💰 Planes y Límites

### Plan FREE (Gratis)
- ✅ 5,000 errores/mes
- ✅ 1 proyecto
- ✅ 1 usuario
- ✅ 30 días retención
- ✅ Session Replay básico
- ✅ Performance monitoring

**¿Es suficiente para MVP?** ✅ **SÍ**

Si pasas 5,000 errores/mes, tienes problemas más grandes que el plan de Sentry 😅

### Plan TEAM ($26/mes)
- 50,000 errores/mes
- Proyectos ilimitados
- Usuarios ilimitados
- 90 días retención

---

## 🎯 Beneficios

### Para Desarrolladores
- ✅ **Stack traces completos** con source maps
- ✅ **Contexto rico** (usuario, route, props)
- ✅ **Breadcrumbs** para reproducir
- ✅ **Grouping inteligente** de errores similares

### Para el Negocio
- ✅ **Visibilidad completa** de errores en producción
- ✅ **Alertas proactivas** antes que usuarios reporten
- ✅ **Métricas de estabilidad**
- ✅ **Priorización** de bugs por impacto

### Para Usuarios
- ✅ **Bugs se detectan rápido**
- ✅ **Fixes más rápidos**
- ✅ **App más estable**

---

## ✅ Checklist

- [x] Sentry SDK instalado
- [x] Configuración client/server/edge
- [x] next.config.ts actualizado
- [x] errorLogger integrado
- [x] Utilidades de Sentry creadas
- [x] .env.example con instrucciones
- [x] Documentación completa
- [ ] Crear cuenta en Sentry.io ← **TU SIGUIENTE PASO**
- [ ] Obtener DSN
- [ ] Configurar .env.local
- [ ] Probar en /test-errors
- [ ] Verificar en Sentry dashboard

---

## 🆘 Troubleshooting

### "No veo errores en Sentry"

1. **Verificar DSN:**
   ```bash
   echo $NEXT_PUBLIC_SENTRY_DSN
   ```

2. **Verificar NODE_ENV:**
   ```bash
   echo $NODE_ENV
   ```
   Debe ser `production` para que Sentry esté activo.

3. **Revisar consola del navegador:**
   Busca mensajes de Sentry.

### "Source maps no funcionan"

1. Verificar `SENTRY_AUTH_TOKEN`
2. Verificar `SENTRY_ORG` y `SENTRY_PROJECT`
3. Revisar logs del build

### "Demasiados errores"

Si llegas al límite de 5,000/mes:

1. **Revisar filtros** en `sentry.client.config.ts`
2. **Agregar más `ignoreErrors`**
3. **Sampling:** Reducir `tracesSampleRate`

---

## 📚 Recursos

- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Error Monitoring Best Practices](https://docs.sentry.io/product/issues/issue-details/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Alerts Configuration](https://docs.sentry.io/product/alerts/)

---

## 🎉 ¡Listo!

El código está **100% implementado**. Solo falta:

1. ✅ Crear cuenta en Sentry.io (5 min)
2. ✅ Copiar DSN (30 seg)
3. ✅ Configurar .env.local (1 min)
4. ✅ Reiniciar servidor (10 seg)
5. ✅ ¡Ya estás monitoreando errores!

---

**Status:** ✅ Implementado y listo para configurar  
**Siguiente:** Testing unitarios o React Query

---

*Última actualización: 22 de Octubre 2025*
