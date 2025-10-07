'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import ApiClient from '@/lib/services/apiClient';
import { logger } from '@/lib/utils/logger';
import type { User, Role } from './UserManagement';
import { useToaster } from '@/components/ui/toaster';

interface EditUserModalProps {
  user: User;
  roles: Role[];
  onClose: () => void;
  onUserUpdated: () => void;
}

export function EditUserModal({ user, roles, onClose, onUserUpdated }: EditUserModalProps) {
  const { toast } = useToaster();
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
      toast('Usuario actualizado', { type: 'success' });
      onUserUpdated();
    } catch (error: any) {
      logger.error('Error updating user:', error);
      setError(error.message || 'Error al actualizar usuario');
      toast(error.message || 'Error al actualizar usuario', { type: 'error' });
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
      toast('Contraseña actualizada', { type: 'success' });
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
    } catch (error: any) {
      logger.error('Error changing password:', error);
      setPasswordError(error.message || 'Error al cambiar contraseña');
      toast(error.message || 'Error al cambiar contraseña', { type: 'error' });
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
    <Modal isOpen={true} onClose={onClose} title={`Editar usuario: ${user.nombre} ${user.apellido}`} size="lg">
      <div className="flex-1 overflow-y-auto">
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
                <Button type="submit" variant="brand" size="sm" isLoading={loading} disabled={loading}>
                  Actualizar usuario
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
              <Button onClick={() => setShowPasswordSection(!showPasswordSection)} variant="secondary" size="sm">
                {showPasswordSection ? 'Ocultar' : 'Mostrar'}
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
                    <Button type="submit" variant="brand" size="sm" isLoading={passwordLoading} disabled={passwordLoading}>
                      Cambiar contraseña
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4 sm:pt-6 border-t border-gray-200 mt-4 sm:mt-6">
            <Button onClick={onClose} variant="secondary" size="sm">Cerrar</Button>
          </div>
        </div>
    </Modal>
  );
}