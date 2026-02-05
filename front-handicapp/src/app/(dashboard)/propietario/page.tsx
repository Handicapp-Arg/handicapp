'use client';

import React, { useState } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { useStats } from '@/lib/hooks/useStats';
import { useEventosProximos } from '@/lib/hooks/useEventosProximos';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { useCaballos } from '@/lib/hooks/useCaballosQuery';
import { useTareas } from '@/lib/hooks/useTareasQuery';
import { Loader } from '@/components/ui/loader';
import { 
  Trophy, 
  Heart, 
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Plus,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function PropietarioDashboard() {
  const { stats, loading } = useStats();
  const { eventos } = useEventosProximos({ limit: 5 });
  const { user } = useAuthNew();
  const { data: caballosData, isLoading: caballosLoading } = useCaballos({ page: 1, limit: 10 });
  const { data: tareasData } = useTareas({ estado: undefined, limit: 10 });

  if (loading || caballosLoading) {
    return <Loader />;
  }

  const propietarioNombre = user?.nombre || 'Propietario';
  // Normalizar respuesta de caballos (puede venir en data.caballos o directamente en caballos)
  const caballos = (caballosData as any)?.data?.caballos || (caballosData as any)?.caballos || [];
  const tareas = tareasData?.tareas || [];
  
  // Filtrar tareas de hoy
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const tareasHoy = tareas.filter(tarea => {
    if (!tarea.fecha_limite) return false;
    const fechaTarea = new Date(tarea.fecha_limite);
    fechaTarea.setHours(0, 0, 0, 0);
    return fechaTarea.getTime() === hoy.getTime();
  });
  
  // TODO: Implementar hook de gastos real
  const gastos = {
    mesActual: 125000,
    mesAnterior: 98000,
    diferencia: 27.55,
    tipo: 'aumento' as const
  };

  return (
    <SimpleRoleGuard roles={['propietario']}>
      <div className="min-h-screen bg-white">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8 space-y-12">
          
          <div className="flex flex-col gap-12">
            
            {/* Fila superior: Finanzas y Mis Caballos */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
               
               {/* Finanzas */}
               <section className="flex flex-col h-full">
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[19px] font-semibold text-gray-900">Finanzas</h2>
                    <Link href="/propietario/reportes/gastos" className="text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors">Ver detalle</Link>
                 </div>
                 
                 <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex-1 flex flex-col justify-center">
                     <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 mb-1">Gastos este mes</p>
                            <h3 className="text-3xl font-bold text-gray-900 tracking-tight">${gastos.mesActual.toLocaleString('es-AR')}</h3>
                        </div>
                        <div className="flex items-center gap-1.5 py-1 px-2.5 bg-white rounded-full border border-gray-200 shadow-sm">
                           {gastos.tipo === 'aumento' ? <TrendingUp className="h-3.5 w-3.5 text-red-500" /> : <TrendingDown className="h-3.5 w-3.5 text-emerald-500" />}
                           <span className={`text-xs font-semibold ${gastos.tipo === 'aumento' ? 'text-red-500' : 'text-emerald-500'}`}>
                              {gastos.diferencia}%
                           </span>
                        </div>
                     </div>
                 </div>
               </section>

               {/* Mis Caballos */}
               <section className="flex flex-col h-full xl:border-l xl:border-gray-100 xl:pl-12">
                 <div className="flex items-center justify-between mb-6">
                   <h2 className="text-[19px] font-semibold text-gray-900">Mis Caballos</h2>
                   <Link href="/propietario/caballos" className="text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors">Ver todos</Link>
                 </div>
                 
                 <div className="flex-1">
                 {caballos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 h-full">
                        {caballos.slice(0, 3).map((caballo: any) => (
                          <Link
                            key={caballo.id}
                            href={`/propietario/caballos/${caballo.id}`}
                            className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-100 w-full"
                          >
                            {caballo.foto_url ? (
                                <Image
                                  src={caballo.foto_url}
                                  alt={caballo.nombre}
                                  fill
                                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full bg-gray-100">
                                  <Heart className="h-8 w-8 text-gray-300" />
                                </div>
                              )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-12">
                                <h3 className="text-white font-medium text-sm truncate">{caballo.nombre}</h3>
                                <p className="text-white/70 text-xs truncate">{caballo.raza || 'Sin raza'}</p>
                            </div>
                          </Link>
                        ))}
                        <Link
                            href="/propietario/caballos/nuevo"
                            className="aspect-[4/5] rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-all group bg-transparent w-full"
                        >
                            <Plus className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-medium uppercase tracking-wide">Agregar</span>
                        </Link>
                    </div>
                  ) : (
                    <div className="py-12 text-center border border-gray-100 rounded-2xl bg-gray-50 h-[300px] flex flex-col items-center justify-center">
                      <p className="text-gray-500 mb-4 text-sm">Aún no tienes caballos registrados</p>
                      <Link href="/propietario/caballos/nuevo" className="inline-flex items-center justify-center px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                        Registrar primer caballo
                      </Link>
                    </div>
                  )}
                 </div>
               </section>
            </div>

            {/* Fila inferior: Reporte Diario y Próximos Eventos */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">

               {/* Reporte Diario */}
               <section className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                     <h2 className="text-[19px] font-semibold text-gray-900">Reporte Diario</h2>
                     <span className="text-sm text-gray-500">{new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                  </div>
                  
                  <div className="flex-1">
                  {tareasHoy.length > 0 ? (
                      <div className="space-y-3">
                         {tareasHoy.slice(0, 4).map((tarea: any) => (
                            <div key={tarea.id} className="group flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-300 transition-all bg-white hover:shadow-sm">
                              <div className={`mt-1.5 w-2.5 h-2.5 rounded-full flex-shrink-0 ${tarea.estado === 'completada' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                              <div className="flex-1 min-w-0">
                                 <div className="flex justify-between items-start">
                                    <h3 className="text-[15px] font-medium text-gray-900 group-hover:text-black transition-colors">{tarea.titulo}</h3>
                                    <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded-md ml-2">
                                        {tarea.fecha_limite ? new Date(tarea.fecha_limite).toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit'}) : '--:--'}
                                    </span>
                                 </div>
                                 <p className="text-[13px] text-gray-500 mt-1 flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                    {tarea.caballo?.nombre || 'General'}
                                 </p>
                              </div>
                            </div>
                         ))}
                         <div className="pt-2">
                            <Link href="/propietario/tareas" className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors">
                                Ver todas las tareas <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                         </div>
                      </div>
                  ) : (
                      <div className="p-10 border border-dashed border-gray-200 rounded-2xl text-center bg-gray-50/50 h-full flex flex-col justify-center items-center">
                         <ClipboardList className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                         <p className="text-gray-900 font-medium text-sm">Todo al día</p>
                         <p className="text-gray-500 text-sm mt-1">No hay tareas pendientes para hoy</p>
                      </div>
                  )}
                  </div>
               </section>

               {/* Próximos Eventos */}
               <section className="flex flex-col h-full xl:border-l xl:border-gray-100 xl:pl-12">
                  <div className="flex items-center justify-between mb-6">
                     <h2 className="text-[19px] font-semibold text-gray-900">Próximos Eventos</h2>
                     <Link href="/propietario/eventos" className="text-[14px] font-medium text-gray-500 hover:text-gray-900 transition-colors">Calendario completo</Link>
                  </div>
                  
                  <div className="flex-1">
                  {eventos && eventos.length > 0 ? (
                    <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-4 before:w-[2px] before:bg-gray-100 h-full">
                       {eventos.slice(0, 4).map((evento: any) => {
                          const fecha = new Date(evento.fecha_evento);
                          const esHoy = fecha.toDateString() === new Date().toDateString();
                          
                          return (
                            <div key={evento.id} className="relative pl-12 group">
                               {/* Timeline dot */}
                               <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center font-bold text-xs shadow-sm z-10 ${esHoy ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                                    {fecha.getDate()}
                               </div>
                               
                               <Link href={`/propietario/eventos/${evento.id}`} className="block group-hover:translate-x-1 transition-transform duration-300">
                                   <div className="flex justify-between items-start">
                                       <div>
                                           <h3 className="text-[15px] font-semibold text-gray-900">{evento.titulo}</h3>
                                           <p className="text-[13px] text-gray-500 mt-0.5">{fecha.toLocaleDateString('es-AR', { month: 'long', weekday: 'long' })}</p>
                                       </div>
                                       <div className="px-2.5 py-1 rounded-md bg-gray-50 text-[11px] uppercase tracking-wider font-semibold text-gray-500 border border-gray-100">
                                          {evento.tipo_evento?.nombre || 'Evento'}
                                       </div>
                                   </div>
                               </Link>
                            </div>
                          )
                       })}
                    </div>
                  ) : (
                    <div className="p-8 border border-gray-100 rounded-2xl text-center bg-gray-50/50 h-full flex flex-col justify-center items-center">
                       <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                       <p className="text-gray-500 text-sm">No hay eventos próximos en agenda</p>
                    </div>
                  )}
                  </div>
               </section>
            
            </div>

          </div>

        </div>
      </div>
    </SimpleRoleGuard>
  );
}

