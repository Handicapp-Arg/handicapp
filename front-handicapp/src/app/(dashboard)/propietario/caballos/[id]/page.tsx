"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SimpleRoleGuard } from "@/components/common/SimplePermissionGuard";
import caballoService, { Caballo, CaballoPedigree } from "@/lib/services/caballoService";
import { useToaster } from "@/components/ui/toaster";
import CaballoFicha from "@/components/caballos/CaballoFicha";
import AdjuntosList from "@/components/adjuntos/AdjuntosList";
import QRCodeDisplay from "@/components/qr/QRCodeDisplay";
import PropietariosList from "@/components/propietarios/PropietariosList";
import CaballoForm from "@/components/dashboard/CaballoForm";
import { QrCodeIcon, ArrowPathIcon as RefreshCw, ArrowDownTrayIcon as Download, PencilIcon as Edit } from "@heroicons/react/24/outline";
import { LoadingSpinnerFullPage } from "@/components/ui/loading-spinner";

export default function CaballoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToaster();

  const [caballo, setCaballo] = useState<Caballo | null>(null);
  const [loading, setLoading] = useState(true);
  const [pedigree, setPedigree] = useState<CaballoPedigree | null>(null);
  const [origin, setOrigin] = useState("");
  const [activeTab, setActiveTab] = useState<"info" | "documentos" | "propietarios">("info");
  const [showQRModal, setShowQRModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const loadCaballoData = async (id: number) => {
    try {
      setLoading(true);
      
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

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
              {/* Hero Header */}
              <div className="relative overflow-hidden mb-8 rounded-2xl shadow-xl">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-[#0f172a]"></div>
                
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-10" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}></div>
                
                {/* Gradient orbs */}
                <div className="absolute top-0 right-1/4 w-64 h-64 bg-slate-600/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-gray-500/20 rounded-full blur-3xl"></div>
                
                {/* Content */}
                <div className="relative z-10 px-6 sm:px-8 py-6">
                  {/* Breadcrumb / Volver */}
                  <button 
                    onClick={() => router.push("/propietario/caballos")} 
                    className="mb-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver a Mis Caballos
                  </button>

                  {/* Title Section */}
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                          {caballo.nombre}
                        </h1>
                        <p className="text-sm sm:text-base text-white/70">
                          Información completa del caballo
                        </p>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <button 
                        onClick={() => setShowQRModal(true)} 
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-200 font-medium"
                      >
                        <QrCodeIcon className="w-4 h-4" />
                        Ver QR
                      </button>
                      <button 
                        onClick={() => loadCaballoData(Number(params?.id))} 
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Actualizar
                      </button>
                      <button 
                        onClick={exportarFicha}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-200 font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Exportar
                      </button>
                      <button 
                        onClick={() => setShowEditModal(true)}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <Edit className="w-5 h-5" />
                        Editar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2">
                  <nav className="flex gap-2 overflow-x-auto">
                    <button
                      onClick={() => setActiveTab("info")}
                      className={`flex items-center gap-2 py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                        activeTab === "info"
                          ? "bg-slate-900 text-white shadow-lg"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Información General
                    </button>
                    <button
                      onClick={() => setActiveTab("documentos")}
                      className={`flex items-center gap-2 py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                        activeTab === "documentos"
                          ? "bg-slate-900 text-white shadow-lg"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      Documentos
                    </button>
                    <button
                      onClick={() => setActiveTab("propietarios")}
                      className={`flex items-center gap-2 py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                        activeTab === "propietarios"
                          ? "bg-slate-900 text-white shadow-lg"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Propietarios
                    </button>
                  </nav>
                </div>
              </div>

              {/* Tab Content */}
              <div id="ficha-caballo">
                {activeTab === "info" && <CaballoFicha caballo={caballo} origin={origin} pedigree={pedigree} />}
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
            </>
          )}
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
