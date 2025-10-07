'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import ApiClient from '@/lib/services/apiClient';
import { logger } from '@/lib/utils/logger';
import type { Role } from './UserManagement';
import { useToaster } from '@/components/ui/toaster';

interface CreateUserModalProps {
  roles: Role[];
  onClose: () => void;
  onUserCreated: () => void;
}

export function CreateUserModal({ roles, onClose, onUserCreated }: CreateUserModalProps) {
  const { toast } = useToaster();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    rol_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorDetails, setErrorDetails] = useState<string[] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  setError('');
  setErrorDetails(null);

    // Validations
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.password || !formData.rol_id) {
      setError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    // Política de contraseña alineada con el backend:
    //  - Entre 8 y 128 caracteres
    //  - Al menos una minúscula, una mayúscula y un número
    const strongPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/;
    if (!strongPwd.test(formData.password)) {
      setError('La contraseña debe tener entre 8 y 128 caracteres e incluir al menos una minúscula, una mayúscula y un número');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Por favor ingresa un email válido');
      return;
    }

    try {
      setLoading(true);
      
      const data = await ApiClient.createUser({
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono || undefined,
        rol_id: parseInt(formData.rol_id),
      });
      toast('Usuario creado correctamente', { type: 'success' });
      onUserCreated();
      onClose();
    } catch (error: any) {
      logger.error('Error creating user:', error);
      const message = error?.message || 'Error al crear usuario';
      const details: string[] | undefined = error?.details;
      setError(message);
      if (details?.length) setErrorDetails(details);
      toast(message, { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Crear usuario" size="lg">
      <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
              <p className="text-red-800 font-medium text-sm">{error}</p>
              {errorDetails?.length ? (
                <ul className="mt-2 list-disc list-inside text-red-700 text-xs space-y-1">
                  {errorDetails.map((e, idx) => (
                    <li key={idx}>{e}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Grid de dos columnas para organizar mejor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              
              {/* Columna izquierda - Información personal */}
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Información personal</h3>
                  
                  <div className="space-y-4">
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
                          placeholder="Ej: Juan"
                          autoComplete="given-name"
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
                          placeholder="Ej: Pérez"
                          autoComplete="family-name"
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
                        placeholder="usuario@ejemplo.com"
                        autoComplete="email"
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
                        placeholder="+54 9 11 1234-5678"
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna derecha - Rol y contraseña */}
              <div className="space-y-4 sm:space-y-6">
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Rol y acceso</h3>
                  
                  <div className="space-y-4">
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
                        <option value="">Selecciona un rol</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contraseña *
                      </label>
                      <Input
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="w-full focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Mínimo 8 caracteres, con mayúscula, minúscula y número"
                        autoComplete="new-password"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar Contraseña *
                      </label>
                      <Input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="w-full focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Repetir contraseña"
                        autoComplete="new-password"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200">
              <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" variant="brand" size="sm" isLoading={loading} disabled={loading}>
                Crear usuario
              </Button>
            </div>
          </form>
      </div>
    </Modal>
  );
}