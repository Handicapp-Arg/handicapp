/**
 * 💊 TRATAMIENTOS TAB
 * Gestión de tratamientos médicos activos
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, Plus, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function TratamientosTab() {
  // TODO: Implementar lógica de tratamientos cuando el backend esté listo
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Pill className="w-10 h-10 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Tratamientos Médicos
          </h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Gestiona planes de tratamiento, medicaciones y seguimiento de terapias veterinarias
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Funcionalidad en desarrollo - Próximamente disponible</span>
          </div>

          <Link href="/veterinario/tratamientos/crear">
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Tratamiento
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
