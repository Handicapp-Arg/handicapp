/**
 * DashboardSidebar - Componente reutilizable para sidebar de dashboards
 * Muestra eventos próximos y alertas relevantes por rol
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, AlertCircle, Stethoscope, CheckCircle } from 'lucide-react';
import { type RoleClave, getRoleColorScheme } from '@/lib/design-tokens';
import { cn } from '@/lib/utils';

interface EventoPreview {
  id: number;
  titulo: string;
  fecha_evento: string;
  hora_inicio?: string;
  ubicacion?: string;
  tipo?: string;
}

interface AlertaPreview {
  id: string;
  tipo: 'salud' | 'tarea' | 'evento' | 'general';
  titulo: string;
  descripcion: string;
  prioridad?: 'baja' | 'media' | 'alta' | 'critica';
}

interface DashboardSidebarProps {
  role: RoleClave;
  eventos?: EventoPreview[];
  alertas?: AlertaPreview[];
  className?: string;
}

const tipoIcons = {
  salud: Stethoscope,
  tarea: CheckCircle,
  evento: Calendar,
  general: AlertCircle,
};

const prioridadColors = {
  baja: 'bg-blue-100 text-blue-700',
  media: 'bg-yellow-100 text-yellow-700',
  alta: 'bg-orange-100 text-orange-700',
  critica: 'bg-red-100 text-red-700',
};

export function DashboardSidebar({ role, eventos = [], alertas = [], className }: DashboardSidebarProps) {
  const colorScheme = getRoleColorScheme(role);

  // Gradientes específicos por rol (para evitar problemas de purge CSS)
  const gradientClasses: Record<RoleClave, string> = {
    admin: 'bg-gradient-to-br from-slate-500 to-gray-600',
    propietario: 'bg-gradient-to-br from-blue-400 to-cyan-500',
    establecimiento: 'bg-gradient-to-br from-green-400 to-emerald-500',
    capataz: 'bg-gradient-to-br from-orange-400 to-amber-500',
    empleado: 'bg-gradient-to-br from-purple-400 to-violet-500',
    veterinario: 'bg-gradient-to-br from-teal-400 to-cyan-500',
  };

  return (
    <div className={cn('lg:col-span-1', className)}>
      <div className="sticky top-24 space-y-8">
        {/* Próximos Eventos */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <div className={cn('p-2 rounded-xl shadow-md', gradientClasses[role])}>
              <Calendar className="w-5 h-5 text-white" />
            </div>
            Próximos Eventos
          </h2>
          <Card className="border border-gray-200 shadow-lg">
            <CardContent className="p-4 space-y-3">
              {eventos.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">No hay eventos próximos</p>
                  <Link 
                    href={`/${role}/eventos`}
                    className="text-xs text-blue-600 hover:underline mt-2 inline-block"
                  >
                    Ver calendario
                  </Link>
                </div>
              ) : (
                eventos.slice(0, 3).map((evento) => {
                  const fecha = new Date(evento.fecha_evento);
                  const dia = fecha.getDate();
                  const mes = fecha.toLocaleDateString('es-AR', { month: 'short' }).toUpperCase();

                  return (
                    <Link 
                      key={evento.id}
                      href={`/${role}/eventos`}
                      className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex-shrink-0">
                        <div className={cn(
                          'w-12 h-12 rounded-lg flex flex-col items-center justify-center',
                          colorScheme.iconBg
                        )}>
                          <span className={cn('text-xs font-medium', colorScheme.icon)}>
                            {mes}
                          </span>
                          <span className={cn('text-lg font-bold', colorScheme.icon)}>
                            {dia}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate group-hover:text-blue-600 transition-colors">
                          {evento.titulo}
                        </p>
                        {evento.ubicacion && (
                          <p className="text-xs text-muted-foreground truncate">
                            {evento.ubicacion}
                          </p>
                        )}
                        {evento.hora_inicio && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {evento.hora_inicio}
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })
              )}

              {eventos.length > 3 && (
                <Link
                  href={`/${role}/eventos`}
                  className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium pt-2 border-t"
                >
                  Ver todos ({eventos.length})
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alertas Pendientes */}
        {alertas.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-md">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              Alertas Pendientes
            </h2>
            <Card className="border border-amber-200 bg-amber-50/50 shadow-lg">
              <CardContent className="p-4 space-y-3">
                {alertas.slice(0, 3).map((alerta) => {
                  const Icon = tipoIcons[alerta.tipo] || AlertCircle;
                  const prioridadClass = prioridadColors[alerta.prioridad || 'media'];

                  return (
                    <div key={alerta.id} className="flex items-start gap-3">
                      <div className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                        prioridadClass
                      )}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-900">
                          {alerta.titulo}
                        </p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          {alerta.descripcion}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {alertas.length > 3 && (
                  <div className="text-center pt-2 border-t border-amber-200">
                    <p className="text-xs text-amber-700">
                      +{alertas.length - 3} alertas más
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
