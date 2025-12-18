"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SimpleRoleGuard } from "@/components/common/SimplePermissionGuard";
import caballoService, { Caballo, CaballoPedigree } from "@/lib/services/caballoService";
import { eventoService, type Evento } from "@/lib/services/eventoService";
import { useToaster } from "@/components/ui/toaster";
import CaballoFicha from "@/components/caballos/CaballoFicha";
import AdjuntosList from "@/components/adjuntos/AdjuntosList";
import QRCodeDisplay from "@/components/qr/QRCodeDisplay";
import PropietariosList from "@/components/propietarios/PropietariosList";
import CaballoForm from "@/components/dashboard/CaballoForm";
import { QrCodeIcon, ArrowPathIcon as RefreshCw, ArrowDownTrayIcon as Download, PencilIcon as Edit2, CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
import { LoadingSpinnerFullPage } from "@/components/ui/loading-spinner";

export default function CaballoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToaster();

  const [caballo, setCaballo] = useState<Caballo | null>(null);
  const [loading, setLoading] = useState(true);
  const [pedigree, setPedigree] = useState<CaballoPedigree | null>(null);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [eventosLoaded, setEventosLoaded] = useState(false);
  const [origin, setOrigin] = useState("");
  const [activeTab, setActiveTab] = useState<"ficha" | "pedigree" | "historial" | "documentos" | "propietarios">("ficha");
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
        
        // Intentar cargar pedigree solo si el caballo se cargó bien
        try {
          const respPedigree = await caballoService.getPedigree(id);
          const pedigreeData = (respPedigree as { data?: CaballoPedigree })?.data;
          setPedigree(pedigreeData || null);
        } catch (e) {
          console.log('⚠️ No se pudo cargar pedigree:', e);
          setPedigree(null);
        }
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
      const response: any = await eventoService.getAll({ 
        page: 1, 
        limit: 50, 
        caballo_id: caballoId 
      });
      
      const eventosData = response?.data?.eventos || response?.eventos || response?.data || response || [];
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
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {loading && (
          <LoadingSpinnerFullPage label="Cargando información del caballo..." />
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
                  className="inline-flex items-center px-6 py-3 bg-[#0f172a] text-white rounded-xl hover:bg-[#0f172a]/90 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                  Volver a Mis Caballos
                </button>
              </div>
            </div>
          )}

          {!loading && caballo && (
            <>
              <div className="space-y-4">
                {/* Breadcrumb */}
                <button 
                  onClick={() => router.push("/propietario/caballos")} 
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium group"
                >
                  <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Volver a Mis Caballos
                </button>

                {/* Header Compacto */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                  <div className="px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                      {/* Info Principal */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-xl font-bold text-slate-900 truncate">
                              {caballo.nombre}
                            </h1>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                              caballo.estado_global === "activo" 
                                ? "bg-emerald-100 text-emerald-700" 
                                : caballo.estado_global === "inactivo" 
                                ? "bg-amber-100 text-amber-700" 
                                : caballo.estado_global === "vendido" 
                                ? "bg-blue-100 text-blue-700" 
                                : "bg-slate-100 text-slate-700"
                            }`}>
                              {caballo.estado_global ? caballo.estado_global.toUpperCase() : "SIN ESTADO"}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-3 text-sm text-slate-600">
                            {caballo.microchip && (
                              <span className="font-mono">{caballo.microchip}</span>
                            )}
                            {caballo.raza && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span>{caballo.raza}</span>
                              </>
                            )}
                            <span className="text-slate-300">•</span>
                            <span>{caballo.sexo === "macho" ? "Macho" : caballo.sexo === "hembra" ? "Hembra" : "—"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setShowQRModal(true)} 
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <QrCodeIcon className="w-4 h-4" />
                          QR
                        </button>
                        <button 
                          onClick={() => loadCaballoData(Number(params?.id))} 
                          disabled={loading}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={exportarFicha}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setShowEditModal(true)} 
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          Editar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-slate-200 bg-white rounded-t-xl">
                  <nav className="flex gap-1 px-4" aria-label="Tabs">
                    <button
                      onClick={() => setActiveTab("ficha")}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "ficha"
                          ? "border-slate-900 text-slate-900"
                          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      Ficha Completa
                    </button>
                    <button
                      onClick={() => setActiveTab("pedigree")}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "pedigree"
                          ? "border-slate-900 text-slate-900"
                          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      Pedigree
                    </button>
                    <button
                      onClick={() => setActiveTab("historial")}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "historial"
                          ? "border-slate-900 text-slate-900"
                          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      Historial de Actividades
                    </button>
                    <button
                      onClick={() => setActiveTab("documentos")}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "documentos"
                          ? "border-slate-900 text-slate-900"
                          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      Documentos
                    </button>
                    <button
                      onClick={() => setActiveTab("propietarios")}
                      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === "propietarios"
                          ? "border-slate-900 text-slate-900"
                          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      Propietarios
                    </button>
                  </nav>
                </div>

              {/* Tab Content */}
              <div id="ficha-caballo">
                {activeTab === "ficha" && <CaballoFicha caballo={caballo} origin={origin} pedigree={pedigree} />}
                {activeTab === "pedigree" && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Pedigree</h3>
                    <p className="text-slate-600">Contenido del pedigree próximamente...</p>
                  </div>
                )}
                {activeTab === "historial" && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                    {/* Header del Historial */}
                    <div className="p-6 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 mb-1">Historial de Actividades</h3>
                          <p className="text-sm text-slate-600">
                            Registro completo de actividades, cuidados y eventos de {caballo.nombre}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEventosLoaded(false);
                              loadEventosDelCaballo(caballo.id);
                            }}
                            disabled={loadingEventos}
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className={`w-4 h-4 ${loadingEventos ? 'animate-spin' : ''}`} />
                            {loadingEventos ? 'Cargando...' : 'Actualizar'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Contenido del Historial */}
                    <div className="p-6">
                      {loadingEventos ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="text-center">
                            <RefreshCw className="w-8 h-8 text-slate-400 animate-spin mx-auto mb-3" />
                            <p className="text-slate-600">Cargando historial de eventos...</p>
                          </div>
                        </div>
                      ) : eventos.length === 0 ? (
                        <div className="text-center py-12">
                          <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                          <h4 className="text-lg font-medium text-slate-900 mb-2">Sin eventos registrados</h4>
                          <p className="text-slate-600 max-w-md mx-auto">
                            Aún no hay eventos registrados para {caballo.nombre}. 
                            Los eventos aparecerán aquí cuando el personal del establecimiento complete actividades.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="text-sm text-slate-600 mb-4">
                            Mostrando {eventos.length} evento{eventos.length !== 1 ? 's' : ''} registrado{eventos.length !== 1 ? 's' : ''}
                          </div>
                          
                          {eventos.map((evento) => (
                            <div
                              key={evento.id}
                              className={`border rounded-lg p-4 transition-colors ${
                                evento.origen_tarea_id 
                                  ? "border-blue-200 bg-blue-50 hover:bg-blue-100" 
                                  : "border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-medium text-slate-900 truncate">
                                      {evento.titulo}
                                    </h4>
                                    
                                    {/* Indicador de evento auto-generado */}
                                    {evento.origen_tarea_id && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                        🔧 Auto-generado
                                      </span>
                                    )}
                                    
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                                      evento.estado === "completado" 
                                        ? "bg-green-100 text-green-700" 
                                        : evento.estado === "programado"
                                        ? "bg-blue-100 text-blue-700"
                                        : evento.estado === "cancelado"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-slate-100 text-slate-700"
                                    }`}>
                                      {evento.estado}
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                                      evento.prioridad === "alta" 
                                        ? "bg-orange-100 text-orange-700" 
                                        : evento.prioridad === "critica"
                                        ? "bg-red-100 text-red-700"
                                        : evento.prioridad === "media"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-slate-100 text-slate-700"
                                    }`}>
                                      {evento.prioridad}
                                    </span>
                                  </div>
                                  
                                  {evento.descripcion && (
                                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                                      {evento.descripcion}
                                    </p>
                                  )}
                                  
                                  {/* Información adicional para eventos auto-generados */}
                                  {evento.origen_tarea_id && (
                                    <div className="bg-blue-100 rounded-md p-2 mb-3 border border-blue-200">
                                      <p className="text-xs text-blue-700">
                                        💡 <strong>Actividad completada:</strong> Esta entrada fue generada 
                                        automáticamente al completar una tarea programada por el equipo veterinario.
                                      </p>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <div className="flex items-center gap-1">
                                      <CalendarIcon className="w-3 h-3" />
                                      <span>
                                        {new Date(evento.fecha_evento).toLocaleDateString('es-AR', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric'
                                        })}
                                      </span>
                                    </div>
                                    
                                    {evento.hora_inicio && (
                                      <div className="flex items-center gap-1">
                                        <ClockIcon className="w-3 h-3" />
                                        <span>{evento.hora_inicio}</span>
                                      </div>
                                    )}
                                    
                                    {evento.tipo_evento?.nombre && (
                                      <div className="flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                                        <span>{evento.tipo_evento.nombre}</span>
                                      </div>
                                    )}
                                    
                                    {evento.creado_por && (
                                      <div className="flex items-center gap-1">
                                        <span>Registrado por: {evento.creado_por.nombre} {evento.creado_por.apellido}</span>
                                      </div>
                                    )}
                                  </div>
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
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <AdjuntosList caballoId={Number(params?.id)} showActions={false} />
                  </div>
                )}
                {activeTab === "propietarios" && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <PropietariosList caballoId={Number(params?.id)} />
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
