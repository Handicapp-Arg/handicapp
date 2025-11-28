import React from 'react';
import { usePathname } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Phone, Mail, Home, Building2, MapPin, Power, PowerOff, Plus, Users } from 'lucide-react';

export default function EstablecimientoDetailView({ establecimiento }: { establecimiento: any }) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const isPropietario = pathname.includes('/propietario/');
  if (!establecimiento) return null;
  const est = establecimiento;
  return (
    <div className="mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 sm:px-8 py-6">
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
          {(est.telefono || est.email || est.direccion || (est.latitud && est.longitud)) && (
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
                      Coordenadas: {typeof est.latitud === 'number' ? est.latitud.toFixed(8) : est.latitud}, {typeof est.longitud === 'number' ? est.longitud.toFixed(8) : est.longitud}
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
                  {est.servicios_disponibles.map((servicio: any, index: number) => (
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
                  <MapPin className="w-4 h-4 text-gray-600" />
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

            {/* Información del Sistema solo para admin */}
            {!isPropietario && (
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
                      {est.creado_el ? new Date(est.creado_el).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Última Actualización:</span>
                    <span className="font-medium">
                      {est.actualizado_el ? new Date(est.actualizado_el).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : '-'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
