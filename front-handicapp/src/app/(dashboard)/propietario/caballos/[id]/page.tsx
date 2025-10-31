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
      <div className="max-w-7xl mx-auto">
        {/* Botón volver */}
        <div className="mb-6">
          <button 
            onClick={() => router.push("/propietario/caballos")} 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#0f172a] transition-colors font-medium group"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Volver a Mis Caballos</span>
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              {/* Spinner moderno */}
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-[#af936f]/20 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative w-16 h-16 mx-auto">
                  <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-[#0f172a] rounded-full border-t-transparent animate-spin"></div>
                </div>
              </div>
              <p className="text-gray-600 font-medium">Cargando información del caballo...</p>
              <p className="text-gray-400 text-sm mt-2">Un momento por favor</p>
            </div>
          </div>
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
              <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">{caballo.nombre}</h1>
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-gradient-to-r from-[#0f172a]/5 to-[#af936f]/5 rounded-lg border border-[#af936f]/20">
                      <span className="text-sm text-gray-600">Microchip: </span>
                      <span className="font-mono font-semibold text-[#0f172a]">{caballo.microchip}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => setShowQRModal(true)} 
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-[#0f172a]/20 transition-all duration-200 shadow-sm hover:shadow font-medium"
                  >
                    <QrCodeIcon className="w-4 h-4" />
                    Ver QR
                  </button>
                  <button 
                    onClick={() => loadCaballoData(Number(params?.id))} 
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-[#0f172a]/20 transition-all duration-200 shadow-sm hover:shadow font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Actualizar
                  </button>
                  <button 
                    onClick={exportarFicha}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-[#0f172a]/20 transition-all duration-200 shadow-sm hover:shadow font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Exportar
                  </button>
                  <button 
                    onClick={() => setShowEditModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0f172a] text-white rounded-xl hover:bg-[#0f172a]/90 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
                  <nav className="flex gap-2">
                    <button
                      onClick={() => setActiveTab("info")}
                      className={`flex items-center gap-2 py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 ${
                        activeTab === "info"
                          ? "bg-[#0f172a] text-white shadow-lg"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Información General
                    </button>
                    <button
                      onClick={() => setActiveTab("documentos")}
                      className={`flex items-center gap-2 py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 ${
                        activeTab === "documentos"
                          ? "bg-[#0f172a] text-white shadow-lg"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      Documentos
                    </button>
                    <button
                      onClick={() => setActiveTab("propietarios")}
                      className={`flex items-center gap-2 py-3 px-6 rounded-lg font-medium text-sm transition-all duration-200 ${
                        activeTab === "propietarios"
                          ? "bg-[#0f172a] text-white shadow-lg"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
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
              {activeTab === "info" && <CaballoFicha caballo={caballo} origin={origin} pedigree={pedigree} />}
              {activeTab === "documentos" && <AdjuntosList caballoId={Number(params?.id)} showActions={false} />}
              {activeTab === "propietarios" && <PropietariosList caballoId={Number(params?.id)} />}

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
    </SimpleRoleGuard>
  );
}
