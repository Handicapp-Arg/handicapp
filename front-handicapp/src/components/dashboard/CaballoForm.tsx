"use client";

import { useState, useEffect } from 'react';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { caballoService, type Caballo, type CreateCaballoData } from '@/lib/services/horseService';
import { establecimientoService, type Establecimiento } from '@/lib/services/stableService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CameraIcon, 
  MapPinIcon, 
  TagIcon, 
  IdentificationIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import ApiClient from '@/lib/services/apiClient';
import dynamic from 'next/dynamic';
const ImageCropperDialog = dynamic(() => import('@/components/ui/ImageCropperDialog').then(m => ({ default: m.ImageCropperDialog })), {
  loading: () => null,
  ssr: false,
});

interface CaballoFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (caballo: Caballo) => void;
  caballo?: Caballo;
}

export function CaballoForm({ isOpen, onClose, onSuccess, caballo }: CaballoFormProps) {
  const { user } = useAuthNew();
  const [loading, setLoading] = useState(false);
  const [establecimientos, setEstablecimientos] = useState<Establecimiento[]>([]);
  const [caballosPadres, setCaballosPadres] = useState<Caballo[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("perfil");

  // Estados para el crop de imagen
  const [showCropper, setShowCropper] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

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
    rp: undefined,
    sba: undefined,
    adn: undefined,
    pasaporte: undefined,
    numero_fei: undefined,
    ueln: undefined,
    altura: undefined,
    peso: undefined
  });

  const formatToInputDate = (dateStr?: string | null) => {
    if (!dateStr) return undefined;
    const tryIso = new Date(dateStr);
    if (!isNaN(tryIso.getTime())) {
      return tryIso.toISOString().split('T')[0];
    }
    return undefined;
  };

  useEffect(() => {
    if (isOpen) {
      loadEstablecimientos();
      loadCaballosPadres();
      setActiveTab("perfil");
      
      if (caballo) {
        setFormData({
          nombre: caballo.nombre,
          sexo: caballo.sexo || undefined,
          fecha_nacimiento: formatToInputDate(caballo.fecha_nacimiento) || undefined,
          pelaje: caballo.pelaje || undefined,
          raza: caballo.raza || undefined,
          disciplina: caballo.disciplina || undefined,
          microchip: caballo.microchip || undefined,
          establecimiento_id: caballo.asociaciones_establecimientos?.[0]?.establecimiento_id || undefined,
          padre_id: caballo.padre_id || undefined,
          madre_id: caballo.madre_id || undefined,
          propietario_usuario_id: caballo.propiedades?.[0]?.propietario_usuario_id || user?.id || undefined,
          porcentaje_tenencia: caballo.propiedades?.[0]?.porcentaje_tenencia || 100,
          rp: caballo.rp || undefined,
          sba: caballo.sba || undefined,
          adn: caballo.adn || undefined,
          pasaporte: caballo.pasaporte || undefined,
          numero_fei: caballo.numero_fei || undefined,
          ueln: caballo.ueln || undefined,
          altura: caballo.altura || undefined,
          peso: caballo.peso || undefined
        });
        setPreviewUrl(caballo.foto_url || null);
      } else {
        // Reset
        setFormData({
            nombre: '',
            sexo: undefined,
            establecimiento_id: undefined,
            propietario_usuario_id: user?.id,
            porcentaje_tenencia: 100
        });
        setPreviewUrl(null);
      }
      setErrors({});
    }
  }, [isOpen, caballo, user?.id]);

  const loadEstablecimientos = async () => {
    try {
      const response: any = await establecimientoService.getAll({ page: 1, limit: 100 });
      const data = response.data || response;
      setEstablecimientos(Array.isArray(data) ? data : data.items || []);
    } catch (error) { console.error(error); }
  };

  const loadCaballosPadres = async () => {
    try {
      const response: any = await caballoService.getAll({ limit: 100 });
      const data = response.data || response;
      const list = Array.isArray(data) ? data : data.caballos || [];
      setCaballosPadres(list.filter((c: Caballo) => c.id !== caballo?.id));
    } catch (error) { console.error(error); }
  };

  const handleInputChange = (field: keyof CreateCaballoData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value === 'null' ? undefined : value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nombre?.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (formData.porcentaje_tenencia !== undefined && (formData.porcentaje_tenencia < 0 || formData.porcentaje_tenencia > 100)) {
      newErrors.porcentaje_tenencia = 'El porcentaje debe estar entre 0 y 100';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Leer archivo para mostrar en cropper
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      setTempImageSrc(reader.result as string);
      setShowCropper(true);
      // Limpiar input para permitir seleccionar la misma imagen
      e.target.value = ''; 
    });
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setUploading(true);
    const formDataUpload = new FormData();
    // Convertir blob a file
    const file = new File([croppedBlob], "profile_image.jpg", { type: "image/jpeg" });
    formDataUpload.append('file', file);
    
    try {
      const res: any = await ApiClient.makeRequest('/uploads/image', {
        method: 'POST',
        body: formDataUpload
      });
      const url = res.data?.url || res.url;
      setFormData(prev => ({ ...prev, foto_url: url }));
      setPreviewUrl(url);
    } catch (error) {
      console.error('Upload error:', error);
      setErrors(prev => ({ ...prev, foto_url: 'Error subiendo imagen recortada' }));
    } finally {
      setUploading(false);
      setShowCropper(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (uploading) return;
    if (!validateForm()) return;

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        altura: formData.altura ? Number(formData.altura) : undefined,
        peso: formData.peso ? Number(formData.peso) : undefined
      };
      
      const result = (caballo 
        ? await caballoService.update(caballo.id, dataToSend)
        : await caballoService.create(dataToSend)) as any;

      if (result.success || result.data || result.id) {
        onSuccess(result.data || result);
        handleClose();
      }
    } catch (error: any) {
      setErrors({ submit: error.message || 'Error al guardar' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const machos = caballosPadres.filter(c => c.sexo === 'macho');
  const hembras = caballosPadres.filter(c => c.sexo === 'hembra');

  return (
    <>
      <ImageCropperDialog
        isOpen={showCropper}
        imageSrc={tempImageSrc}
        aspect={4 / 3} // Landscape/Rectangular para caballos
        onClose={() => {
            setShowCropper(false);
            setTempImageSrc(null);
        }}
        onCropComplete={handleCropComplete}
      />
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="p-0 gap-0 w-full h-full sm:h-[700px] sm:max-w-[900px] sm:rounded-md bg-white border-none shadow-md flex flex-col overflow-hidden">
        
        {/* Header Fijo */}
        <div className="shrink-0 px-6 py-5 border-b border-gray-100 bg-white z-10 flex items-start justify-between">
            <div className="flex flex-col gap-1">
                <DialogTitle className="text-xl font-bold text-gray-900">
                    {caballo ? 'Editar Caballo' : 'Nuevo Caballo'}
                </DialogTitle>
                <p className="text-sm text-gray-500">
                    {caballo ? `Modificando ficha de ${caballo.nombre}` : 'Complete los datos para el registro.'}
                </p>
            </div>
            <button 
                onClick={handleClose} 
                className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 rounded-md  -mr-2 -mt-2"
            >
                <XMarkIcon className="w-5 h-5" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
                
                {/* Tabs Fijas */}
                <div className="shrink-0 px-6 pt-4 pb-2 bg-white">
                    <TabsList className="w-full justify-start h-auto p-1 bg-gray-100/80 rounded-md grid grid-cols-4 gap-1">
                        <TabsTrigger value="perfil" className="h-10 text-xs font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">Perfil</TabsTrigger>
                        <TabsTrigger value="detalles" className="h-10 text-xs font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">Detalles</TabsTrigger>
                        <TabsTrigger value="genealogia" className="h-10 text-xs font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">Linaje</TabsTrigger>
                        <TabsTrigger value="legales" className="h-10 text-xs font-medium rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm">Legales</TabsTrigger>
                    </TabsList>
                </div>

                {/* Contenido Scrolleable */}
                <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
                    <TabsContent value="perfil" className="mt-0 h-full focus-visible:outline-none">
                        <div className="flex flex-col sm:flex-row gap-6 pb-4">
                            {/* Columna Foto */}
                            <div className="w-full sm:w-[260px] shrink-0">
                                <Label className="text-xs font-bold uppercase text-gray-400 mb-2 block tracking-wider">Foto</Label>
                                <div className="group relative w-full aspect-[4/3] rounded-md overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 hover:border-gray-300  cursor-pointer">
                                    {/* ... image upload ... */}
                                    {previewUrl ? (
                                        <div className="relative w-full h-full">
                                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20  flex items-center justify-center">
                                                <CameraIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 " />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-4">
                                            <CameraIcon className="w-10 h-10 mb-2 text-gray-300" />
                                            <span className="text-[10px] text-center font-medium">Subir Imagen</span>
                                        </div>
                                    )}
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                                    />
                                    {uploading && (
                                        <div className="absolute inset-0 bg-white/80 z-30 flex items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Columna Inputs */}
                            <div className="flex-1 space-y-5">
                                <div className="space-y-1.5">
                                    <Label htmlFor="nombre" className="text-gray-700">Nombre del Ejemplar <span className="text-red-500">*</span></Label>
                                    <Input 
                                        id="nombre" 
                                        value={formData.nombre} 
                                        onChange={e => handleInputChange('nombre', e.target.value)}
                                        className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-gray-900  text-lg font-medium"
                                        placeholder="Ej: Trueno"
                                    />
                                    {errors.nombre && <p className="text-xs text-red-500 font-medium">{errors.nombre}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-gray-600">Sexo</Label>
                                        <Select 
                                            value={formData.sexo} 
                                            onValueChange={val => handleInputChange('sexo', val)}
                                        >
                                            <SelectTrigger className="h-10 bg-white border-gray-200"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="macho">Macho</SelectItem>
                                                <SelectItem value="hembra">Hembra</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-gray-600">F. Nacimiento</Label>
                                        <Input 
                                            type="date" 
                                            value={formData.fecha_nacimiento || ''} 
                                            onChange={e => handleInputChange('fecha_nacimiento', e.target.value)}
                                            className="h-10 bg-white border-gray-200 block"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-gray-600">Establecimiento / Ubicación</Label>
                                    <Select 
                                        value={formData.establecimiento_id?.toString()} 
                                        onValueChange={val => handleInputChange('establecimiento_id', parseInt(val))}
                                    >
                                        <SelectTrigger className="h-10 bg-white border-gray-200 text-gray-700">
                                            <div className="flex items-center gap-2 truncate">
                                                <MapPinIcon className="w-4 h-4 text-gray-400" />
                                                <SelectValue placeholder="Sin asignar ubicación" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {establecimientos.map(est => (
                                                <SelectItem key={est.id} value={est.id.toString()}>{est.nombre}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="detalles" className="mt-0 h-full focus-visible:outline-none">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-4">
                            <div className="space-y-1.5">
                                <Label className="text-gray-600">Raza</Label>
                                <Input 
                                    className="h-10 bg-white" placeholder="Ej: Polo Argentino"
                                    value={formData.raza || ''}
                                    onChange={e => handleInputChange('raza', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-gray-600">Pelaje</Label>
                                <Input 
                                    className="h-10 bg-white" placeholder="Ej: Alazán"
                                    value={formData.pelaje || ''}
                                    onChange={e => handleInputChange('pelaje', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label className="text-gray-600">Disciplina Principal</Label>
                                <Select value={formData.disciplina} onValueChange={val => handleInputChange('disciplina', val)}>
                                    <SelectTrigger className="h-10 bg-white"><SelectValue placeholder="Seleccionar actividad" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="polo">Polo</SelectItem>
                                        <SelectItem value="salto">Salto</SelectItem>
                                        <SelectItem value="carrera">Carrera</SelectItem>
                                        <SelectItem value="adiestramiento">Adiestramiento</SelectItem>
                                        <SelectItem value="otro">Otro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-gray-600">Altura (metros)</Label>
                                <Input
                                    type="number" step="0.01" inputMode="decimal" className="h-10 bg-white" placeholder="1.60"
                                    value={formData.altura || ''}
                                    onChange={e => handleInputChange('altura', e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-gray-600">Peso (kg)</Label>
                                <Input
                                    type="number" inputMode="numeric" className="h-10 bg-white" placeholder="450"
                                    value={formData.peso || ''}
                                    onChange={e => handleInputChange('peso', e.target.value)}
                                />
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="genealogia" className="mt-0 h-full focus-visible:outline-none">
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-6 flex items-start gap-3">
                             <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-gray-600 font-bold text-xs">i</div>
                             <p className="text-sm text-gray-700 leading-relaxed">
                                Selecciona los padres para vincular automáticamente el linaje. Si los padres no están registrados, déjalo en blanco.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 pb-4">
                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Padre (Semental)</Label>
                                <Select 
                                    value={formData.padre_id?.toString() || 'null'} 
                                    onValueChange={val => handleInputChange('padre_id', val === 'null' ? undefined : parseInt(val))}
                                >
                                    <SelectTrigger className="h-12 bg-white hover:bg-gray-50 ">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-gray-400 shrink-0"/>
                                            <span className={formData.padre_id ? "text-gray-900" : "text-gray-500"}>
                                                {caballosPadres.find(c => c.id === formData.padre_id)?.nombre || 'Seleccionar Padre...'}
                                            </span>
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null" className="text-gray-500">-- No seleccionado --</SelectItem>
                                        {machos.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Madre (Yegua)</Label>
                                <Select 
                                    value={formData.madre_id?.toString() || 'null'} 
                                    onValueChange={val => handleInputChange('madre_id', val === 'null' ? undefined : parseInt(val))}
                                >
                                    <SelectTrigger className="h-12 bg-white hover:bg-gray-50 ">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full bg-pink-500 shrink-0"/>
                                            <span className={formData.madre_id ? "text-gray-900" : "text-gray-500"}>
                                            {caballosPadres.find(c => c.id === formData.madre_id)?.nombre || 'Seleccionar Madre...'}
                                            </span>
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null" className="text-gray-500">-- No seleccionada --</SelectItem>
                                        {hembras.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nombre}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="legales" className="mt-0 h-full focus-visible:outline-none">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-4">
                            <div className="space-y-1.5 md:col-span-2">
                                <Label className="text-gray-600">Número de Microchip</Label>
                                <div className="relative">
                                    <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input 
                                        className="h-11 pl-10 bg-white font-mono text-gray-800" 
                                        placeholder="XXXXXXXXXXXXXXXXX"
                                        value={formData.microchip || ''}
                                        onChange={e => handleInputChange('microchip', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-gray-600">Pasaporte</Label>
                                <Input className="bg-white" value={formData.pasaporte || ''} onChange={e => handleInputChange('pasaporte', e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-gray-600">Nº FEI</Label>
                                <Input className="bg-white" value={formData.numero_fei || ''} onChange={e => handleInputChange('numero_fei', e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-gray-600">SBA</Label>
                                <Input className="bg-white" value={formData.sba || ''} onChange={e => handleInputChange('sba', e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-gray-600">UELN</Label>
                                <Input className="bg-white" value={formData.ueln || ''} onChange={e => handleInputChange('ueln', e.target.value)} placeholder="Universal ID" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-gray-600">ADN</Label>
                                <Input className="bg-white" value={formData.adn || ''} onChange={e => handleInputChange('adn', e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-gray-600">Registro (RP)</Label>
                                <Input className="bg-white" value={formData.rp || ''} onChange={e => handleInputChange('rp', e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-gray-600">Tenencia Propia (%)</Label>
                                <div className="relative">
                                    <Input
                                        type="number" inputMode="numeric" min="0" max="100" className="bg-white pr-8"
                                        value={formData.porcentaje_tenencia || ''}
                                        onChange={e => handleInputChange('porcentaje_tenencia', parseInt(e.target.value))}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </div>

                {/* Footer Fijo */}
                <DialogFooter className="shrink-0 p-5 bg-white border-t border-gray-100 flex flex-col-reverse sm:flex-row gap-3 sm:gap-2">
                    <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="w-full sm:w-auto text-gray-700 bg-white border-gray-200 hover:bg-gray-50">
                        Cancelar
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={loading || uploading}
                        className="w-full sm:w-auto bg-gray-900 hover:bg-gray-700 text-white px-8 font-medium"
                    >
                        {loading ? 'Guardando...' : (caballo ? 'Guardar Cambios' : 'Crear Caballo')}
                    </Button>
                </DialogFooter>
            </Tabs>
        </form>
      </DialogContent>
    </Dialog>
    </>
  );
}

export default CaballoForm;