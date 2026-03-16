"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SimpleRoleGuard } from "@/components/common/SimplePermissionGuard";
import caballoService, { Caballo } from "@/lib/services/horseService";
import { eventoService, type Evento } from "@/lib/services/eventService";
import { useToaster } from "@/components/ui/toaster";
import CaballoFicha from "@/components/horses/HorseProfile";
import AdjuntosList from "@/components/attachments/AttachmentsList";
import dynamic from 'next/dynamic';
const QRCodeDisplay = dynamic(() => import('@/components/qr/QRCodeDisplay'), {
  loading: () => <div className="h-32 bg-gray-100 rounded-md animate-pulse" />,
  ssr: false,
});
import PropietariosList from "@/components/owners/OwnersList";
import CaballoForm from "@/components/dashboard/CaballoForm";
import CaballoTareasTab from "@/components/horses/HorseTasksTab";
import { QrCodeIcon, PencilSquareIcon, CalendarDaysIcon, UserIcon } from "@heroicons/react/24/outline";
import { ArrowLeft } from "lucide-react";

const TABS = [
  { id: "ficha", label: "General" },
  { id: "historial", label: "Actividades" },
  { id: "documentos", label: "Documentos" },
  { id: "propietarios", label: "Propietarios" },
  { id: "tareas", label: "Tareas" },
] as const;

type TabId = typeof TABS[number]["id"];

const STATUS_BADGE: Record<string, string> = {
  activo:   'bg-green-50 text-green-700 border border-green-200',
  inactivo: 'bg-amber-50 text-amber-700 border border-amber-200',
  vendido:  'bg-gray-100 text-gray-700 border border-gray-200',
  fallecido:'bg-gray-50 text-gray-600 border border-gray-200',
};

export default function CaballoDetallePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToaster();
  const id = Number(params?.id);

  const [caballo, setCaballo] = useState<Caballo | null>(null);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("ficha");
  const [showQRModal, setShowQRModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Events (lazy — only when historial tab opens)
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(false);
  const [eventosLoaded, setEventosLoaded] = useState(false);

  const loadCaballo = async (caballoId: number) => {
    try {
      setLoading(true);
      const res = await caballoService.getById(caballoId);
      const data = (res as { data?: Caballo })?.data;
      if (data?.id) {
        setCaballo(data);
      } else {
        toast("No se encontró el caballo", "error");
      }
    } catch (e) {
      toast((e as Error)?.message || "No se pudo cargar el caballo", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadEventos = async (caballoId: number) => {
    try {
      setLoadingEventos(true);
      const res = await eventoService.getAll({ page: 1, limit: 50, caballo_id: caballoId });
      const list = Array.isArray(res) ? res : (res as any)?.data || [];
      setEventos(Array.isArray(list) ? list : []);
    } catch {
      setEventos([]);
    } finally {
      setLoadingEventos(false);
      setEventosLoaded(true);
    }
  };

  useEffect(() => {
    if (!id || isNaN(id)) { toast("ID inválido", "error"); return; }
    loadCaballo(id);
    setOrigin(window.location.origin);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (activeTab === "historial" && caballo?.id && !eventosLoaded && !loadingEventos) {
      loadEventos(caballo.id);
    }
  }, [activeTab, caballo?.id, eventosLoaded, loadingEventos]);

  return (
    <SimpleRoleGuard roles={["propietario"]} fallback={<div className="p-6 text-sm text-gray-500">Sin permisos</div>}>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40" />
          <div className="h-10 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[1,2,3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-md" />)}
          </div>
        </div>
      )}

      {/* Not found */}
      {!loading && !caballo && (
        <div className="bg-white rounded-md border border-gray-200 p-12 text-center">
          <p className="text-gray-900 font-medium mb-4">Caballo no encontrado</p>
          <button
            onClick={() => router.push("/propietario/horses")}
            className="px-4 py-2.5 bg-gray-900 text-white text-sm rounded-md hover:bg-gray-700"
          >
            Volver a Mis Caballos
          </button>
        </div>
      )}

      {!loading && caballo && (
        <div className="space-y-6">

          {/* Header */}
          <div className="flex flex-col gap-4">
            {/* Back + actions row */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.push("/propietario/horses")}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                Mis Caballos
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowQRModal(true)}
                  className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                  title="Ver QR"
                >
                  <QrCodeIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-700"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  Editar
                </button>
              </div>
            </div>

            {/* Title + status */}
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

            {/* Tabs */}
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

            {activeTab === "historial" && (
              <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                {loadingEventos ? (
                  <div className="space-y-3 p-6">
                    {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-md animate-pulse" />)}
                  </div>
                ) : eventos.length === 0 ? (
                  <div className="py-16 text-center border border-dashed border-gray-200 rounded-md">
                    <CalendarDaysIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-900">Sin actividad registrada</p>
                    <p className="text-sm text-gray-500 mt-1">Los eventos aparecerán aquí.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {eventos.map(evento => (
                      <li key={evento.id} className="flex items-start gap-4 px-5 py-4">
                        {/* Date */}
                        <div className="w-12 text-center flex-shrink-0">
                          <p className="text-xs text-gray-400 uppercase leading-none">
                            {new Date(evento.fecha_evento).toLocaleDateString('es-AR', { month: 'short' })}
                          </p>
                          <p className="text-lg font-semibold text-gray-800 leading-tight">
                            {new Date(evento.fecha_evento).getDate()}
                          </p>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{evento.titulo}</p>
                          {evento.descripcion && (
                            <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{evento.descripcion}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                            {evento.tipo_evento?.nombre && <span>{evento.tipo_evento.nombre}</span>}
                            {evento.creado_por && (
                              <span className="flex items-center gap-1">
                                <UserIcon className="w-3 h-3" />
                                {evento.creado_por.nombre}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status */}
                        <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded capitalize ${
                          evento.estado === 'completado' ? 'bg-green-50 text-green-700' :
                          evento.estado === 'cancelado' ? 'bg-gray-100 text-gray-500' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {evento.estado}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === "documentos" && (
              <div className="bg-white border border-gray-200 rounded-md p-5">
                <AdjuntosList caballoId={id} showActions={false} />
              </div>
            )}

            {activeTab === "propietarios" && (
              <div className="bg-white border border-gray-200 rounded-md p-5">
                <PropietariosList caballoId={id} />
              </div>
            )}

            {activeTab === "tareas" && (
              <div className="bg-white border border-gray-200 rounded-md p-5">
                <CaballoTareasTab
                  caballoId={id}
                  caballoNombre={caballo.nombre}
                  onTareaCreated={() => {}}
                />
              </div>
            )}
          </div>

          {/* QR Modal */}
          {showQRModal && (
            <QRCodeDisplay
              caballoId={id}
              caballoNombre={caballo.nombre}
              microchip={caballo.microchip || undefined}
              onClose={() => setShowQRModal(false)}
            />
          )}

          {/* Edit Modal */}
          <CaballoForm
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            onSuccess={updated => {
              setCaballo(updated);
              setShowEditModal(false);
              toast("Caballo actualizado", "success");
            }}
            caballo={caballo}
          />
        </div>
      )}
    </SimpleRoleGuard>
  );
}
