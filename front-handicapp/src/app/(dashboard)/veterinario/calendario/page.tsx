'use client';

import React, { useState, useEffect } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { historialMedicoService, RegistroMedico } from '@/lib/services/historialMedicoService';
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function CalendarioMedicoPage() {
  const [fecha, setFecha] = useState(new Date());
  const [eventos, setEventos] = useState<RegistroMedico[]>([]);
  const [loading, setLoading] = useState(true);
  const [vistaSeleccionada, setVistaSeleccionada] = useState<'mes' | 'semana'>('mes');

  const mesActual = fecha.getMonth();
  const anioActual = fecha.getFullYear();

  useEffect(() => {
    cargarEventos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesActual, anioActual]);

  const cargarEventos = async () => {
    try {
      setLoading(true);
      const data = await historialMedicoService.getCalendarioConsultas(mesActual + 1, anioActual);
      setEventos(data);
    } catch (error) {
      console.error('Error cargando calendario:', error);
      toast.error('Error al cargar el calendario');
    } finally {
      setLoading(false);
    }
  };

  const cambiarMes = (direccion: number) => {
    setFecha(prev => {
      const nuevaFecha = new Date(prev);
      nuevaFecha.setMonth(prev.getMonth() + direccion);
      return nuevaFecha;
    });
  };

  const obtenerDiasMes = () => {
    const primerDia = new Date(anioActual, mesActual, 1);
    const ultimoDia = new Date(anioActual, mesActual + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const primerDiaSemana = primerDia.getDay();
    
    const dias: (number | null)[] = [];
    
    // Agregar días vacíos al inicio
    for (let i = 0; i < primerDiaSemana; i++) {
      dias.push(null);
    }
    
    // Agregar días del mes
    for (let i = 1; i <= diasEnMes; i++) {
      dias.push(i);
    }
    
    return dias;
  };

  const obtenerEventosDia = (dia: number) => {
    return eventos.filter(evento => {
      const fechaEvento = new Date(evento.fecha_evento);
      return fechaEvento.getDate() === dia &&
             fechaEvento.getMonth() === mesActual &&
             fechaEvento.getFullYear() === anioActual;
    });
  };

  const esHoy = (dia: number) => {
    const hoy = new Date();
    return dia === hoy.getDate() &&
           mesActual === hoy.getMonth() &&
           anioActual === hoy.getFullYear();
  };

  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <SimpleRoleGuard roles={['veterinario']} fallback={
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-4">🚫</div>
          <h3 className="text-lg font-medium text-gray-900">Sin permisos</h3>
          <p className="text-gray-600">Solo veterinarios pueden acceder</p>
        </div>
      </div>
    }>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Calendar className="w-8 h-8 text-purple-600" />
                  Calendario Médico
                </h1>
                <p className="text-gray-600">
                  Visualiza y gestiona las consultas médicas programadas
                </p>
              </div>
            </div>
          </div>

          {/* Controles del Calendario */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => cambiarMes(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900 min-w-[200px] text-center">
                  {nombresMeses[mesActual]} {anioActual}
                </h2>
                <button
                  onClick={() => cambiarMes(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setFecha(new Date())}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  Hoy
                </button>
                <button
                  onClick={() => setVistaSeleccionada('mes')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    vistaSeleccionada === 'mes'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Mes
                </button>
              </div>
            </div>
          </div>

          {/* Calendario */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando calendario...</p>
              </div>
            ) : (
              <div className="p-4">
                {/* Encabezados de días */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {diasSemana.map(dia => (
                    <div key={dia} className="text-center font-semibold text-gray-600 py-2">
                      {dia}
                    </div>
                  ))}
                </div>

                {/* Grid de días */}
                <div className="grid grid-cols-7 gap-2">
                  {obtenerDiasMes().map((dia, index) => {
                    const eventosDia = dia ? obtenerEventosDia(dia) : [];
                    const esHoyDia = dia ? esHoy(dia) : false;

                    return (
                      <div
                        key={index}
                        className={`min-h-[100px] border rounded-lg p-2 ${
                          dia
                            ? esHoyDia
                              ? 'bg-purple-50 border-purple-400 border-2'
                              : eventosDia.length > 0
                              ? 'bg-blue-50 border-blue-200 hover:border-blue-400 cursor-pointer'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                            : 'bg-gray-50 border-gray-100'
                        }`}
                      >
                        {dia && (
                          <>
                            <div className={`text-sm font-semibold mb-1 ${
                              esHoyDia ? 'text-purple-600' : 'text-gray-900'
                            }`}>
                              {dia}
                            </div>
                            
                            <div className="space-y-1">
                              {eventosDia.slice(0, 2).map(evento => (
                                <Link
                                  key={evento.id}
                                  href={`/veterinario/historial?evento=${evento.id}`}
                                  className={`block text-xs p-1 rounded truncate ${
                                    evento.gravedad === 'critico'
                                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                      : evento.gravedad === 'grave'
                                      ? 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                                  }`}
                                  title={evento.titulo}
                                >
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{evento.titulo}</span>
                                  </div>
                                </Link>
                              ))}
                              {eventosDia.length > 2 && (
                                <div className="text-xs text-gray-600 font-medium px-1">
                                  +{eventosDia.length - 2} más
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Resumen del mes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Consultas</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{eventos.length}</p>
                </div>
                <Calendar className="w-12 h-12 text-purple-200" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-3xl font-bold text-orange-600 mt-1">
                    {eventos.filter(e => !e.validado).length}
                  </p>
                </div>
                <Clock className="w-12 h-12 text-orange-200" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Casos Críticos</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">
                    {eventos.filter(e => e.gravedad === 'critico').length}
                  </p>
                </div>
                <AlertCircle className="w-12 h-12 text-red-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
