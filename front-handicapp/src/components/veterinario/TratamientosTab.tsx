/**
 * 💊 TRATAMIENTOS TAB
 * Gestión de tratamientos médicos activos
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { historialMedicoService, RegistroMedico } from '@/lib/services/historialMedicoService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pill, Calendar, Search, Plus, Activity } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function TratamientosTab() {
  const [registros, setRegistros] = useState<RegistroMedico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadTratamientos = async () => {
      try {
        const data = await historialMedicoService.getEventosMedicos({ tipo: 'tratamiento' });
        setRegistros(data);
      } catch {
        toast.error('Error al cargar tratamientos');
      } finally {
        setLoading(false);
      }
    };
    loadTratamientos();
  }, []);

  const tratamientosFiltrados = useMemo(() => {
    if (!searchTerm) return registros;
    const term = searchTerm.toLowerCase();
    return registros.filter(r =>
      r.titulo?.toLowerCase().includes(term) ||
      r.descripcion?.toLowerCase().includes(term)
    );
  }, [registros, searchTerm]);

  const stats = useMemo(() => ({
    total: registros.length,
    activos: registros.filter(r => r.estado === 'pendiente' || r.estado === 'en_progreso').length,
    completados: registros.filter(r => r.estado === 'completado').length,
  }), [registros]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-xs text-slate-500 mt-1">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.activos}</p>
            <p className="text-xs text-slate-500 mt-1">Activos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completados}</p>
            <p className="text-xs text-slate-500 mt-1">Completados</p>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Buscar tratamientos..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Link href="/veterinario/eventos">
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Tratamiento
          </Button>
        </Link>
      </div>

      {/* Lista */}
      {tratamientosFiltrados.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Pill className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <h3 className="text-base font-medium text-slate-700 mb-2">
              {searchTerm ? 'Sin resultados' : 'Sin tratamientos registrados'}
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              {searchTerm
                ? 'Probá con otro término de búsqueda'
                : 'Los tratamientos registrados como eventos aparecerán acá'}
            </p>
            {!searchTerm && (
              <Link href="/veterinario/eventos">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Tratamiento
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tratamientosFiltrados.map(tratamiento => (
            <Card key={tratamiento.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-slate-900 text-sm truncate">
                        {tratamiento.titulo}
                      </h3>
                      <Badge
                        variant={tratamiento.estado === 'completado' ? 'default' : 'secondary'}
                        className="flex-shrink-0 text-xs"
                      >
                        {tratamiento.estado || 'pendiente'}
                      </Badge>
                    </div>
                    {tratamiento.descripcion && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{tratamiento.descripcion}</p>
                    )}
                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(tratamiento.fecha_evento || '').toLocaleDateString('es-AR')}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
