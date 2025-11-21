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
import type { CrearEmpleadoDTO } from '@/lib/gestionPersonalService';

interface Role {
  id: number;
  nombre: string;
}

interface CreateEmpleadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmpleadoCreated: () => void;
  roles: Role[];
  createEmpleadoFn: (data: CrearEmpleadoDTO) => Promise<{ passwordTemporal: string } | null>;
  primaryColor?: string;
}

export function CreateEmpleadoModal({
  isOpen,
  onClose,
  onEmpleadoCreated,
  roles,
  createEmpleadoFn,
  primaryColor = '#059669', // emerald-600
}: CreateEmpleadoModalProps) {
  const [formData, setFormData] = useState<CrearEmpleadoDTO>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    documento: '',
    rol_id: 5, // Empleado por defecto
    fecha_ingreso: new Date().toISOString().split('T')[0],
    departamento: 'Operaciones',
    puesto: 'Auxiliar',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
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
      
      const result = await createEmpleadoFn(formData);
      
      if (result) {
        toast.success(`Empleado creado. Contraseña temporal: ${result.passwordTemporal}`);
        onEmpleadoCreated();
        onClose();
        
        // Reset form
        setFormData({
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
      } else {
        toast.error('Error al crear empleado');
      }
    } catch (error: unknown) {
      console.error('Error creating empleado:', error);
      const message = error instanceof Error ? error.message : 'Error al crear empleado';
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
            Nuevo Empleado
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
                placeholder="Juan"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Apellido *</label>
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
            <label className="text-sm font-medium">Email *</label>
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
              <label className="text-sm font-medium">Documento *</label>
              <input
                type="text"
                value={formData.documento}
                onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                placeholder="12345678"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
            <div>
              <label className="text-sm font-medium">Fecha de ingreso</label>
              <input
                type="date"
                value={formData.fecha_ingreso}
                onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
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
                placeholder="Operaciones"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Puesto</label>
              <input
                type="text"
                value={formData.puesto}
                onChange={(e) => setFormData({ ...formData, puesto: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                placeholder="Auxiliar"
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
            {loading ? 'Creando...' : 'Crear Empleado'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
