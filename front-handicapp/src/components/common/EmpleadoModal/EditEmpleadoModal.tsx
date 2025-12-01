'use client';

import { useState, useEffect, useRef } from 'react';
import { Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToaster } from '@/components/ui/toaster';
import type { Empleado, CrearEmpleadoDTO, Departamento, Puesto } from '@/lib/gestionPersonalService';
import { gestionPersonalService } from '@/lib/gestionPersonalService';

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
  const { toast } = useToaster();
  
  const [formData, setFormData] = useState<CrearEmpleadoDTO>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    documento: '',
    rol_id: 5,
    fecha_ingreso: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [puestos, setPuestos] = useState<Puesto[]>([]);
  const [puestosFiltrados, setPuestosFiltrados] = useState<Puesto[]>([]);
  
  // Usar useRef para mantener el documento sin disparar re-renders
  const documentoRef = useRef<string>('');

  // Cargar departamentos y puestos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadDepartamentosYPuestos();
    }
  }, [isOpen]);

  // Filtrar puestos cuando cambia el departamento
  useEffect(() => {
    if (formData.departamento_id) {
      const filtered = puestos.filter(p => p.departamento_id === formData.departamento_id);
      setPuestosFiltrados(filtered);
      // Si el puesto seleccionado no pertenece al nuevo departamento, limpiarlo
      if (formData.puesto_id && !filtered.find(p => p.id === formData.puesto_id)) {
        setFormData(prev => ({ ...prev, puesto_id: undefined }));
      }
    } else {
      setPuestosFiltrados(puestos);
    }
  }, [formData.departamento_id, puestos, formData.puesto_id]);

  const loadDepartamentosYPuestos = async () => {
    try {
      const [depts, psts] = await Promise.all([
        gestionPersonalService.getDepartamentos(),
        gestionPersonalService.getPuestos()
      ]);
      setDepartamentos(depts);
      setPuestos(psts);
      setPuestosFiltrados(psts);
    } catch (error) {
      console.error('Error cargando departamentos y puestos:', error);
    }
  };

  // Update form data when empleado changes or modal opens
  useEffect(() => {
    if (empleado && isOpen) {
      // Si el empleado tiene documento, actualizar la referencia
      if (empleado.documento) {
        documentoRef.current = empleado.documento;
      }
      
      // Usar el documento del empleado o el que está en la referencia
      const docValue = empleado.documento || documentoRef.current || '';
      
      setFormData({
        nombre: empleado.nombre,
        apellido: empleado.apellido,
        email: empleado.email,
        telefono: empleado.telefono || '',
        documento: docValue,
        rol_id: empleado.rol_id,
        fecha_ingreso: empleado.fecha_ingreso,
        departamento_id: empleado.departamento_id,
        puesto_id: empleado.puesto_id,
      });
    }
  }, [empleado, isOpen]);

  const handleSubmit = async () => {
    // Check if empleado exists
    if (!empleado) {
      toast('No se ha seleccionado ningún empleado', 'error');
      return;
    }

    // Validations
    if (!formData.nombre || !formData.apellido || !formData.email || !formData.documento) {
      toast('Por favor completa todos los campos obligatorios', 'error');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast('Por favor ingresa un email válido', 'error');
      return;
    }

    try {
      setLoading(true);
      
      const success = await updateEmpleadoFn(empleado.id, formData);
      
      if (success) {
        toast('Empleado actualizado correctamente', 'success');
        
        // Actualizar la referencia con el nuevo documento
        if (formData.documento) {
          documentoRef.current = formData.documento;
        }
        
        onEmpleadoUpdated();
        onClose();
      } else {
        toast('Error al actualizar empleado', 'error');
      }
    } catch (error: unknown) {
      console.error('Error updating empleado:', error);
      
      // HttpError del backend: error.data contiene { success, message, errors? }
      let errorMessage = 'Error al actualizar empleado';
      
      const err = error as { data?: { message?: string; errors?: string[] }; message?: string };
      
      if (err?.data) {
        if (err.data.message) {
          errorMessage = err.data.message;
        }
        if (err.data.errors && Array.isArray(err.data.errors) && err.data.errors.length > 0) {
          errorMessage += ': ' + err.data.errors.join(', ');
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      toast(errorMessage, 'error');
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
              <select
                value={formData.departamento_id || ''}
                onChange={(e) => setFormData({ ...formData, departamento_id: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
              >
                <option value="">Seleccionar departamento</option>
                {departamentos.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Puesto</label>
              <select
                value={formData.puesto_id || ''}
                onChange={(e) => setFormData({ ...formData, puesto_id: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                disabled={!formData.departamento_id}
              >
                <option value="">Seleccionar puesto</option>
                {puestosFiltrados.map((puesto) => (
                  <option key={puesto.id} value={puesto.id}>
                    {puesto.nombre}
                  </option>
                ))}
              </select>
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
