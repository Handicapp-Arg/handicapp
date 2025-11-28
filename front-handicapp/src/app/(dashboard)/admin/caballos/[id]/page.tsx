
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import caballoService, { Caballo, CaballoPedigree } from "@/lib/services/caballoService";
import { useToaster } from "@/components/ui/toaster";
import CaballoFicha from "@/components/caballos/CaballoFicha";
import PropietariosList from "@/components/propietarios/PropietariosList";
import { LoadingSpinnerFullPage } from "@/components/ui/loading-spinner";

export default function CaballoAdminPerfilPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToaster();

  const [caballo, setCaballo] = useState<Caballo | null>(null);
  const [loading, setLoading] = useState(true);
  const [pedigree, setPedigree] = useState<CaballoPedigree | null>(null);
  const [origin, setOrigin] = useState("");

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
          setPedigree(null);
        }
      } else {
        toast("No se encontró el caballo", "error");
      }
    } catch (e) {
      const error = e as Error;
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
  }, [params?.id]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  if (loading) {
    return <LoadingSpinnerFullPage label="Cargando perfil de caballo..." />;
  }

  if (!caballo) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Caballo no encontrado</h1>
        <p>No se pudo cargar la información del caballo.</p>
      </div>
    );
  }

  // Establecimiento actual (si existe)
  const establecimiento = caballo.asociaciones_establecimientos?.[0]?.establecimiento;

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Perfil de Caballo</h1>
      <CaballoFicha caballo={caballo} origin={origin} pedigree={pedigree} />

      {/* Establecimiento actual */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold mb-2">Establecimiento actual</h2>
        {establecimiento ? (
          <div>
            <p className="font-semibold text-gray-900">{establecimiento.nombre}</p>
            {establecimiento.direccion && (
              <p className="text-gray-600 text-sm">{establecimiento.direccion}</p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 italic">Sin establecimiento asignado</p>
        )}
      </div>

      {/* Propietarios actuales */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold mb-2">Propietario(s)</h2>
        <PropietariosList caballoId={caballo.id} readOnly />
      </div>
    </div>
  );
}
