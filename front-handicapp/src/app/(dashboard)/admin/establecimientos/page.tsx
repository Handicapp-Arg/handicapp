'use client';

import React, { useState } from 'react';
import { EstablecimientoList } from '@/components/dashboard/EstablecimientoList';
import { EstablecimientoForm } from '@/components/dashboard/EstablecimientoForm';
import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Phone, Mail, Home, Power, PowerOff, Plus, ArrowLeft, Users } from 'lucide-react';
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
                {est.verificado && (
                  <Badge className="bg-blue-100 text-blue-700">
                    ✓ Verificado
                  </Badge>
                )}
              </div>

              {/* Descripción */}
              {est.descripcion && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Descripción</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 whitespace-pre-wrap">{est.descripcion}</p>
                  </CardContent>
                </Card>
              )}

              {/* Información de contacto */}
              {(est.telefono || est.email || est.direccion) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contacto y Ubicación</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {est.direccion && (
                      <div className="flex items-start gap-2 text-gray-700">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="block">{est.direccion}</span>
                          {(est.ciudad || est.provincia) && (
                            <span className="text-sm text-gray-500">
                              {[est.ciudad, est.provincia].filter(Boolean).join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    {est.telefono && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a href={`tel:${est.telefono}`} className="hover:text-blue-600 transition-colors">
                          {est.telefono}
                        </a>
                      </div>
                    )}
                    {est.email && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a href={`mailto:${est.email}`} className="hover:text-blue-600 transition-colors truncate">
                          {est.email}
                        </a>
                      </div>
                    )}
                    {(est.latitud && est.longitud) && (
                      <div className="flex items-center gap-2 text-gray-700 text-sm pt-2 border-t">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-500">
                          Coordenadas: {typeof est.latitud === 'number' ? est.latitud.toFixed(6) : est.latitud}, {typeof est.longitud === 'number' ? est.longitud.toFixed(6) : est.longitud}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Administrador del establecimiento */}
              {est.usuarios && est.usuarios.length > 0 && (() => {
                const adminUser = est.usuarios.find((u: any) => u.rol?.clave === 'establecimiento');
                return adminUser ? (
                  <Card className="border-2 border-blue-200 bg-blue-50/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-blue-900">
                        <Users className="w-5 h-5" />
                        Administrador del Establecimiento
                      </CardTitle>
                      <CardDescription className="text-blue-700">
                        Usuario principal con permisos de administración
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                            <span className="text-white font-bold text-lg">
                              {adminUser.nombre?.[0]}{adminUser.apellido?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-lg">
                              {adminUser.nombre} {adminUser.apellido}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
                              <Mail className="w-4 h-4" />
                              {adminUser.email}
                            </p>
                            {adminUser.creado_el && (
                              <p className="text-xs text-gray-500 mt-1">
                                Creado: {new Date(adminUser.creado_el).toLocaleDateString('es-AR')}
                              </p>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-blue-600 text-white px-3 py-1">
                          👑 Administrador
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ) : null;
              })()}

              {/* Otros usuarios del establecimiento */}
              {est.usuarios && est.usuarios.length > 0 && (() => {
                const otherUsers = est.usuarios.filter((u: any) => u.rol?.clave !== 'establecimiento');
                return otherUsers.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Personal del Establecimiento
                      </CardTitle>
                      <CardDescription>
                        Otros usuarios con acceso a este establecimiento
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {otherUsers.map((usuario: any) => (
                          <div 
                            key={usuario.id} 
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-600 font-semibold">
                                  {usuario.nombre?.[0]}{usuario.apellido?.[0]}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {usuario.nombre} {usuario.apellido}
                                </p>
                                <p className="text-sm text-gray-500">{usuario.email}</p>
                              </div>
                            </div>
                            <Badge variant="secondary" className="capitalize">
                              {usuario.rol?.nombre || usuario.rol?.clave || 'Usuario'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ) : null;
              })()}

              {/* Información adicional */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(est.superficie_hectareas || est.cantidad_boxes || est.cantidad_paddocks) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Instalaciones</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {est.superficie_hectareas && (
                        <div className="flex items-center justify-between text-gray-700">
                          <div className="flex items-center gap-2">
                            <Home className="w-4 h-4 text-gray-400" />
                            <span>Superficie</span>
                          </div>
                          <span className="font-medium">{est.superficie_hectareas} ha</span>
                        </div>
                      )}
                      {est.cantidad_boxes && (
                        <div className="flex items-center justify-between text-gray-700">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span>Boxes</span>
                          </div>
                          <span className="font-medium">{est.cantidad_boxes}</span>
                        </div>
                      )}
                      {est.cantidad_paddocks && (
                        <div className="flex items-center justify-between text-gray-700">
                          <div className="flex items-center gap-2">
                            <Home className="w-4 h-4 text-gray-400" />
                            <span>Paddocks</span>
                          </div>
                          <span className="font-medium">{est.cantidad_paddocks}</span>
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

              {/* Servicios Disponibles */}
              {est.servicios_disponibles && est.servicios_disponibles.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Servicios Disponibles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {est.servicios_disponibles.map((servicio, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-50">
                          {servicio}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Mapa */}
              {(est.latitud && est.longitud) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-gray-600" />
                      Ubicación en el Mapa
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="w-full h-[400px] rounded-b-lg overflow-hidden">
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={`https://maps.google.com/maps?q=${est.latitud},${est.longitud}&z=15&output=embed`}
                        allowFullScreen
                        title={`Mapa de ${est.nombre}`}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Información Adicional del Sistema */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Rating y Reseñas */}
                {(est.rating_promedio !== undefined || est.total_resenas !== undefined) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Valoraciones</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {est.rating_promedio !== undefined && typeof est.rating_promedio === 'number' && (
                        <div className="flex justify-between text-gray-700">
                          <span>Rating Promedio:</span>
                          <span className="font-medium">
                            {'⭐'.repeat(Math.round(est.rating_promedio))} ({est.rating_promedio.toFixed(1)})
                          </span>
                        </div>
                      )}
                      {est.total_resenas !== undefined && (
                        <div className="flex justify-between text-gray-700">
                          <span>Total de Reseñas:</span>
                          <span className="font-medium">{est.total_resenas}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Información del Sistema */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información del Sistema</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-700">
                      <span>ID:</span>
                      <span className="font-medium font-mono">#{est.id}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Propietario ID:</span>
                      <span className="font-medium font-mono">#{est.propietario_id}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Creado:</span>
                      <span className="font-medium">
                        {new Date(est.creado_el).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Última Actualización:</span>
                      <span className="font-medium">
                        {new Date(est.actualizado_el).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
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
