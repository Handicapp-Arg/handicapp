'use client';

import { useState, useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { useEstablecimientos } from '@/lib/hooks/useStablesQuery';
import type { Establecimiento } from '@/lib/services/stableService';
import { EstablecimientoCard } from '@/components/stables/StableCard';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { PageShell } from '@/components/ui/page-shell';

export default function PropietarioEstablecimientosPage() {
  const { data: response, isLoading } = useEstablecimientos({ page: 1, limit: 50 });
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  let establecimientos: Establecimiento[] = [];
  if (Array.isArray(response)) {
    establecimientos = response;
  } else if (response && typeof response === 'object') {
    const r = response as any;
    establecimientos = r.data?.establecimientos || r.data?.items || r.data || r.establecimientos || r.items || [];
  }

  const filteredEstablecimientos = useMemo(() => {
    if (!searchTerm) return establecimientos;
    return establecimientos.filter(est =>
      est.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.ciudad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.provincia?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [establecimientos, searchTerm]);

  if (isLoading) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1,2,3].map(i => <div key={i} className="h-48 bg-gray-100 rounded-md animate-pulse" />)}
    </div>
  );

  return (
    <SimpleRoleGuard roles={['propietario']}>
      <PageShell
        title="Mis Establecimientos"
        description="Establecimientos donde tienes caballos registrados"
        action={
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar establecimiento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2.5 w-full sm:w-56 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
        }
      >
        {filteredEstablecimientos.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-md">
            <p className="text-sm text-gray-500">
              {searchTerm ? 'No se encontraron establecimientos con ese criterio.' : 'No tenés establecimientos registrados.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {filteredEstablecimientos.map((est) => (
              <EstablecimientoCard
                key={est.id}
                establecimiento={est}
                onClick={(e) => router.push(`/propietario/stables/${e.id}`)}
              />
            ))}
          </div>
        )}
      </PageShell>
    </SimpleRoleGuard>
  );
}
