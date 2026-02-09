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
import { QrCodeIcon, ArrowPathIcon as RefreshCw, ArrowDownTrayIcon as Download, PencilIcon as Edit2, CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Loader } from '@/components/ui/loader';

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
          <Loader />
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
              <div className="space-y-6">
                {/* Breadcrumb mejorado */}
                <button 
                  onClick={() => router.push("/propietario/caballos")} 
                  className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-all duration-200 text-sm font-medium group px-4 py-2 rounded-lg hover:bg-white/60"
                >
                  <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Volver a Mis Caballos
                </button>

                {/* Header Hero */}
                <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                  {/* Background con gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
                  
                  <div className="relative px-8 py-6">
                    <div className="flex items-start justify-between gap-4">
                      {/* Info Principal */}
                      <div className="flex items-center gap-5 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 ring-4 ring-white/10">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-black text-white truncate bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                              {caballo.nombre}
                            </h1>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg ${
                              caballo.estado_global === "activo" 
                                ? "bg-emerald-500 text-white ring-2 ring-emerald-300/50" 
                                : caballo.estado_global === "inactivo" 
                                ? "bg-amber-500 text-white ring-2 ring-amber-300/50" 
                                : caballo.estado_global === "vendido" 
                                ? "bg-blue-500 text-white ring-2 ring-blue-300/50" 
                                : "bg-slate-500 text-white ring-2 ring-slate-300/50"
                            }`}>
                              {caballo.estado_global || "SIN ESTADO"}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-white/80">
                            {caballo.microchip && (
                              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                </svg>
                                <span className="font-mono font-semibold">{caballo.microchip}</span>
                              </div>
                            )}
                            {caballo.raza && (
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                <span className="font-medium">{caballo.raza}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="font-medium">{caballo.sexo === "macho" ? "Macho" : caballo.sexo === "hembra" ? "Hembra" : "—"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setShowQRModal(true)} 
                          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/20 hover:scale-105 transition-all duration-200 shadow-lg"
                          title="Ver código QR"
                        >
                          <QrCodeIcon className="w-5 h-5" />
                          <span className="hidden sm:inline">QR</span>
                        </button>
                        <button 
                          onClick={() => loadCaballoData(Number(params?.id))} 
                          disabled={loading}
                          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/20 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                          title="Actualizar datos"
                        >
                          <RefreshCw className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={exportarFicha}
                          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/20 hover:scale-105 transition-all duration-200 shadow-lg"
                          title="Exportar ficha"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setShowEditModal(true)} 
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-200 shadow-xl shadow-blue-500/30"
                        >
                          <Edit2 className="w-5 h-5" />
                          Editar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-xl border border-white/20 shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50"></div>
                  <nav className="relative flex gap-2 px-6 py-2" aria-label="Tabs">
                    <button
                      onClick={() => setActiveTab("ficha")}
                      className={`relative px-5 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        activeTab === "ficha"
                          ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                      }`}
                    >
                      Ficha Completa
                    </button>
                    <button
                      onClick={() => setActiveTab("historial")}
                      className={`relative px-5 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        activeTab === "historial"
                          ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                      }`}
                    >
                      Historial de Actividades
                    </button>
                    <button
                      onClick={() => setActiveTab("documentos")}
                      className={`relative px-5 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        activeTab === "documentos"
                          ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                      }`}
                    >
                      Documentos
                    </button>
                    <button
                      onClick={() => setActiveTab("propietarios")}
                      className={`relative px-5 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        activeTab === "propietarios"
                          ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                      }`}
                    >
                      Propietarios
                    </button>
                    <button
                      onClick={() => setActiveTab("tareas")}
                      className={`relative px-5 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                        activeTab === "tareas"
                          ? "text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/30"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                      }`}
                    >
                      Tareas Activas
                    </button>
                  </nav>
                </div>

              {/* Tab Content */}
              <div id="ficha-caballo">
                {activeTab === "ficha" && <CaballoFicha caballo={caballo} origin={origin} />}
                {activeTab === "historial" && (
                  <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>
                    
                    {/* Header del Historial */}
                    <div className="relative bg-gradient-to-br from-slate-50 to-blue-50/30 p-6 border-b border-slate-200/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                            <CalendarIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-[#0f172a]">Historial de Actividades</h3>
                            <p className="text-sm text-slate-600">
                              Registro completo de actividades, cuidados y eventos de {caballo.nombre}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEventosLoaded(false);
                              loadEventosDelCaballo(caballo.id);
                            }}
                            disabled={loadingEventos}
                            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-105"
                          >
                            <RefreshCw className={`w-4 h-4 ${loadingEventos ? 'animate-spin' : ''}`} />
                            {loadingEventos ? 'Cargando...' : 'Actualizar'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Contenido del Historial */}
                    <div className="relative p-6">
                      {loadingEventos ? (
                        <div className="flex items-center justify-center py-16">
                          <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                              <RefreshCw className="w-8 h-8 text-white animate-spin" />
                            </div>
                            <p className="text-lg font-semibold text-[#0f172a] mb-1">Cargando historial...</p>
                            <p className="text-sm text-slate-600">Obteniendo eventos registrados</p>
                          </div>
                        </div>
                      ) : eventos.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center">
                            <CalendarIcon className="w-10 h-10 text-slate-400" />
                          </div>
                          <h4 className="text-xl font-bold text-[#0f172a] mb-2">Sin eventos registrados</h4>
                          <p className="text-slate-600 max-w-md mx-auto">
                            Aún no hay eventos registrados para {caballo.nombre}. 
                            Los eventos aparecerán aquí cuando el personal del establecimiento complete actividades.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                            <span className="text-sm font-semibold text-[#0f172a]">
                              {eventos.length} evento{eventos.length !== 1 ? 's' : ''} registrado{eventos.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          
                          {eventos.map((evento) => (
                            <div
                              key={evento.id}
                              className={`group relative border rounded-xl p-5 transition-all duration-300 hover:shadow-xl ${
                                evento.origen_tarea_id 
                                  ? "border-blue-300/50 bg-gradient-to-br from-blue-50 to-purple-50/30 hover:border-blue-400" 
                                  : "border-slate-200/50 bg-gradient-to-br from-slate-50 to-blue-50/20 hover:border-slate-300"
                              }`}
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-[#af936f]/5 group-hover:to-blue-500/5 rounded-xl transition-all duration-300"></div>
                              
                              <div className="relative flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                                    <h4 className="font-bold text-[#0f172a] text-base truncate">
                                      {evento.titulo}
                                    </h4>
                                    
                                    {/* Indicador de evento auto-generado */}
                                    {evento.origen_tarea_id && (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Auto-generado
                                      </span>
                                    )}
                                    
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${
                                      evento.estado === "completado" 
                                        ? "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/30" 
                                        : evento.estado === "programado"
                                        ? "bg-blue-500/10 text-blue-700 ring-1 ring-blue-500/30"
                                        : evento.estado === "cancelado"
                                        ? "bg-red-500/10 text-red-700 ring-1 ring-red-500/30"
                                        : "bg-slate-500/10 text-slate-700 ring-1 ring-slate-500/30"
                                    }`}>
                                      {evento.estado}
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm ${
                                      evento.prioridad === "alta" 
                                        ? "bg-orange-500/10 text-orange-700 ring-1 ring-orange-500/30" 
                                        : evento.prioridad === "critica"
                                        ? "bg-red-500/10 text-red-700 ring-1 ring-red-500/30"
                                        : evento.prioridad === "media"
                                        ? "bg-yellow-500/10 text-yellow-700 ring-1 ring-yellow-500/30"
                                        : "bg-slate-500/10 text-slate-700 ring-1 ring-slate-500/30"
                                    }`}>
                                      {evento.prioridad}
                                    </span>
                                  </div>
                                  
                                  {evento.descripcion && (
                                    <p className="text-sm text-slate-700 mb-3 line-clamp-2 leading-relaxed">
                                      {evento.descripcion}
                                    </p>
                                  )}
                                  
                                  {/* Información adicional para eventos auto-generados */}
                                  {evento.origen_tarea_id && (
                                    <div className="bg-gradient-to-r from-blue-100/50 to-purple-100/50 rounded-lg p-3 mb-3 border border-blue-200/50">
                                      <div className="flex items-start gap-2">
                                        <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-xs text-blue-800 font-medium">
                                          <strong>Actividad completada:</strong> Esta entrada fue generada 
                                          automáticamente al completar una tarea programada por el equipo veterinario.
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap">
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/60 rounded-lg border border-slate-200/50">
                                      <CalendarIcon className="w-3.5 h-3.5 text-[#af936f]" />
                                      <span className="font-medium">
                                        {new Date(evento.fecha_evento).toLocaleDateString('es-AR', {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric'
                                        })}
                                      </span>
                                    </div>
                                    
                                    {evento.hora_inicio && (
                                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/60 rounded-lg border border-slate-200/50">
                                        <ClockIcon className="w-3.5 h-3.5 text-blue-500" />
                                        <span className="font-medium">{evento.hora_inicio}</span>
                                      </div>
                                    )}
                                    
                                    {evento.tipo_evento?.nombre && (
                                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/60 rounded-lg border border-slate-200/50">
                                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                        <span className="font-medium">{evento.tipo_evento.nombre}</span>
                                      </div>
                                    )}
                                    
                                    {evento.creado_por && (
                                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/60 rounded-lg border border-slate-200/50">
                                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="font-medium">{evento.creado_por.nombre} {evento.creado_por.apellido}</span>
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
