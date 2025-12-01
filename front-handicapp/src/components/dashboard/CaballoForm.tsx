"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { caballoService, type Caballo, type CreateCaballoData, type UpdateCaballoData } from '@/lib/services/caballoService';
import { establecimientoService, type Establecimiento } from '@/lib/services/establecimientoService';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ApiClient from '@/lib/services/apiClient';

interface CaballoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (caballo: Caballo) => void;
  caballo?: Caballo;
}

function CaballoForm({ isOpen, onClose, onSuccess, caballo }: CaballoFormProps) {
  const { user } = useAuthNew();
  const [loading, setLoading] = useState(false);
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [caballosPadres, setCaballosPadres] = useState<Caballo[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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
    porcentaje_tenencia: 100,
    // Campos extendidos
    rp: undefined,
    sba: undefined,
    adn: undefined,
    pasaporte: undefined,
    numero_fei: undefined,
    ueln: undefined,
    altura: undefined,
    peso: undefined
  });

  // Para detectar cambio de establecimiento
  const [originalEstablecimientoId, setOriginalEstablecimientoId] = useState<number | undefined>(undefined);

  // Load data on mount
  const formatToInputDate = (dateStr?: string | null) => {
    if (!dateStr) return undefined;
    // If already in YYYY-MM-DD or ISO format, Date can parse it
    const tryIso = new Date(dateStr);
    if (!isNaN(tryIso.getTime())) {
      const y = tryIso.getFullYear();
      const m = String(tryIso.getMonth() + 1).padStart(2, '0');
      const d = String(tryIso.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    // Try DD/MM/YYYY
    const m = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (m) {
      const dd = m[1];
      const mm = m[2];
      const yyyy = m[3];
      return `${yyyy}-${mm}-${dd}`;
    }
    return undefined;
  };

  useEffect(() => {
    if (isOpen) {
      loadEstablecimientos();
      loadCaballosPadres();
      
      if (caballo) {
        const estId = caballo.asociaciones_establecimientos?.[0]?.establecimiento_id || undefined;
        setFormData({
          nombre: caballo.nombre,
          sexo: caballo.sexo || undefined,
          fecha_nacimiento: formatToInputDate(caballo.fecha_nacimiento) || undefined,
          pelaje: caballo.pelaje || undefined,
          raza: caballo.raza || undefined,
          disciplina: caballo.disciplina || undefined,
          microchip: caballo.microchip || undefined,
          establecimiento_id: estId,
          padre_id: caballo.padre_id || undefined,
          madre_id: caballo.madre_id || undefined,
          propietario_usuario_id: caballo.propiedades?.[0]?.propietario_usuario_id || user?.id || undefined,
          porcentaje_tenencia: caballo.propiedades?.[0]?.porcentaje_tenencia || 100,
          // Campos extendidos
          rp: caballo.rp || undefined,
          sba: caballo.sba || undefined,
          adn: caballo.adn || undefined,
          pasaporte: caballo.pasaporte || undefined,
          numero_fei: caballo.numero_fei || undefined,
          ueln: caballo.ueln || undefined,
          altura: caballo.altura || undefined,
          peso: caballo.peso || undefined
        });
        setOriginalEstablecimientoId(estId);
        setPreviewUrl(caballo.foto_url || null);
      } else {
        // Reset form for new caballo
        const initial: CreateCaballoData = {
          nombre: '',
          sexo: undefined,
          fecha_nacimiento: undefined,
          pelaje: undefined,
          raza: undefined,
          disciplina: undefined,
          microchip: undefined,
          foto_url: undefined,
          establecimiento_id: undefined,
          padre_id: undefined,
          madre_id: undefined,
          propietario_usuario_id: user?.id || undefined,
          porcentaje_tenencia: 100,
          // Campos extendidos
          rp: undefined,
          sba: undefined,
          adn: undefined,
          pasaporte: undefined,
          numero_fei: undefined,
          ueln: undefined,
          altura: undefined,
          peso: undefined
        };
        setFormData(initial);
        setPreviewUrl(null);
      }
      setErrors({});
    }
  }, [isOpen, caballo, user?.id]);

  const loadEstablecimientos = async () => {
    try {
      const response: any = await establecimientoService.getAll();
      const data = response.data || response;
      setEstablecimientos(Array.isArray(data) ? data : data.items || []);
    } catch (error) {    }
  };

  const loadCaballosPadres = async () => {
    try {
      const response: any = await caballoService.getAll({ limit: 100 });
      const data = response.data || response;
      const caballos = Array.isArray(data) ? data : data.caballos || [];
      setCaballosPadres(caballos.filter((c: Caballo) => c.id !== caballo?.id));
    } catch (error) {    }
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Client-side validation
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setErrors(prev => ({ ...prev, foto_url: 'Formato no soportado. Usa JPG, PNG, WEBP o GIF.' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB soft limit on client
      setErrors(prev => ({ ...prev, foto_url: 'La imagen supera los 5MB.' }));
      return;
    }

    try {
      setUploading(true);
      const form = new FormData();
      form.append('file', file);
      const res: any = await ApiClient.makeRequest('/uploads/image', {
        method: 'POST',
        // Do NOT set Content-Type manually for FormData
        body: form as any,
      });
      const url = res?.data?.url || res?.url;
      if (url) {
        handleInputChange('foto_url', url);
        setPreviewUrl(url);
        setErrors(prev => ({ ...prev, foto_url: '' }));
      } else {
        setErrors(prev => ({ ...prev, foto_url: 'No se pudo obtener la URL de la imagen.' }));
      }
    } catch (err: any) {
      setErrors(prev => ({ ...prev, foto_url: err?.message || 'Error subiendo imagen' }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (uploading) {
      setErrors(prev => ({
        ...prev,
        foto_url: prev.foto_url || 'Esperá a que la imagen termine de subir antes de guardar.'
      }));
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let result: any;
      
      // Preparar datos con conversión de tipos para campos numéricos
      const dataToSend = {
        ...formData,
        altura: formData.altura ? Number(formData.altura) : undefined,
        peso: formData.peso ? Number(formData.peso) : undefined
      };
      
      if (caballo) {
        // Update existing caballo
        result = await caballoService.update(caballo.id, dataToSend);
      } else {
        // Create new caballo
        result = await caballoService.create(dataToSend);
      }

      if (result.success || result.data || result.id) {
        const savedCaballo = result.data || result;
        onSuccess(savedCaballo);
        handleClose();
      } else {
        throw new Error(result.message || 'Error al guardar el caballo');
      }
    } catch (error: any) {
      console.error('❌ Error guardando:', error);
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
      porcentaje_tenencia: 100,
      // Campos extendidos
      rp: undefined,
      sba: undefined,
      adn: undefined,
      pasaporte: undefined,
      numero_fei: undefined,
      ueln: undefined,
      altura: undefined,
      peso: undefined
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

        {/* Datos Físicos */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Datos Físicos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="altura">Altura (cm)</Label>
              <Input
                id="altura"
                type="number"
                step="0.01"
                value={formData.altura || ''}
                onChange={(e) => handleInputChange('altura', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Ej: 165.5"
                className="font-mono"
              />
            </div>

            <div>
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input
                id="peso"
                type="number"
                step="0.01"
                value={formData.peso || ''}
                onChange={(e) => handleInputChange('peso', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Ej: 520.75"
                className="font-mono"
              />
            </div>
          </div>
        </div>

        {/* Documentación Oficial */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Documentación Oficial</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rp">RP (Registro de Propiedad)</Label>
              <Input
                id="rp"
                value={formData.rp || ''}
                onChange={(e) => handleInputChange('rp', e.target.value || undefined)}
                placeholder="Número RP"
                className="font-mono"
              />
            </div>

            <div>
              <Label htmlFor="sba">SBA (Stud Book Argentino)</Label>
              <Input
                id="sba"
                value={formData.sba || ''}
                onChange={(e) => handleInputChange('sba', e.target.value || undefined)}
                placeholder="Número SBA"
                className="font-mono"
              />
            </div>

            <div>
              <Label htmlFor="adn">ADN</Label>
              <Input
                id="adn"
                value={formData.adn || ''}
                onChange={(e) => handleInputChange('adn', e.target.value || undefined)}
                placeholder="Certificado ADN"
                className="font-mono"
              />
            </div>

            <div>
              <Label htmlFor="pasaporte">Pasaporte</Label>
              <Input
                id="pasaporte"
                value={formData.pasaporte || ''}
                onChange={(e) => handleInputChange('pasaporte', e.target.value || undefined)}
                placeholder="Número de Pasaporte"
                className="font-mono"
              />
            </div>

            <div>
              <Label htmlFor="numero_fei">N° FEI</Label>
              <Input
                id="numero_fei"
                value={formData.numero_fei || ''}
                onChange={(e) => handleInputChange('numero_fei', e.target.value || undefined)}
                placeholder="Número FEI"
                className="font-mono"
              />
            </div>

            <div>
              <Label htmlFor="ueln">UELN</Label>
              <Input
                id="ueln"
                value={formData.ueln || ''}
                onChange={(e) => handleInputChange('ueln', e.target.value || undefined)}
                placeholder="Código UELN"
                className="font-mono"
              />
            </div>
          </div>
        </div>

        {/* Imagen del caballo - Movida al final */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Imagen</h3>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center relative">
              {previewUrl ? (
                <Image 
                  src={previewUrl} 
                  alt="Preview" 
                  fill
                  className="object-cover"
                />
              ) : (
                <span className="text-4xl">🐎</span>
              )}
            </div>
            <div className="flex-1">
              <input 
                id="foto" 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                disabled={uploading}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#0f172a] file:text-white
                  hover:file:bg-[#0f172a]/90
                  file:cursor-pointer cursor-pointer" 
              />
              {errors.foto_url && <p className="text-sm text-red-600 mt-2">{errors.foto_url}</p>}
              {uploading && <p className="text-sm text-blue-600 mt-2">Subiendo imagen, por favor esperá...</p>}
              <p className="text-xs text-gray-500 mt-2">Formatos: JPG, PNG, WEBP, GIF (máx. 5MB)</p>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-6 border-t">
          <Button type="button" variant="secondary" size="sm" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="brand" size="sm" isLoading={loading || uploading} disabled={loading || uploading}>
            {caballo ? 'Actualizar' : 'Registrar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export { CaballoForm };

export default CaballoForm;