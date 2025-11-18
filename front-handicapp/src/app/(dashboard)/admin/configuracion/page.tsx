'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import ApiClient from '@/lib/services/apiClient';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Building2, MapPin, Phone, Mail } from 'lucide-react';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';

interface Establecimiento {
  id: number;
  nombre: string;
  direccion?: string;
  capacidad?: number;
  telefono?: string;
  email?: string;
  superficie_hectareas?: number;
}

export default function AdminConfiguracionPage() {
  const { user } = useAuthNew();
  const [establecimiento, setEstablecimiento] = useState<Establecimiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    capacidad: '',
    telefono: '',
    email: '',
    superficie_hectareas: ''
  });

  useEffect(() => {
    fetchEstablecimiento();
  }, [user]);

  const fetchEstablecimiento = async () => {
    try {
      setLoading(true);
      const response: any = await ApiClient.makeRequest('/establecimientos', {
        method: 'GET'
      });
      
      if (response?.data?.items && response.data.items.length > 0) {
        const est = response.data.items[0];
        setEstablecimiento(est);
        setFormData({
          nombre: est.nombre || '',
          direccion: est.direccion || '',
          capacidad: est.capacidad?.toString() || '',
          telefono: est.telefono || '',
          email: est.email || '',
          superficie_hectareas: est.superficie_hectareas?.toString() || ''
        });
      }
    } catch (error) {
      console.error('Error fetching establecimiento:', error);
      setMessage({ type: 'error', text: 'Error al cargar los datos del establecimiento' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!establecimiento?.id) {
      setMessage({ type: 'error', text: 'No se encontró el establecimiento' });
      return;
    }

    try {
      setSaving(true);
      setMessage(null);

      const updateData = {
        nombre: formData.nombre,
        direccion: formData.direccion,
        capacidad: parseInt(formData.capacidad) || undefined,
        telefono: formData.telefono,
        email: formData.email,
        superficie_hectareas: parseFloat(formData.superficie_hectareas) || undefined
      };

      await ApiClient.makeRequest(`/establecimientos/${establecimiento.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      setMessage({ type: 'success', text: 'Configuración guardada exitosamente' });
      await fetchEstablecimiento();
    } catch (error: any) {
      console.error('Error saving configuration:', error);
      setMessage({ 
        type: 'error', 
        text: error?.message || 'Error al guardar la configuración' 
      });
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => ({
    capacidad: formData.capacidad || '0',
    superficie: formData.superficie_hectareas || '0',
    contactos: [formData.telefono, formData.email].filter(Boolean).length,
    completado: Math.round(
      ([formData.nombre, formData.direccion, formData.capacidad, formData.telefono, formData.email, formData.superficie_hectareas]
        .filter(Boolean).length / 6) * 100
    )
  }), [formData]);

  if (loading) {
    return <LoadingSpinnerFullPage label="Cargando..." variant="primary" />;
  }

  return (
    <SimpleRoleGuard roles={['admin']}>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-slate-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-500/20 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-8 h-8 text-slate-400" />
              <h1 className="text-3xl font-bold text-white">Configuración</h1>
            </div>
            <p className="text-slate-300 text-lg">
              Gestiona la información y configuración de tu establecimiento
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Capacidad</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.capacidad}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Caballos
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Superficie</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.superficie}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  Hectáreas
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Contactos</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.contactos}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Datos
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Completado</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.completado}%</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                  Perfil
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert Message */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {/* Configuration Form */}
        <Card className="rounded-2xl shadow-xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-slate-600" />
              <div>
                <h3 className="font-semibold text-lg">Información General</h3>
                <CardDescription>Actualiza los datos básicos de tu establecimiento</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Establecimiento *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="Ej: Haras San Jorge"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email de Contacto
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="contacto@establecimiento.com"
                  />
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="+54 11 1234-5678"
                  />
                </div>

                <div>
                  <label htmlFor="capacidad" className="block text-sm font-medium text-gray-700 mb-2">
                    Capacidad (Caballos)
                  </label>
                  <input
                    type="number"
                    id="capacidad"
                    name="capacidad"
                    value={formData.capacidad}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="150"
                  />
                </div>

                <div>
                  <label htmlFor="superficie_hectareas" className="block text-sm font-medium text-gray-700 mb-2">
                    Superficie (Hectáreas)
                  </label>
                  <input
                    type="number"
                    id="superficie_hectareas"
                    name="superficie_hectareas"
                    value={formData.superficie_hectareas}
                    onChange={handleInputChange}
                    min="0"
                    step="0.1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                    placeholder="85.5"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <textarea
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
                  placeholder="Ruta 9, km 45, Buenos Aires"
                />
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={fetchEstablecimiento}
                  disabled={saving}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </SimpleRoleGuard>
  );
}
