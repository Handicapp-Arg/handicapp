"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { caballoService, type Caballo, type CreateCaballoData, type UpdateCaballoData } from '@/lib/services/caballoService';
import { establecimientoService, type Establecimiento } from '@/lib/services/establecimientoService';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CaballoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (caballo: Caballo) => void;
  caballo?: Caballo;
}

function CaballoForm({ isOpen, onClose, onSuccess, caballo }: CaballoFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [caballosPadres, setCaballosPadres] = useState<Caballo[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form data
  const [formData, setFormData] = useState<CreateCaballoData>({
    nombre: '',
    sexo: undefined,
    fecha_nacimiento: undefined,
    pelaje: undefined,
    raza: undefined,
    disciplina: undefined,
    microchip: undefined,
    establecimiento_id: undefined,
    padre_id: undefined,
    madre_id: undefined,
    propietario_usuario_id: user?.id || undefined,
    porcentaje_tenencia: 100
  });

  // Load data on mount
  useEffect(() => {
    if (isOpen) {
      loadEstablecimientos();
      loadCaballosPadres();
      
      if (caballo) {
        setFormData({
          nombre: caballo.nombre,
          sexo: caballo.sexo || undefined,
          fecha_nacimiento: caballo.fecha_nacimiento || undefined,
          pelaje: caballo.pelaje || undefined,
          raza: caballo.raza || undefined,
          disciplina: caballo.disciplina || undefined,
          microchip: caballo.microchip || undefined,
          establecimiento_id: caballo.asociaciones_establecimientos?.[0]?.establecimiento_id || undefined,
          padre_id: caballo.padre_id || undefined,
          madre_id: caballo.madre_id || undefined,
          propietario_usuario_id: caballo.propiedades?.[0]?.propietario_usuario_id || user?.id || undefined,
          porcentaje_tenencia: caballo.propiedades?.[0]?.porcentaje_tenencia || 100
        });
      } else {
        // Reset form for new caballo
        setFormData({
          nombre: '',
          sexo: undefined,
          fecha_nacimiento: undefined,
          pelaje: undefined,
          raza: undefined,
          disciplina: undefined,
          microchip: undefined,
          establecimiento_id: undefined,
          padre_id: undefined,
          madre_id: undefined,
          propietario_usuario_id: user?.id || undefined,
          porcentaje_tenencia: 100
        });
      }
      setErrors({});
    }
  }, [isOpen, caballo, user?.id]);

  const loadEstablecimientos = async () => {
    try {
      const response: any = await establecimientoService.getAll();
      const data = response.data || response;
      setEstablecimientos(Array.isArray(data) ? data : data.items || []);
    } catch (error) {
      console.error('Error loading establecimientos:', error);
    }
  };

  const loadCaballosPadres = async () => {
    try {
      const response: any = await caballoService.getAll({ limit: 100 });
      const data = response.data || response;
      const caballos = Array.isArray(data) ? data : data.caballos || [];
      setCaballosPadres(caballos.filter((c: Caballo) => c.id !== caballo?.id));
    } catch (error) {
      console.error('Error loading caballos:', error);
    }
  };

  const handleInputChange = (field: keyof CreateCaballoData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre?.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }

    if (formData.microchip && formData.microchip.length < 10) {
      newErrors.microchip = 'El microchip debe tener al menos 10 caracteres';
    }

    if (formData.porcentaje_tenencia !== undefined && (formData.porcentaje_tenencia < 0 || formData.porcentaje_tenencia > 100)) {
      newErrors.porcentaje_tenencia = 'El porcentaje debe estar entre 0 y 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let result: any;
      
      if (caballo) {
        // Update existing caballo
        const updateData: UpdateCaballoData = { ...formData };
        result = await caballoService.update(caballo.id, updateData);
      } else {
        // Create new caballo
        result = await caballoService.create(formData);
      }

      if (result.success || result.data || result.id) {
        const savedCaballo = result.data || result;
        onSuccess(savedCaballo);
        handleClose();
      } else {
        throw new Error(result.message || 'Error al guardar el caballo');
      }
    } catch (error: any) {
      console.error('Error saving caballo:', error);
      setErrors({ submit: error.message || 'Error al guardar el caballo' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      nombre: '',
      sexo: undefined,
      fecha_nacimiento: undefined,
      pelaje: undefined,
      raza: undefined,
      disciplina: undefined,
      microchip: undefined,
      establecimiento_id: undefined,
      padre_id: undefined,
      madre_id: undefined,
      propietario_usuario_id: user?.id || undefined,
      porcentaje_tenencia: 100
    });
    setErrors({});
    onClose();
  };

  const machosPadres = caballosPadres.filter(c => c.sexo === 'macho');
  const hembrasMadres = caballosPadres.filter(c => c.sexo === 'hembra');

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={caballo ? 'Editar Caballo' : 'Registrar Nuevo Caballo'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {errors.submit}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Información Básica</h3>
            
            <div>
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                placeholder="Nombre del caballo"
                className={errors.nombre ? 'border-red-500' : ''}
              />
              {errors.nombre && <p className="text-sm text-red-600 mt-1">{errors.nombre}</p>}
            </div>

            <div>
              <Label htmlFor="sexo">Sexo</Label>
              <select
                id="sexo"
                value={formData.sexo || ''}
                onChange={(e) => handleInputChange('sexo', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar sexo</option>
                <option value="macho">Macho</option>
                <option value="hembra">Hembra</option>
              </select>
            </div>

            <div>
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                value={formData.fecha_nacimiento || ''}
                onChange={(e) => handleInputChange('fecha_nacimiento', e.target.value || undefined)}
              />
            </div>

            <div>
              <Label htmlFor="raza">Raza</Label>
              <Input
                id="raza"
                value={formData.raza || ''}
                onChange={(e) => handleInputChange('raza', e.target.value || undefined)}
                placeholder="Raza del caballo"
              />
            </div>

            <div>
              <Label htmlFor="pelaje">Pelaje</Label>
              <Input
                id="pelaje"
                value={formData.pelaje || ''}
                onChange={(e) => handleInputChange('pelaje', e.target.value || undefined)}
                placeholder="Color del pelaje"
              />
            </div>
          </div>

          {/* Información Técnica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Información Técnica</h3>
            
            <div>
              <Label htmlFor="disciplina">Disciplina</Label>
              <select
                id="disciplina"
                value={formData.disciplina || ''}
                onChange={(e) => handleInputChange('disciplina', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar disciplina</option>
                <option value="polo">Polo</option>
                <option value="equitacion">Equitación</option>
                <option value="turf">Turf</option>
              </select>
            </div>

            <div>
              <Label htmlFor="microchip">Microchip</Label>
              <Input
                id="microchip"
                value={formData.microchip || ''}
                onChange={(e) => handleInputChange('microchip', e.target.value || undefined)}
                placeholder="Número de microchip"
                className={errors.microchip ? 'border-red-500' : ''}
              />
              {errors.microchip && <p className="text-sm text-red-600 mt-1">{errors.microchip}</p>}
            </div>

            <div>
              <Label htmlFor="establecimiento_id">Establecimiento</Label>
              <select
                id="establecimiento_id"
                value={formData.establecimiento_id || ''}
                onChange={(e) => handleInputChange('establecimiento_id', Number(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar establecimiento</option>
                {establecimientos.map((est) => (
                  <option key={est.id} value={est.id}>
                    {est.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="porcentaje_tenencia">Porcentaje de Tenencia (%)</Label>
              <Input
                id="porcentaje_tenencia"
                type="number"
                min="0"
                max="100"
                value={formData.porcentaje_tenencia || ''}
                onChange={(e) => handleInputChange('porcentaje_tenencia', Number(e.target.value) || undefined)}
                className={errors.porcentaje_tenencia ? 'border-red-500' : ''}
              />
              {errors.porcentaje_tenencia && <p className="text-sm text-red-600 mt-1">{errors.porcentaje_tenencia}</p>}
            </div>
          </div>
        </div>

        {/* Genealogía */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Genealogía</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="padre_id">Padre</Label>
              <select
                id="padre_id"
                value={formData.padre_id || ''}
                onChange={(e) => handleInputChange('padre_id', Number(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin padre registrado</option>
                {machosPadres.map((caballo) => (
                  <option key={caballo.id} value={caballo.id}>
                    {caballo.nombre} - {caballo.raza || 'Sin raza'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="madre_id">Madre</Label>
              <select
                id="madre_id"
                value={formData.madre_id || ''}
                onChange={(e) => handleInputChange('madre_id', Number(e.target.value) || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin madre registrada</option>
                {hembrasMadres.map((caballo) => (
                  <option key={caballo.id} value={caballo.id}>
                    {caballo.nombre} - {caballo.raza || 'Sin raza'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? 'Guardando...' : (caballo ? 'Actualizar' : 'Registrar')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default CaballoForm;