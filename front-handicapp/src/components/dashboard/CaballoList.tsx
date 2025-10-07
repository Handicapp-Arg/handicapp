"use client";

import { useState, useEffect } from 'react';
import { useAuthNew } from '@/lib/hooks/useAuthNew';
import { caballoService, type Caballo } from '@/lib/services/caballoService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, EyeIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { logger } from '@/lib/utils/logger';
// @ts-ignore
import CaballoForm from './CaballoForm';

export function CaballoList() {
  const [caballos, setCaballos] = useState<Caballo[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    activos: 0,
    conEventos: 0,
    nuevos: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedCaballo, setSelectedCaballo] = useState<Caballo | undefined>();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthNew();
  const { canManageHorses, canDeleteHorses, canViewMedicalHistory, getUserRole } = usePermissions();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchCaballos();
    }
  }, [currentPage, searchTerm, authLoading, isAuthenticated]);

  const fetchCaballos = async () => {
    if (authLoading || !isAuthenticated) return;
    try {
      setLoading(true);
      const response: any = await caballoService.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm
      });
      
      if (response && (response.success || response.data)) {
        const caballosData = response.data?.caballos || response.caballos || response.data || response;
        const list: Caballo[] = Array.isArray(caballosData) ? caballosData : [];
        const totalData = response.meta?.total || response.data?.total || response.total || list.length;
        const totalPagesData = response.meta?.totalPages || response.data?.totalPages || response.totalPages || 1;

        setCaballos(list);
        setTotalPages(totalPagesData);

        // Calcular estadísticas de forma segura
        const activos = list.filter((c: Caballo) => c.estado_global === 'activo').length;
        const conEventos = list.filter((c: Caballo) => c._count?.eventos && c._count.eventos > 0).length;
        const treintaDiasAtras = new Date();
        treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);
        const nuevos = list.filter((c: Caballo) => new Date(c.creado_el) > treintaDiasAtras).length;

        setStats({
          total: totalData,
          activos,
          conEventos,
          nuevos
        });
      }
    } catch (error) {
      logger.error('Error loading caballos:', error);
      setCaballos([]);
      setStats({ total: 0, activos: 0, conEventos: 0, nuevos: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCaballo = () => {
    setSelectedCaballo(undefined);
    setShowForm(true);
  };

  const handleEditCaballo = (caballo: Caballo) => {
    setSelectedCaballo(caballo);
    setShowForm(true);
  };

  const handleFormSuccess = (caballo: Caballo) => {
    // Actualizar la lista
    fetchCaballos();
  };

  const handleDeleteCaballo = async (caballo: Caballo) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el caballo "${caballo.nombre}"?`)) {
      try {
        const result: any = await caballoService.delete(caballo.id);
        if (result.success || result) {
          fetchCaballos(); // Recargar lista
        } else {
          alert('Error al eliminar el caballo');
        }
      } catch (error) {
        logger.error('Error deleting caballo:', error);
        alert('Error al eliminar el caballo');
      }
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCaballos();
  };

  const getSexoBadgeColor = (sexo: string | null) => {
    switch (sexo) {
      case 'macho': return 'bg-blue-100 text-blue-800';
      case 'hembra': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEstadoBadgeColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'inactivo': return 'bg-yellow-100 text-yellow-800';
      case 'vendido': return 'bg-purple-100 text-purple-800';
      case 'fallecido': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  const calculateAge = (birthDate: string | null) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    const age = Math.floor((today.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return age;
  };

  if (loading && caballos.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando caballos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Buscador + Acción */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar por nombre, raza o microchip..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        {canManageHorses() && (
          <button 
            onClick={handleCreateCaballo}
            className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm text-sm font-medium"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Registrar Caballo
          </button>
        )}
      </div>

      {/* Lista de caballos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {caballos.map((caballo) => {
          const edad = calculateAge(caballo.fecha_nacimiento);
          const propietario = caballo.propiedades?.[0]?.propietario;
          
          return (
            <Card key={caballo.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{caballo.nombre}</CardTitle>
                    <p className="text-sm text-gray-600">{caballo.raza || 'Raza no especificada'}</p>
                  </div>
                  <div className="flex gap-1">
                    {/* Botón Ver: siempre visible */}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEditCaballo(caballo)}
                      title={canManageHorses() ? "Editar caballo" : "Ver detalles"}
                    >
                      {canManageHorses() ? <PencilIcon className="h-3 w-3" /> : <EyeIcon className="h-3 w-3" />}
                    </Button>
                    
                    {/* Botón Eliminar: solo admin */}
                    {canDeleteHorses() && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDeleteCaballo(caballo)}
                        className="text-red-600 hover:text-red-700"
                        title="Eliminar caballo"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
                    )}
                    
                    {/* Indicador de permisos médicos */}
                    {canViewMedicalHistory() && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full" title="Acceso a historial médico">
                        🚑
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                {/* Imagen del caballo */}
                {caballo.foto_url ? (
                  <img
                    src={caballo.foto_url}
                    alt={caballo.nombre}
                    className="w-full h-32 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
                    <span className="text-4xl">🐎</span>
                  </div>
                )}

                {/* Información básica */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Sexo:</span>
                    <Badge className={getSexoBadgeColor(caballo.sexo)}>
                      {caballo.sexo === 'macho' ? '♂ Macho' : caballo.sexo === 'hembra' ? '♀ Hembra' : 'No especificado'}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estado:</span>
                    <Badge className={getEstadoBadgeColor(caballo.estado_global)}>
                      {caballo.estado_global}
                    </Badge>
                  </div>

                  {edad && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Edad:</span>
                      <span className="text-sm font-medium">{edad} años</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Nacimiento:</span>
                    <span className="text-sm">{formatDate(caballo.fecha_nacimiento)}</span>
                  </div>

                  {caballo.pelaje && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pelaje:</span>
                      <span className="text-sm">{caballo.pelaje}</span>
                    </div>
                  )}

                  {caballo.disciplina && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Disciplina:</span>
                      <span className="text-sm capitalize">{caballo.disciplina}</span>
                    </div>
                  )}

                  {propietario && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Propietario:</span>
                      <span className="text-sm">{propietario.nombre} {propietario.apellido}</span>
                    </div>
                  )}

                  {caballo.microchip && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Microchip:</span>
                      <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                        {caballo.microchip}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mensaje si no hay caballos */}
      {!loading && caballos.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-6">🐎</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay caballos registrados</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm ? 'No se encontraron caballos que coincidan con tu búsqueda.' : 'Comienza registrando tu primer caballo.'}
          </p>
          {!searchTerm && canManageHorses() && (
            <button 
              onClick={handleCreateCaballo}
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Registrar Primer Caballo
            </button>
          )}
          {!searchTerm && !canManageHorses() && (
            <p className="text-sm text-gray-500 mt-2">
              {getUserRole() === 'empleado' ? 'Contacta a tu supervisor para registrar caballos.' : 'No tienes permisos para registrar caballos.'}
            </p>
          )}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
          >
            Anterior
          </Button>
          
          <span className="flex items-center px-4 text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          
          <Button
            variant="secondary"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || loading}
          >
            Siguiente
          </Button>
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