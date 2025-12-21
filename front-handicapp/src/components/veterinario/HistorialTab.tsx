/**
 * 📋 HISTORIAL TAB
 * Historial clínico completo de pacientes
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, AlertCircle, Search } from 'lucide-react';

export default function HistorialTab() {
  // TODO: Implementar lógica de historial cuando el backend esté listo
  
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Historial Clínico
          </h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Accede al historial médico completo de cada paciente, incluyendo consultas previas, tratamientos y diagnósticos
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Funcionalidad en desarrollo - Próximamente disponible</span>
          </div>

          <Button className="bg-blue-600 hover:bg-blue-700">
            <Search className="w-4 h-4 mr-2" />
            Buscar Historial
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
