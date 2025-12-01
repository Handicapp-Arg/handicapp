'use client';

import React, { useEffect, useState } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import ApiClient from '@/lib/services/apiClient';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, User, Lock } from 'lucide-react';

export default function AdminConfiguracionPage() {
  const { user, updateUser } = useAuthNew();
  const [activeTab, setActiveTab] = useState<'perfil' | 'seguridad'>('perfil');
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

  const tabs = [
    { id: 'perfil' as const, label: 'Información Personal', icon: User },
    { id: 'seguridad' as const, label: 'Seguridad', icon: Lock },
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
    <SimpleRoleGuard roles={['admin']}>
      <div>
        {/* Hero Section */}
        <div className="bg-[#0f172a] rounded-2xl shadow-xl mb-6 px-6 sm:px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
                Configuración
              </h1>
              <p className="text-sm text-white/70">
                Gestiona tu información personal y seguridad
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
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
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className={`
                      -ml-0.5 mr-2 h-5 w-5
                      ${activeTab === tab.id ? 'text-slate-900' : 'text-gray-400 group-hover:text-gray-500'}
                    `} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          {/* Información Personal */}
          {activeTab === 'perfil' && (
            <form onSubmit={handleUpdatePerfil}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Información Personal
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Actualiza tu información personal visible en la plataforma
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <p className="text-xs text-gray-500 mt-1">
                      El email no se puede modificar
                    </p>
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

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="bg-slate-900 hover:bg-slate-800"
                  >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Seguridad */}
          {activeTab === 'seguridad' && (
            <form onSubmit={handleChangePassword}>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Cambiar Contraseña
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Actualiza tu contraseña para mantener tu cuenta segura
                  </p>
                </div>

                <div className="space-y-4 max-w-md">
                  <div>
                    <Label htmlFor="currentPassword" className="text-gray-700">Contraseña Actual *</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Ingresa tu contraseña actual"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="newPassword" className="text-gray-700">Nueva Contraseña *</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Mínimo 8 caracteres"
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Mínimo 8 caracteres
                    </p>
                    {passwordData.newPassword && !isPasswordLengthValid && (
                      <p className="text-xs text-red-500 mt-1">
                        La contraseña debe tener al menos 8 caracteres
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-gray-700">Confirmar Nueva Contraseña *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Repite tu nueva contraseña"
                      required
                    />
                    {passwordData.confirmPassword && !passwordsMatch && (
                      <p className="text-xs text-red-500 mt-1">
                        Las contraseñas no coinciden
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button
                    type="submit"
                    disabled={saving || !isPasswordFormReady}
                    className="bg-slate-900 hover:bg-slate-800 disabled:bg-gray-300 disabled:text-gray-600 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Actualizando...' : 'Cambiar Contraseña'}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
