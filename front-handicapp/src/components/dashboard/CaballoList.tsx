"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { useCaballos, useEliminarCaballo } from '@/lib/hooks';
import { type Caballo } from '@/lib/services/caballoService';
// ...existing code...
import { usePermissions } from '@/lib/hooks/usePermissions';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, EyeIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { logger } from '@/lib/utils/logger';
import CaballoForm from './CaballoForm';
import CaballoCard from './CaballoCard';
import { generarReporteCaballosPDF, exportarCaballosExcel } from '@/lib/services/reporteService';

export function CaballoList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const searchRef = useRef<number | NodeJS.Timeout | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState<number>(9);
  const [showForm, setShowForm] = useState(false);
  const [selectedCaballo, setSelectedCaballo] = useState<Caballo | undefined>();
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
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

  // Normalizar datos
  const caballos = useMemo(() => {
    if (!response) return [];
    const data = (response as { data?: { caballos?: Caballo[] }; caballos?: Caballo[] });
    const list = data?.data?.caballos || data?.caballos || [];
    return Array.isArray(list) ? list : [];
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
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            {/* Spinner moderno */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-[#af936f]/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#0f172a] rounded-full border-t-transparent animate-spin"></div>
              </div>
            </div>
            <p className="text-gray-600 font-medium">Cargando caballos...</p>
            <p className="text-gray-400 text-sm mt-2">Un momento por favor</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Header mejorado con búsqueda y controles */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
        {/* Buscador principal */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre, raza o microchip..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); refetch(); } }}
            className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0f172a] focus:border-[#0f172a] bg-white shadow-sm transition-all duration-200 text-xs sm:text-sm"
          />
        </div>

        {/* Controles secundarios */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          {/* Izquierda: Info de paginación */}
          <div className="flex items-center gap-3">
            <p className="text-xs sm:text-sm text-gray-600">
              Mostrando <span className="font-semibold">{caballos.length}</span> de <span className="font-semibold">{stats.total}</span>
            </p>
          </div>

          {/* Derecha: Botón crear y vista */}
          <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
            {/* Botones de exportación */}
            {caballos.length > 0 && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={handleExportPDF}
                  className="inline-flex items-center justify-center px-2 sm:px-3 py-2 sm:py-2.5 bg-red-600 text-white rounded-lg sm:rounded-xl hover:bg-red-700 active:bg-red-800 transition-all duration-200 shadow-md hover:shadow-lg text-xs font-medium"
                  title="Descargar PDF"
                >
                  <ArrowDownTrayIcon className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">PDF</span>
                </button>
                <button
                  onClick={handleExportExcel}
                  className="inline-flex items-center justify-center px-2 sm:px-3 py-2 sm:py-2.5 bg-green-600 text-white rounded-lg sm:rounded-xl hover:bg-green-700 active:bg-green-800 transition-all duration-200 shadow-md hover:shadow-lg text-xs font-medium"
                  title="Descargar Excel"
                >
                  <ArrowDownTrayIcon className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Excel</span>
                </button>
              </div>
            )}
            
            {canManageHorses() && (
              <button
                onClick={handleCreateCaballo}
                className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 bg-[#0f172a] text-white rounded-lg sm:rounded-xl hover:bg-[#0f172a]/90 active:bg-[#0f172a]/80 transition-all duration-200 shadow-lg hover:shadow-xl text-xs sm:text-sm font-medium group"
              >
                <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2 group-hover:scale-110 transition-transform" />
                <span className="hidden xs:inline">Registrar</span>
                <span className="xs:hidden">Nuevo</span>
              </button>
            )}

            {/* Selector de vista moderno */}
            <div className="inline-flex items-center rounded-lg sm:rounded-xl bg-gray-100 p-0.5 sm:p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-200 ${
                  viewMode === 'cards' 
                    ? 'bg-white text-[#0f172a] shadow-sm' 
                    : 'text-gray-600 hover:text-[#0f172a]'
                } whitespace-nowrap`}
              >
                Tarjetas
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium transition-all duration-200 ${
                  viewMode === 'table' 
                    ? 'bg-white text-[#0f172a] shadow-sm' 
                    : 'text-gray-600 hover:text-[#0f172a]'
                } whitespace-nowrap`}
              >
                Tabla
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista en modo tarjetas */}
      {viewMode === 'cards' && (
        <div className="max-w-7xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {caballos.map((caballo) => (
              <div key={caballo.id}>
                <CaballoCard
                  caballo={caballo}
                  onEdit={canManageHorses() ? handleEditCaballo : undefined}
                  onView={handleViewCaballo}
                  onDelete={canDeleteHorses() ? handleDeleteCaballo : undefined}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista en modo tabla */}
      {viewMode === 'table' && (
        <div className="overflow-x-auto rounded-lg sm:rounded-xl border border-gray-100 -mx-3 sm:mx-0">
          <table className="w-full text-xs sm:text-sm min-w-[640px]">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="text-left p-2 sm:p-4 font-semibold text-gray-700">Nombre</th>
                <th className="text-left p-2 sm:p-4 font-semibold text-gray-700">Sexo</th>
                <th className="text-left p-2 sm:p-4 font-semibold text-gray-700">Raza</th>
                <th className="text-left p-2 sm:p-4 font-semibold text-gray-700">Estado</th>
                <th className="text-left p-2 sm:p-4 font-semibold text-gray-700">Microchip</th>
                <th className="text-center p-2 sm:p-4 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {caballos.map((c) => (
                <tr 
                  key={c.id} 
                  className="hover:bg-gray-50 active:bg-gray-100 transition-colors group"
                >
                  <td className="p-2 sm:p-4">
                    <button
                      onClick={() => handleViewCaballo(c)}
                      className="font-semibold text-gray-900 hover:text-[#0f172a] active:text-[#0f172a]/80 transition-colors text-left truncate max-w-[120px] sm:max-w-none"
                    >
                      {c.nombre}
                    </button>
                  </td>
                  <td className="p-2 sm:p-4 text-gray-600">{c.sexo || '—'}</td>
                  <td className="p-2 sm:p-4 text-gray-600 truncate max-w-[100px] sm:max-w-none">{c.raza || '—'}</td>
                  <td className="p-2 sm:p-4">
                    <span className={`inline-flex px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap ${
                      c.estado_global === 'activo' 
                        ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-500/20'
                        : c.estado_global === 'inactivo'
                        ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-500/20'
                        : c.estado_global === 'vendido'
                        ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-500/20'
                        : 'bg-gray-100 text-gray-800 ring-1 ring-gray-500/20'
                    }`}>
                      {c.estado_global}
                    </span>
                  </td>
                  <td className="p-2 sm:p-4">
                    <span className="font-mono text-[10px] sm:text-xs text-gray-600">
                      {c.microchip || '—'}
                    </span>
                  </td>
                  <td className="p-2 sm:p-4">
                    <div className="flex items-center justify-center gap-1 sm:gap-2">
                      <button
                        onClick={() => canManageHorses() ? handleEditCaballo(c) : handleViewCaballo(c)}
                        className="p-1.5 sm:p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-[#0f172a] hover:text-white active:bg-[#0f172a]/80 transition-all duration-200 hover:scale-110"
                        title={canManageHorses() ? 'Editar' : 'Ver'}
                      >
                        {canManageHorses() ? <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4" /> : <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4" />}
                      </button>
                      {canDeleteHorses() && (
                        <button
                          onClick={() => handleDeleteCaballo(c)}
                          className="p-1.5 sm:p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 active:bg-red-200 transition-all duration-200 hover:scale-110"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Mensaje si no hay caballos */}
      {!loading && caballos.length === 0 && (
        <div className="text-center py-20 px-4">
          <div className="max-w-md mx-auto">
            {/* Icono con efecto */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-[#af936f]/20 rounded-full blur-2xl"></div>
              <div className="relative text-7xl sm:text-8xl">🐎</div>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              {searchTerm ? 'No se encontraron caballos' : 'No hay caballos registrados'}
            </h3>
            <p className="text-gray-600 mb-8 text-sm sm:text-base leading-relaxed">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda o revisa los filtros aplicados.' 
                : 'Comienza registrando tu primer caballo para empezar a gestionar tu haras.'}
            </p>
            
            {!searchTerm && canManageHorses() && (
              <button
                onClick={handleCreateCaballo}
                className="inline-flex items-center px-6 py-3 bg-[#0f172a] text-white rounded-xl hover:bg-[#0f172a]/90 transition-all duration-200 shadow-lg hover:shadow-xl font-medium group"
              >
                <PlusIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Registrar Primer Caballo
              </button>
            )}
            
            {!searchTerm && !canManageHorses() && (
              <div className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm">
                <span className="mr-2">ℹ️</span>
                {getUserRole() === 'empleado' 
                  ? 'Contacta a tu supervisor para registrar caballos.' 
                  : 'No tienes permisos para registrar caballos.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Paginación moderna */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-100">
          {/* Info de página */}
          <div className="text-sm text-gray-600 font-medium">
            Mostrando <span className="text-gray-900 font-semibold">{caballos.length}</span> de{' '}
            <span className="text-gray-900 font-semibold">{stats.total}</span> caballos
          </div>

          {/* Controles de paginación */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1 || loading}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              Primera
            </button>
            
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1 || loading}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              Anterior
            </button>

            {/* Números de página */}
            <div className="hidden sm:flex items-center gap-1">
              {getPageNumbers().map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  disabled={loading}
                  className={`min-w-[40px] px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    p === currentPage
                      ? 'bg-[#0f172a] text-white shadow-md'
                      : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Indicador móvil de página actual */}
            <div className="sm:hidden px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg border border-gray-200">
              {currentPage} / {totalPages}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || loading}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              Siguiente
            </button>
            
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || loading}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              Última
            </button>
          </div>
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