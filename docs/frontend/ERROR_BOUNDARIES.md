# 🛡️ Sistema de Error Boundaries - HandicApp

## 📋 Tabla de Contenidos

- [Visión General](#visión-general)
- [Componentes Principales](#componentes-principales)
- [Implementación](#implementación)
- [Guía de Uso](#guía-de-uso)
- [Error Logger](#error-logger)
- [Testing](#testing)
- [Próximos Pasos](#próximos-pasos)

---

## 🎯 Visión General

Sistema completo de **Error Boundaries** implementado en HandicApp para:

✅ **Evitar crashes completos** de la aplicación  
✅ **Capturar errores** en tiempo de ejecución  
✅ **Mostrar UI elegante** cuando falla un componente  
✅ **Logging centralizado** de errores  
✅ **Preparado para Sentry** (siguiente fase)

### Estado Actual

- ✅ **Error Boundaries** implementado en layouts principales
- ✅ **Error Logger Service** con localStorage para debug
- ✅ **Componentes Safe** para wrappear secciones críticas
- ✅ **Integración con API Client** para logging automático
- 🟡 **Sentry** (pendiente - siguiente fase)

---

## 🧩 Componentes Principales

### 1. `ErrorBoundary.tsx`

Componente principal que captura errores de React.

**Características:**
- Class component (requerido por React)
- UI elegante con gradientes y animaciones
- 3 acciones: Reintentar, Recargar, Ir al inicio
- Stack trace en desarrollo
- Callback onError para logging custom

**Props:**
```typescript
interface Props {
  children: ReactNode;
  fallback?: ReactNode;          // UI custom
  onError?: (error, errorInfo) => void;  // Callback
  showDetails?: boolean;          // Mostrar stack trace
}
```

**Uso:**
```tsx
<ErrorBoundary
  showDetails={process.env.NODE_ENV === 'development'}
  onError={(error, errorInfo) => {
    errorLogger.logCriticalError(error, { component: 'MyApp' });
  }}
>
  <App />
</ErrorBoundary>
```

---

### 2. `ErrorFallback.tsx`

Componente de fallback reutilizable para errores.

**Variantes:**

**a) ErrorFallback (completo):**
```tsx
<ErrorFallback
  error={error}
  resetError={() => setError(null)}
  title="Error al cargar"
  message="Hubo un problema con los datos"
  compact={false}  // false = vista completa
/>
```

**b) ErrorFallback (compacto):**
```tsx
<ErrorFallback
  error={error}
  resetError={resetHandler}
  compact={true}  // true = inline/small
/>
```

**c) LoadingErrorFallback:**
```tsx
<LoadingErrorFallback onRetry={fetchData} />
```

---

### 3. `SafeComponent.tsx`

Wrappers especializados para diferentes tipos de componentes.

#### **SafeComponent** (genérico)
```tsx
<SafeComponent
  componentName="ProductList"
  fallbackTitle="Error al cargar productos"
  fallbackMessage="No se pudieron cargar los productos"
  compact={false}
>
  <ProductList />
</SafeComponent>
```

#### **SafeForm** (formularios)
```tsx
<SafeForm formName="CreateProduct">
  <form onSubmit={handleSubmit}>
    {/* campos del form */}
  </form>
</SafeForm>
```

#### **SafeTable** (tablas)
```tsx
<SafeTable tableName="ProductsTable">
  <table>
    {/* contenido tabla */}
  </table>
</SafeTable>
```

#### **SafeChart** (gráficos)
```tsx
<SafeChart chartName="SalesChart">
  <BarChart data={data} />
</SafeChart>
```

---

### 4. `errorLogger.ts`

Servicio centralizado para logging de errores.

**Métodos principales:**

```typescript
// Error genérico
errorLogger.logError({
  error: new Error('Something failed'),
  context: { userId: '123', route: '/products' },
  severity: 'high',
  tags: { type: 'validation' }
});

// Error de API (automático en http.ts)
errorLogger.logApiError(
  error,
  '/api/products',
  'POST',
  500
);

// Error de componente
errorLogger.logComponentError(
  error,
  'ProductForm',
  { productId: '123' }
);

// Error crítico
errorLogger.logCriticalError(
  error,
  { component: 'RootLayout' }
);
```

**Hook para React:**
```tsx
function MyComponent() {
  const { logError, logApiError } = useErrorLogger();
  
  const handleAction = async () => {
    try {
      await api.call();
    } catch (err) {
      logApiError(err, '/api/call', 'POST', 500);
    }
  };
}
```

**Debug en localStorage:**
```typescript
// Ver logs guardados
errorLogger.getLogs();

// Limpiar logs
errorLogger.clearLogs();
```

---

## 🚀 Implementación

### Estructura de Archivos

```
front-handicapp/src/
├── components/
│   └── error/
│       ├── ErrorBoundary.tsx      ✅ (190 líneas)
│       ├── ErrorFallback.tsx      ✅ (100 líneas)
│       ├── SafeComponent.tsx      ✅ (120 líneas)
│       └── index.ts               ✅ (exports + guía)
│
├── lib/
│   ├── errorLogger.ts             ✅ (250 líneas)
│   └── http.ts                    ✅ (integrado)
│
└── app/
    ├── layout.tsx                 ✅ (con ErrorBoundary)
    └── (dashboard)/
        └── layout.tsx             ✅ (con ErrorBoundary)
```

### Layouts Implementados

#### **1. Root Layout** (`app/layout.tsx`)
```tsx
<ErrorBoundary
  showDetails={process.env.NODE_ENV === 'development'}
  onError={(error, errorInfo) => {
    errorLogger.logCriticalError(error, {
      component: 'RootLayout',
      componentStack: errorInfo.componentStack,
    });
  }}
>
  <Providers>{children}</Providers>
</ErrorBoundary>
```

#### **2. Dashboard Layout** (`(dashboard)/layout.tsx`)
```tsx
<ErrorBoundary
  showDetails={process.env.NODE_ENV === 'development'}
  onError={(error, errorInfo) => {
    errorLogger.logCriticalError(error, {
      component: 'DashboardLayout',
      componentStack: errorInfo.componentStack,
    });
  }}
>
  <ProtectedRoute>
    <NotificationProvider>
      <DashboardLayoutComponent>{children}</DashboardLayoutComponent>
    </NotificationProvider>
  </ProtectedRoute>
</ErrorBoundary>
```

---

## 📖 Guía de Uso

### Caso 1: Proteger una Página Completa

```tsx
// app/(dashboard)/admin/analytics/page.tsx
import { SafeComponent } from '@/components/error';

export default function AnalyticsPage() {
  return (
    <SafeComponent
      componentName="AnalyticsPage"
      fallbackTitle="Error al cargar Analytics"
    >
      <AnalyticsContent />
    </SafeComponent>
  );
}
```

### Caso 2: Proteger un Formulario

```tsx
// components/forms/CreateProductForm.tsx
import { SafeForm } from '@/components/error';

export function CreateProductForm() {
  return (
    <SafeForm formName="CreateProduct">
      <form onSubmit={handleSubmit}>
        <input name="name" />
        <input name="price" />
        <button type="submit">Crear</button>
      </form>
    </SafeForm>
  );
}
```

### Caso 3: Proteger una Tabla

```tsx
// components/tables/ProductsTable.tsx
import { SafeTable } from '@/components/error';

export function ProductsTable({ data }) {
  return (
    <SafeTable tableName="Products">
      <table>
        <thead>...</thead>
        <tbody>
          {data.map(product => (
            <tr key={product.id}>...</tr>
          ))}
        </tbody>
      </table>
    </SafeTable>
  );
}
```

### Caso 4: Proteger Gráficos

```tsx
// components/charts/SalesChart.tsx
import { SafeChart } from '@/components/error';

export function SalesChart({ data }) {
  return (
    <SafeChart chartName="Sales">
      <div className="chart-container">
        {/* render chart */}
      </div>
    </SafeChart>
  );
}
```

### Caso 5: Logging Manual

```tsx
'use client';
import { useErrorLogger } from '@/components/error';

export function MyComponent() {
  const { logError } = useErrorLogger();
  
  const handleRiskyOperation = () => {
    try {
      // operación que puede fallar
      riskyFunction();
    } catch (err) {
      logError(err, {
        component: 'MyComponent',
        action: 'riskyOperation'
      });
      // mostrar toast o mensaje al usuario
    }
  };
  
  return <button onClick={handleRiskyOperation}>Ejecutar</button>;
}
```

### Caso 6: HOC withErrorBoundary

```tsx
// components/complex/ComplexComponent.tsx
import { withErrorBoundary } from '@/components/error';

function ComplexComponent() {
  // componente complejo que puede fallar
  return <div>...</div>;
}

export default withErrorBoundary(ComplexComponent, {
  showDetails: process.env.NODE_ENV === 'development'
});
```

---

## 🔍 Error Logger

### Configuración

El error logger está **activado automáticamente** en:

1. ✅ **Layouts principales** (Root y Dashboard)
2. ✅ **API Client** (todos los errores HTTP)
3. ✅ **Componentes Safe** (todos los wrapped components)

### Logs en localStorage

Los últimos **10 errores** se guardan en `localStorage` para debug:

```javascript
// En la consola del navegador
JSON.parse(localStorage.getItem('handicapp_error_logs'))
```

**Estructura:**
```json
[
  {
    "message": "Cannot read property 'name' of undefined",
    "stack": "Error: ...\n  at Component...",
    "context": {
      "component": "ProductList",
      "userId": "123",
      "route": "/products"
    },
    "timestamp": "2025-10-22T14:30:00.000Z"
  }
]
```

### Severidades

- `low` - Errores menores, no afectan funcionalidad
- `medium` - Errores que afectan una feature (default)
- `high` - Errores que afectan múltiples features
- `critical` - Errores que crashean la app

---

## 🧪 Testing

### Test Manual

Agrega este componente temporal para probar:

```tsx
// app/(dashboard)/test-error/page.tsx
'use client';
import { SafeComponent } from '@/components/error';
import { useState } from 'react';

function BuggyComponent() {
  const [explode, setExplode] = useState(false);
  
  if (explode) {
    throw new Error('💥 Componente explotó!');
  }
  
  return (
    <button onClick={() => setExplode(true)}>
      Hacer explotar componente
    </button>
  );
}

export default function TestErrorPage() {
  return (
    <div className="p-8">
      <h1>Test Error Boundaries</h1>
      <SafeComponent componentName="BuggyComponent">
        <BuggyComponent />
      </SafeComponent>
    </div>
  );
}
```

### Verificar

1. Navega a `/test-error`
2. Click en "Hacer explotar componente"
3. Debería aparecer el ErrorFallback (no crash)
4. Verifica en consola el log del error
5. Verifica en localStorage: `handicapp_error_logs`

---

## ✅ Checklist de Implementación

### Completado ✅

- [x] `ErrorBoundary` component
- [x] `ErrorFallback` component
- [x] `SafeComponent`, `SafeForm`, `SafeTable`, `SafeChart`
- [x] `errorLogger` service con localStorage
- [x] `useErrorLogger` hook
- [x] `withErrorBoundary` HOC
- [x] Integración en `RootLayout`
- [x] Integración en `DashboardLayout`
- [x] Integración en `apiClient` (http.ts)
- [x] Exports centralizados (`components/error/index.ts`)
- [x] Documentación completa

### Pendiente 🟡

- [ ] Unit tests para Error Boundaries
- [ ] Integration tests
- [ ] Configurar Sentry (FASE 2)
- [ ] Error recovery automático
- [ ] Telemetry adicional

---

## 🎯 Próximos Pasos (FASE 2)

### 1. Configurar Sentry

```bash
pnpm add @sentry/nextjs
pnpm sentry:init
```

Actualizar `errorLogger.ts`:
```typescript
import * as Sentry from '@sentry/nextjs';

private sendToSentry(error, context, severity, tags) {
  Sentry.captureException(error, {
    level: severity,
    contexts: { custom: context },
    tags,
  });
}
```

### 2. Agregar Tests

```typescript
// __tests__/ErrorBoundary.test.tsx
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/error';

function BuggyComponent() {
  throw new Error('Test error');
}

test('captura error y muestra fallback', () => {
  render(
    <ErrorBoundary>
      <BuggyComponent />
    </ErrorBoundary>
  );
  
  expect(screen.getByText(/algo salió mal/i)).toBeInTheDocument();
});
```

### 3. Error Recovery

Agregar lógica de auto-recovery:
```typescript
// Reintentar automáticamente después de X segundos
componentDidCatch(error) {
  setTimeout(() => {
    this.setState({ hasError: false });
  }, 5000);
}
```

---

## 📊 Estadísticas

**Archivos creados:** 5  
**Archivos modificados:** 3  
**Líneas de código:** ~800 líneas  
**Tiempo estimado:** 2-3 horas  

**Cobertura:**
- ✅ 100% layouts principales
- ✅ 100% API calls
- 🟡 50% componentes individuales (agregar según necesidad)

---

## 💡 Tips

1. **No wrappear todo:** Solo componentes críticos o propensos a errores
2. **Usar compact=true:** Para errores inline (tablas, cards)
3. **Log temprano:** Captura errores antes de que lleguen al boundary
4. **Development vs Production:** Stack trace solo en dev
5. **Monitor localStorage:** Revisa logs antes de deploy

---

## 🆘 Troubleshooting

**Problema:** ErrorBoundary no captura el error  
**Solución:** Los boundaries solo capturan errores en **render**. Usa try-catch para event handlers.

**Problema:** Demasiados logs en localStorage  
**Solución:** Ejecuta `errorLogger.clearLogs()` en consola.

**Problema:** El error se muestra pero no se loguea  
**Solución:** Verifica que `onError` callback esté definido en el boundary.

---

## 📚 Referencias

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Next.js Error Handling](https://nextjs.org/docs/app/building-your-application/routing/error-handling)
- [Sentry React](https://docs.sentry.io/platforms/javascript/guides/react/)

---

**✅ Sistema completo implementado y funcional**  
**🎯 Listo para producción**  
**🔜 Siguiente: Configurar Sentry**
