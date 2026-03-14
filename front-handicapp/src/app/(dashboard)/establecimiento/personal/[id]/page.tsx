'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  Building2,
  FileText,
  Shield,
  Clock
} from 'lucide-react';
import { gestionPersonalService, type Empleado } from '@/lib/gestionPersonalService';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';

export default function EmpleadoDetallePage() {
  const params = useParams();
  const [empleado, setEmpleado] = useState<Empleado | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEmpleado = async () => {
      try {
        const id = Number(params.id);
        const data = await gestionPersonalService.getEmpleado(id);
        setEmpleado(data);
      } catch (error) {
        console.error('Error cargando empleado:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEmpleado();
  }, [params.id]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!empleado) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Empleado no encontrado</h2>
            <p className="text-gray-500 mb-6">No se pudo encontrar la información del empleado solicitado.</p>
            <Link 
              href="/establecimiento/personal" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Personal
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      activo: { className: 'bg-green-100 text-green-800 border-green-300', label: 'Activo' },
      inactivo: { className: 'bg-gray-100 text-gray-800 border-gray-300', label: 'Inactivo' },
      suspendido: { className: 'bg-red-100 text-red-800 border-red-300', label: 'Suspendido' },
    };
    const variant = variants[estado] || variants.activo;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 p-8">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
        
        <div className="relative">
          <Link
            href="/establecimiento/personal"
            className="inline-flex items-center gap-2 text-emerald-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a Personal
          </Link>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {empleado.nombre} {empleado.apellido}
                </h1>
                <p className="text-emerald-200 text-lg mt-1">
                  {typeof empleado.puesto === 'string' 
                    ? empleado.puesto 
                    : empleado.puesto?.nombre || 'Sin puesto asignado'}
                </p>
              </div>
            </div>
            <div>
              {getEstadoBadge(empleado.estado)}
            </div>
          </div>
        </div>
      </div>

      {/* Información Personal */}
      <Card className="rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="font-semibold text-gray-900 truncate">{empleado.email}</p>
              </div>
            </div>

            {empleado.telefono && (
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-500">Teléfono</p>
                  <p className="font-semibold text-gray-900">{empleado.telefono}</p>
                </div>
              </div>
            )}

            {empleado.documento && (
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-500">Documento</p>
                  <p className="font-semibold text-gray-900">{empleado.documento}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-amber-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-500">Fecha de ingreso</p>
                <p className="font-semibold text-gray-900">
                  {new Date(empleado.fecha_ingreso).toLocaleDateString('es-AR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información Laboral */}
      <Card className="rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            Información Laboral
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-500">Rol</p>
                <p className="font-semibold text-gray-900">{empleado.rol_nombre}</p>
              </div>
            </div>

            {empleado.departamento && (
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-cyan-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-500">Departamento</p>
                  <p className="font-semibold text-gray-900">
                    {typeof empleado.departamento === 'string' 
                      ? empleado.departamento 
                      : empleado.departamento.nombre}
                  </p>
                </div>
              </div>
            )}

            {empleado.puesto && (
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-orange-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-500">Puesto</p>
                  <p className="font-semibold text-gray-900">
                    {typeof empleado.puesto === 'string' 
                      ? empleado.puesto 
                      : empleado.puesto.nombre}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-rose-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-500">Estado</p>
                <div className="mt-1">
                  {getEstadoBadge(empleado.estado)}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información Adicional */}
      {empleado.creado_el && (
        <Card className="rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              Información del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-slate-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-500">Fecha de registro</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(empleado.creado_el).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
