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
import type { Empleado, CrearEmpleadoDTO } from '@/lib/gestionPersonalService';

interface Role {
  id: number;
  nombre: string;
}

interface EditEmpleadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmpleadoUpdated: () => void;
  empleado: Empleado | null;
  roles: Role[];
  updateEmpleadoFn: (empleadoId: number, data: CrearEmpleadoDTO) => Promise<boolean>;
  primaryColor?: string;
}

export function EditEmpleadoModal({
  isOpen,
  onClose,
  onEmpleadoUpdated,
  empleado,
  roles,
  updateEmpleadoFn,
  primaryColor = '#2563eb', // blue-600
}: EditEmpleadoModalProps) {
  const [formData, setFormData] = useState<CrearEmpleadoDTO>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    documento: '',
    rol_id: 5,
    fecha_ingreso: new Date().toISOString().split('T')[0],
    departamento: 'Operaciones',
    puesto: 'Auxiliar',
  });
  const [loading, setLoading] = useState(false);

  // Update form data when empleado changes
  useEffect(() => {
    if (empleado) {
      setFormData({
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        email: empleado.email,
        telefono: empleado.telefono || '',
        documento: empleado.documento || '',
        rol_id: empleado.rol_id,
        fecha_ingreso: empleado.fecha_ingreso,
        departamento: empleado.departamento || 'Operaciones',
        puesto: empleado.puesto || 'Auxiliar',
      });
    }
  }, [empleado]);

  const handleSubmit = async () => {
    // Check if empleado exists
    if (!empleado) {
      toast.error('No se ha seleccionado ningún empleado');
      return;
    }

    // Validations
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.documento) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    try {
      setLoading(true);
      
      const success = await updateEmpleadoFn(empleado.id, formData);
      
      if (success) {
        toast.success('Empleado actualizado correctamente');
        onEmpleadoUpdated();
        onClose();
      } else {
        toast.error('Error al actualizar empleado');
      }
    } catch (error: unknown) {
      console.error('Error updating empleado:', error);
      const message = error instanceof Error ? error.message : 'Error al actualizar empleado';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if empleado is null
  if (!empleado) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Edit className="w-6 h-6" style={{ color: primaryColor }} />
            Editar Empleado
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nombre *</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Apellido *</label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full mt-1 px-3 py-2 border rounded-lg"
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
              />
            </div>
            <div>
              <label className="text-sm font-medium">Documento *</label>
              <input
                type="text"
                value={formData.documento}
                onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Departamento</label>
              <input
                type="text"
                value={formData.departamento}
                onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Puesto</label>
              <input
                type="text"
                value={formData.puesto}
                onChange={(e) => setFormData({ ...formData, puesto: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Rol</label>
            <select
              value={formData.rol_id}
              onChange={(e) => setFormData({ ...formData, rol_id: Number(e.target.value) })}
              className="w-full mt-1 px-3 py-2 border rounded-lg"
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.nombre}
                </option>
              ))}
            </select>
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
