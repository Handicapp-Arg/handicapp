'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, User, Mail, Phone, Calendar, Briefcase, Building2 } from 'lucide-react';
import { gestionPersonalService, type Empleado } from '@/lib/gestionPersonalService';

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
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!empleado) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Empleado no encontrado</p>
          <Link href="/establecimiento/personal" className="text-emerald-600 hover:underline">
            Volver a Personal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/establecimiento/personal"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {empleado.nombre} {empleado.apellido}
          </h1>
          <p className="text-gray-500">{empleado.puesto}</p>
        </div>
      </div>

      {/* Información básica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{empleado.email}</p>
            </div>
          </div>
          {empleado.telefono && (
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="font-medium">{empleado.telefono}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Fecha de ingreso</p>
              <p className="font-medium">{new Date(empleado.fecha_ingreso).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Rol</p>
              <p className="font-medium">{empleado.rol_nombre}</p>
            </div>
          </div>
          {empleado.departamento && (
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Departamento</p>
                <p className="font-medium">{empleado.departamento}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-5 h-5" />
            <div>
              <p className="text-sm text-gray-500">Estado</p>
              <Badge variant={empleado.estado === 'activo' ? 'default' : 'secondary'}>
                {empleado.estado}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
