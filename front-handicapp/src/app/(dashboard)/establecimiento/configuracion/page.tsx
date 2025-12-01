'use client';

import React, { useEffect, useState, useRef } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import ApiClient from '@/lib/services/apiClient';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, User } from 'lucide-react';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';
import { LeafletAddressPicker } from '@/components/dashboard/LeafletAddressPicker';

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

type TabType = 'establecimiento' | 'cuenta';

export default function EstablecimientoConfiguracionPage() {
  const { user, refreshUser } = useAuthNew();
  const [activeTab, setActiveTab] = useState<TabType>('establecimiento');
  const [establecimiento, setEstablecimiento] = useState<Establecimiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    cuit: '',
    direccion_calle: '',
    direccion_numero: '',
    direccion_complemento: '',
    codigo_postal: '',
    ciudad: '',
    provincia: '',
    pais: '',
    latitud: undefined as number | undefined,
    longitud: undefined as number | undefined,
    descripcion: '',
    cantidad_boxes: '',
    telefono: '',
    email: '',
    superficie_hectareas: '',
    tipo_establecimiento: 'mixto',
    estado: 'activo',
    disciplina_principal: ''
  });

  const [accountData, setAccountData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Ref para rastrear cambios en los datos del usuario
  const lastSyncedUserDataRef = useRef<string>('');

  useEffect(() => {
    fetchEstablecimiento();
  }, []);

  // Sincronizar accountData con user cuando cambia
  useEffect(() => {
    if (!user) return;
    
    const currentUserData = JSON.stringify({
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      telefono: user.telefono
    });
    
    const hasUserDataChanged = currentUserData !== lastSyncedUserDataRef.current;
    
    if (hasUserDataChanged) {
      setAccountData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        telefono: user.telefono || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      lastSyncedUserDataRef.current = currentUserData;
    }
  }, [user, user?.id, user?.nombre, user?.apellido, user?.email, user?.telefono]);

  const fetchEstablecimiento = async () => {
    try {
      setLoading(true);
      const response = await ApiClient.makeRequest('/establecimientos', {
        method: 'GET'
      }) as unknown;
      
      let est: Establecimiento | null = null;
      
      if (typeof response === 'object' && response !== null) {
        const r = response as Record<string, unknown>;
        
        if (r.data && typeof r.data === 'object') {
          const data = r.data as Record<string, unknown>;
          if (Array.isArray(data.items) && data.items.length > 0) {
            est = data.items[0] as Establecimiento;
          } else if (data.id) {
            est = data as unknown as Establecimiento;
          }
        } else if (Array.isArray(r.items) && r.items.length > 0) {
          est = r.items[0] as Establecimiento;
        } else if (Array.isArray(response) && response.length > 0) {
          est = response[0] as Establecimiento;
        } else if (r.id) {
          est = r as unknown as Establecimiento;
        }
      }
      
      if (est) {
        setEstablecimiento(est);
        setFormData({
          nombre: est.nombre || '',
          cuit: est.cuit || '',
          direccion_calle: est.direccion_calle || '',
          direccion_numero: est.direccion_numero || '',
          direccion_complemento: est.direccion_complemento || '',
          codigo_postal: est.codigo_postal || '',
          ciudad: est.ciudad || '',
          provincia: est.provincia || '',
          pais: est.pais || '',
          latitud: est.latitud,
          longitud: est.longitud,
          descripcion: est.descripcion || '',
          cantidad_boxes: est.cantidad_boxes?.toString() || '',
          telefono: est.telefono || '',
          email: est.email || '',
          superficie_hectareas: est.superficie_hectareas?.toString() || '',
          tipo_establecimiento: est.tipo_establecimiento || 'mixto',
          estado: est.estado || 'activo',
          disciplina_principal: est.disciplina_principal || ''
        });
      }
    } catch (error) {
      console.error('Error al cargar establecimiento:', error);
      setMessage({ type: 'error', text: 'Error al cargar los datos del establecimiento' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (addressData: {
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
    setFormData(prev => ({
      ...prev,
      ...addressData
    }));
  };

  const handleCancel = () => {
    if (establecimiento) {
      setFormData({
        nombre: establecimiento.nombre || '',
        cuit: establecimiento.cuit || '',
        direccion_calle: establecimiento.direccion_calle || '',
        direccion_numero: establecimiento.direccion_numero || '',
        direccion_complemento: establecimiento.direccion_complemento || '',
        codigo_postal: establecimiento.codigo_postal || '',
        ciudad: establecimiento.ciudad || '',
        provincia: establecimiento.provincia || '',
        pais: establecimiento.pais || '',
        latitud: establecimiento.latitud,
        longitud: establecimiento.longitud,
        descripcion: establecimiento.descripcion || '',
        cantidad_boxes: establecimiento.cantidad_boxes?.toString() || '',
        telefono: establecimiento.telefono || '',
        email: establecimiento.email || '',
        superficie_hectareas: establecimiento.superficie_hectareas?.toString() || '',
        tipo_establecimiento: establecimiento.tipo_establecimiento || 'mixto',
        estado: establecimiento.estado || 'activo',
        disciplina_principal: establecimiento.disciplina_principal || ''
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

      const updateData: Partial<Establecimiento> = {
        nombre: formData.nombre,
      };

      // CUIT
      if (formData.cuit && formData.cuit.trim()) {
        updateData.cuit = formData.cuit.trim();
      }

      // Dirección completa
      if (formData.direccion_calle && formData.direccion_calle.trim()) {
        updateData.direccion_calle = formData.direccion_calle.trim();
      }
      if (formData.direccion_numero && formData.direccion_numero.trim()) {
        updateData.direccion_numero = formData.direccion_numero.trim();
      }
      if (formData.direccion_complemento && formData.direccion_complemento.trim()) {
        updateData.direccion_complemento = formData.direccion_complemento.trim();
      }
      if (formData.codigo_postal && formData.codigo_postal.trim()) {
        updateData.codigo_postal = formData.codigo_postal.trim();
      }
      if (formData.ciudad && formData.ciudad.trim()) {
        updateData.ciudad = formData.ciudad.trim();
      }
      if (formData.provincia && formData.provincia.trim()) {
        updateData.provincia = formData.provincia.trim();
      }
      if (formData.pais && formData.pais.trim()) {
        updateData.pais = formData.pais.trim();
      }
      if (formData.latitud !== undefined && formData.latitud !== null) {
        updateData.latitud = Number(formData.latitud);
      }
      if (formData.longitud !== undefined && formData.longitud !== null) {
        updateData.longitud = Number(formData.longitud);
      }

      // Descripción
      if (formData.descripcion && formData.descripcion.trim()) {
        updateData.descripcion = formData.descripcion.trim();
      }
      
      // Cantidad de boxes: solo enviar si es un número válido > 0
      if (formData.cantidad_boxes && parseInt(formData.cantidad_boxes) > 0) {
        updateData.cantidad_boxes = parseInt(formData.cantidad_boxes);
      }
      
      // Teléfono
      if (formData.telefono && formData.telefono.trim()) {
        updateData.telefono = formData.telefono.trim();
      }
      
      // Email
      if (formData.email && formData.email.trim()) {
        updateData.email = formData.email.trim();
      }
      
      // Superficie: solo enviar si es un número válido > 0
      if (formData.superficie_hectareas && parseFloat(formData.superficie_hectareas) > 0) {
        updateData.superficie_hectareas = parseFloat(formData.superficie_hectareas);
      }

      // Tipo y estado
      if (formData.tipo_establecimiento) {
        updateData.tipo_establecimiento = formData.tipo_establecimiento;
      }
      if (formData.estado) {
        updateData.estado = formData.estado;
      }
      if (formData.disciplina_principal && formData.disciplina_principal.trim()) {
        updateData.disciplina_principal = formData.disciplina_principal.trim();
      }

      await ApiClient.makeRequest(`/establecimientos/${establecimiento.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      await fetchEstablecimiento();

      setMessage({ type: 'success', text: 'Configuración guardada exitosamente' });
    } catch (error: unknown) {
      console.error('Error al guardar configuración:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar la configuración';
      
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setMessage(null);

      // Validar campos básicos
      if (!accountData.nombre || !accountData.apellido) {
        setMessage({ type: 'error', text: 'Nombre y apellido son obligatorios' });
        return;
      }

      // Si está cambiando contraseña, validar
      if (accountData.newPassword || accountData.currentPassword || accountData.confirmPassword) {
        if (!accountData.currentPassword) {
          setMessage({ type: 'error', text: 'Ingresa tu contraseña actual' });
          return;
        }
        if (!accountData.newPassword) {
          setMessage({ type: 'error', text: 'Ingresa tu nueva contraseña' });
          return;
        }
        if (accountData.newPassword.length < 8) {
          setMessage({ type: 'error', text: 'La nueva contraseña debe tener al menos 8 caracteres' });
          return;
        }
        if (accountData.newPassword !== accountData.confirmPassword) {
          setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
          return;
        }
      }

      const updateData: {
        nombre: string;
        apellido: string;
        email?: string;
        telefono?: string;
        currentPassword?: string;
        newPassword?: string;
      } = {
        nombre: accountData.nombre.trim(),
        apellido: accountData.apellido.trim(),
      };

      if (accountData.email && accountData.email.trim()) {
        updateData.email = accountData.email.trim();
      }

      if (accountData.telefono && accountData.telefono.trim()) {
        updateData.telefono = accountData.telefono.trim();
      }

      // Si está cambiando contraseña, incluirla
      if (accountData.newPassword) {
        updateData.currentPassword = accountData.currentPassword;
        updateData.newPassword = accountData.newPassword;
      }

      await ApiClient.makeRequest(`/users/${user?.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      await refreshUser();

      setMessage({ type: 'success', text: 'Información actualizada exitosamente' });
    } catch (error: unknown) {
      console.error('Error actualizando usuario:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar la información';
      setMessage({ 
        type: 'error', 
        text: errorMessage
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAccountCancel = () => {
    if (user) {
      setAccountData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        email: user.email || '',
        telefono: user.telefono || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setMessage(null);
    }
  };

  if (loading) {
    return <LoadingSpinnerFullPage label="Cargando..." />;
  }

  return (
    <SimpleRoleGuard roles={['establecimiento']}>
      <Card>
        <CardHeader className="space-y-4">
          {/* Title and Description */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-xl sm:text-2xl">Configuración</CardTitle>
              <CardDescription className="mt-1">Gestiona la información de tu establecimiento y tu cuenta</CardDescription>
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
              <button
                onClick={() => setActiveTab('establecimiento')}
                className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'establecimiento'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>Establecimiento</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('cuenta')}
                className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'cuenta'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <User className="w-4 h-4" />
                  <span>Mi Cuenta</span>
                </div>
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
            {/* Tab Content: Establecimiento */}
            {activeTab === 'establecimiento' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                
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
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Ej: Haras San Jorge"
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
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="20-12345678-9"
                        minLength={11}
                        maxLength={13}
                      />
                      <p className="mt-1 text-xs text-gray-500">Formato: XX-XXXXXXXX-X (11-13 caracteres)</p>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Email de Contacto
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="email@establecimiento.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Teléfono de contacto"
                      />
                    </div>
                  </div>
                </div>

                {/* Ubicación con OpenStreetMap */}
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Ubicación</h3>
                  <LeafletAddressPicker
                    value={{
                      direccion_calle: formData.direccion_calle,
                      direccion_numero: formData.direccion_numero,
                      direccion_complemento: formData.direccion_complemento,
                      codigo_postal: formData.codigo_postal,
                      ciudad: formData.ciudad,
                      provincia: formData.provincia,
                      pais: formData.pais,
                      latitud: formData.latitud,
                      longitud: formData.longitud
                    }}
                    onChange={handleAddressChange}
                  />
                </div>

                {/* Detalles del establecimiento */}
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Detalles</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="tipo_establecimiento" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Tipo
                      </label>
                      <select
                        id="tipo_establecimiento"
                        name="tipo_establecimiento"
                        value={formData.tipo_establecimiento}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="mixto">Mixto</option>
                        <option value="haras">Haras</option>
                        <option value="polo">Polo</option>
                        <option value="salto">Salto</option>
                        <option value="doma">Doma</option>
                        <option value="turf">Turf</option>
                        <option value="enduro">Enduro</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Estado
                      </label>
                      <select
                        id="estado"
                        name="estado"
                        value={formData.estado}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                        <option value="mantenimiento">Mantenimiento</option>
                        <option value="suspendido">Suspendido</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="superficie_hectareas" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Superficie (hectáreas)
                      </label>
                      <input
                        type="number"
                        id="superficie_hectareas"
                        name="superficie_hectareas"
                        value={formData.superficie_hectareas}
                        onChange={handleInputChange}
                        step="0.01"
                        placeholder="50.5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="cantidad_boxes" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Cantidad de boxes
                      </label>
                      <input
                        type="number"
                        id="cantidad_boxes"
                        name="cantidad_boxes"
                        value={formData.cantidad_boxes}
                        onChange={handleInputChange}
                        placeholder="20"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <div>
                      <label htmlFor="disciplina_principal" className="block text-sm font-medium text-gray-700 mb-1.5">
                        Disciplina principal
                      </label>
                      <select
                        id="disciplina_principal"
                        name="disciplina_principal"
                        value={formData.disciplina_principal}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="polo">Polo</option>
                        <option value="equitacion">Equitación</option>
                        <option value="turf">Turf</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Descripción</h3>
                  <div>
                    <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Descripción del establecimiento
                    </label>
                    <textarea
                      id="descripcion"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      placeholder="Describe las características, servicios y detalles del establecimiento..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm min-h-[100px]"
                      rows={4}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Building2 className="w-4 h-4" />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Tab Content: Mi Cuenta */}
            {activeTab === 'cuenta' && (
              <form onSubmit={handleAccountSubmit} className="space-y-6">
              
              {/* Información Personal */}
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={accountData.nombre}
                      onChange={(e) => setAccountData({ ...accountData, nombre: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      value={accountData.apellido}
                      onChange={(e) => setAccountData({ ...accountData, apellido: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Tu apellido"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={accountData.email}
                      onChange={(e) => setAccountData({ ...accountData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={accountData.telefono}
                      onChange={(e) => setAccountData({ ...accountData, telefono: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Teléfono de contacto"
                    />
                  </div>
                </div>
              </div>

              {/* Cambiar Contraseña */}
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Cambiar Contraseña</h3>
                <p className="text-sm text-gray-600 mb-4">Deja estos campos vacíos si no deseas cambiar tu contraseña</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Contraseña Actual
                    </label>
                    <input
                      type="password"
                      value={accountData.currentPassword}
                      onChange={(e) => setAccountData({ ...accountData, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="Ingresa tu contraseña actual"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        value={accountData.newPassword}
                        onChange={(e) => setAccountData({ ...accountData, newPassword: e.target.value })}
                        minLength={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Mínimo 8 caracteres"
                      />
                      {accountData.newPassword && accountData.newPassword.length < 8 && (
                        <p className="mt-1 text-xs text-red-600">La contraseña debe tener al menos 8 caracteres</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Confirmar Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        value={accountData.confirmPassword}
                        onChange={(e) => setAccountData({ ...accountData, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Repite la nueva contraseña"
                      />
                      {accountData.confirmPassword && accountData.newPassword !== accountData.confirmPassword && (
                        <p className="mt-1 text-xs text-red-600">Las contraseñas no coinciden</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleAccountCancel}
                  disabled={saving}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <User className="w-4 h-4" />
                      Guardar Cambios
                    </>
                  )}
                </button>
              </div>
            </form>
            )}
          </CardContent>
        </Card>
    </SimpleRoleGuard>
  );
}
