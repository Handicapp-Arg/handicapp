'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import caballoService from '@/lib/services/caballoService';
import { useToaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ApiClient from '@/lib/services/apiClient';
import { useCaballo, useActualizarCaballo } from '@/lib/hooks/useCaballosQuery';

export default function EditarCaballoPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToaster();
  const opts = caballoService.getFormOptions();
  const idStr = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string);
  const idNum = idStr ? Number(idStr) : NaN;

  // React Query hooks
  const { data: caballoData, isLoading: loading } = useCaballo(idNum);
  const actualizarCaballo = useActualizarCaballo();

  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [form, setForm] = useState({
    nombre: '',
    sexo: 'macho',
    fecha_nacimiento: '',
    raza: '',
    pelaje: '',
    microchip: '',
    disciplina: '',
    foto_url: '',
    // Documentación oficial
    rp: '',
    sba: '',
    adn: '',
    pasaporte: '',
    numero_fei: '',
    ueln: '',
    // Datos físicos
    altura: '',
    peso: ''
  });

  // Inicializar formulario con datos del caballo
  useMemo(() => {
    if (caballoData) {
      const data = (caballoData as { data?: {
        nombre?: string;
        sexo?: string;
        fecha_nacimiento?: string;
        raza?: string;
        pelaje?: string;
        microchip?: string;
        disciplina?: string;
        foto_url?: string;
        rp?: string;
        sba?: string;
        adn?: string;
        pasaporte?: string;
        numero_fei?: string;
        ueln?: string;
        altura?: number;
        peso?: number;
      } })?.data || {};
      
      setForm({
        nombre: data.nombre ?? '',
        sexo: data.sexo ?? 'macho',
        fecha_nacimiento: (data.fecha_nacimiento ?? '').slice(0, 10),
        raza: data.raza ?? '',
        pelaje: data.pelaje ?? '',
        microchip: data.microchip ?? '',
        disciplina: data.disciplina ?? '',
        foto_url: data.foto_url ?? '',
        // Documentación oficial
        rp: data.rp ?? '',
        sba: data.sba ?? '',
        adn: data.adn ?? '',
        pasaporte: data.pasaporte ?? '',
        numero_fei: data.numero_fei ?? '',
        ueln: data.ueln ?? '',
        // Datos físicos
        altura: data.altura ? String(data.altura) : '',
        peso: data.peso ? String(data.peso) : ''
      });
      setPreviewUrl(data.foto_url || null);
    }
  }, [caballoData]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones del cliente
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      toast('Formato no soportado. Usa JPG, PNG, WEBP o GIF.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast('La imagen supera los 5MB.', 'error');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);
      
      const res = await ApiClient.makeRequest('/uploads/image', {
        method: 'POST',
        body: formData,
      }) as { url?: string; data?: { url?: string } };
      
      const url = res?.data?.url || res?.url;
      if (url) {
        setForm(prev => ({ ...prev, foto_url: url }));
        setPreviewUrl(url);
        toast('Imagen subida exitosamente', 'success');
      } else {
        toast('No se pudo obtener la URL de la imagen.', 'error');
      }
    } catch (err) {
      const error = err as { message?: string };
      toast(error?.message || 'Error subiendo imagen', 'error');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idNum) return;

    // Validaciones
    if (!form.nombre.trim()) {
      toast('El nombre es obligatorio', 'error');
      return;
    }

    if (form.microchip && form.microchip.length < 10) {
      toast('El microchip debe tener al menos 10 caracteres', 'error');
      return;
    }

    try {
      const updateData = {
        nombre: form.nombre.trim(),
        sexo: form.sexo as 'macho' | 'hembra' | undefined,
        fecha_nacimiento: form.fecha_nacimiento,
        raza: form.raza || undefined,
        pelaje: form.pelaje || undefined,
        microchip: form.microchip || undefined,
        disciplina: (form.disciplina || undefined) as 'polo' | 'equitacion' | 'turf' | undefined,
        foto_url: form.foto_url || undefined,
        // Documentación oficial
        rp: form.rp || undefined,
        sba: form.sba || undefined,
        adn: form.adn || undefined,
        pasaporte: form.pasaporte || undefined,
        numero_fei: form.numero_fei || undefined,
        ueln: form.ueln || undefined,
        // Datos físicos
        altura: form.altura ? Number(form.altura) : undefined,
        peso: form.peso ? Number(form.peso) : undefined
      };
      
      await actualizarCaballo.mutateAsync({ id: idNum, data: updateData });
      
      toast('Cambios guardados exitosamente', 'success');
      // Añadir timestamp para forzar recarga de datos
      router.push(`/propietario/caballos/${idNum}?updated=${Date.now()}`);
    } catch (e) {
      const error = e as { message?: string };
      toast(error?.message || 'No se pudo guardar', 'error');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="text-gray-600">Cargando caballo...</span>
      </div>
    </div>
  );

  return (
    <SimpleRoleGuard roles={['propietario']} fallback={<div className="p-6">Sin permisos</div>}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-6">
            <button 
              onClick={() => router.push(`/propietario/caballos/${idNum}`)} 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <span>←</span> Volver al perfil del caballo
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Editar Caballo</h1>
            <p className="text-gray-600 text-sm sm:text-base">Actualiza la información de {form.nombre}</p>
          </div>

          <form onSubmit={onSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Imagen del caballo */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📸</span>
                    </div>
                    Fotografía
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center">
                    <div className="w-48 h-48 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center mb-4">
                      {previewUrl ? (
                        <Image 
                          src={previewUrl} 
                          alt="Caballo" 
                          width={192}
                          height={192}
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <span className="text-6xl">🐎</span>
                      )}
                    </div>
                    <div className="w-full">
                      <input 
                        id="foto" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        disabled={uploading}
                        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {uploading && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                          <span className="text-sm text-gray-600">Subiendo imagen...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Información del caballo */}
            <div className="lg:col-span-2 space-y-6">
              {/* Información Básica */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🏷️</span>
                    </div>
                    Información Básica
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Nombre *"
                      name="nombre"
                      value={form.nombre}
                      onChange={onChange}
                      required
                      placeholder="Nombre del caballo"
                    />
                    <div>
                      <label className="block text-sm text-foreground/80 mb-1">Sexo</label>
                      <select 
                        name="sexo" 
                        value={form.sexo} 
                        onChange={onChange} 
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent"
                      >
                        {opts.sexos.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>
                    <Input
                      label="Fecha de nacimiento"
                      type="date"
                      name="fecha_nacimiento"
                      value={form.fecha_nacimiento}
                      onChange={onChange}
                    />
                    <Input
                      label="Raza"
                      name="raza"
                      value={form.raza}
                      onChange={onChange}
                      placeholder="Ej: Sangre Pura de Carrera"
                    />
                    <Input
                      label="Pelaje"
                      name="pelaje"
                      value={form.pelaje}
                      onChange={onChange}
                      placeholder="Ej: Alazán, Tordillo, etc."
                    />
                    <div>
                      <label className="block text-sm text-foreground/80 mb-1">Disciplina</label>
                      <select 
                        name="disciplina" 
                        value={form.disciplina} 
                        onChange={onChange} 
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:border-transparent"
                      >
                        <option value="">— Seleccionar —</option>
                        {opts.disciplinas.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Información Técnica */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">🔬</span>
                    </div>
                    Identificación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    label="Microchip"
                    name="microchip"
                    value={form.microchip}
                    onChange={onChange}
                    placeholder="Número de microchip (mínimo 10 caracteres)"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    El microchip debe tener al menos 10 caracteres para ser válido
                  </p>
                </CardContent>
              </Card>

              {/* Datos Físicos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📏</span>
                    </div>
                    Datos Físicos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Altura (cm)"
                      type="number"
                      name="altura"
                      value={form.altura}
                      onChange={onChange}
                      placeholder="Ej: 165"
                      step="0.01"
                      min="0"
                    />
                    <Input
                      label="Peso (kg)"
                      type="number"
                      name="peso"
                      value={form.peso}
                      onChange={onChange}
                      placeholder="Ej: 550"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Documentación Oficial */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg">📋</span>
                    </div>
                    Documentación Oficial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="RP (Registro Pedigree)"
                      name="rp"
                      value={form.rp}
                      onChange={onChange}
                      placeholder="Ej: ARG123456"
                    />
                    <Input
                      label="SBA (Stud Book Argentino)"
                      name="sba"
                      value={form.sba}
                      onChange={onChange}
                      placeholder="Ej: SBA789"
                    />
                    <Input
                      label="ADN (Código Genético)"
                      name="adn"
                      value={form.adn}
                      onChange={onChange}
                      placeholder="Ej: DNA-XYZ-2024"
                    />
                    <Input
                      label="Pasaporte Equino"
                      name="pasaporte"
                      value={form.pasaporte}
                      onChange={onChange}
                      placeholder="Ej: PASS-001"
                    />
                    <Input
                      label="N° FEI (Fed. Ecuestre Int.)"
                      name="numero_fei"
                      value={form.numero_fei}
                      onChange={onChange}
                      placeholder="Ej: FEI10012345"
                    />
                    <Input
                      label="UELN (ID Universal)"
                      name="ueln"
                      value={form.ueln}
                      onChange={onChange}
                      placeholder="Ej: 528210000123456"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => router.back()}
                  disabled={actualizarCaballo.isPending || uploading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  variant="brand" 
                  isLoading={actualizarCaballo.isPending}
                  disabled={actualizarCaballo.isPending || uploading}
                >
                  {actualizarCaballo.isPending ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
