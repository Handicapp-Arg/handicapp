/**
 * PageShell — Contenedor estándar para todas las páginas del dashboard.
 *
 * Uso:
 *   <PageShell title="Mis Caballos" description="Gestioná tus caballos." action={<Button>Agregar</Button>}>
 *     <MiContenido />
 *   </PageShell>
 */

import React from 'react';

interface PageShellProps {
  title: string;
  description?: string;
  /** Botón/acción a mostrar a la derecha del título */
  action?: React.ReactNode;
  children: React.ReactNode;
  /** Padding adicional al contenedor principal */
  className?: string;
}

export function PageShell({ title, description, action, children, className }: PageShellProps) {
  return (
    <div className={`space-y-6 ${className ?? ''}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm text-slate-500 mt-1">{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
