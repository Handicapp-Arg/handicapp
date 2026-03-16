"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import caballoService, { Caballo } from "@/lib/services/horseService";
import { useToaster } from "@/components/ui/toaster";
import CaballoFicha from "@/components/horses/HorseProfile";
import AdjuntosList from "@/components/attachments/AttachmentsList";
import PropietariosList from "@/components/owners/OwnersList";
import { ArrowLeft } from "lucide-react";

const TABS = [
  { id: "ficha", label: "General" },
  { id: "documentos", label: "Documentos" },
  { id: "propietarios", label: "Propietarios" },
] as const;

type TabId = typeof TABS[number]["id"];

const STATUS_BADGE: Record<string, string> = {
  activo:    'bg-green-50 text-green-700 border border-green-200',
  inactivo:  'bg-amber-50 text-amber-700 border border-amber-200',
  vendido:   'bg-gray-100 text-gray-700 border border-gray-200',
  fallecido: 'bg-gray-50 text-gray-600 border border-gray-200',
};

export default function CaballoAdminPerfilPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToaster();
  const id = Number(params?.id);

  const [caballo, setCaballo] = useState<Caballo | null>(null);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("ficha");

  useEffect(() => {
    if (!id || isNaN(id)) { toast("ID inválido", "error"); return; }
    setOrigin(window.location.origin);
    caballoService.getById(id)
      .then(res => {
        const data = (res as { data?: Caballo })?.data;
        if (data?.id) setCaballo(data);
        else toast("No se encontró el caballo", "error");
      })
      .catch(e => toast((e as Error)?.message || "No se pudo cargar el caballo", "error"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <>
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40" />
          <div className="h-10 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-md" />)}
          </div>
        </div>
      )}

      {!loading && !caballo && (
        <div className="bg-white rounded-md border border-gray-200 p-12 text-center">
          <p className="text-gray-900 font-medium mb-4">Caballo no encontrado</p>
          <button
            onClick={() => router.push("/admin/horses")}
            className="px-4 py-2.5 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-700"
          >
            Volver a Caballos
          </button>
        </div>
      )}

      {!loading && caballo && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push("/admin/horses")}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Caballos
              </button>
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-semibold text-gray-900">{caballo.nombre}</h1>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_BADGE[caballo.estado_global] ?? 'bg-gray-100 text-gray-600'}`}>
                  {caballo.estado_global}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {[caballo.raza, caballo.sexo, caballo.disciplina].filter(Boolean).join(' · ')}
              </p>
            </div>

            <div className="flex gap-0 border-b border-gray-200 overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 -mb-px ${
                    activeTab === tab.id
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div>
            {activeTab === "ficha" && (
              <CaballoFicha caballo={caballo} origin={origin} />
            )}

            {activeTab === "documentos" && (
              <div className="bg-white border border-gray-200 rounded-md p-5">
                <AdjuntosList caballoId={id} showActions={false} />
              </div>
            )}

            {activeTab === "propietarios" && (
              <div className="bg-white border border-gray-200 rounded-md p-5">
                <PropietariosList caballoId={id} readOnly />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
