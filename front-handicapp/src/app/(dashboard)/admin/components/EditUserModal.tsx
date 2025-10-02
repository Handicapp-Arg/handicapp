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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Editar Usuario</h2>
            <Button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </Button>
          </div>

          {/* User Info Form */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Información Personal</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <Input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    className="w-full"
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
                    className="w-full"
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
                  className="w-full"
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
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol *
                </label>
                <select
                  value={formData.rol_id}
                  onChange={(e) => handleInputChange('rol_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Actualizando...
                    </div>
                  ) : (
                    'Actualizar Usuario'
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Password Change Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-medium text-gray-900">Cambiar Contraseña</h3>
              <Button
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showPasswordSection ? 'Ocultar' : 'Mostrar'}
              </Button>
            </div>

            {showPasswordSection && (
              <div>
                {passwordError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {passwordError}
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
                      className="w-full"
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
                      className="w-full"
                      placeholder="Repetir nueva contraseña"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg disabled:opacity-50"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Cambiando...
                        </div>
                      ) : (
                        'Cambiar Contraseña'
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t mt-4">
            <Button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}