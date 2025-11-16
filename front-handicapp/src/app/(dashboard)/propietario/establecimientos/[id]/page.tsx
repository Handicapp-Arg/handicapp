'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Phone, Mail, Home, Building2, MapPin } from 'lucide-react';
import { establecimientoService, type Establecimiento } from '@/lib/services/establecimientoService';

export default function PropietarioEstablecimientoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [establecimiento, setEstablecimiento] = useState<Establecimiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = Number(params?.id);
    if (id) {
      loadEstablecimiento(id);
    }
  }, [params?.id]);

  const loadEstablecimiento = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await establecimientoService.getById(id);
      setEstablecimiento(data);
    } catch (err) {
      console.error('Error cargando establecimiento:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el establecimiento');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SimpleRoleGuard roles={['propietario']}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </SimpleRoleGuard>
    );
  }

  if (error || !establecimiento) {
    return (
      <SimpleRoleGuard roles={['propietario']}>
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-800 mb-4">{error || 'Establecimiento no encontrado'}</p>
            <button
              onClick={() => router.push('/propietario/establecimientos')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Volver
            </button>
          </div>
        </div>
      </SimpleRoleGuard>
    );
  }

  const est = establecimiento;

  return (
    <SimpleRoleGuard roles={['propietario']}>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 sm:px-8 py-6">
            <button
              onClick={() => router.push('/propietario/establecimientos')}
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

            {/* Mis caballos en este establecimiento */}
            {est.mis_caballos && est.mis_caballos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Mis Caballos Aquí</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {est.mis_caballos.map((caballo) => (
                      <Badge key={caballo.id} variant="outline" className="bg-emerald-50 border-emerald-300 text-emerald-700">
                        {caballo.nombre}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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
    </SimpleRoleGuard>
  );
}

