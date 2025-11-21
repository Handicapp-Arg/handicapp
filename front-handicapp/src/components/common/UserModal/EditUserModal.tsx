'use client';

import { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';

interface Role {
  id: number;
  nombre: string;
}

interface EditUserData {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol_id: number;
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
  } | null;
  roles: Role[];
  updateUserFn: (userId: number, data: EditUserData) => Promise<unknown>;
  primaryColor?: string;
}

export function EditUserModal({
  isOpen,
  onClose,
  onUserUpdated,
  user,
  roles,
  updateUserFn,
  primaryColor = '#0f172a',
}: EditUserModalProps) {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    rol_id: '',
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
      
      await updateUserFn(user.id, {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        telefono: formData.telefono || undefined,
        rol_id: parseInt(formData.rol_id),
      });
      
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Edit className="w-6 h-6" style={{ color: primaryColor }} />
            Editar Usuario
          </DialogTitle>
        </DialogHeader>
        
        {/* Mensaje de error visible */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 flex items-center gap-2">
              <span className="text-lg">⚠️</span>
              {error}
            </p>
          </div>
        )}
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                placeholder="Juan"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Apellido</label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                placeholder="Pérez"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              placeholder="juan.perez@email.com"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Teléfono</label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                placeholder="+54 9 11 1234-5678"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Rol</label>
              <select
                value={formData.rol_id}
                onChange={(e) => setFormData({ ...formData, rol_id: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              >
                <option value="">Selecciona un rol</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
