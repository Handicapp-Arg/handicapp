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
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stethoscope, Pill, FileText, Calendar } from 'lucide-react';
import { Loader } from '@/components/ui/loader';
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
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-sm text-slate-500">Cargando información...</p>
      </div>
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
          description="Gestión integral de consultas, tratamientos e historial clínico"
          icon={Stethoscope}
          breadcrumbs={[
            { label: 'Dashboard', href: '/veterinario' },
            { label: 'Atención Médica', href: '/veterinario/consultas' },
          ]}
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
