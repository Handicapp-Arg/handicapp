"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { useCaballos, useEliminarCaballo } from '@/lib/hooks';
import { type Caballo } from '@/lib/services/caballoService';
// ...existing code...
import { usePermissions } from '@/lib/hooks/usePermissions';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, EyeIcon, TrashIcon, ArrowDownTrayIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/utils/logger';
import CaballoForm from './CaballoForm';
import CaballoCardModern from './CaballoCardModern';
import CaballoFilters from './CaballoFilters';
import { CaballosGridSkeleton } from './CaballoCardSkeleton';
import { generarReporteCaballosPDF, exportarCaballosExcel } from '@/lib/services/reporteService';

export function CaballoList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('all');
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
    
    // Filtrar por estado si no es 'all'
    if (selectedEstado && selectedEstado !== 'all') {
      list = list.filter((c: Caballo) => c.estado_global === selectedEstado);
    }
    
    return list;
  }, [response, selectedEstado]);

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
      router.push(`/${rolePath}/caballos/${caballo.id}`);
    } catch {
      window.location.href = `/${rolePath}/caballos/${caballo.id}`;
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
    if (window.confirm(`¿Estás seguro de que quieres eliminar el caballo "${caballo.nombre}"?`)) {
      try {
        await deleteCaballoMutation.mutateAsync(caballo.id);
        refetch(); // Recargar lista
      } catch (error) {
        console.error('Error deleting caballo:', error);
        alert('Error al eliminar el caballo');
      }
    }
  }, [deleteCaballoMutation, refetch]);

  // Exportar reportes
  const handleExportPDF = useCallback(async () => {
    try {
      await generarReporteCaballosPDF(caballos, {
        titulo: 'Reporte de Caballos',
        subtitulo: getUserRole() === 'propietario' ? 'Mi Haras' : 'Gestión de Equinos',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error al generar el reporte PDF');
    }
  }, [caballos, getUserRole]);

  const handleExportExcel = useCallback(() => {
    try {
      exportarCaballosExcel(caballos);
    } catch (error) {
      console.error('Error generating Excel:', error);
      alert('Error al generar el archivo Excel');
    }
  }, [caballos]);

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

  if (loading && caballos.length === 0) {
    return (
      <div className="p-6 sm:p-8">
        <div className="mb-8">
          <div className="h-10 w-64 bg-slate-200 rounded-lg animate-pulse mb-4"></div>
          <div className="h-6 w-96 bg-slate-100 rounded animate-pulse"></div>
        </div>
        <CaballosGridSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      {/* Header mejorado: Estilo Airbnb (Filtros horizantales) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        
        {/* Chips de Categoría */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
            {[
                { id: 'all', label: 'Todos' },
                { id: 'activo', label: 'Activos' },
                { id: 'en venta', label: 'En venta' },
                { id: 'inactivo', label: 'Inactivos' }
            ].map((estado) => (
                <button
                    key={estado.id}
                    onClick={() => setSelectedEstado(estado.id)}
                    className={`
                        whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all
                        ${selectedEstado === estado.id 
                            ? 'bg-slate-900 text-white shadow-md' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                        }
                    `}
                >
                    {estado.label}
                </button>
            ))}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
             {/* Search Compacto */}
             <div className="relative flex-1 sm:flex-initial sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-4 w-4 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Buscar caballo..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="
                        block w-full pl-10 pr-3 py-2 rounded-full border border-slate-200 
                        leading-5 bg-white placeholder-slate-400 focus:outline-none 
                        focus:placeholder-slate-300 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 
                        sm:text-sm transition-all shadow-sm hover:shadow-md
                    "
                />
             </div>

             {canManageHorses() && (
                 <button
                    onClick={handleCreateCaballo}
                    className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-full shadow-sm text-sm font-semibold text-white bg-slate-900 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all duration-300"
                 >
                    <PlusIcon className="-ml-1 mr-1 h-5 w-5" aria-hidden="true" />
                    Agregar
                 </button>
             )}
        </div>
      </div>

      {/* Grid de Cards - Estilo Airbnb */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-6 gap-y-10">
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
                    <div className="mx-auto h-24 w-24 text-slate-200 mb-4">
                        <MagnifyingGlassIcon className="w-full h-full opacity-20" />
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-slate-900">No se encontraron caballos</h3>
                    <p className="mt-1 text-sm text-slate-500">Prueba ajustando los filtros de búsqueda.</p>
                </div>
            )}
      </div>



      {/* Paginación Minimalista */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center pb-8">
          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm bg-white" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="relative inline-flex items-center rounded-l-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Anterior</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            
             {getPageNumbers().map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  aria-current={p === currentPage ? 'page' : undefined}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0 ${
                    p === currentPage
                      ? 'z-10 bg-slate-900 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900'
                      : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                  }`}
                >
                  {p}
                </button>
              ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
              className="relative inline-flex items-center rounded-r-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Siguiente</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
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