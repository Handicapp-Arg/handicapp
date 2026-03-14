
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProfileSkeleton from '@/components/skeletons/ProfileSkeleton';
import { establecimientoService, type Establecimiento } from '@/lib/services/establecimientoService';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import EstablecimientoDetailView from '@/components/dashboard/EstablecimientoDetailView';

export default function AdminEstablecimientoDetailPage() {
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

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error || !establecimiento) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-800 mb-4">{error || 'Establecimiento no encontrado'}</p>
          <button
            onClick={() => router.push('/admin/establecimientos')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
