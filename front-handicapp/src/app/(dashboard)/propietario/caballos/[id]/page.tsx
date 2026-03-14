"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SimpleRoleGuard } from "@/components/common/SimplePermissionGuard";
import caballoService, { Caballo } from "@/lib/services/caballoService";
import { eventoService, type Evento } from "@/lib/services/eventoService";
import { useToaster } from "@/components/ui/toaster";
import CaballoFicha from "@/components/caballos/CaballoFicha";
import AdjuntosList from "@/components/adjuntos/AdjuntosList";
import QRCodeDisplay from "@/components/qr/QRCodeDisplay";
import PropietariosList from "@/components/propietarios/PropietariosList";
import CaballoForm from "@/components/dashboard/CaballoForm";
import CaballoTareasTab from "@/components/caballos/CaballoTareasTab";
import { QrCodeIcon, ArrowPathIcon as RefreshCw, ArrowDownTrayIcon as Download, PencilIcon as Edit2, CalendarIcon, ClockIcon, IdentificationIcon, CheckCircleIcon, UserIcon } from "@heroicons/react/24/outline";
import CaballoDetailSkeleton from "@/components/skeletons/CaballoDetailSkeleton";

export default function CaballoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToaster();

  const [caballo, setCaballo] = useState<Caballo | null>(null);
  const [loading, setLoading] = useState(true);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [eventosLoaded, setEventosLoaded] = useState(false);
  const [origin, setOrigin] = useState("");
  const [activeTab, setActiveTab] = useState<"ficha" | "historial" | "documentos" | "propietarios" | "tareas">("ficha");
  const [showQRModal, setShowQRModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const loadCaballoData = async (id: number) => {
    try {
      setLoading(true);
      // Resetear estados de eventos cuando cambia el caballo
      setEventos([]);
      setEventosLoaded(false);
      // Cargar caballo principal
      const respCaballo = await caballoService.getById(id);
      // El backend devuelve { success: true, message: "...", data: Caballo }
      const caballoData = (respCaballo as { data?: Caballo })?.data;
      if (caballoData && caballoData.id) {
        setCaballo(caballoData);
      } else {
        console.error('❌ No se recibió data del caballo');
        toast("No se encontró el caballo", "error");
      }
    } catch (e) {
      const error = e as Error;
      console.error('❌ Error cargando caballo:', error);
      toast(error?.message || "No se pudo cargar el caballo", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadEventosDelCaballo = async (caballoId: number) => {
    try {
      setLoadingEventos(true);
      const response = await eventoService.getAll({ 
        page: 1, 
        limit: 50, 
        caballo_id: caballoId 
      });
      
      const eventosData = Array.isArray(response) ? response : response?.data || [];
      const eventosList: Evento[] = Array.isArray(eventosData) ? eventosData : [];
      setEventos(eventosList);
      setEventosLoaded(true);
    } catch (error) {
      console.error('❌ Error cargando eventos:', error);
      setEventos([]);
      setEventosLoaded(true);
    } finally {
      setLoadingEventos(false);
    }
  };

  useEffect(() => {
    const id = Number(params?.id);
    
    if (!id || isNaN(id)) {
      toast("ID de caballo inválido", "error");
      return;
    }
    
    loadCaballoData(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      setOrigin(origin);
    }
  }, []);

  // Cargar eventos cuando se selecciona la pestaña historial (solo una vez)
  useEffect(() => {
    if (activeTab === "historial" && caballo?.id && !eventosLoaded && !loadingEventos) {
      loadEventosDelCaballo(caballo.id);
    }
  }, [activeTab, caballo?.id, eventosLoaded, loadingEventos]);

  const exportarFicha = () => {
    const printContent = document.getElementById("ficha-caballo");
    if (!printContent || !caballo) return;
    const newWindow = window.open("", "_blank");
    if (!newWindow) return;
    const styles = `
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; }
        .print-card { border: 1px solid #e5e7eb; margin-bottom: 1rem; padding: 1rem; border-radius: 8px; }
      </style>
    `;
    newWindow.document.write(`<!doctype html><html><head><title>Ficha ${caballo.nombre}</title>${styles}</head><body>${printContent.innerHTML}</body></html>`);
    newWindow.document.close();
    newWindow.print();
  };

  return (
    <SimpleRoleGuard roles={["propietario"]} fallback={<div className="p-6">Sin permisos</div>}>
      <div className="min-h-screen">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {loading && (
          <CaballoDetailSkeleton />
        )}

          {!loading && !caballo && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12">
              <div className="text-center max-w-md mx-auto">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-red-100 rounded-full blur-2xl"></div>
                  <div className="relative w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto ring-4 ring-red-100">
                    <span className="text-4xl">❌</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Caballo no encontrado</h3>
                <p className="text-gray-600 mb-6">El caballo que buscas no existe o no tienes permisos para verlo</p>
                <button
                  onClick={() => router.push("/propietario/caballos")}
                  className="inline-flex items-center px-6 py-3 bg-slate-950 text-white rounded-xl hover:bg-slate-950/90 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                  Volver a Mis Caballos
                </button>
              </div>
            </div>
          )}

          {!loading && caballo && (
            <>
              <div className="space-y-8 animate-in fade-in duration-500">
                {/* Modern Header: Breadcrumb + Actions + Title */}
                <div className="flex flex-col gap-6">
                  {/* Top Bar: Back & Actions */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <button
                        onClick={() => router.push("/propietario/caballos")}
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium group"
                     >
                        <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Volver a Mis Caballos
                     </button>

                     <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-slate-200 shadow-sm self-start md:self-auto">
                        <button
                           onClick={() => loadCaballoData(Number(params?.id))}
                           className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                           title="Actualizar datos"
                        >
                           <RefreshCw className="w-5 h-5" />
                        </button>
                         <button
                           onClick={exportarFicha}
                           className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                           title="Descargar Ficha PDF"
                        >
                           <Download className="w-5 h-5" />
                        </button>
                        <button
                           onClick={() => setShowQRModal(true)}
                           className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"
                           title="Ver QR"
                        >
                           <QrCodeIcon className="w-5 h-5" />
                        </button>
                        <div className="w-px h-5 bg-slate-200 mx-1"></div>
                        <button
                           onClick={() => setShowEditModal(true)}
                           className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-full shadow-sm transition-all"
                        >
                           <Edit2 className="w-4 h-4" />
                           Editar
                        </button>
                     </div>
                  </div>

                  {/* Title Section */}
                  <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-0 gap-4">
                     <div className="pb-6">
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{caballo.nombre}</h1>
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              caballo.estado_global === "activo"
                                 ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                 : caballo.estado_global === "inactivo"
                                 ? "bg-amber-50 text-amber-700 border-amber-200"
                                 : caballo.estado_global === "vendido"
                                 ? "bg-blue-50 text-blue-700 border-blue-200"
                                 : "bg-slate-50 text-slate-600 border-slate-200"
                           }`}>
                              {caballo.estado_global?.toUpperCase() || "SIN ESTADO"}
                           </span>
                           {caballo.microchip && (
                              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100">
                                 <IdentificationIcon className="w-4 h-4 text-slate-400" />
                                 <span className="text-sm text-slate-600 font-mono">{caballo.microchip}</span>
                              </div>
                           )}
                           {caballo.raza && (
                              <span className="text-sm text-slate-500 font-medium px-2 border-l border-slate-200">
                                 {caballo.raza}
                              </span>
                           )}
                        </div>
                     </div>
                     
                     {/* Modern Tabs Navigation */}
                     <nav className="-mb-px flex space-x-6 overflow-x-auto no-scrollbar" aria-label="Tabs">
                        {[
                           { id: "ficha", label: "General" },
                           { id: "historial", label: "Actividades" },
                           { id: "documentos", label: "Documentos" },
                           { id: "propietarios", label: "Propietarios" },
                           { id: "tareas", label: "Tareas" },
                        ].map((tab) => (
                           <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab.id as any)}
                              className={`
                                 whitespace-nowrap py-4 border-b-2 font-medium text-sm transition-all duration-200
                                 ${activeTab === tab.id
                                    ? "border-slate-900 text-slate-900"
                                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"}
                              `}
                           >
                              {tab.label}
                           </button>
                        ))}
                     </nav>
                  </div>
                </div>

              {/* Tab Content */}
              <div className="mt-8">
                {activeTab === "ficha" && <CaballoFicha caballo={caballo} origin={origin} />}
                {activeTab === "historial" && (
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Header Clean */}
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-blue-600">
                             <CalendarIcon className="w-5 h-5" />
                          </div>
                          <div>
                             <h3 className="font-bold text-slate-900">Historial de Actividades</h3>
                             <p className="text-sm text-slate-500">Registro de eventos y cuidados</p>
                          </div>
                       </div>
                       <div className="flex gap-2">
                           <button 
                             onClick={() => loadCaballoData(Number(params?.id))} 
                             className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-white"
                             title="Refrescar historial"
                           >
                              <RefreshCw className={`w-4 h-4 ${loadingEventos ? 'animate-spin' : ''}`} />
                           </button>
                       </div>
                    </div>
                    


                    {/* Contenido del Historial */}
                    <div className="relative p-6">
                      {loadingEventos ? (
                          <div className="space-y-3 py-4">
                            {[1,2,3].map(i => (
                              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                            ))}
                          </div>
                       ) : eventos.length === 0 ? (
                          <div className="py-16 text-center">
                             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                <CalendarIcon className="w-8 h-8 text-slate-300" />
                             </div>
                             <h4 className="text-slate-900 font-medium mb-1">Sin eventos registrados</h4>
                             <p className="text-slate-500 text-sm">No hay actividad reciente para este caballo.</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                             {eventos.map((evento) => (
                                <div key={evento.id} className="group flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                                   {/* Status Stripe */}
                                   <div className={`hidden sm:block w-1 self-stretch rounded-full flex-shrink-0 ${
                                      evento.estado === 'completado' ? 'bg-emerald-500' :
                                      evento.estado === 'programado' ? 'bg-blue-500' : 
                                      'bg-slate-300'
                                   }`}></div>
                                   
                                   {/* Content Wrapper */}
                                   <div className="flex-1 min-w-0">
                                      {/* Header Row */}
                                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                         <div className="flex flex-col gap-1 w-full">
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-bold text-slate-900 text-base">
                                                  {evento.titulo}
                                                </h4>
                                            </div>
                                    
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                {/* Indicador de evento auto-generado */}
                                                {evento.origen_tarea_id && (
                                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide text-blue-700 bg-blue-50 border border-blue-100">
                                                    Auto
                                                  </span>
                                                )}
                                                
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${
                                                  evento.estado === "completado" 
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                                                    : evento.estado === "programado"
                                                    ? "bg-blue-50 text-blue-700 border-blue-100"
                                                    : evento.estado === "cancelado"
                                                    ? "bg-red-50 text-red-700 border-red-100"
                                                    : "bg-slate-50 text-slate-700 border-slate-100"
                                                }`}>
                                                  {evento.estado}
                                                </span>
                                            </div>
                                         </div>
                                       
                                         <div className="text-xs text-slate-500 hidden sm:block text-right min-w-[80px]">
                                              <div className="font-semibold bg-slate-50 border border-slate-100 px-2 py-1 rounded text-slate-600 mb-1 inline-block">
                                                 {new Date(evento.fecha_evento).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                                              </div>
                                              {evento.hora_inicio && <div>{evento.hora_inicio}</div>}
                                         </div>
                                      </div>
                                  
                                      {evento.descripcion && (
                                        <p className="text-sm text-slate-700 mb-3 line-clamp-2 leading-relaxed">
                                          {evento.descripcion}
                                        </p>
                                      )}
                                      
                                      <div className="flex items-center gap-6 text-xs text-slate-400 border-t border-slate-100 pt-3 mt-1">
                                        {evento.tipo_evento?.nombre && (
                                          <div className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                            <span className="font-medium text-slate-600">{evento.tipo_evento.nombre}</span>
                                          </div>
                                        )}
                                        
                                        {evento.creado_por && (
                                          <div className="flex items-center gap-1.5">
                                            <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="font-medium text-slate-500">{evento.creado_por.nombre} {evento.creado_por.apellido}</span>
                                          </div>
                                        )}
                                      </div>
                                   </div>
                                </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {activeTab === "documentos" && (
                  <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
                    <div className="relative">
                      <AdjuntosList caballoId={Number(params?.id)} showActions={false} />
                    </div>
                  </div>
                )}
                {activeTab === "propietarios" && (
                  <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
                    <div className="relative">
                      <PropietariosList caballoId={Number(params?.id)} />
                    </div>
                  </div>
                )}
                {activeTab === "tareas" && (
                  <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
                    <div className="relative">
                      <CaballoTareasTab 
                        caballoId={Number(params?.id)} 
                        caballoNombre={caballo.nombre}
                        onTareaCreated={() => {
                          // Opcional: refrescar algo si es necesario
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* QR Modal */}
              {showQRModal && (
                <QRCodeDisplay
                  caballoId={Number(params?.id)}
                  caballoNombre={caballo.nombre}
                  microchip={caballo.microchip || undefined}
                  onClose={() => setShowQRModal(false)}
                />
              )}

              {/* Edit Modal */}
              <CaballoForm
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSuccess={(updatedCaballo) => {
                  setCaballo(updatedCaballo);
                  setShowEditModal(false);
                  toast("Caballo actualizado exitosamente", "success");
                  // Recargar datos completos
                  loadCaballoData(Number(params?.id));
                }}
                caballo={caballo}
              />
              </div>
            </>
          )}
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
