'use client';

import React, { useEffect, useState } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import ApiClient from '@/lib/services/apiClient';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Lock, Mail, Phone, Shield, Key, Info } from 'lucide-react';

type TabType = 'perfil' | 'seguridad';

export default function AdminConfiguracionPage() {
  const { user, updateUser } = useAuthNew();
  const [activeTab, setActiveTab] = useState<TabType>('perfil');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Form states
  const [perfilData, setPerfilData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    telefono: user?.telefono || '',
    email: user?.email || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Sincronizar perfilData con user cuando cambie
  useEffect(() => {
    if (user) {
      setPerfilData({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        telefono: user.telefono || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleUpdatePerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await ApiClient.makeRequest('/users/profile', {
        method: 'PUT',
        body: JSON.stringify({
          nombre: perfilData.nombre,
          apellido: perfilData.apellido,
          telefono: perfilData.telefono,
        }),
      }) as { data?: Partial<typeof user> };

      if (response.data) {
        updateUser(response.data);
      }
      
      setMessage({ type: 'success', text: 'Perfil actualizado correctamente' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar el perfil';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      setSaving(false);
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres' });
      setSaving(false);
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
      setSaving(false);
    }
  };

  const isPasswordLengthValid = passwordData.newPassword.trim().length >= 8;
  const passwordsMatch =
    passwordData.confirmPassword === '' || passwordData.newPassword === passwordData.confirmPassword;
  const isPasswordFormReady =
    passwordData.currentPassword.trim().length > 0 &&
    passwordData.newPassword.trim().length > 0 &&
    passwordData.confirmPassword.trim().length > 0 &&
    isPasswordLengthValid &&
    passwordData.newPassword === passwordData.confirmPassword;

  return (
    <SimpleRoleGuard roles={['admin']}>
      <Card>
        <CardHeader className="space-y-4">
          {/* Title and Description */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-xl sm:text-2xl">Configuración</CardTitle>
              <CardDescription className="mt-1">Gestiona tu información personal y seguridad</CardDescription>
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
                onClick={() => setActiveTab('perfil')}
                className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'perfil'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <User className="w-4 h-4" />
                  <span>Información Personal</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('seguridad')}
                className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'seguridad'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Lock className="w-4 h-4" />
                  <span>Seguridad</span>
                </div>
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Tab Content: Información Personal */}
          {activeTab === 'perfil' && (
            <form onSubmit={handleUpdatePerfil} className="space-y-6">
              {/* Datos Personales */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Datos Personales</h3>
                    <p className="text-sm text-gray-600">Información básica de tu perfil</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="nombre" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Nombre *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      value={perfilData.nombre}
                      onChange={(e) => setPerfilData({ ...perfilData, nombre: e.target.value })}
                      placeholder="Tu nombre"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white shadow-sm hover:border-gray-300"
                    />
                  </div>

                  <div>
                    <label htmlFor="apellido" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Apellido *
                    </label>
                    <input
                      type="text"
                      id="apellido"
                      value={perfilData.apellido}
                      onChange={(e) => setPerfilData({ ...perfilData, apellido: e.target.value })}
                      placeholder="Tu apellido"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white shadow-sm hover:border-gray-300"
                    />
                  </div>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Información de Contacto</h3>
                    <p className="text-sm text-gray-600">Datos para comunicación</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="email" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        value={perfilData.email}
                        disabled
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed text-sm shadow-sm"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <Lock className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="mt-2 flex items-start gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-blue-700">El email es tu identificador único y no puede modificarse por seguridad</p>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="telefono" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 text-blue-600" />
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      value={perfilData.telefono}
                      onChange={(e) => setPerfilData({ ...perfilData, telefono: e.target.value })}
                      placeholder="+54 11 1234-5678"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm bg-white shadow-sm hover:border-gray-300"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Guardando...
                    </span>
                  ) : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          )}

          {/* Tab Content: Seguridad */}
          {activeTab === 'seguridad' && (
            <form onSubmit={handleChangePassword} className="space-y-6">
              {/* Cambiar Contraseña */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 border border-red-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-red-600 rounded-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Seguridad de la Cuenta</h3>
                    <p className="text-sm text-gray-600">Cambia tu contraseña regularmente para mantener tu cuenta protegida</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label htmlFor="currentPassword" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Lock className="w-4 h-4 text-red-600" />
                      Contraseña Actual *
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Ingresa tu contraseña actual"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm bg-white shadow-sm hover:border-gray-300"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="newPassword" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Key className="w-4 h-4 text-red-600" />
                        Nueva Contraseña *
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Mínimo 8 caracteres"
                        required
                        minLength={8}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm bg-white shadow-sm hover:border-gray-300"
                      />
                      {passwordData.newPassword && (
                        <div className="mt-2">
                          {isPasswordLengthValid ? (
                            <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                              </svg>
                              Longitud válida
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                              </svg>
                              Mínimo 8 caracteres
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                        <Key className="w-4 h-4 text-red-600" />
                        Confirmar Contraseña *
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Repite la contraseña"
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm bg-white shadow-sm hover:border-gray-300"
                      />
                      {passwordData.confirmPassword && (
                        <div className="mt-2">
                          {passwordsMatch ? (
                            <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                              </svg>
                              Contraseñas coinciden
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                              </svg>
                              No coinciden
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-4 bg-amber-50 rounded-lg border border-amber-200 mt-4">
                    <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-800">
                      <p className="font-semibold mb-2">Recomendaciones de seguridad:</p>
                      <ul className="space-y-1 text-xs">
                        <li className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-amber-600 rounded-full"></span>
                          Usa al menos 8 caracteres
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-amber-600 rounded-full"></span>
                          Combina letras, números y símbolos
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-amber-600 rounded-full"></span>
                          No uses información personal obvia
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1 h-1 bg-amber-600 rounded-full"></span>
                          Cambia tu contraseña periódicamente
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="submit"
                  disabled={saving || !isPasswordFormReady}
                  className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition-all text-sm font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Actualizando...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Cambiar Contraseña
                    </span>
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
