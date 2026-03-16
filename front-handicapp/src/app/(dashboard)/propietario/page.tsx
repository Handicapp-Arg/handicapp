'use client';

import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { useAuthNew, useOwnerDashboard, useTareas } from '@/lib/hooks';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ClipboardList, Calendar, CheckSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PropietarioDashboard() {
  const { user } = useAuthNew();
  const { data } = useOwnerDashboard();
  const { data: tareasData } = useTareas({ limit: 10, estado: 'pendiente' });

  const caballos = data?.caballos ?? [];
  const eventos  = data?.eventos  ?? [];
  const tareas   = tareasData?.data ?? [];

  return (
    <SimpleRoleGuard roles={['propietario']}>
      <div className="space-y-6">

        {/* Header */}
        <div className="pb-4 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Mi espacio</p>
          <h1 className="text-xl font-semibold text-gray-900">Hola, {user?.nombre ?? 'Propietario'}</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { label: 'Caballos',  value: caballos.length, accent: 'border-l-violet-400', iconBg: 'bg-violet-50', icon: ClipboardList, iconColor: 'text-violet-600' },
            { label: 'Tareas',    value: tareas.length,   accent: 'border-l-amber-400',  iconBg: 'bg-amber-50',  icon: CheckSquare,  iconColor: 'text-amber-600' },
            { label: 'Eventos',   value: eventos.length,  accent: 'border-l-emerald-400',iconBg: 'bg-emerald-50',icon: Calendar,     iconColor: 'text-emerald-600' },
          ].map(({ label, value, accent, iconBg, icon: Icon, iconColor }) => (
            <Card key={label} className={`border-l-4 ${accent}`}>
              <CardContent className="px-3 pt-3 pb-3 sm:px-4 sm:pt-4 sm:pb-4">
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 truncate">{label}</p>
                    <p className="text-2xl font-semibold text-gray-800 leading-none">{value}</p>
                  </div>
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-md ${iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Caballos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3 gap-2">
            <CardTitle className="text-base font-medium">Mis Caballos</CardTitle>
            <div className="flex gap-2 flex-shrink-0">
              <Link
                href="/propietario/horses/nuevo"
                className="px-3 py-2.5 text-sm font-medium bg-gray-900 text-white rounded-md hover:bg-gray-700"
              >
                + Nuevo
              </Link>
              <Link
                href="/propietario/horses"
                className="px-3 py-2.5 text-sm font-medium border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 flex items-center gap-1"
              >
                Ver todos <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {caballos.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-gray-200 rounded-md">
                <p className="text-sm text-gray-400">Sin caballos registrados.</p>
                <Link href="/propietario/horses/nuevo" className="text-xs text-gray-600 underline mt-1 inline-block">Agregar primero</Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {caballos.slice(0, 8).map((c: any) => (
                  <Link key={c.id} href={`/propietario/horses/${c.id}`} className="flex flex-col gap-1 group">
                    <div className="aspect-square overflow-hidden bg-gray-100 rounded-md border border-gray-200 group-hover:border-gray-300">
                      {c.foto_url
                        ? <Image src={c.foto_url} alt={c.nombre} width={120} height={120} className="object-cover w-full h-full" />
                        : <div className="w-full h-full flex items-center justify-center text-gray-400 text-[10px]">Sin foto</div>
                      }
                    </div>
                    <span className="text-xs truncate text-center text-gray-600" title={c.nombre}>{c.nombre}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tareas y Eventos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 gap-2">
              <CardTitle className="text-base font-medium">Tareas Pendientes</CardTitle>
              <Link href="/propietario/tasks" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 py-1 flex-shrink-0">
                Ver todas <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {tareas.length === 0 ? (
                <p className="px-4 pb-5 text-sm text-gray-400">Sin tareas pendientes</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {tareas.map((t: any) => (
                    <li key={t.id}>
                      <Link href="/propietario/tasks" className="flex items-center gap-3 px-4 sm:px-6 py-3.5 hover:bg-gray-50 min-h-[44px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-gray-800 truncate">{t.titulo}</p>
                          {t.caballo?.nombre && <p className="text-xs text-gray-400">{t.caballo.nombre}</p>}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 gap-2">
              <CardTitle className="text-base font-medium">Próximos Eventos</CardTitle>
              <Link href="/propietario/events" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1 py-1 flex-shrink-0">
                Ver todos <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {eventos.length === 0 ? (
                <p className="px-4 pb-5 text-sm text-gray-400">Sin eventos próximos</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {eventos.slice(0, 6).map((e: any) => {
                    const fecha = new Date(e.fecha_evento);
                    return (
                      <li key={e.id}>
                        <Link href="/propietario/events" className="flex items-center gap-3 px-4 sm:px-6 py-3.5 hover:bg-gray-50 min-h-[44px]">
                          <div className="w-9 h-9 border border-gray-200 rounded-md flex flex-col items-center justify-center flex-shrink-0">
                            <span className="text-[10px] text-gray-400 uppercase leading-none">
                              {fecha.toLocaleDateString('es-AR', { month: 'short' })}
                            </span>
                            <span className="text-sm font-semibold text-gray-800 leading-tight">{fecha.getDate()}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-gray-800 truncate">{e.titulo}</p>
                            {e.caballo?.nombre && <p className="text-xs text-gray-400">{e.caballo.nombre}</p>}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

        </div>
      </div>
    </SimpleRoleGuard>
  );
}
