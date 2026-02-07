"use client";

import React, { useEffect, useState } from "react";
import { Loader } from "@/components/ui/loader";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp, TrendingDown, Heart, Plus, ArrowRight, ClipboardList, Check, Sun, Calendar } from "lucide-react";
import { SimpleRoleGuard } from "@/components/common/SimplePermissionGuard";

export default function PropietarioDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";
  const res = await fetch(`${apiBaseUrl}/propietario/dashboard`, {
    credentials: 'include',
  });
  if (!res.ok) {
    let msg = "Error al cargar datos del dashboard";
    if (res.status === 401) {
      msg = "No tienes sesión activa. Por favor inicia sesión.";
    } else if (res.status === 403) {
      msg = "No tienes permisos para ver este contenido.";
    } else if (res.status === 404) {
      msg = "Endpoint no encontrado. Contacta a soporte.";
    } else if (res.status === 500) {
      try {
        const errJson = await res.json();
        msg = errJson?.error || msg;
      } catch {}
    }
    throw new Error(msg);
  }
  const json = await res.json();
  setData(json);
      } catch (e: any) {
        setError(e.message || "Error inesperado");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <Loader />;
  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block bg-red-100 text-red-700 px-4 py-2 rounded-lg border border-red-200 shadow">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }
  if (!data) return null;


  // Finanzas
  const gastos = {
    mesActual: Array.isArray(data.finanzas) ? data.finanzas.reduce((acc: number, g: any) => acc + (g.monto || 0), 0) : 0,
    mesAnterior: 0,
    diferencia: 0,
    tipo: "aumento" as const,
  };

  // Caballos
  const caballos = Array.isArray(data.caballos) ? data.caballos : [];

  // Tareas
  const listaTareas = Array.isArray(data.tareas) ? data.tareas : [];

  // Eventos
  const eventos = Array.isArray(data.eventos) ? data.eventos : [];

  // Reporte Diario: combinar tareas y eventos de hoy
  const hoy = new Date();
  const hoyISO = hoy.toISOString().split("T")[0];
  const actividadesHoy = [
    ...listaTareas.filter((t: any) => (t.fecha_limite || t.fecha_vencimiento || t.created_at || "").startsWith(hoyISO)).map((t: any) => ({
      ...t,
      tipoItem: "tarea",
      horaRef: t.fecha_limite || t.fecha_vencimiento || t.created_at,
    })),
    ...eventos.filter((e: any) => (e.fecha_evento || "").startsWith(hoyISO)).map((e: any) => {
      let refDate = e.fecha_evento;
      if (e.hora_inicio && e.fecha_evento) {
        const datePart = e.fecha_evento.split("T")[0];
        refDate = `${datePart}T${e.hora_inicio}`;
      }
      return {
        ...e,
        tipoItem: "evento",
        horaRef: refDate,
      };
    }),
  ].sort((a, b) => new Date(a.horaRef).getTime() - new Date(b.horaRef).getTime());

  return (
    <SimpleRoleGuard roles={["propietario"]}>
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
              <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 flex-1 flex flex-col justify-center relative overflow-hidden group">
                {/* Background gradient subtle */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-slate-50/80"></div>
                {/* Decorative Circle Blur */}
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl group-hover:bg-[#af936f]/10 transition-colors duration-500"></div>
                <div className="flex flex-col h-full relative z-10 justify-between">
                  {gastos.mesActual > 0 ? (
                    <>
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Total Gastos</span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl text-slate-300 font-light">$</span>
                            <h3 className="text-5xl font-bold text-[#1e293b] tracking-tighter">{gastos.mesActual.toLocaleString("es-AR")}</h3>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl border backdrop-blur-sm ${gastos.tipo === "aumento" ? "bg-red-50/50 border-red-100 text-red-600" : "bg-emerald-50/50 border-emerald-100 text-emerald-600"}`}>
                          {gastos.tipo === "aumento" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          <span className="text-xs font-bold">{gastos.diferencia}%</span>
                        </div>
                      </div>
                      {/* Footer con info extra y visualización */}
                      <div className="mt-6 pt-4 border-t border-slate-100/80 flex items-end justify-between">
                        <div>
                          <p className="text-xs text-slate-400 mb-0.5">vs mes anterior</p>
                          <p className="text-sm font-medium text-slate-600">${gastos.mesAnterior.toLocaleString("es-AR")}</p>
                        </div>
                        {/* Mini Sparkline visual */}
                        <svg className="w-24 h-8 text-[#af936f]" viewBox="0 0 100 40" fill="none" stroke="currentColor" strokeWidth="2">
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
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-8">
                      <span className="text-slate-400 text-lg">No hay gastos registrados.</span>
                    </div>
                  )}
                </div>
              </div>
            </section>


            {/* Mis Caballos */}
            <section className="flex flex-col h-full xl:border-l xl:border-slate-100 xl:pl-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[19px] font-semibold text-[#1e293b]">Mis Caballos</h2>
                <Link href="/propietario/caballos" className="text-[14px] font-medium text-[#af936f] hover:text-[#1e293b] transition-colors">Ver todos</Link>
              </div>
              <div className="flex-1">
                {caballos.length > 0 ? (
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
                  
                  <div className="flex-1">
                  {actividadesHoy.length > 0 ? (
                      <div className="space-y-3">
                         {actividadesHoy.slice(0, 5).map((item: any) => (
                            <div key={`${item.tipoItem}-${item.id}`} className="group flex items-start gap-4 p-4 rounded-xl border border-slate-100 hover:border-[#af936f]/30 transition-all bg-white hover:shadow-md cursor-pointer">
                              <div className={`mt-1 flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0 border-2 transition-colors ${
                                  (item.estado === 'completada' || item.estado === 'completado') 
                                    ? 'bg-emerald-500 border-emerald-500' 
                                    : (item.tipoItem === 'evento' ? 'border-blue-300 bg-blue-50' : 'border-slate-300 group-hover:border-[#af936f]')
                              }`}>
                                  {(item.estado === 'completada' || item.estado === 'completado') && <Check className="w-3 h-3 text-white" />}
                                  {item.tipoItem === 'evento' && item.estado !== 'completado' && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                 <div className="flex justify-between items-start">
                                    <h3 className={`text-[15px] font-medium transition-colors ${
                                        (item.estado === 'completada' || item.estado === 'completado') ? 'text-slate-400 line-through' : 'text-[#1e293b] group-hover:text-[#1e293b]'
                                    }`}>
                                        {item.titulo}
                                    </h3>
                                    <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-md ml-2 group-hover:bg-[#1e293b] group-hover:text-white transition-colors">
                                        {item.hora_inicio 
                                            ? item.hora_inicio.substring(0, 5) 
                                            : (item.fecha_limite || item.fecha_vencimiento 
                                                ? new Date(item.fecha_limite || item.fecha_vencimiento).toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit'}) 
                                                : '--:--')
                                        }
                                    </span>
                                 </div>
                                 <div className="flex items-center gap-2 mt-1">
                                    {item.tipoItem === 'evento' && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                            {item.tipo_evento?.nombre || 'Evento'}
                                        </span>
                                    )}
                                    <p className="text-[13px] text-slate-500 flex items-center gap-1.5">
                                        <span className={`w-1 h-1 rounded-full ${item.tipoItem === 'evento' ? 'bg-blue-400' : 'bg-slate-300 group-hover:bg-[#af936f]'}`}></span>
                                        {item.caballo?.nombre || 'General'}
                                    </p>
                                 </div>
                              </div>
                            </div>
                         ))}
                         <div className="pt-2">
                            <Link href="/propietario/tareas" className="text-sm font-medium text-[#af936f] hover:text-[#1e293b] flex items-center gap-2 transition-colors group">
                                Ver todas las tareas <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                            </Link>
                         </div>
                      </div>
                  ) : (
                      <div className="p-10 border border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/30 h-full flex flex-col justify-center items-center">
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
                  
                  <div className="flex-1">
                  {eventos && eventos.length > 0 ? (
                    <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-4 before:w-[2px] before:bg-slate-100 h-full">
                       {eventos.slice(0, 4).map((evento: any) => {
                          const fecha = new Date(evento.fecha_evento);
                          const esHoy = fecha.toDateString() === new Date().toDateString();
                          
                          return (
                            <div key={evento.id} className="relative pl-12 group">
                               {/* Timeline dot */}
                               <div className={`absolute left-0 top-1 w-10 h-10 rounded-full border-4 border-white flex items-center justify-center font-bold text-xs shadow-sm z-10 transition-colors ${esHoy ? 'bg-[#1e293b] text-white' : 'bg-white text-slate-500 border-slate-100 group-hover:border-[#af936f] group-hover:text-[#af936f]'}`}>
                                    {fecha.getDate()}
                               </div>
                               
                               <Link href={`/propietario/eventos`} className="block group-hover:translate-x-1 transition-transform duration-300">
                                   <div className="flex justify-between items-start">
                                       <div>
                                           <h3 className="text-[15px] font-semibold text-[#1e293b]">{evento.titulo}</h3>
                                           <p className="text-[13px] text-slate-500 mt-0.5 group-hover:text-[#af936f] transition-colors">{fecha.toLocaleDateString('es-AR', { month: 'long', weekday: 'long' })}</p>
                                       </div>
                                       <div className="px-2.5 py-1 rounded-md bg-[#1e293b]/5 text-[11px] uppercase tracking-wider font-bold text-[#1e293b] border border-[#1e293b]/10 group-hover:bg-[#1e293b] group-hover:text-white transition-colors">
                                          {evento.tipo_evento?.nombre || 'Evento'}
                                       </div>
                                   </div>
                               </Link>
                            </div>
                          )
                       })}
                    </div>
                  ) : (
                    <div className="p-8 border border-slate-200 rounded-2xl text-center bg-slate-50/50 h-full flex flex-col justify-center items-center">
                       <Calendar className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                       <p className="text-slate-500 text-sm">No hay eventos próximos en agenda</p>
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

