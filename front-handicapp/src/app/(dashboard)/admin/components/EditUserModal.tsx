'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ApiClient from '@/lib/services/apiClient';
import type { User, Role } from './UserManagement';

interface EditUserModalProps {
  user: User;
  roles: Role[];
  onClose: () => void;
  onUserUpdated: () => void;
}

export function EditUserModal({ user, roles, onClose, onUserUpdated }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    telefono: user.telefono || '',
    rol_id: user.rol.id.toString(),
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.rol_id) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    try {
      setLoading(true);
      
      await ApiClient.updateUser(user.id, {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono || undefined,
        rol_id: parseInt(formData.rol_id),
      });

      onUserUpdated();
    } catch (error: any) {
      console.error('Error updating user:', error);
      setError(error.message || 'Error al actualizar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Por favor completa ambos campos de contraseña');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setPasswordLoading(true);
      
      await ApiClient.changePassword(user.id, {
        newPassword: passwordData.newPassword,
      });

      setPasswordData({ newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
      alert('Contraseña actualizada exitosamente');
    } catch (error: any) {
      console.error('Error changing password:', error);
      setPasswordError(error.message || 'Error al cambiar contraseña');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    if (passwordError) setPasswordError('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-xl sm:text-2xl">✏️</span>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-white">Editar Usuario</h2>
                <p className="text-blue-100 text-sm">{user.nombre} {user.apellido}</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 text-xl p-1 rounded-lg"
            >
              ×
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* User Info Form */}
          <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center mb-4">
              <span className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                <span className="text-sm sm:text-base">👤</span>
              </span>
              Información Personal
            </h3>
            
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
                <p className="text-red-800 font-medium text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <Input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    className="w-full focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido *
                  </label>
                  <Input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => handleInputChange('apellido', e.target.value)}
                    className="w-full focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <Input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  className="w-full focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol *
                </label>
                <select
                  value={formData.rol_id}
                  onChange={(e) => handleInputChange('rol_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">💾</span>
                      Actualizar Usuario
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Password Change Section */}
          <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <span className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                  <span className="text-sm sm:text-base">🔐</span>
                </span>
                Cambiar Contraseña
              </h3>
              <Button
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="text-sm text-blue-600 hover:text-blue-800 px-3 py-1 rounded-lg hover:bg-blue-50"
              >
                {showPasswordSection ? '🔼 Ocultar' : '🔽 Mostrar'}
              </Button>
            </div>

            {showPasswordSection && (
              <div>
                {passwordError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
                    <p className="text-red-800 font-medium text-sm">{passwordError}</p>
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nueva Contraseña
                    </label>
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                      className="w-full focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirmar Nueva Contraseña
                    </label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                      className="w-full focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Repetir nueva contraseña"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="px-4 sm:px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Cambiando...
                        </>
                      ) : (
                        <>
                          <span className="mr-2">🔑</span>
                          Cambiar Contraseña
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4 sm:pt-6 border-t border-gray-200 mt-4 sm:mt-6">
            <Button
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg font-medium transition-colors"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}