'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { establecimientoService, type Establecimiento, type CreateEstablecimientoData } from '@/lib/services/establecimientoService';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
  const [formData, setFormData] = useState<CreateEstablecimientoData>({
    nombre: establecimiento?.nombre || '',
    direccion: establecimiento?.direccion || '',
    telefono: establecimiento?.telefono || '',
    email: establecimiento?.email || '',
    tipo_establecimiento: establecimiento?.tipo_establecimiento || 'haras',
    superficie_hectareas: establecimiento?.superficie_hectareas || undefined,
    cantidad_boxes: establecimiento?.cantidad_boxes || undefined,
    cantidad_paddocks: establecimiento?.cantidad_paddocks || undefined,
    servicios_disponibles: establecimiento?.servicios_disponibles || []
  });

  const handleInputChange = (field: keyof CreateEstablecimientoData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleServiciosChange = (servicios: string) => {
    const serviciosArray = servicios.split(',').map(s => s.trim()).filter(s => s.length > 0);
    setFormData(prev => ({ ...prev, servicios_disponibles: serviciosArray }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result: Establecimiento;
      
      if (establecimiento?.id) {
        // Editar establecimiento existente
        result = await establecimientoService.update(establecimiento.id, formData);
      } else {
        // Crear nuevo establecimiento
        result = await establecimientoService.create(formData);
      }

      onSave?.(result);
    } catch (err: any) {
      setError(err.message || 'Error al guardar el establecimiento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-6 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-xl sm:text-2xl">🏛️</span>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            {establecimiento ? 'Editar Establecimiento' : 'Nuevo Establecimiento'}
          </h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4">
              <p className="text-red-800 font-medium text-sm">{error}</p>
            </div>
          )}

          {/* Grid de dos columnas para organizar mejor */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Columna izquierda */}
            <div className="space-y-4 sm:space-y-6">
              {/* Información básica */}
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center mb-4">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                    <span className="text-sm sm:text-base">📝</span>
                  </span>
                  Información Básica
                </h3>
                
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
                    <Label htmlFor="tipo_establecimiento" className="text-sm font-medium text-gray-700">Tipo *</Label>
                    <select
                      id="tipo_establecimiento"
                      value={formData.tipo_establecimiento}
                      onChange={(e) => handleInputChange('tipo_establecimiento', e.target.value as any)}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="haras">Haras</option>
                      <option value="polo">Polo</option>
                      <option value="salto">Salto</option>
                      <option value="doma">Doma</option>
                      <option value="turf">Turf</option>
                      <option value="mixto">Mixto</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="direccion" className="text-sm font-medium text-gray-700">Dirección *</Label>
                    <Input
                      id="direccion"
                      value={formData.direccion}
                      onChange={(e) => handleInputChange('direccion', e.target.value)}
                      placeholder="Dirección completa"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contacto */}
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center mb-4">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                    <span className="text-sm sm:text-base">📞</span>
                  </span>
                  Contacto
                </h3>
                
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

            {/* Columna derecha */}
            <div className="space-y-4 sm:space-y-6">
              {/* Características físicas */}
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center mb-4">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                    <span className="text-sm sm:text-base">🏞️</span>
                  </span>
                  Características
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="superficie_hectareas" className="text-sm font-medium text-gray-700">Superficie (ha)</Label>
                    <Input
                      id="superficie_hectareas"
                      type="number"
                      min="0"
                      step="0.1"
                      value={formData.superficie_hectareas || ''}
                      onChange={(e) => handleInputChange('superficie_hectareas', e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="0.0"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cantidad_boxes" className="text-sm font-medium text-gray-700">Boxes</Label>
                    <Input
                      id="cantidad_boxes"
                      type="number"
                      min="0"
                      value={formData.cantidad_boxes || ''}
                      onChange={(e) => handleInputChange('cantidad_boxes', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="0"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <Label htmlFor="cantidad_paddocks" className="text-sm font-medium text-gray-700">Paddocks</Label>
                    <Input
                      id="cantidad_paddocks"
                      type="number"
                      min="0"
                      value={formData.cantidad_paddocks || ''}
                      onChange={(e) => handleInputChange('cantidad_paddocks', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="0"
                      className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Servicios disponibles */}
              <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center mb-4">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
                    <span className="text-sm sm:text-base">🛠️</span>
                  </span>
                  Servicios
                </h3>
                
                <div>
                  <Label htmlFor="servicios_disponibles" className="text-sm font-medium text-gray-700">Servicios disponibles</Label>
                  <Textarea
                    id="servicios_disponibles"
                    value={formData.servicios_disponibles?.join(', ') || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleServiciosChange(e.target.value)}
                    placeholder="Veterinaria, Herrería, Entrenamiento..."
                    rows={4}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separados por comas
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botones de acción - Fijos en la parte inferior */}
          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t border-gray-200 sticky bottom-0 bg-white">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg font-medium transition-colors"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <CheckIcon className="h-4 w-4 mr-2" />
              )}
              {establecimiento ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};