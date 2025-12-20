/**
 * Badge de Notificaciones con Animación
 * Muestra el contador de notificaciones no leídas en tiempo real
 */

'use client';

import { Bell } from 'lucide-react';
import { useNotificacionesCount } from '@/lib/hooks/useNotificaciones';
import { useRouter } from 'next/navigation';
import { useAuthNew } from '@/lib/hooks/useAuthNew';

interface NotificationBadgeProps {
  className?: string;
  showLabel?: boolean;
}

export function NotificationBadge({ className = '', showLabel = false }: NotificationBadgeProps) {
  const { noLeidas } = useNotificacionesCount();
  const router = useRouter();
  const { user } = useAuthNew();

  if (!user) return null;

  const handleClick = () => {
    const role = user.rol?.clave || 'empleado';
    router.push(`/${role}/notificaciones`);
  };

  return (
    <button
      onClick={handleClick}
      className={`relative inline-flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
      aria-label={`${noLeidas} notificaciones no leídas`}
    >
      <div className="relative">
        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
        
        {/* Badge con animación */}
        {noLeidas > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse">
            {noLeidas > 99 ? '99+' : noLeidas}
          </span>
        )}
      </div>

      {/* Label opcional */}
      {showLabel && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Notificaciones
          {noLeidas > 0 && (
            <span className="ml-1 text-red-500">
              ({noLeidas})
            </span>
          )}
        </span>
      )}
    </button>
  );
}

/**
 * Badge compacto solo con icono (para navbar horizontal)
 */
export function NotificationBadgeCompact() {
  return <NotificationBadge className="p-1.5" showLabel={false} />;
}

/**
 * Badge con label (para navbar vertical/sidebar)
 */
export function NotificationBadgeWithLabel() {
  return <NotificationBadge showLabel={true} />;
}
