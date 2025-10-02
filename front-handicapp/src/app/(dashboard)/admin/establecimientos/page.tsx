'use client';

import React, { useState } from 'react';
import { EstablecimientoList } from '@/components/dashboard/EstablecimientoList';
import { EstablecimientoForm } from '@/components/dashboard/EstablecimientoForm';
import { SimpleAdminOnly } from '@/components/common/SimplePermissionGuard';
import { type Establecimiento } from '@/lib/services/establecimientoService';

export default function AdminEstablecimientosPage() {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [selectedEstablecimiento, setSelectedEstablecimiento] = useState<Establecimiento | null>(null);

  const handleCreateNew = () => {
    setSelectedEstablecimiento(null);
    setView('create');
  };

  const handleEdit = (establecimiento: Establecimiento) => {
    setSelectedEstablecimiento(establecimiento);
    setView('edit');
  };

  const handleSave = (establecimiento: Establecimiento) => {
    setView('list');
    setSelectedEstablecimiento(null);
  };

  const handleCancel = () => {
    setView('list');
    setSelectedEstablecimiento(null);
  };

  const handleSelect = (establecimiento: Establecimiento) => {
    // TODO: Implementar vista de detalle
    setSelectedEstablecimiento(establecimiento);
  };

  if (view === 'create') {
    return (
      <SimpleAdminOnly>
        <div className="container mx-auto px-4 py-8">
          <EstablecimientoForm
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </SimpleAdminOnly>
    );
  }

  if (view === 'edit' && selectedEstablecimiento) {
    return (
      <SimpleAdminOnly>
        <div className="container mx-auto px-4 py-8">
          <EstablecimientoForm
            establecimiento={selectedEstablecimiento}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </SimpleAdminOnly>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EstablecimientoList
        onCreateEstablecimiento={handleCreateNew}
        onEditEstablecimiento={handleEdit}
        onSelectEstablecimiento={handleSelect}
      />
    </div>
  );
}