'use client';

import React, { useState } from 'react';
import { Building2, Search, MapPin } from 'lucide-react';
import { EstablecimientoList } from './EstablecimientoList';
import { EstablecimientoMapView } from './EstablecimientoMapView';
import { EstablecimientoExplorarView } from './EstablecimientoExplorarView';
import type { Establecimiento } from '@/lib/services/establecimientoService';

interface EstablecimientoTabsProps {
  /** Datos precargados desde el padre para evitar doble fetch */
  establecimientos?: Establecimiento[];
  /** Indica si los datos están cargando en el padre */
  isLoading?: boolean;
}

export function EstablecimientoTabs({ establecimientos, isLoading }: EstablecimientoTabsProps) {
  const [activeTab, setActiveTab] = useState<'list' | 'explorar' | 'mapa'>('list');

  const tabs = [
    { id: 'list' as const, label: 'Mis Establecimientos', icon: Building2 },
    { id: 'explorar' as const, label: 'Explorar Todos', icon: Search },
    { id: 'mapa' as const, label: 'Ver en Mapa', icon: MapPin },
  ];

  return (
    <div>
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 px-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className={`
                  -ml-0.5 mr-2 h-5 w-5
                  ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                `} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content with padding */}
      <div className="p-6">
        {activeTab === 'list' && <EstablecimientoList establecimientos={establecimientos} isLoading={isLoading} />}
        {activeTab === 'explorar' && <EstablecimientoExplorarView establecimientos={establecimientos} isLoading={isLoading} />}
        {activeTab === 'mapa' && <EstablecimientoMapView establecimientos={establecimientos} isLoading={isLoading} />}
      </div>
    </div>
  );
}
