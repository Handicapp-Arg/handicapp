'use client';

/**
 * 🏥 ATENCIÓN MÉDICA - HUB CENTRAL VETERINARIO
 * 
 * Consolidación de:
 * - Consultas Médicas
 * - Tratamientos Activos
 * - Historial Clínico
 * 
 * @architecture Sistema de tabs con lazy loading y estado compartido
 * @pattern Composición de componentes + React Query
 */

import React, { useState, Suspense, lazy } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { PageHeader } from '@/components/ui/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stethoscope, Pill, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';

// Lazy loading de componentes pesados para optimizar carga inicial
const ConsultasTab = lazy(() => import('@/components/veterinario/ConsultasTab'));
const TratamientosTab = lazy(() => import('@/components/veterinario/TratamientosTab'));
const HistorialTab = lazy(() => import('@/components/veterinario/HistorialTab'));

/**
 * Loading fallback component
 */
function TabLoadingFallback() {
  return (
    <div className="space-y-4 py-6">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}

/**
 * Main Component - Atención Médica
 */
export default function AtencionMedicaPage() {
  const [activeTab, setActiveTab] = useState('consultas');

  return (
    <SimpleRoleGuard roles={['veterinario']}>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Atención Médica"
          subtitle="Gestión integral de consultas, tratamientos e historial clínico"
        />

        {/* Tabs Navigation */}
        <Card className="shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-slate-200 bg-slate-50/50">
              <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-auto">
                <TabsTrigger 
                  value="consultas" 
                  className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-4"
                >
                  <Stethoscope className="w-4 h-4 mr-2" />
                  <span className="font-semibold">Consultas</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="tratamientos"
                  className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-4"
                >
                  <Pill className="w-4 h-4 mr-2" />
                  <span className="font-semibold">Tratamientos</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="historial"
                  className="relative rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-4"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="font-semibold">Historial</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content with Suspense */}
            <div className="p-6">
              <Suspense fallback={<TabLoadingFallback />}>
                <TabsContent value="consultas" className="mt-0">
                  <ConsultasTab />
                </TabsContent>

                <TabsContent value="tratamientos" className="mt-0">
                  <TratamientosTab />
                </TabsContent>

                <TabsContent value="historial" className="mt-0">
                  <HistorialTab />
                </TabsContent>
              </Suspense>
            </div>
          </Tabs>
        </Card>
      </div>
    </SimpleRoleGuard>
  );
}
