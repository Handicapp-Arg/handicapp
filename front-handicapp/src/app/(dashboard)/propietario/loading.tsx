/**
 * Loading UI para rutas de Propietario
 * Se muestra mientras la página se está cargando
 */
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';

export default function PropietarioLoading() {
  return <LoadingSpinnerFullPage label="Cargando..." variant="success" />;
}
