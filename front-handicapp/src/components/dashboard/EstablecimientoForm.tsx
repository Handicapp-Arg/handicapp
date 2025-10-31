'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { establecimientoService, type Establecimiento } from '@/lib/services/establecimientoService';
import { Modal } from '@/components/ui/modal';

interface EstablecimientoFormProps {
  establecimiento?: Establecimiento;
  onSave?: (establecimiento: Establecimiento) => void;
  onCancel?: () => void;
}

export const EstablecimientoForm: React.FC<EstablecimientoFormProps> = ({
  establecimiento,
  onSave,
  onCancel
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: establecimiento?.nombre || '',
    cuit: '',
    direccion_calle: establecimiento?.direccion || '',
    telefono: establecimiento?.telefono || '',
    email: establecimiento?.email || '',
    tipo_establecimiento: (establecimiento as any)?.tipo_establecimiento || 'mixto',
    estado: (establecimiento as any)?.estado || 'activo',
    superficie_hectareas: (establecimiento as any)?.superficie_hectareas || '',
    cantidad_boxes: (establecimiento as any)?.cantidad_boxes || '',
    servicios: (establecimiento as any)?.servicios || []
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result: Establecimiento;
      
      if (establecimiento?.id) {
        result = await establecimientoService.update(establecimiento.id, formData);
      } else {
        result = await establecimientoService.create(formData as any);
      }

      onSave?.(result);
    } catch (err: any) {
      // Extraer el mensaje de error más específico
      let errorMessage = 'Error al guardar el establecimiento';
      
      if (err.data) {
        const data = err.data;
        if (data.errors && Array.isArray(data.errors)) {
          // Errores de validación de express-validator
          errorMessage = data.errors.map((e: any) => `${e.path}: ${e.msg}`).join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onCancel || (() => {})} title={establecimiento ? 'Editar establecimiento' : 'Nuevo establecimiento'} size="xl">
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
              <p className="text-red-800 font-medium text-sm">{error}</p>
            </div>
          )}

          {/* Grid de dos columnas para organizar mejor */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            
            {/* Información básica y contacto */}
            <div className="space-y-4 sm:space-y-6">
              {/* Información básica */}
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Información básica</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="nombre" className="text-sm font-medium text-gray-700">Nombre *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => handleInputChange('nombre', e.target.value)}
                      placeholder="Nombre del establecimiento"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="cuit" className="text-sm font-medium text-gray-700">CUIT *</Label>
                    <Input
                      id="cuit"
                      value={formData.cuit}
                      onChange={(e) => handleInputChange('cuit', e.target.value)}
                      placeholder="20-12345678-9"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                      minLength={11}
                      maxLength={13}
                    />
                    <p className="mt-1 text-xs text-gray-500">Formato: XX-XXXXXXXX-X (11-13 caracteres)</p>
                  </div>

                  <div>
                    <Label htmlFor="direccion_calle" className="text-sm font-medium text-gray-700">Dirección *</Label>
                    <Input
                      id="direccion_calle"
                      value={formData.direccion_calle}
                      onChange={(e) => handleInputChange('direccion_calle', e.target.value)}
                      placeholder="Dirección completa"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Detalles del establecimiento */}
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Detalles</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tipo_establecimiento" className="text-sm font-medium text-gray-700">Tipo</Label>
                    <select
                      id="tipo_establecimiento"
                      value={formData.tipo_establecimiento}
                      onChange={(e) => handleInputChange('tipo_establecimiento', e.target.value)}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="mixto">Mixto</option>
                      <option value="haras">Haras</option>
                      <option value="polo">Polo</option>
                      <option value="salto">Salto</option>
                      <option value="doma">Doma</option>
                      <option value="turf">Turf</option>
                      <option value="enduro">Enduro</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="estado" className="text-sm font-medium text-gray-700">Estado</Label>
                    <select
                      id="estado"
                      value={formData.estado}
                      onChange={(e) => handleInputChange('estado', e.target.value)}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    >
                      <option value="activo">Activo</option>
                      <option value="inactivo">Inactivo</option>
                      <option value="mantenimiento">Mantenimiento</option>
                      <option value="suspendido">Suspendido</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="superficie_hectareas" className="text-sm font-medium text-gray-700">Superficie (hectáreas)</Label>
                    <Input
                      id="superficie_hectareas"
                      type="number"
                      step="0.01"
                      value={formData.superficie_hectareas}
                      onChange={(e) => handleInputChange('superficie_hectareas', e.target.value ? parseFloat(e.target.value) : '')}
                      placeholder="50.5"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cantidad_boxes" className="text-sm font-medium text-gray-700">Cantidad de boxes</Label>
                    <Input
                      id="cantidad_boxes"
                      type="number"
                      value={formData.cantidad_boxes}
                      onChange={(e) => handleInputChange('cantidad_boxes', e.target.value ? parseInt(e.target.value) : '')}
                      placeholder="20"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Contacto */}
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Contacto</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="telefono" className="text-sm font-medium text-gray-700">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => handleInputChange('telefono', e.target.value)}
                      placeholder="+54 11 1234-5678"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contacto@establecimiento.com"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción - Fijos en la parte inferior */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t border-gray-200">
            <Button type="button" variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>

            <Button type="submit" variant="brand" size="sm" isLoading={loading} disabled={loading}>
              {establecimiento ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};