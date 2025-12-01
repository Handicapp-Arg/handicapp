'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
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

interface CreateUserData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
  rol_id: number;
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
  roles: Role[];
  createUserFn: (data: CreateUserData) => Promise<unknown>;
  primaryColor?: string;
}

export function CreateUserModal({
  isOpen,
  onClose,
  onUserCreated,
  roles,
  createUserFn,
  primaryColor = '#0f172a',
}: CreateUserModalProps) {
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
  const [error, setError] = useState<string>('');

  const handleSubmit = async () => {
    console.log('🔵 handleSubmit called');
    console.log('📋 formData:', formData);
    setError(''); // Limpiar error previo
    
    // Validations
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.password || !formData.rol_id) {
      console.log('❌ Campos obligatorios faltantes');
      const errorMsg = 'Por favor completa todos los campos obligatorios';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      console.log('❌ Contraseñas no coinciden');
      const errorMsg = 'Las contraseñas no coinciden';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Política de contraseña alineada con el backend:
    //  - Entre 8 y 128 caracteres
    //  - Al menos una minúscula, una mayúscula y un número
    const strongPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/;
    if (!strongPwd.test(formData.password)) {
      console.log('❌ Contraseña débil');
      const errorMsg = 'La contraseña debe tener entre 8 y 128 caracteres e incluir al menos una minúscula, una mayúscula y un número';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      console.log('❌ Email inválido');
      const errorMsg = 'Por favor ingresa un email válido';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    try {
      setLoading(true);
      console.log('🚀 Llamando createUserFn...');
      
      await createUserFn({
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono || undefined,
        rol_id: parseInt(formData.rol_id),
      });
      
      console.log('✅ Usuario creado exitosamente');
      toast.success('Usuario creado correctamente');
      onUserCreated();
      onClose();
      
      // Reset form
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        confirmPassword: '',
        telefono: '',
        rol_id: '',
      });
    } catch (error: unknown) {
      console.error('Error creating user:', error);
      const message = error instanceof Error ? error.message : 'Error al crear usuario';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Plus className="w-6 h-6" style={{ color: primaryColor }} />
            Nuevo Usuario
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Contraseña</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Confirmar Contraseña</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                placeholder="Repetir contraseña"
              />
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
            {loading ? 'Creando...' : 'Crear Usuario'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
