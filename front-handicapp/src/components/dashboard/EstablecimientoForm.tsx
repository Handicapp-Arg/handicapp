'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {establecimiento ? 'Editar Establecimiento' : 'Nuevo Establecimiento'}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                placeholder="Nombre del establecimiento"
                required
              />
            </div>

            <div>
              <Label htmlFor="tipo_establecimiento">Tipo de Establecimiento *</Label>
              <select
                id="tipo_establecimiento"
                value={formData.tipo_establecimiento}
                onChange={(e) => handleInputChange('tipo_establecimiento', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
          </div>

          <div>
            <Label htmlFor="direccion">Dirección *</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => handleInputChange('direccion', e.target.value)}
              placeholder="Dirección completa del establecimiento"
              required
            />
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                placeholder="+54 11 1234-5678"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="contacto@establecimiento.com"
              />
            </div>
          </div>

          {/* Características físicas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="superficie_hectareas">Superficie (hectáreas)</Label>
              <Input
                id="superficie_hectareas"
                type="number"
                min="0"
                step="0.1"
                value={formData.superficie_hectareas || ''}
                onChange={(e) => handleInputChange('superficie_hectareas', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.0"
              />
            </div>

            <div>
              <Label htmlFor="cantidad_boxes">Cantidad de Boxes</Label>
              <Input
                id="cantidad_boxes"
                type="number"
                min="0"
                value={formData.cantidad_boxes || ''}
                onChange={(e) => handleInputChange('cantidad_boxes', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="cantidad_paddocks">Cantidad de Paddocks</Label>
              <Input
                id="cantidad_paddocks"
                type="number"
                min="0"
                value={formData.cantidad_paddocks || ''}
                onChange={(e) => handleInputChange('cantidad_paddocks', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Servicios disponibles */}
          <div>
            <Label htmlFor="servicios_disponibles">Servicios Disponibles</Label>
            <Textarea
              id="servicios_disponibles"
              value={formData.servicios_disponibles?.join(', ') || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleServiciosChange(e.target.value)}
              placeholder="Veterinaria, Herrería, Entrenamiento, etc. (separados por comas)"
              rows={3}
            />
            <p className="text-sm text-gray-500 mt-1">
              Ingresa los servicios separados por comas
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={loading}
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <CheckIcon className="h-4 w-4 mr-2" />
              )}
              {establecimiento ? 'Actualizar' : 'Crear'} Establecimiento
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};