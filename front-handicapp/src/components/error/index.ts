/**
 * Error Handling Components & Utils
 * 
 * Sistema completo de manejo de errores para HandicApp
 */

// Components
export { ErrorBoundary, withErrorBoundary } from './ErrorBoundary';
export { RootErrorBoundary } from './RootErrorBoundary';
export { DashboardErrorBoundary } from './DashboardErrorBoundary';
export { ErrorFallback, LoadingErrorFallback } from './ErrorFallback';
export {
  SafeComponent,
  SafeForm,
  SafeTable,
  SafeChart,
} from './SafeComponent';

// Services
export { errorLogger, useErrorLogger } from '@/lib/errorLogger';

/**
 * GUÍA DE USO:
 * 
 * 1. ErrorBoundary en Layouts:
 *    Ya implementado en RootLayout y DashboardLayout
 * 
 * 2. SafeComponent para secciones críticas:
 *    <SafeComponent componentName="ProductList">
 *      <ProductList />
 *    </SafeComponent>
 * 
 * 3. SafeForm en formularios:
 *    <SafeForm formName="CreateProduct">
 *      <form>...</form>
 *    </SafeForm>
 * 
 * 4. SafeTable en tablas de datos:
 *    <SafeTable tableName="ProductsTable">
 *      <table>...</table>
 *    </SafeTable>
 * 
 * 5. Error Logger manual:
 *    const { logApiError } = useErrorLogger();
 *    try {
 *      await api.call();
 *    } catch (error) {
 *      logApiError(error, '/api/products', 'POST', 500);
 *    }
 * 
 * 6. HOC withErrorBoundary:
 *    export default withErrorBoundary(MyComponent);
 */
