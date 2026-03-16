# Error Handling Components

Sistema completo de manejo de errores para HandicApp.

## 🎯 Quick Start

```tsx
import { SafeComponent } from '@/components/error';

// Proteger cualquier componente
<SafeComponent componentName="MyComponent">
  <MyComponent />
</SafeComponent>
```

## 📦 Componentes Disponibles

### ErrorBoundary
Captura errores de React en render.

```tsx
import { ErrorBoundary } from '@/components/error';

<ErrorBoundary
  showDetails={process.env.NODE_ENV === 'development'}
  onError={(error, errorInfo) => console.error(error)}
>
  <App />
</ErrorBoundary>
```

### ErrorFallback
UI de fallback cuando ocurre un error.

```tsx
import { ErrorFallback } from '@/components/error';

<ErrorFallback
  error={error}
  resetError={() => reset()}
  title="Error al cargar"
  compact={true}  // Para errores inline
/>
```

### SafeComponent
Wrapper genérico que combina ErrorBoundary + ErrorFallback.

```tsx
import { SafeComponent } from '@/components/error';

<SafeComponent
  componentName="ProductList"
  fallbackTitle="Error al cargar productos"
  compact={false}
>
  <ProductList />
</SafeComponent>
```

### SafeForm
Wrapper especializado para formularios.

```tsx
import { SafeForm } from '@/components/error';

<SafeForm formName="CreateProduct">
  <form>...</form>
</SafeForm>
```

### SafeTable
Wrapper para tablas de datos.

```tsx
import { SafeTable } from '@/components/error';

<SafeTable tableName="Products">
  <table>...</table>
</SafeTable>
```

### SafeChart
Wrapper para gráficos.

```tsx
import { SafeChart } from '@/components/error';

<SafeChart chartName="Sales">
  <ChartComponent />
</SafeChart>
```

## 🪝 Hooks

### useErrorLogger
Hook para logging manual de errores.

```tsx
import { useErrorLogger } from '@/components/error';

function MyComponent() {
  const { logError, logApiError, logComponentError } = useErrorLogger();
  
  const handleAction = async () => {
    try {
      await api.call();
    } catch (error) {
      logApiError(error, '/api/endpoint', 'POST', 500);
    }
  };
}
```

## 🔧 Error Logger Service

### Métodos Disponibles

```typescript
import { errorLogger } from '@/components/error';

// Log genérico
errorLogger.logError({
  error: new Error('Something failed'),
  context: { userId: '123' },
  severity: 'high',
  tags: { type: 'validation' }
});

// Log de API
errorLogger.logApiError(error, '/api/products', 'POST', 500);

// Log de componente
errorLogger.logComponentError(error, 'ProductForm', { id: '123' });

// Log crítico
errorLogger.logCriticalError(error, { component: 'App' });

// Ver logs guardados
const logs = errorLogger.getLogs();

// Limpiar logs
errorLogger.clearLogs();
```

## 🧪 Testing

Visita `/test-errors` para probar el sistema completo.

## 📚 Documentación Completa

Ver `docs/frontend/ERROR_BOUNDARIES.md` para documentación detallada.

## 🎨 Características

- ✅ Captura errores en render (ErrorBoundary)
- ✅ UI elegante para errores
- ✅ Logging centralizado
- ✅ Almacena últimos 10 errores en localStorage
- ✅ Stack trace en desarrollo
- ✅ Preparado para Sentry
- ✅ HOC `withErrorBoundary`
- ✅ Wrappers especializados
- ✅ TypeScript completo

## 🚀 Ya Implementado

- ✅ Root Layout
- ✅ Dashboard Layout
- ✅ API Client (http.ts)

## 💡 Tips

1. No wrappear TODO - solo componentes críticos
2. Usar `compact={true}` para errores inline
3. Revisar logs antes de deploy: `errorLogger.getLogs()`
4. Stack trace solo en desarrollo
5. Combinar con try-catch en event handlers

---

**Status:** ✅ Listo para producción  
**Siguiente:** Configurar Sentry
