'use client';

import { useState, useEffect } from 'react';
import { Edit, Shield, MapPin, CheckCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import toast from 'react-hot-toast';

interface Role {
  id: number;
  nombre: string;
}

interface Establecimiento {
  id: number;
  nombre: string;
}

interface EditUserData {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol_id: number;
  establecimiento_id?: number | null;
  ubicacion?: string;
  estado_usuario?: 'pending' | 'invited' | 'active' | 'suspended' | 'disabled' | 'deleted';
  verificado?: boolean;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  user: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    rol?: { id: number; nombre: string };
    rol_id?: number;
    establecimiento_id?: number | null;
    ubicacion?: string;
    estado_usuario?: string;
    verificado?: boolean;
  } | null;
  roles: Role[];
  establecimientos?: Establecimiento[];
  updateUserFn: (userId: number, data: EditUserData) => Promise<unknown>;
  primaryColor?: string;
}

export function EditUserModal({
  isOpen,
  onClose,
  onUserUpdated,
  user,
  roles,
  establecimientos = [],
  updateUserFn,
  primaryColor = '#0f172a',
}: EditUserModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    rol_id: '',
    establecimiento_id: '',
    ubicacion: '',
    estado_usuario: 'active' as 'pending' | 'invited' | 'active' | 'suspended' | 'disabled' | 'deleted',
    verificado: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        telefono: user.telefono || '',
        rol_id: (user.rol?.id || user.rol_id || '').toString(),
        establecimiento_id: (user.establecimiento_id || '').toString(),
        ubicacion: user.ubicacion || '',
        estado_usuario: (user.estado_usuario as any) || 'active',
        verificado: user.verificado || false,
      });
      setError(''); // Limpiar error al cambiar usuario
    }
  }, [user]);

  const handleSubmit = async () => {
    setError(''); // Limpiar error previo
    
    // Check if user exists
    if (!user) {
      const errorMsg = 'No se ha seleccionado ningún usuario';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Validations
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.rol_id) {
      const errorMsg = 'Por favor completa todos los campos obligatorios';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      const errorMsg = 'Por favor ingresa un email válido';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      setLoading(true);
      
      const updateData: EditUserData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono || undefined,
        rol_id: parseInt(formData.rol_id),
        ubicacion: formData.ubicacion || undefined,
        estado_usuario: formData.estado_usuario,
        verificado: formData.verificado,
      };

      // Solo incluir establecimiento_id si hay establecimientos disponibles y se seleccionó uno
      if (establecimientos.length > 0 && formData.establecimiento_id) {
        updateData.establecimiento_id = parseInt(formData.establecimiento_id) || null;
      }
      
      await updateUserFn(user.id, updateData);
      
      toast.success('Usuario actualizado correctamente');
      onUserUpdated();
      onClose();
    } catch (error: unknown) {
      console.error('Error updating user:', error);
      const message = error instanceof Error ? error.message : 'Error al actualizar usuario';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if user is null
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Edit className="w-5 h-5 text-gray-700" />
            Editar Usuario - Administrador
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Modifica todos los campos del usuario. Todos los cambios se aplicarán inmediatamente.
          </p>
        </DialogHeader>
        
        {/* Mensaje de error visible */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {error}
            </p>
          </div>
        )}
        
        <div className="grid gap-6 py-4 px-6">
          {/* Estado y Verificación - Destacados */}
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Estado de la Cuenta
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Estado del Usuario</label>
                <select
                  value={formData.estado_usuario}
                  onChange={(e) => setFormData({ ...formData, estado_usuario: e.target.value as any })}
                  className={`w-full px-4 py-2.5 border rounded-md focus:ring-2 focus:ring-gray-300 focus:border-gray-400 bg-white font-medium ${
                    formData.estado_usuario === 'active' 
                      ? 'border-green-300 text-green-700' 
                      : formData.estado_usuario === 'pending' || formData.estado_usuario === 'invited'
                      ? 'border-yellow-300 text-yellow-700'
                      : formData.estado_usuario === 'suspended'
                      ? 'border-orange-300 text-orange-700'
                      : 'border-red-300 text-red-700'
                  }`}
                >
                  <option value="active">Activo - Acceso completo al sistema</option>
                  <option value="pending">Pendiente - Esperando activación</option>
                  <option value="invited">Invitado - Invitación enviada</option>
                  <option value="suspended">Suspendido - Cuenta suspendida temporalmente</option>
                  <option value="disabled">Deshabilitado - Cuenta deshabilitada</option>
                  <option value="deleted">Eliminado - Marcado como eliminado</option>
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  {formData.estado_usuario === 'active' && 'El usuario tiene acceso completo a todas sus funcionalidades asignadas.'}
                  {formData.estado_usuario === 'pending' && 'El usuario está pendiente de activación por el administrador.'}
                  {formData.estado_usuario === 'invited' && 'Se ha enviado una invitación al usuario para que complete su registro.'}
                  {formData.estado_usuario === 'suspended' && 'Cuenta temporalmente suspendida por el administrador.'}
                  {formData.estado_usuario === 'disabled' && 'Cuenta deshabilitada permanentemente.'}
                  {formData.estado_usuario === 'deleted' && 'Usuario marcado como eliminado (soft delete).'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Verificación de Email</label>
                <label className="flex items-center gap-3 cursor-pointer bg-white p-4 rounded-md border border-gray-200 hover:border-gray-400">
                  <input
                    type="checkbox"
                    checked={formData.verificado}
                    onChange={(e) => setFormData({ ...formData, verificado: e.target.checked })}
                    className="w-5 h-5 text-gray-700 rounded focus:ring-2 focus:ring-gray-300"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium flex items-center gap-2">
                      {formData.verificado ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-green-700">Usuario Verificado</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-gray-400" />
                          <span className="text-gray-600">No Verificado</span>
                        </>
                      )}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.verificado 
                        ? 'El usuario ha verificado su dirección de email.' 
                        : 'El usuario aún no ha verificado su email.'}
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Información Personal */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Información Personal</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-300 focus:border-gray-400 text-base"
                  placeholder="Juan"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Apellido *</label>
                <input
                  type="text"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-300 focus:border-gray-400 text-base"
                  placeholder="Pérez"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Información de Contacto</h3>
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-300 focus:border-gray-400 text-base"
                  placeholder="juan.perez@email.com"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-300 focus:border-gray-400 text-base"
                    placeholder="+54 9 11 1234-5678"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={formData.ubicacion}
                    onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-300 focus:border-gray-400 text-base"
                    placeholder="Buenos Aires, Argentina"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Rol y Establecimiento */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Asignaciones</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Rol *</label>
                <select
                  value={formData.rol_id}
                  onChange={(e) => setFormData({ ...formData, rol_id: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-300 focus:border-gray-400 bg-white text-base"
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
              {establecimientos.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Establecimiento</label>
                  <select
                    value={formData.establecimiento_id}
                    onChange={(e) => setFormData({ ...formData, establecimiento_id: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-300 focus:border-gray-400 bg-white text-base"
                  >
                    <option value="">Sin establecimiento</option>
                    {establecimientos.map((est) => (
                      <option key={est.id} value={est.id}>
                        {est.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-700 font-medium"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
