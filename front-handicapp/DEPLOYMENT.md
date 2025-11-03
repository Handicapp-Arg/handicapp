# Deployment en Vercel - HandicApp Frontend

## 🚀 Pasos para deployar en Vercel

### 1. Configurar Variables de Entorno en Vercel

Ve a tu proyecto en Vercel → Settings → Environment Variables y agrega:

```bash
# API Backend
NEXT_PUBLIC_API_URL=https://tu-backend.com/api
NEXT_PUBLIC_WS_URL=wss://tu-backend.com

# Build
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
NODE_OPTIONS=--max-old-space-size=4096

# Sentry (opcional)
NEXT_PUBLIC_SENTRY_DSN=tu-dsn-de-sentry
SENTRY_ORG=tu-org
SENTRY_PROJECT=tu-proyecto
```

### 2. Configuración del Proyecto en Vercel

- **Framework Preset**: Next.js
- **Build Command**: `pnpm run build` (ya configurado en vercel.json)
- **Output Directory**: `.next` (detectado automáticamente)
- **Install Command**: `pnpm install`
- **Node Version**: 20.x

### 3. Solución al Error ENOENT

El error `ENOENT: no such file or directory, lstat '.next/server/app/(site)/page_client-reference-manifest.js'` se soluciona con:

#### Cambios aplicados:

1. **next.config.ts**: 
   - Agregado `clientRouterFilter: false` en experimental
   - Configurado webpack fallbacks para fs, net, tls
   - Agregado `typescript.ignoreBuildErrors: false`

2. **vercel.json**: 
   - Configurado `NODE_OPTIONS` con más memoria
   - Configurado timeout de funciones a 30s

3. **.vercelignore**: 
   - Ignorar archivos de caché innecesarios

### 4. Comandos útiles

```bash
# Build local para testear
pnpm run build

# Build limpio
pnpm run build:clean

# Verificar build
pnpm run start
```

### 5. Troubleshooting

#### Error: Module not found
- Verificar que todas las dependencias estén en `dependencies` (no en `devDependencies`)
- Ejecutar `pnpm install` para sincronizar

#### Error: Out of memory
- Ya configurado `NODE_OPTIONS=--max-old-space-size=4096` en vercel.json
- Si persiste, contactar soporte de Vercel para aumentar límites

#### Error: Build timeout
- Configurado timeout a 30s en vercel.json
- Optimizar imports usando `optimizePackageImports` (ya configurado)

### 6. Después del Deploy

1. Verificar que el sitio carga correctamente
2. Probar login con credenciales de prueba
3. Verificar que las rutas protegidas funcionan
4. Comprobar la conexión con el backend
5. Revisar logs en Vercel Dashboard

### 7. Monitoreo

- **Vercel Analytics**: Habilitado automáticamente
- **Sentry**: Configurado para tracking de errores
- **Logs**: Disponibles en Vercel Dashboard → Deployments → Logs

## 📝 Notas Importantes

- El frontend está optimizado para Next.js 15.5.3 con React 19
- PWA deshabilitado en development, habilitado en production
- WebSocket configurado para conexión con backend
- Todas las rutas usan autenticación basada en cookies httpOnly

## 🔗 Enlaces

- [Documentación Vercel](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Troubleshooting Vercel](https://vercel.com/docs/errors)
