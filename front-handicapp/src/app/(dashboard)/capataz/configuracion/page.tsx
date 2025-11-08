'use client';

import React, { useState } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, User, Lock, Bell } from 'lucide-react';
import ApiClient from '@/lib/services/apiClient';

export default function CapatazConfiguracionPage() {
  const { user, refreshUser } = useAuthNew();
  const [activeTab, setActiveTab] = useState<'perfil' | 'seguridad' | 'notificaciones'>('perfil');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const [notificacionesData, setNotificacionesData] = useState({
    email_tareas: true,
    email_eventos: true,
    email_caballos: true,
    push_enabled: true,
  });

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

  const tabs = [
    { id: 'perfil' as const, label: 'Información Personal', icon: User },
    { id: 'seguridad' as const, label: 'Seguridad', icon: Lock },
    { id: 'notificaciones' as const, label: 'Notificaciones', icon: Bell },
  ];

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
    <SimpleRoleGuard roles={['capataz']}>
      <div>
        <div className="relative overflow-hidden mb-8 rounded-2xl">
          <div className="absolute inset-0 bg-[#0f172a]"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-60"></div>
          <div className="absolute top-0 right-1/4 w-64 h-64 bg-orange-600/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 px-6 sm:px-8 lg:px-12 py-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
                  Configuración Personal
                </h1>
                <p className="text-sm sm:text-base text-white/70">
                  Gestiona tu información personal, seguridad y preferencias
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                      ${activeTab === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className={`
                      -ml-0.5 mr-2 h-5 w-5
                      ${activeTab === tab.id ? 'text-orange-500' : 'text-gray-400 group-hover:text-gray-500'}
                    `} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          {activeTab === 'perfil' && (
            <form onSubmit={handleUpdatePerfil}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
                  <p className="text-sm text-gray-600 mb-6">Actualiza tu información personal visible en la plataforma</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input id="nombre" value={perfilData.nombre} onChange={(e) => setPerfilData({ ...perfilData, nombre: e.target.value })} placeholder="Tu nombre" required />
                  </div>
                  <div>
                    <Label htmlFor="apellido">Apellido *</Label>
                    <Input id="apellido" value={perfilData.apellido} onChange={(e) => setPerfilData({ ...perfilData, apellido: e.target.value })} placeholder="Tu apellido" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={perfilData.email} disabled className="bg-gray-50 cursor-not-allowed" />
                    <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
                  </div>
                  <div>
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input id="telefono" type="tel" value={perfilData.telefono} onChange={(e) => setPerfilData({ ...perfilData, telefono: e.target.value })} placeholder="+54 11 1234-5678" />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'seguridad' && (
            <form onSubmit={handleChangePassword}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Cambiar Contraseña</h3>
                  <p className="text-sm text-gray-600 mb-6">Actualiza tu contraseña para mantener tu cuenta segura</p>
                </div>

                <div className="space-y-4 max-w-md">
                  <div>
                    <Label htmlFor="currentPassword">Contraseña Actual *</Label>
                    <Input id="currentPassword" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">Nueva Contraseña *</Label>
                    <Input id="newPassword" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} required minLength={8} />
                    <p className="text-xs text-gray-500 mt-1">Mínimo 8 caracteres</p>
                    {passwordData.newPassword && !isPasswordLengthValid && (<p className="text-xs text-red-500 mt-1">La contraseña debe tener al menos 8 caracteres</p>)}
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña *</Label>
                    <Input id="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required />
                    {passwordData.confirmPassword && !passwordsMatch && (<p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>)}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button type="submit" disabled={loading || !isPasswordFormReady} className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed">
                    {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'notificaciones' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferencias de Notificaciones</h3>
                <p className="text-sm text-gray-600 mb-6">Configura cómo quieres recibir notificaciones sobre gestión del establecimiento</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Tareas y Asignaciones</p>
                    <p className="text-sm text-gray-600">Notificaciones sobre tareas pendientes y asignadas</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={notificacionesData.email_tareas} onChange={(e) => setNotificacionesData({ ...notificacionesData, email_tareas: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Eventos y Calendario</p>
                    <p className="text-sm text-gray-600">Recordatorios sobre próximos eventos del establecimiento</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={notificacionesData.email_eventos} onChange={(e) => setNotificacionesData({ ...notificacionesData, email_eventos: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Alertas de Caballos</p>
                    <p className="text-sm text-gray-600">Notificaciones sobre salud y cuidados de los caballos</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={notificacionesData.email_caballos} onChange={(e) => setNotificacionesData({ ...notificacionesData, email_caballos: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Notificaciones Push</p>
                    <p className="text-sm text-gray-600">Activa notificaciones push en tu dispositivo</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={notificacionesData.push_enabled} onChange={(e) => setNotificacionesData({ ...notificacionesData, push_enabled: e.target.checked })} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t">
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Las preferencias de notificaciones se guardarán automáticamente en una próxima actualización
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
