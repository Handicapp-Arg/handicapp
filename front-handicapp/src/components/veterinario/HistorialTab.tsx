/**
 * 📋 HISTORIAL TAB
 * Historial clínico completo de pacientes
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useCaballos } from '@/lib/hooks';
import { historialMedicoService, RegistroMedico } from '@/lib/services/historialMedicoService';
import { Caballo } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Activity, Calendar, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HistorialTab() {
  const { data: caballosData = [], isLoading: loadingCaballos } = useCaballos({ page: 1, limit: 100 });
  const [selectedCaballo, setSelectedCaballo] = useState<number | null>(null);
  const [historial, setHistorial] = useState<RegistroMedico[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  const caballos = useMemo(() => {
    return Array.isArray(caballosData)
      ? caballosData
      : ((caballosData as { data?: { caballos?: Caballo[] } })?.data?.caballos
        || (caballosData as { data?: Caballo[] })?.data
        || []);
  }, [caballosData]);

  const selectedCaballoData = caballos.find((c: Caballo) => c.id === selectedCaballo);

  const handleSelectCaballo = async (caballoId: number) => {
    setSelectedCaballo(caballoId);
    setLoadingHistorial(true);
    try {
      const data = await historialMedicoService.getHistorialCaballo(caballoId);
      setHistorial(data);
    } catch {
      toast.error('Error al cargar el historial médico');
    } finally {
      setLoadingHistorial(false);
    }
  };

  if (loadingCaballos) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Lista de Caballos */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <h3 className="font-semibold text-slate-900">Pacientes ({caballos.length})</h3>
          <p className="text-sm text-slate-500">Selecciona un paciente</p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {caballos.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">Sin caballos disponibles</p>
            ) : (
              caballos.map((caballo: Caballo) => (
                <button
                  key={caballo.id}
                  onClick={() => handleSelectCaballo(caballo.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${
                    selectedCaballo === caballo.id
                      ? 'bg-purple-50 border-2 border-purple-500'
                      : 'bg-slate-50 hover:bg-slate-100 border-2 border-transparent'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                    selectedCaballo === caballo.id ? 'bg-purple-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}>
                    🐎
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate text-sm">{caballo.nombre}</p>
                    <p className="text-xs text-slate-500 truncate">{caballo.raza || 'Sin raza'}</p>
                  </div>
                  {selectedCaballo === caballo.id && (
                    <ChevronRight className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Historial del paciente seleccionado */}
      <div className="lg:col-span-2">
        {!selectedCaballo ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-base font-medium text-slate-700 mb-1">Selecciona un paciente</h3>
              <p className="text-sm text-slate-500">Elige un caballo para ver su historial clínico completo</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            {/* Cabecera del paciente */}
            <div className="p-5 border-b border-slate-200 bg-purple-50 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-xl">
                  🐎
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{selectedCaballoData?.nombre}</h2>
                  <div className="flex gap-3 text-xs text-slate-600 mt-0.5">
                    <span>{selectedCaballoData?.raza || 'N/A'}</span>
                    <span>·</span>
                    <span>{selectedCaballoData?.sexo || 'N/A'}</span>
                    {selectedCaballoData?.edad != null && (
                      <>
                        <span>·</span>
                        <span>{selectedCaballoData.edad} años</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido */}
            <CardContent className="p-5">
              {loadingHistorial ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : historial.length === 0 ? (
                <div className="text-center py-10">
                  <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">Sin registros médicos para este paciente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historial.map((registro) => (
                    <div
                      key={registro.id}
                      className="border border-slate-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Activity className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-medium text-slate-900 text-sm">{registro.titulo}</h4>
                              <Badge variant="outline" className="mt-1 text-xs">
                                {registro.tipo_evento?.nombre || registro.tipo || 'N/A'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
                              <Calendar className="w-3 h-3" />
                              {new Date(registro.fecha_evento || '').toLocaleDateString('es-AR')}
                            </div>
                          </div>
                          {registro.descripcion && (
                            <p className="text-xs text-slate-600 mt-2 line-clamp-2">{registro.descripcion}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
