'use client';

import React, { useState } from 'react';
import { EstablecimientoList } from '@/components/dashboard/EstablecimientoList';
import { EstablecimientoForm } from '@/components/dashboard/EstablecimientoForm';
import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Phone, Mail, Home, Power, PowerOff, Plus, ArrowLeft } from 'lucide-react';
import { type Establecimiento, establecimientoService } from '@/lib/services/establecimientoService';

export default function AdminEstablecimientosPage() {
  const [view, setView] = useState<'list' | 'create' | 'edit' | 'detail'>('list');
  const [selectedEstablecimiento, setSelectedEstablecimiento] = useState<Establecimiento | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleCreateNew = () => {
    setSelectedEstablecimiento(null);
    setView('create');
  };

  const handleEdit = (establecimiento: Establecimiento) => {
    setSelectedEstablecimiento(establecimiento);
    setView('edit');
  };

  const handleSave = (establecimiento: Establecimiento) => {
    setView('list');
    setSelectedEstablecimiento(null);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedEstablecimiento(null);
  };

  const handleSelect = (establecimiento: Establecimiento) => {
    setSelectedEstablecimiento(establecimiento);
  };

  const handleViewDetails = (establecimiento: Establecimiento) => {
    console.log('🔍 handleViewDetails llamado con:', establecimiento);
    setSelectedEstablecimiento(establecimiento);
    setView('detail');
  };

  const handleToggleStatus = async () => {
    if (!selectedEstablecimiento) return;

    const nuevoEstado = selectedEstablecimiento.estado === 'activo' ? 'inactivo' : 'activo';
    
    try {
      setUpdatingStatus(true);
      const updated = await establecimientoService.update(selectedEstablecimiento.id, {
        estado: nuevoEstado as 'activo' | 'inactivo'
      });
      
      // Actualizar el establecimiento seleccionado con el nuevo estado
      setSelectedEstablecimiento({
        ...selectedEstablecimiento,
        estado: updated.estado
      });
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('Error al actualizar el estado del establecimiento');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (view === 'create') {
    return (
      <SimpleAdminOnly>
        <div className="mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            <EstablecimientoForm
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </SimpleAdminOnly>
    );
  }

  if (view === 'edit' && selectedEstablecimiento) {
    return (
      <SimpleAdminOnly>
        <div className="mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            <EstablecimientoForm
              establecimiento={selectedEstablecimiento}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </SimpleAdminOnly>
    );
  }

  if (view === 'detail' && selectedEstablecimiento) {
    const est = selectedEstablecimiento;
    return (
      <SimpleAdminOnly>
        <div className="mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 sm:px-8 py-6">
              <button
                onClick={() => setView('list')}
                className="mb-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver a la lista
              </button>
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{est.nombre}</h1>
                  <div className="flex items-center gap-4 text-white/70 text-sm">
                    {est.direccion && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{est.direccion}</span>
                      </div>
                    )}
                    {est.ciudad && est.provincia && (
                      <span>{est.ciudad}, {est.provincia}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleToggleStatus}
                    disabled={updatingStatus}
                    className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-2 ${
                      est.estado === 'activo'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {updatingStatus ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Actualizando...
                      </>
                    ) : est.estado === 'activo' ? (
                      <>
                        <PowerOff className="w-4 h-4" />
                        Desactivar
                      </>
                    ) : (
                      <>
                        <Power className="w-4 h-4" />
                        Activar
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setView('edit');
                    }}
                    className="px-4 py-2 bg-white text-slate-900 rounded-lg hover:bg-white/90 transition-colors font-medium text-sm"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="capitalize">
                  {est.tipo_establecimiento}
                </Badge>
                <Badge 
                  className={
                    est.estado === 'activo' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }
                >
                  {est.estado}
                </Badge>
              </div>

              {/* Información de contacto */}
              {(est.telefono || est.email) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contacto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {est.telefono && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{est.telefono}</span>
                      </div>
                    )}
                    {est.email && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{est.email}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Información adicional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(est.superficie_hectareas || est.cantidad_boxes) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Instalaciones</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {est.superficie_hectareas && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Home className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{est.superficie_hectareas}</span>
                          <span className="text-gray-500">hectáreas</span>
                        </div>
                      )}
                      {est.cantidad_boxes && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="font-medium">{est.cantidad_boxes}</span>
                          <span className="text-gray-500">boxes</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {est._count && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Estadísticas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {est._count.usuarios !== undefined && (
                        <div className="flex justify-between text-gray-700">
                          <span>Usuarios:</span>
                          <span className="font-medium">{est._count.usuarios}</span>
                        </div>
                      )}
                      {est._count.caballos !== undefined && (
                        <div className="flex justify-between text-gray-700">
                          <span>Caballos:</span>
                          <span className="font-medium">{est._count.caballos}</span>
                        </div>
                      )}
                      {est._count.eventos !== undefined && (
                        <div className="flex justify-between text-gray-700">
                          <span>Eventos:</span>
                          <span className="font-medium">{est._count.eventos}</span>
                        </div>
                      )}
                      {est._count.tareas !== undefined && (
                        <div className="flex justify-between text-gray-700">
                          <span>Tareas:</span>
                          <span className="font-medium">{est._count.tareas}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </SimpleAdminOnly>
    );
  }

  return (
    <SimpleAdminOnly>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header compacto */}
        <div className="bg-[#0f172a] rounded-2xl shadow-xl mb-6 px-6 sm:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
                Gestión de Establecimientos
              </h1>
              <p className="text-sm text-white/70">
                Administra establecimientos ecuestres y sus configuraciones
              </p>
            </div>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-white/90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="w-5 h-5" />
              Nuevo Establecimiento
            </button>
          </div>
        </div>

        {/* List Component */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <EstablecimientoList 
            showAll={true} 
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
          />
        </div>
        </div>
      </div>
    </SimpleAdminOnly>
  );
}
