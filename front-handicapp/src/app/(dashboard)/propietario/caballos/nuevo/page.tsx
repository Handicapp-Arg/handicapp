'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import caballoService from '@/lib/services/caballoService';
import { useToaster } from '@/components/ui/toaster';

export default function NuevoCaballoPage() {
  const router = useRouter();
  const { toast } = useToaster();
  const opts = caballoService.getFormOptions();

  const [form, setForm] = useState({
    nombre: '',
    sexo: 'macho',
    fecha_nacimiento: '',
    raza: '',
    pelaje: '',
    microchip: '',
    disciplina: '',
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
  const [saving, setSaving] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.fecha_nacimiento) {
      toast('Completá nombre y fecha de nacimiento', 'warning');
      return;
    }
    try {
      setSaving(true);
      await caballoService.create({
        nombre: form.nombre.trim(),
        sexo: form.sexo as any,
        fecha_nacimiento: form.fecha_nacimiento,
        raza: form.raza || undefined,
        pelaje: form.pelaje || undefined,
        microchip: form.microchip || undefined,
        disciplina: (form.disciplina || undefined) as any,
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
      });
      toast('Caballo creado', 'success');
      router.push('/propietario/caballos');
    } catch (e: any) {
      toast(e?.message || 'No se pudo crear', 'error');
    } finally { setSaving(false); }
  };

  return (
    <SimpleRoleGuard roles={['propietario']} fallback={<div className="p-6">Sin permisos</div>}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <button onClick={() => router.push('/propietario/caballos')} className="text-sm text-gray-600 mb-4">← Volver</button>
          <div className="bg-white rounded-xl border p-6">
            <h1 className="text-2xl font-bold text-[#0f172a] mb-6">Nuevo Caballo</h1>
            
            <form onSubmit={onSubmit} className="space-y-8">
              {/* Información Básica */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Información Básica
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre <span className="text-red-500">*</span>
                    </label>
                    <input 
                      name="nombre" 
                      value={form.nombre} 
                      onChange={onChange} 
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#af936f] focus:border-transparent" 
                      required 
                      placeholder="Ej: Relámpago"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sexo <span className="text-red-500">*</span>
                    </label>
                    <select 
                      name="sexo" 
                      value={form.sexo} 
                      onChange={onChange} 
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#af936f] focus:border-transparent"
                    >
                      {opts.sexos.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de nacimiento <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="date" 
                      name="fecha_nacimiento" 
                      value={form.fecha_nacimiento} 
                      onChange={onChange} 
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#af936f] focus:border-transparent" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Raza</label>
                    <input 
                      name="raza" 
                      value={form.raza} 
                      onChange={onChange} 
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#af936f] focus:border-transparent" 
                      placeholder="Ej: Pura Sangre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pelaje</label>
                    <input 
                      name="pelaje" 
                      value={form.pelaje} 
                      onChange={onChange} 
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#af936f] focus:border-transparent" 
                      placeholder="Ej: Alazán"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Microchip</label>
                    <input 
                      name="microchip" 
                      value={form.microchip} 
                      onChange={onChange} 
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#af936f] focus:border-transparent font-mono" 
                      placeholder="Ej: 1234567890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Disciplina</label>
                    <select 
                      name="disciplina" 
                      value={form.disciplina} 
                      onChange={onChange} 
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#af936f] focus:border-transparent"
                    >
                      <option value="">Seleccionar...</option>
                      {opts.disciplinas.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Datos Físicos */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Datos Físicos
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label>
                    <input 
                      type="number" 
                      name="altura" 
                      value={form.altura} 
                      onChange={onChange} 
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#af936f] focus:border-transparent" 
                      placeholder="Ej: 165"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                    <input 
                      type="number" 
                      name="peso" 
                      value={form.peso} 
                      onChange={onChange} 
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#af936f] focus:border-transparent" 
                      placeholder="Ej: 550"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Documentación Oficial */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Documentación Oficial
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      RP (Registro Pedigree)
                    </label>
                    <input 
                      name="rp" 
                      value={form.rp} 
                      onChange={onChange} 
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#af936f] focus:border-transparent font-mono" 
                      placeholder="Ej: ARG123456"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SBA (Stud Book Argentino)
                    </label>
                    <input 
                      name="sba" 
                      value={form.sba} 
                      onChange={onChange} 
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#af936f] focus:border-transparent font-mono" 
                      placeholder="Ej: SBA789"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ADN (Código Genético)
                    </label>
                    <input 
                      name="adn" 
                      value={form.adn} 
                      onChange={onChange} 
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#af936f] focus:border-transparent font-mono" 
                      placeholder="Ej: DNA-XYZ-2024"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pasaporte Equino
                    </label>
                    <input 
                      name="pasaporte" 
                      value={form.pasaporte} 
                      onChange={onChange} 
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#af936f] focus:border-transparent font-mono" 
                      placeholder="Ej: PASS-001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      N° FEI (Fed. Ecuestre Int.)
                    </label>
                    <input 
                      name="numero_fei" 
                      value={form.numero_fei} 
                      onChange={onChange} 
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#af936f] focus:border-transparent font-mono" 
                      placeholder="Ej: FEI10012345"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      UELN (ID Universal)
                    </label>
                    <input 
                      name="ueln" 
                      value={form.ueln} 
                      onChange={onChange} 
                      className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#af936f] focus:border-transparent font-mono" 
                      placeholder="Ej: 528210000123456"
                    />
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={() => router.back()} 
                  className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="px-6 py-2.5 rounded-lg bg-[#0f172a] text-white hover:bg-[#0f172a]/90 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Guardando...' : 'Guardar Caballo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
