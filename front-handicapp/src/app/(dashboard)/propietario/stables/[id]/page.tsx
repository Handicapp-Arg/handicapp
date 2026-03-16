'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { establecimientoService, type Establecimiento } from '@/lib/services/stableService';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import EstablecimientoDetailView from '@/components/dashboard/EstablecimientoDetailView';

export default function PropietarioEstablecimientoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [establecimiento, setEstablecimiento] = useState<Establecimiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = Number(params?.id);
    if (id) {
      loadEstablecimiento(id);
    }
  }, [params?.id]);

  const loadEstablecimiento = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const data = await establecimientoService.getById(id);
      setEstablecimiento(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el establecimiento');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 rounded-md animate-pulse" />)}
    </div>
  );

  if (error || !establecimiento) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-6">
          <p className="text-red-800 mb-4">{error || 'Establecimiento no encontrado'}</p>
          <button
            onClick={() => router.push('/propietario/stables')}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['admin', 'propietario']}>
      <EstablecimientoDetailView establecimiento={establecimiento} />
    </SimpleRoleGuard>
  );
}

