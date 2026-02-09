'use client';

import React, { useState, useEffect } from 'react';
import { eventoService } from '@/lib/services/eventoService';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { useStats } from '@/lib/hooks/useStats';
import { useEventosProximos } from '@/lib/hooks/useEventosProximos';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { useCaballos } from '@/lib/hooks/useCaballosQuery';
import { useTareas } from '@/lib/hooks/useTareasQuery';
import { usePropietarioDashboard } from '@/lib/hooks/usePropietarioDashboard';
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
  ClipboardList,
  Check,
  Sun,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function PropietarioDashboard() {
  const { stats, loading } = useStats();
  const { user } = useAuthNew();
  
  // Hook optimizado que trae todo en una sola request
  const { data: dashboardData, isLoading: dashboardLoading } = usePropietarioDashboard();
  
  // Fallback a queries individuales si no hay dashboard data
  const { data: caballosData, isLoading: caballosLoading } = useCaballos({ 
    page: 1, 
    limit: 10,
    enabled: !dashboardData // Solo si no hay dashboard data
  });
  
  // Definir rango de fechas para hoy (Asegurando cobertura completa del día en UTC)
  const hoy = new Date();
  
  // Usamos Date.UTC para asegurar que cubrimos desde las 00:00 UTC del día actual
  // Esto previene que tareas guardadas como "YYYY-MM-DD 00:00:00" queden fuera por offset horario
  const startOfDay = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0));
  const endOfDay = new Date(Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59));

  // Traer tareas específicas de hoy usando el filtro de fecha del backend + Límite ampliado
  const { data: tareasData } = useTareas({ 
    limit: 100,
    fecha_desde: startOfDay.toISOString(),
    fecha_hasta: endOfDay.toISOString(),
    enabled: !dashboardData // Solo si no hay dashboard data
  });

  // Usar datos del dashboard optimizado o fallback
  const caballos = dashboardData?.caballos || (caballosData as any)?.data?.caballos || (caballosData as any)?.caballos || [];
  const gastosStats = dashboardData?.gastosStats || { mesActual: 0, mesAnterior: 0, diferencia: 0, tipo: 'aumento' as const };
  const eventos = dashboardData?.eventos || [];
  const gastosLoading = dashboardLoading;
  
  // Estado para eventos de hoy
  const [eventosHoy, setEventosHoy] = useState<any[]>([]);

  useEffect(() => {
    const fetchEventosHoy = async () => {
        try {
            const response = await eventoService.getAll({
                fecha_desde: startOfDay.toISOString(),
                fecha_hasta: endOfDay.toISOString(),
                limit: 100
            });
            // Adaptar respuesta que puede venir paginada o directa
            const loadedEventos = (response as any).data || (Array.isArray(response) ? response : []);
            setEventosHoy(loadedEventos);
        } catch (error) {
            console.error('Error fetching today events:', error);
        }
    };
    
    // Solo ejecutar si tenemos las fechas definidas
    if (startOfDay && endOfDay) {
        fetchEventosHoy();
    }
  }, []); // Dependencias vacías para ejecutar al montar, ya que las fechas de hoy son calculadas al inicio

  const propietarioNombre = user?.nombre || 'Propietario';
  
  // Las tareas ya vienen filtradas por fecha desde el backend
  const listaTareas = tareasData?.data || [];
  
  // Combinar Tareas y Eventos para el Reporte Diario
  const actividadesHoy = [
    ...listaTareas.map((t: any) => ({ 
        ...t, 
        tipoItem: 'tarea',
        // Preferir fecha limite, sino vencimiento, sino creado
        horaRef: t.fecha_limite || t.fecha_vencimiento || t.created_at
    })),
    ...eventosHoy.map((e: any) => {
        // Construir fecha referencia para eventos
        let refDate = e.fecha_evento;
        if (e.hora_inicio && e.fecha_evento) {
            // Si tiene hora, intentar combinar (asumiendo fecha_evento es YYYY-MM-DD o ISO)
            const datePart = e.fecha_evento.split('T')[0];
            refDate = `${datePart}T${e.hora_inicio}`;
        }
        return {
            ...e,
            tipoItem: 'evento',
            horaRef: refDate
        };
    })
  ].sort((a, b) => {
      const dateA = new Date(buttonDateSafely(a.horaRef)).getTime();
      const dateB = new Date(buttonDateSafely(b.horaRef)).getTime();
      return dateA - dateB;
  });

  function buttonDateSafely(dateStr: string) {
      if (!dateStr) return new Date().toISOString();
      // Si es solo hora HH:mm:ss, agregar fecha hoy
      if (dateStr.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
          return `${new Date().toISOString().split('T')[0]}T${dateStr}`;
      }
      return dateStr;
  }

  return (
    <SimpleRoleGuard roles={['propietario']}>
      <div className="max-w-[1600px] mx-auto space-y-12 animate-fade-in">
          
          <div className="flex flex-col gap-12">
            
            {/* Fila superior: Finanzas y Mis Caballos */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
               
               {/* Finanzas */}
               <section className="flex flex-col h-full">
                 <div className="flex items-center justify-between mb-6">
                    <h2 className="text-[19px] font-semibold text-[#1e293b]">Finanzas</h2>
                    <Link href="/propietario/reportes/gastos" className="text-[14px] font-medium text-[#af936f] hover:text-[#1e293b] transition-colors">Ver detalle</Link>
                 </div>
                 
                 {gastosLoading ? (
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/60 flex-1 flex flex-col justify-center relative overflow-hidden">
                       <div className="space-y-4 animate-pulse">
                          <div className="h-4 bg-slate-200 rounded w-24"></div>
                          <div className="h-12 bg-slate-200 rounded w-48"></div>
                          <div className="h-3 bg-slate-200 rounded w-32 mt-8"></div>
                       </div>
                    </div>
                 ) : (
                 <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 flex-1 flex flex-col justify-center relative overflow-hidden group">
                     {/* Background gradient subtle */}
                     <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50/80"></div>
                     
                     {/* Decorative Circle Blur */}
                     <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl group-hover:bg-[#af936f]/10 transition-colors duration-500"></div>
                     
                     <div className="flex flex-col h-full relative z-10 justify-between">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Total Gastos</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-xl sm:text-2xl text-slate-300 font-light">$</span>
                                    <h3 className="text-3xl sm:text-5xl font-bold text-[#1e293b] tracking-tight leading-none">{gastosStats.mesActual.toLocaleString('es-AR')}</h3>
                                </div>
                            </div>
                            
                            <div className={`flex items-center gap-1 sm:gap-1.5 py-1 px-2 sm:py-1.5 sm:px-3 rounded-lg sm:rounded-xl border backdrop-blur-sm flex-shrink-0 ${gastosStats.tipo === 'aumento' ? 'bg-red-50/50 border-red-100 text-red-600' : 'bg-emerald-50/50 border-emerald-100 text-emerald-600'}`}>
                               {gastosStats.tipo === 'aumento' ? <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" /> : <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />}
                               <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap">{gastosStats.diferencia}%</span>
                            </div>
                        </div>

                        {/* Footer con info extra y visualización */}
                        <div className="mt-6 pt-4 border-t border-slate-100/80 flex items-end justify-between">
                            <div>
                                <p className="text-xs text-slate-400 mb-0.5">vs mes anterior</p>
                                <p className="text-sm font-medium text-slate-600">${gastosStats.mesAnterior.toLocaleString('es-AR')}</p>
                            </div>
                            {/* Mini Sparkline visual - oculto en móvil */}
                            <svg className="hidden sm:block w-24 h-8 text-[#af936f]" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M0 35 C 20 35, 20 10, 40 20 C 60 30, 70 5, 100 15" strokeLinecap="round" vectorEffect="non-scaling-stroke" className="opacity-50 group-hover:opacity-100 transition-opacity" />
                                <path d="M0 35 C 20 35, 20 10, 40 20 C 60 30, 70 5, 100 15" stroke="url(#gradient)" strokeWidth="0" fill="url(#gradient)" className="opacity-10" />
                                <defs>
                                    <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="currentColor" />
                                        <stop offset="100%" stopColor="transparent" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                     </div>
                 </div>
                 )}
               </section>

               {/* Mis Caballos */}
               <section className="flex flex-col h-full xl:border-l xl:border-slate-100 xl:pl-12">
                 <div className="flex items-center justify-between mb-6">
                   <h2 className="text-[19px] font-semibold text-[#1e293b]">Mis Caballos</h2>
                   <Link href="/propietario/caballos" className="text-[14px] font-medium text-[#af936f] hover:text-[#1e293b] transition-colors">Ver todos</Link>
                 </div>
                 
                 <div className="flex-1">
                 {caballosLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 h-full">
                       {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="aspect-[4/5] rounded-xl bg-slate-100 animate-pulse" />
                       ))}
                    </div>
                 ) : caballos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 h-full">
                        {caballos.slice(0, 3).map((caballo: any) => (
                          <Link
                            key={caballo.id}
                            href={`/propietario/caballos/${caballo.id}`}
                            className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 w-full shadow-sm hover:shadow-md transition-all"
                          >
                            {caballo.foto_url ? (
                                <Image
                                  src={caballo.foto_url}
                                  alt={caballo.nombre}
                                  fill
                                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full bg-slate-50">
                                  <Heart className="h-8 w-8 text-slate-300" />
                                </div>
                              )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#1e293b] via-[#1e293b]/60 to-transparent p-4 pt-12">
                                <h3 className="text-white font-medium text-sm truncate">{caballo.nombre}</h3>
                                <p className="text-white/80 text-xs truncate">{caballo.raza || 'Sin raza'}</p>
                            </div>
                          </Link>
                        ))}
                        <Link
                            href="/propietario/caballos/nuevo"
                            className="aspect-[4/5] rounded-xl border-2 border-dashed border-[#af936f]/20 hover:border-[#af936f] flex flex-col items-center justify-center text-[#af936f] hover:bg-[#af936f]/5 transition-all group w-full"
                        >
                            <Plus className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold uppercase tracking-wide">Agregar</span>
                        </Link>
                    </div>
                  ) : (
                    <div className="py-12 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 h-[300px] flex flex-col items-center justify-center">
                      <p className="text-slate-500 mb-4 text-sm">Aún no tienes caballos registrados</p>
                      <Link href="/propietario/caballos/nuevo" className="inline-flex items-center justify-center px-6 py-2.5 bg-[#1e293b] text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-blue-900/10">
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
                     <div className="flex items-center gap-2">
                        <h2 className="text-[19px] font-semibold text-[#1e293b]">Reporte Diario</h2>
                        <Sun className="w-5 h-5 text-[#af936f]" />
                     </div>
                     <span className="text-sm font-medium text-[#af936f] bg-[#af936f]/5 px-3 py-1 rounded-full">{new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                  {dashboardLoading ? (
                    <div className="space-y-3 flex-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-xl bg-white border border-slate-200/60 p-4 animate-pulse">
                          <div className="flex items-start gap-4">
                            <div className="w-6 h-6 bg-slate-200 rounded-lg flex-shrink-0" />
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="h-4 bg-slate-200 rounded w-2/3" />
                                <div className="h-4 bg-slate-100 rounded w-12" />
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="h-6 bg-slate-100 rounded-lg w-20" />
                                <div className="h-3 bg-slate-100 rounded w-24" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : actividadesHoy.length > 0 ? (
                      <>
                        <div className="space-y-3 flex-1">
                         {actividadesHoy.slice(0, 5).map((item: any) => {
                            const estaCompletado = item.estado === 'completada' || item.estado === 'completado';
                            const esEvento = item.tipoItem === 'evento';
                            const link = esEvento ? `/propietario/eventos/${item.id}` : `/propietario/tareas/${item.id}`;
                            
                            return (
                            <Link key={`${item.tipoItem}-${item.id}`} href={link} className="group relative overflow-hidden rounded-xl bg-white border border-slate-200/60 hover:border-[#af936f]/40 transition-all duration-300 hover:shadow-lg block cursor-pointer">
                              {/* Barra lateral de estado */}
                              <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${
                                 estaCompletado ? 'bg-emerald-500' : esEvento ? 'bg-blue-400' : 'bg-amber-400 group-hover:bg-[#af936f]'
                              }`}></div>
                              
                              <div className="p-4 pl-5">
                                 <div className="flex items-start gap-4">
                                    {/* Checkbox o indicador */}
                                    <div className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                                       estaCompletado 
                                          ? 'bg-emerald-500 text-white shadow-sm' 
                                          : esEvento 
                                             ? 'bg-blue-50 border-2 border-blue-300' 
                                             : 'bg-white border-2 border-slate-300 group-hover:border-[#af936f]'
                                    }`}>
                                       {estaCompletado && <Check className="w-4 h-4" />}
                                       {esEvento && !estaCompletado && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                                    </div>
                                    
                                    {/* Contenido */}
                                    <div className="flex-1 min-w-0">
                                       <div className="flex items-start justify-between gap-3 mb-2">
                                          <h3 className={`text-[15px] font-semibold leading-tight transition-colors ${
                                             estaCompletado ? 'text-slate-400 line-through' : 'text-[#1e293b] group-hover:text-[#af936f]'
                                          }`}>
                                             {item.titulo}
                                          </h3>
                                          
                                          {/* Hora */}
                                          <span className="flex-shrink-0 flex items-center gap-1 text-[13px] font-medium text-slate-400 group-hover:text-[#af936f] transition-colors">
                                             <Clock className="w-3.5 h-3.5" />
                                             {item.hora_inicio 
                                                ? item.hora_inicio.substring(0, 5) 
                                                : (item.fecha_limite || item.fecha_vencimiento 
                                                   ? new Date(item.fecha_limite || item.fecha_vencimiento).toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit'}) 
                                                   : '--:--')
                                             }
                                          </span>
                                       </div>
                                       
                                       {/* Metadata */}
                                       <div className="flex items-center gap-3 text-[13px] text-slate-500">
                                          {esEvento && (
                                             <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                                                <Calendar className="w-3 h-3" />
                                                {item.tipo_evento?.nombre || 'Evento'}
                                             </span>
                                          )}
                                          {!esEvento && (
                                             <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
                                                <ClipboardList className="w-3 h-3" />
                                                Tarea
                                             </span>
                                          )}
                                          
                                          {item.caballo?.nombre && (
                                             <>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span>{item.caballo.nombre}</span>
                                             </>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                            </Link>
                         )})}
                         </div>
                         {actividadesHoy.length > 5 && (
                            <div className="pt-4">
                               <Link href="/propietario/tareas" className="text-sm font-medium text-[#af936f] hover:text-[#1e293b] flex items-center gap-2 transition-colors group">
                                   Ver todas las actividades <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                               </Link>
                            </div>
                         )}
                      </>
                  ) : (
                      <div className="p-10 border border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/30 flex-1 flex flex-col justify-center items-center">
                         <ClipboardList className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                         <p className="text-[#1e293b] font-medium text-sm">Todo al día</p>
                         <p className="text-slate-500 text-sm mt-1">No hay actividades pendientes para hoy</p>
                      </div>
                  )}
                  </div>
               </section>

               {/* Próximos Eventos */}
               <section className="flex flex-col h-full xl:border-l xl:border-slate-100 xl:pl-12">
                  <div className="flex items-center justify-between mb-6">
                     <h2 className="text-[19px] font-semibold text-[#1e293b]">Próximos Eventos</h2>
                     <Link href="/propietario/eventos" className="text-[14px] font-medium text-[#af936f] hover:text-[#1e293b] transition-colors">Calendario completo</Link>
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                  {dashboardLoading ? (
                    <div className="space-y-3 flex-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rounded-xl bg-white border border-slate-200/60 p-4 animate-pulse">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-slate-200 rounded-xl flex-shrink-0" />
                            <div className="flex-1 space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <div className="h-4 bg-slate-200 rounded w-3/4" />
                                <div className="h-4 bg-slate-100 rounded w-12" />
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="h-6 bg-slate-100 rounded-lg w-16" />
                                <div className="h-3 bg-slate-100 rounded w-20" />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : eventos && eventos.length > 0 ? (
                    <>
                      <div className="space-y-3 flex-1">
                         {eventos.slice(0, 4).map((evento: any) => {
                            const fecha = new Date(evento.fecha_evento);
                            const esHoy = fecha.toDateString() === new Date().toDateString();
                            const estasSemana = (fecha.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 7;
                            
                            return (
                              <Link key={evento.id} href={`/propietario/eventos/${evento.id}`} className="group relative overflow-hidden rounded-xl bg-white border border-slate-200/60 hover:border-[#af936f]/40 transition-all duration-300 hover:shadow-lg block cursor-pointer">
                                 {/* Indicador lateral de color */}
                                 <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${
                                    esHoy ? 'bg-[#af936f]' : estasSemana ? 'bg-blue-400' : 'bg-slate-200 group-hover:bg-[#af936f]'
                                 }`}></div>
                                 
                                 <div className="p-4 pl-5">
                                    <div className="flex items-start gap-4">
                                       {/* Fecha en formato calendario */}
                                       <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all ${
                                          esHoy 
                                             ? 'bg-[#af936f] text-white shadow-lg shadow-[#af936f]/20' 
                                             : 'bg-slate-50 text-slate-600 border border-slate-200 group-hover:border-[#af936f]/30'
                                       }`}>
                                          <span className="text-[10px] font-bold uppercase tracking-wide opacity-75">
                                             {fecha.toLocaleDateString('es-AR', { month: 'short' })}
                                          </span>
                                          <span className="text-[20px] font-bold leading-none">
                                             {fecha.getDate()}
                                          </span>
                                       </div>
                                       
                                       {/* Contenido del evento */}
                                       <div className="flex-1 min-w-0">
                                          <div className="flex items-start justify-between gap-3 mb-2">
                                             <h3 className="text-[15px] font-semibold text-[#1e293b] leading-tight group-hover:text-[#af936f] transition-colors">
                                                {evento.titulo}
                                             </h3>
                                             
                                             {/* Hora a la derecha - igual que Reporte Diario */}
                                             {evento.hora_inicio && (
                                                <span className="flex-shrink-0 flex items-center gap-1 text-[13px] font-medium text-slate-400 group-hover:text-[#af936f] transition-colors">
                                                   <Clock className="w-3.5 h-3.5" />
                                                   {evento.hora_inicio.substring(0, 5)}
                                                </span>
                                             )}
                                          </div>
                                          
                                          {/* Metadata */}
                                          <div className="flex items-center gap-3 text-[13px] text-slate-500">
                                             {esHoy && (
                                                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#af936f]/10 text-[#af936f] border border-[#af936f]/20">
                                                   Hoy
                                                </span>
                                             )}
                                             {evento.tipo_evento?.nombre && (
                                                <>
                                                   {esHoy && <span className="w-1 h-1 rounded-full bg-slate-300"></span>}
                                                   <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                                                      <Calendar className="w-3 h-3" />
                                                      {evento.tipo_evento.nombre}
                                                   </span>
                                                </>
                                             )}
                                             
                                             {evento.caballo?.nombre && (
                                                <>
                                                   <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                   <span>{evento.caballo.nombre}</span>
                                                </>
                                             )}
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </Link>
                            )
                         })}
                      </div>
                      {eventos.length > 4 && (
                        <div className="pt-4">
                          <Link href="/propietario/eventos" className="flex items-center gap-2 text-sm font-medium text-[#af936f] hover:text-[#1e293b] transition-colors group">
                            <span>Ver todos los eventos</span>
                            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-10 border border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/30 flex-1 flex flex-col justify-center items-center">
                       <Calendar className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                       <p className="text-[#1e293b] font-medium text-sm">No hay eventos próximos</p>
                       <p className="text-slate-500 text-sm mt-1">Cuando se programen eventos aparecerán aquí</p>
                    </div>
                  )}
                  </div>
               </section>
            
            </div>

          </div>

      </div>
    </SimpleRoleGuard>
  );
}

