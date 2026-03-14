"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import caballoService, { Caballo, CaballoPedigree } from "@/lib/services/caballoService";
import { useToaster } from "@/components/ui/toaster";
import CaballoFicha from "@/components/caballos/CaballoFicha";
import AdjuntosList from "@/components/adjuntos/AdjuntosList";
import PropietariosList from "@/components/propietarios/PropietariosList";
import { ArrowLeftIcon, ArrowPathIcon as RefreshCw } from "@heroicons/react/24/outline";
import CaballoDetailSkeleton from '@/components/skeletons/CaballoDetailSkeleton';

export default function CaballoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToaster();

  const [caballo, setCaballo] = useState<Caballo | null>(null);
  const [loading, setLoading] = useState(true);
  const [pedigree, setPedigree] = useState<CaballoPedigree | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "documentos" | "propietarios">("info");

  const loadCaballoData = async (id: number) => {
    try {
      setLoading(true);
      
      const respCaballo = await caballoService.getById(id);
      const caballoData = (respCaballo as { data?: Caballo })?.data;
      
      if (caballoData && caballoData.id) {
        setCaballo(caballoData);
        
        try {
          const respPedigree = await caballoService.getPedigree(id);
          const pedigreeData = (respPedigree as { data?: CaballoPedigree })?.data;
          setPedigree(pedigreeData || null);
        } catch (e) {
          // pedigree not critical — silently ignore
          setPedigree(null);
        }
      } else {
        toast("No se encontró el caballo", "error");
        router.push('/establecimiento/caballos');
      }
    } catch (e) {
      const error = e as Error;
      console.error('❌ Error cargando caballo:', error);
      toast(error?.message || "No se pudo cargar el caballo", "error");
      router.push('/establecimiento/caballos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = Number(params?.id);
    
    if (!id || isNaN(id)) {
      toast("ID de caballo inválido", "error");
      router.push('/establecimiento/caballos');
      return;
    }
    
    loadCaballoData(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.id]);

  if (loading) {
    return <CaballoDetailSkeleton />;
  }

  if (!caballo) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No se encontró el caballo</p>
          <button
            onClick={() => router.push('/establecimiento/caballos')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Volver a caballos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/establecimiento/caballos')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{caballo.nombre}</h1>
              <p className="text-gray-600 mt-1">Vista de solo lectura</p>
            </div>
          </div>
          
          <button 
            onClick={() => loadCaballoData(caballo.id)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
          <nav className="flex gap-2">
            <button
              onClick={() => setActiveTab("info")}
              className={`flex items-center gap-2 py-3 px-6 rounded-lg font-medium text-sm transition-all ${
                activeTab === "info"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Información
            </button>
            <button
              onClick={() => setActiveTab("documentos")}
              className={`flex items-center gap-2 py-3 px-6 rounded-lg font-medium text-sm transition-all ${
                activeTab === "documentos"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Documentos
            </button>
            <button
              onClick={() => setActiveTab("propietarios")}
              className={`flex items-center gap-2 py-3 px-6 rounded-lg font-medium text-sm transition-all ${
                activeTab === "propietarios"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Propietarios
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === "info" && (
          <CaballoFicha caballo={caballo} pedigree={pedigree} origin="establecimiento" />
        )}
        
        {activeTab === "documentos" && (
          <AdjuntosList caballoId={caballo.id} />
        )}
        
        {activeTab === "propietarios" && (
          <PropietariosList 
            caballoId={caballo.id}
            readOnly={true}
          />
        )}
      </div>
    </div>
  );
}
