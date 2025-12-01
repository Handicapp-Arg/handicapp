/**
 * Loading UI para todas las rutas del dashboard
 * Se muestra mientras la página se está cargando
 */
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';

export default function DashboardLoading() {
  return <LoadingSpinnerFullPage label="Cargando..." variant="primary" />;
}
