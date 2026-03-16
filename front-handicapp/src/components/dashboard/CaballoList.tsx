"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { useCaballos, useEliminarCaballo } from '@/lib/hooks';
import { type Caballo } from '@/lib/services/horseService';
// ...existing code...
import { usePermissions } from '@/lib/hooks/usePermissions';
import toast from 'react-hot-toast';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, EyeIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/utils/logger';
import CaballoForm from './CaballoForm';
import CaballoCardModern from './CaballoCardModern';

export function CaballoList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const searchRef = useRef<number | NodeJS.Timeout | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState<number>(9);
  const [showForm, setShowForm] = useState(false);
  const [selectedCaballo, setSelectedCaballo] = useState<Caballo | undefined>();
  const { isAuthenticated, isLoading: authLoading } = useAuthNew();
  const { canManageHorses, canDeleteHorses, getUserRole } = usePermissions();
  const router = useRouter();

  // ✅ React Query - Cache automático
  const { 
    data: response, 
    isLoading: loadingQuery,
    refetch 
  } = useCaballos({
    page: currentPage,
    limit: itemsPerPage,
    search: debouncedSearchTerm
  });

  const deleteCaballoMutation = useEliminarCaballo();

  const loading = loadingQuery || authLoading;

  // Normalizar datos y aplicar filtros
  const caballos = useMemo(() => {
    if (!response) return [];
    const data = (response as { data?: { caballos?: Caballo[] }; caballos?: Caballo[] });
    let list = data?.data?.caballos || data?.caballos || [];
    list = Array.isArray(list) ? list : [];
    
    return list;
  }, [response]);

  const totalPages = useMemo(() => {
    if (!response) return 1;
    const data = response as { meta?: { totalPages?: number }; data?: { totalPages?: number }; totalPages?: number };
    return data?.meta?.totalPages || data?.data?.totalPages || data?.totalPages || 1;
  }, [response]);

  const stats = useMemo(() => {
    const activos = caballos.filter((c: Caballo) => c.estado_global === 'activo').length;
    const conEventos = caballos.filter((c: Caballo) => c._count?.eventos && c._count.eventos > 0).length;
    const treintaDiasAtras = new Date();
    treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);
    const nuevos = caballos.filter((c: Caballo) => new Date(c.creado_el) > treintaDiasAtras).length;

    const totalData = (response as { meta?: { total?: number }; data?: { total?: number }; total?: number })?.meta?.total 
      || (response as { data?: { total?: number } })?.data?.total 
      || caballos.length;

    return {
      total: totalData,
      activos,
      conEventos,
      nuevos
    };
  }, [caballos, response]);

  // Debounce search - actualizar el término buscado después de 500ms
  useEffect(() => {
    if (searchRef.current) clearTimeout(searchRef.current as number);
    searchRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);
    
    return () => {
      if (searchRef.current) clearTimeout(searchRef.current as number);
    };
  }, [searchTerm]);

  // 🚀 Memoizar callbacks para evitar re-creación
  const handleCreateCaballo = useCallback(() => {
    setSelectedCaballo(undefined);
    setShowForm(true);
  }, []);

  const handleEditCaballo = useCallback((caballo: Caballo) => {
    // Abrir modal de edición con los datos del caballo
    setSelectedCaballo(caballo);
    setShowForm(true);
  }, []);

  const handleViewCaballo = useCallback((caballo: Caballo) => {
    // Navegar a la página de detalle del caballo usando el rol del usuario
    const userRole = getUserRole();
    const rolePath = userRole || 'propietario'; // Fallback a propietario
    
    try {
      router.push(`/${rolePath}/horses/${caballo.id}`);
    } catch {
      window.location.href = `/${rolePath}/horses/${caballo.id}`;
    }
  }, [router, getUserRole]);

  const handleFormSuccess = useCallback(() => {
    // Cerrar el modal primero
    setShowForm(false);
    setSelectedCaballo(undefined);
    // Forzar recarga con React Query
    setTimeout(() => {
      refetch();
    }, 100);
  }, [refetch]);

  const handleDeleteCaballo = useCallback(async (caballo: Caballo) => {
    toast((t) => (
      <span className="flex items-center gap-3">
        <span className="text-sm">¿Eliminar a <strong>{caballo.nombre}</strong>?</span>
        <button
          className="px-3 py-1 bg-red-600 text-white text-xs rounded-md font-medium"
          onClick={async () => {
            toast.dismiss(t.id);
            try {
              await deleteCaballoMutation.mutateAsync(caballo.id);
              refetch();
              toast.success(`${caballo.nombre} eliminado correctamente`);
            } catch (error) {
              logger.error('Error deleting caballo:', error);
              toast.error('Error al eliminar el caballo');
            }
          }}
        >
          Eliminar
        </button>
        <button
          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium"
          onClick={() => toast.dismiss(t.id)}
        >
          Cancelar
        </button>
      </span>
    ), { duration: 6000 });
  }, [deleteCaballoMutation, refetch]);

  // Helper to compute page numbers for pagination display (max window)
  const getPageNumbers = useMemo(() => () => {
    const maxButtons = 7;
    const pages: number[] = [];
    let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  // search handled directly by handleSearchChange (debounced)

  // Debounce search input to avoid too many requests
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // El debounce se maneja en el useEffect que actualiza debouncedSearchTerm
  };

  // helper functions removed (not used in this file)

  if (loading && caballos.length === 0) return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[1,2,3,4,5,6].map(i => <div key={i} className="h-52 bg-gray-100 rounded-md animate-pulse" />)}
    </div>
  );

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Mis Caballos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestioná y monitoreá el estado de tus caballos.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar caballo..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-3 py-2.5 w-full sm:w-56 border border-gray-300 rounded-md text-base focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
          {canManageHorses() && (
            <button
              onClick={handleCreateCaballo}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-700 text-white rounded-md text-sm font-medium"
            >
              <PlusIcon className="h-4 w-4" />
              Agregar caballo
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {caballos.map((caballo) => (
              <div key={caballo.id} className="w-full">
                <CaballoCardModern
                  caballo={caballo}
                  onEdit={canManageHorses() ? handleEditCaballo : undefined}
                  onView={handleViewCaballo}
                  onDelete={canDeleteHorses() ? handleDeleteCaballo : undefined}
                />
              </div>
            ))}
            
            {/* Card "Agregar Nuevo" si no hay resultados o al final como opción */}
            {caballos.length === 0 && !loading && (
                <div className="col-span-full py-20 text-center">
                    <div className="mx-auto h-24 w-24 text-gray-200 mb-4">
                        <MagnifyingGlassIcon className="w-full h-full opacity-20" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron caballos</h3>
                    <p className="mt-1 text-sm text-gray-500">Prueba ajustando los filtros de búsqueda.</p>
                </div>
            )}
      </div>



      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-3">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-md text-sm text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Anterior
          </button>
          <span className="flex items-center text-sm text-gray-500">{currentPage} / {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || loading}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-md text-sm text-gray-600 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Modal de formulario */}
      <CaballoForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleFormSuccess}
        caballo={selectedCaballo}
      />
    </div>
  );
}