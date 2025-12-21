'use client';

/**
 * 🎨 CONFIGURACION LAYOUT - COMPONENTE REUTILIZABLE
 * Layout unificado para configuración de todos los roles
 * Sigue el patrón DRY (Don't Repeat Yourself) con configuración por rol
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Lock, Bell, Building2 } from 'lucide-react';
import ApiClient from '@/lib/services/apiClient';
import { LeafletAddressPicker } from '@/components/dashboard/LeafletAddressPicker';

// Tipos para las tabs disponibles
type TabType = 'perfil' | 'seguridad' | 'notificaciones' | 'establecimiento';

interface ConfiguracionTab {
  id: TabType;
  label: string;
  icon: typeof User;
}

interface ConfiguracionLayoutProps {
  /** Rol del usuario (para validación y personalización) */
  role: string;
  /** Tabs disponibles para este rol */
  availableTabs: TabType[];
  /** Título de la página (opcional, default: "Configuración") */
  title?: string;
  /** Descripción (opcional) */
  description?: string;
  /** Mostrar sección de establecimiento (solo para rol establecimiento) */
  hasEstablecimiento?: boolean;
}

interface Establecimiento {
  id: number;
  nombre: string;
  cuit?: string;
  direccion_calle?: string;
  direccion_numero?: string;
  direccion_complemento?: string;
  codigo_postal?: string;
  ciudad?: string;
  provincia?: string;
  pais?: string;
  latitud?: number;
  longitud?: number;
  descripcion?: string;
  cantidad_boxes?: number;
  telefono?: string;
  email?: string;
  superficie_hectareas?: number;
  tipo_establecimiento?: string;
  estado?: string;
  disciplina_principal?: string;
}

export function ConfiguracionLayout({
  availableTabs,
  title = 'Configuración',
  description = 'Gestiona tu información personal, seguridad y preferencias',
  hasEstablecimiento = false,
}: ConfiguracionLayoutProps) {
  const { user, refreshUser } = useAuthNew();
  const [activeTab, setActiveTab] = useState<TabType>(availableTabs[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Estados para perfil
  const [perfilData, setPerfilData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    telefono: user?.telefono || '',
    email: user?.email || '',
  });

  // Estados para contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Estados para notificaciones
  const [notificacionesData, setNotificacionesData] = useState({
    email_consultas: true,
    email_tratamientos: true,
    email_emergencias: true,
    push_enabled: true,
  });

  // Estados para establecimiento
  const [establecimiento, setEstablecimiento] = useState<Establecimiento | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    cuit: '',
    direccion_calle: '',
    direccion_numero: '',
    direccion_complemento: '',
    codigo_postal: '',
    ciudad: '',
    provincia: '',
    pais: 'Argentina',
    latitud: undefined as number | undefined,
    longitud: undefined as number | undefined,
    descripcion: '',
    cantidad_boxes: '',
    telefono: '',
    email: '',
    superficie_hectareas: '',
    tipo_establecimiento: 'mixto' as 'haras' | 'polo' | 'salto' | 'doma' | 'turf' | 'enduro' | 'mixto' | 'otro',
    estado: 'activo' as 'activo' | 'inactivo' | 'mantenimiento' | 'suspendido',
    disciplina_principal: ''
  });

  const lastSyncedUserDataRef = useRef<string>('');
  const isEstablecimientoLoadedRef = useRef(false);

  // Sincronizar datos de usuario
  useEffect(() => {
    if (user) {
      const currentUserData = JSON.stringify({
        nombre: user.nombre,
        apellido: user.apellido,
        telefono: user.telefono,
        email: user.email,
      });

      if (currentUserData !== lastSyncedUserDataRef.current) {
        setPerfilData({
          nombre: user.nombre || '',
          apellido: user.apellido || '',
          telefono: user.telefono || '',
          email: user.email || '',
        });
        lastSyncedUserDataRef.current = currentUserData;
      }
    }
  }, [user]);

  // Cargar datos de establecimiento si aplica
  useEffect(() => {
    const loadEstablecimiento = async () => {
      if (!hasEstablecimiento) return;

      // Para el rol establecimiento, el ID puede estar en user.establecimiento_id o user.id
      const establecimientoId = user?.establecimiento_id || user?.id;
      
      if (!establecimientoId) return;

      // Evitar cargas duplicadas
      if (isEstablecimientoLoadedRef.current && establecimiento?.id === establecimientoId) {
        return;
      }
      
      setLoading(true);
      try {
        const response = await ApiClient.makeRequest<Establecimiento>(
          `/establecimientos/${establecimientoId}`,
          { method: 'GET' }
        );
        
        // El ApiClient envuelve la respuesta en {success, message, data}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = (response as any).data || response;
        
        setEstablecimiento(data);
        
        // Actualizar formData con los datos del establecimiento
        setFormData({
          nombre: data.nombre || '',
          cuit: data.cuit || '',
          direccion_calle: data.direccion_calle || '',
          direccion_numero: data.direccion_numero || '',
          direccion_complemento: data.direccion_complemento || '',
          codigo_postal: data.codigo_postal || '',
          ciudad: data.ciudad || '',
          provincia: data.provincia || '',
          pais: data.pais || 'Argentina',
          latitud: data.latitud,
          longitud: data.longitud,
          descripcion: data.descripcion || '',
          cantidad_boxes: data.cantidad_boxes?.toString() || '',
          telefono: data.telefono || '',
          email: data.email || '',
          superficie_hectareas: data.superficie_hectareas?.toString() || '',
          tipo_establecimiento: (data.tipo_establecimiento || 'mixto') as 'haras' | 'polo' | 'salto' | 'doma' | 'turf' | 'enduro' | 'mixto' | 'otro',
          estado: (data.estado || 'activo') as 'activo' | 'inactivo' | 'mantenimiento' | 'suspendido',
          disciplina_principal: data.disciplina_principal || ''
        });
        
        isEstablecimientoLoadedRef.current = true;
      } catch (error) {
        console.error('Error al cargar establecimiento:', error);
        isEstablecimientoLoadedRef.current = false;
      } finally {
        setLoading(false);
      }
    };

    loadEstablecimiento();
  }, [hasEstablecimiento, user?.establecimiento_id, user?.id, establecimiento?.id]);

  // Handlers
  const handleUpdatePerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await ApiClient.makeRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
          nombre: perfilData.nombre,
          apellido: perfilData.apellido,
          telefono: perfilData.telefono,
        }),
      });

      await refreshUser();
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el perfil';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres' });
      setLoading(false);
      return;
    }

    try {
      await ApiClient.makeRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cambiar la contraseña';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitEstablecimiento = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!establecimiento?.id) {
      setMessage({ type: 'error', text: 'No se pudo identificar el establecimiento' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        ...formData,
        cantidad_boxes: formData.cantidad_boxes ? parseInt(formData.cantidad_boxes) : null,
        superficie_hectareas: formData.superficie_hectareas ? parseFloat(formData.superficie_hectareas) : null,
      };
      
      await ApiClient.makeRequest(`/establecimientos/${establecimiento.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      setMessage({ type: 'success', text: 'Establecimiento actualizado correctamente' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el establecimiento';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  // Configuración de tabs
  const allTabs: Record<TabType, ConfiguracionTab> = {
    perfil: { id: 'perfil', label: 'Información Personal', icon: User },
    seguridad: { id: 'seguridad', label: 'Seguridad', icon: Lock },
    notificaciones: { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
    establecimiento: { id: 'establecimiento', label: 'Establecimiento', icon: Building2 },
  };

  const tabs = availableTabs.map(tabId => allTabs[tabId]);

  // Validaciones
  const isPasswordLengthValid = passwordData.newPassword.trim().length >= 8;
  const passwordsMatch = passwordData.confirmPassword === '' || passwordData.newPassword === passwordData.confirmPassword;
  const isPasswordFormReady =
    passwordData.currentPassword.trim().length > 0 &&
    passwordData.newPassword.trim().length > 0 &&
    passwordData.confirmPassword.trim().length > 0 &&
    isPasswordLengthValid &&
    passwordsMatch;

  return (
    <Card>
      <CardHeader className="space-y-4">
        {/* Title and Description */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-xl sm:text-2xl">{title}</CardTitle>
            <CardDescription className="mt-1">{description}</CardDescription>
          </div>
        </div>

        {/* Alert Message */}
        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 -mb-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#af936f] text-[#af936f]'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Tab: Perfil */}
        {activeTab === 'perfil' && (
          <form onSubmit={handleUpdatePerfil} className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input 
                    id="nombre" 
                    value={perfilData.nombre} 
                    onChange={(e) => setPerfilData({ ...perfilData, nombre: e.target.value })} 
                    placeholder="Tu nombre" 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="apellido">Apellido *</Label>
                  <Input 
                    id="apellido" 
                    value={perfilData.apellido} 
                    onChange={(e) => setPerfilData({ ...perfilData, apellido: e.target.value })} 
                    placeholder="Tu apellido" 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={perfilData.email} 
                    disabled 
                    className="bg-gray-50 cursor-not-allowed" 
                  />
                  <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input 
                    id="telefono" 
                    type="tel" 
                    value={perfilData.telefono} 
                    onChange={(e) => setPerfilData({ ...perfilData, telefono: e.target.value })} 
                    placeholder="+54 11 1234-5678" 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                <Button type="submit" disabled={loading} className="bg-[#af936f] hover:bg-[#9a8160]">
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Tab: Seguridad */}
        {activeTab === 'seguridad' && (
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Cambiar Contraseña</h3>
              <p className="text-sm text-gray-600 mb-6">Actualiza tu contraseña para mantener tu cuenta segura</p>

              <div className="space-y-4 max-w-md">
                <div>
                  <Label htmlFor="currentPassword">Contraseña Actual *</Label>
                  <Input 
                    id="currentPassword" 
                    type="password" 
                    value={passwordData.currentPassword} 
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="newPassword">Nueva Contraseña *</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    value={passwordData.newPassword} 
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} 
                    required 
                    minLength={8} 
                  />
                  <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
                  {passwordData.newPassword && !isPasswordLengthValid && (
                    <p className="text-xs text-red-500 mt-1">La contraseña debe tener al menos 8 caracteres</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña *</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={passwordData.confirmPassword} 
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} 
                    required 
                  />
                  {passwordData.confirmPassword && !passwordsMatch && (
                    <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                <Button 
                  type="submit" 
                  disabled={loading || !isPasswordFormReady} 
                  className="bg-[#af936f] hover:bg-[#9a8160] disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
                >
                  {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Tab: Notificaciones */}
        {activeTab === 'notificaciones' && (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Preferencias de Notificaciones</h3>
              <p className="text-sm text-gray-600 mb-6">Configura cómo quieres recibir notificaciones</p>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div>
                    <p className="font-medium text-gray-900">Consultas y Actividades</p>
                    <p className="text-sm text-gray-600">Notificaciones sobre nuevas consultas asignadas</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notificacionesData.email_consultas} 
                      onChange={(e) => setNotificacionesData({ ...notificacionesData, email_consultas: e.target.checked })} 
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#af936f]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#af936f]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div>
                    <p className="font-medium text-gray-900">Recordatorios</p>
                    <p className="text-sm text-gray-600">Recordatorios sobre tareas y eventos importantes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notificacionesData.email_tratamientos} 
                      onChange={(e) => setNotificacionesData({ ...notificacionesData, email_tratamientos: e.target.checked })} 
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#af936f]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#af936f]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div>
                    <p className="font-medium text-gray-900">Notificaciones Importantes</p>
                    <p className="text-sm text-gray-600">Alertas urgentes que requieren atención inmediata</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notificacionesData.email_emergencias} 
                      onChange={(e) => setNotificacionesData({ ...notificacionesData, email_emergencias: e.target.checked })} 
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#af936f]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#af936f]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div>
                    <p className="font-medium text-gray-900">Notificaciones Push</p>
                    <p className="text-sm text-gray-600">Activa notificaciones push en tu dispositivo</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={notificacionesData.push_enabled} 
                      onChange={(e) => setNotificacionesData({ ...notificacionesData, push_enabled: e.target.checked })} 
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#af936f]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#af936f]"></div>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t mt-6">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Las preferencias de notificaciones se guardarán automáticamente en una próxima actualización
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Establecimiento (solo para rol establecimiento) */}
        {activeTab === 'establecimiento' && hasEstablecimiento && (
          <form onSubmit={handleSubmitEstablecimiento} className="space-y-6">
            {/* Información Básica */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Información básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Nombre del Establecimiento *
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#af936f] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="cuit" className="block text-sm font-medium text-gray-700 mb-1.5">
                    CUIT
                  </label>
                  <input
                    type="text"
                    id="cuit"
                    name="cuit"
                    value={formData.cuit}
                    onChange={(e) => setFormData({ ...formData, cuit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#af936f] focus:border-transparent"
                    placeholder="20-12345678-9"
                  />
                </div>
              </div>
            </div>

            {/* Dirección con Mapa */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Dirección y Ubicación</h3>
              
              {/* Mapa interactivo */}
              <div className="mb-6">
                <LeafletAddressPicker
                  value={{
                    direccion_calle: formData.direccion_calle,
                    direccion_numero: formData.direccion_numero,
                    direccion_complemento: formData.direccion_complemento,
                    ciudad: formData.ciudad,
                    provincia: formData.provincia,
                    codigo_postal: formData.codigo_postal,
                    pais: formData.pais,
                    latitud: formData.latitud,
                    longitud: formData.longitud,
                  }}
                  onChange={(addressData: {
                    direccion_calle: string;
                    direccion_numero?: string;
                    direccion_complemento?: string;
                    codigo_postal?: string;
                    ciudad?: string;
                    provincia?: string;
                    pais?: string;
                    latitud?: number;
                    longitud?: number;
                  }) => {
                    setFormData({
                      ...formData,
                      direccion_calle: addressData.direccion_calle || '',
                      direccion_numero: addressData.direccion_numero || '',
                      direccion_complemento: addressData.direccion_complemento || '',
                      ciudad: addressData.ciudad || '',
                      provincia: addressData.provincia || '',
                      codigo_postal: addressData.codigo_postal || '',
                      pais: addressData.pais || 'Argentina',
                      latitud: addressData.latitud,
                      longitud: addressData.longitud,
                    });
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="submit" disabled={loading} className="bg-[#af936f] hover:bg-[#9a8160]">
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
