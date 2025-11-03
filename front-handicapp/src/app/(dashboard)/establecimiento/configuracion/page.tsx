'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import ApiClient from '@/lib/services/apiClient';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Settings, Building2, MapPin, Phone, Mail } from 'lucide-react';

interface Establecimiento {
  id: number;
  nombre: string;
  direccion_calle?: string;
  cantidad_boxes?: number;
  telefono?: string;
  email?: string;
  superficie_hectareas?: number;
}

export default function EstablecimientoConfiguracionPage() {
  const { user } = useAuthNew();
  const [establecimiento, setEstablecimiento] = useState<Establecimiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    direccion_calle: '',
    cantidad_boxes: '',
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
      
      console.log('📥 Respuesta GET establecimientos:', response);
      
      let est = null;
      
      // Manejar diferentes estructuras de respuesta
      if (response?.data?.items && response.data.items.length > 0) {
        est = response.data.items[0];
      } else if (response?.data && !Array.isArray(response.data) && response.data.id) {
        est = response.data;
      } else if (response?.items && response.items.length > 0) {
        est = response.items[0];
      } else if (Array.isArray(response) && response.length > 0) {
        est = response[0];
      } else if (response?.id) {
        est = response;
      }
      
      if (est) {
        console.log('✅ Establecimiento encontrado:', est);
        setEstablecimiento(est);
        setFormData({
          nombre: est.nombre || '',
          direccion_calle: est.direccion_calle || '',
          cantidad_boxes: est.cantidad_boxes?.toString() || '',
          telefono: est.telefono || '',
          email: est.email || '',
          superficie_hectareas: est.superficie_hectareas?.toString() || ''
        });
      } else {
        console.warn('⚠️ No se encontró establecimiento en la respuesta');
      }
    } catch (error) {
      console.error('❌ Error fetching establecimiento:', error);
      setMessage({ type: 'error', text: 'Error al cargar los datos del establecimiento' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    if (establecimiento) {
      setFormData({
        nombre: establecimiento.nombre || '',
        direccion_calle: establecimiento.direccion_calle || '',
        cantidad_boxes: establecimiento.cantidad_boxes?.toString() || '',
        telefono: establecimiento.telefono || '',
        email: establecimiento.email || '',
        superficie_hectareas: establecimiento.superficie_hectareas?.toString() || ''
      });
      setMessage(null);
    }
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

      // Construir objeto solo con campos que tienen valores válidos
      const updateData: any = {
        nombre: formData.nombre,
      };

      // Dirección: solo enviar si tiene 5+ caracteres
      if (formData.direccion_calle && formData.direccion_calle.trim().length >= 5) {
        updateData.direccion_calle = formData.direccion_calle.trim();
      }
      // Si está vacío o muy corto, simplemente no enviar el campo
      
      // Cantidad de boxes: solo enviar si es un número válido > 0
      if (formData.cantidad_boxes && parseInt(formData.cantidad_boxes) > 0) {
        updateData.cantidad_boxes = parseInt(formData.cantidad_boxes);
      }
      // Si está vacío, no enviar el campo
      
      // Teléfono: solo enviar si tiene valor
      if (formData.telefono && formData.telefono.trim()) {
        updateData.telefono = formData.telefono.trim();
      }
      
      // Email: solo enviar si tiene valor
      if (formData.email && formData.email.trim()) {
        updateData.email = formData.email.trim();
      }
      
      // Superficie: solo enviar si es un número válido > 0
      if (formData.superficie_hectareas && parseFloat(formData.superficie_hectareas) > 0) {
        updateData.superficie_hectareas = parseFloat(formData.superficie_hectareas);
      }

      console.log('📤 Enviando datos:', updateData);
      console.log('📍 Al endpoint:', `/establecimientos/${establecimiento.id}`);

      const response = await ApiClient.makeRequest(`/establecimientos/${establecimiento.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      console.log('✅ Respuesta del backend:', response);
      console.log('✅ Respuesta completa:', JSON.stringify(response, null, 2));

      // Actualizar el establecimiento con los datos que acabamos de guardar
      if (establecimiento) {
        const updatedEstablecimiento = {
          ...establecimiento,
          ...updateData
        };
        setEstablecimiento(updatedEstablecimiento);
        
        console.log('✅ Estado actualizado localmente:', updatedEstablecimiento);
        console.log('✅ FormData actual:', formData);
      }

      setMessage({ type: 'success', text: 'Configuración guardada exitosamente' });
    } catch (error: any) {
      console.error('❌ Error completo:', error);
      console.error('❌ Error message:', error?.message);
      console.error('❌ Error details:', error?.details);
      console.error('❌ Error stack:', error?.stack);
      
      let errorMessage = 'Error al guardar la configuración';
      
      if (error?.message) {
        errorMessage = error.message;
      }
      
      if (error?.details && Array.isArray(error.details)) {
        errorMessage += '\n- ' + error.details.join('\n- ');
      }
      
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo(() => ({
    capacidad: formData.cantidad_boxes || '0',
    superficie: formData.superficie_hectareas || '0',
    contactos: [formData.telefono, formData.email].filter(Boolean).length,
    completado: Math.round(
      ([formData.nombre, formData.direccion_calle, formData.cantidad_boxes, formData.telefono, formData.email, formData.superficie_hectareas]
        .filter(Boolean).length / 6) * 100
    )
  }), [formData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['establecimiento']}>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/20 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-8 h-8 text-emerald-400" />
              <h1 className="text-3xl font-bold text-white">Configuración</h1>
            </div>
            <p className="text-slate-300 text-lg">
              Gestiona la información y configuración de tu establecimiento
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Capacidad</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.capacidad}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  Caballos
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
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

          <Card className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
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

          <Card className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
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
              <Building2 className="w-6 h-6 text-emerald-600" />
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="+54 11 1234-5678"
                  />
                </div>

                <div>
                  <label htmlFor="cantidad_boxes" className="block text-sm font-medium text-gray-700 mb-2">
                    Capacidad (Caballos)
                  </label>
                  <input
                    type="number"
                    id="cantidad_boxes"
                    name="cantidad_boxes"
                    value={formData.cantidad_boxes}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="85.5"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="direccion_calle" className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <textarea
                  id="direccion_calle"
                  name="direccion_calle"
                  value={formData.direccion_calle}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                  placeholder="Ruta 9, km 45, Buenos Aires"
                  minLength={5}
                  maxLength={500}
                />
                {formData.direccion_calle && formData.direccion_calle.length > 0 && formData.direccion_calle.length < 5 && (
                  <p className="mt-1 text-sm text-red-600">
                    La dirección debe tener al menos 5 caracteres
                  </p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Mínimo 5 caracteres (opcional)
                </p>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all disabled:opacity-50 flex items-center gap-2"
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
