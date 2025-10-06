"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { caballoService, type Caballo } from '@/lib/services/caballoService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';
// @ts-ignore
import CaballoForm from './CaballoForm';

export function CaballoList() {
  const [caballos, setCaballos] = useState<Caballo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [selectedCaballo, setSelectedCaballo] = useState<Caballo | undefined>();
  const { user } = useAuth();

  useEffect(() => {
    fetchCaballos();
  }, [currentPage, searchTerm]);

  const fetchCaballos = async () => {
    try {
      setLoading(true);
      const response: any = await caballoService.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm
      });
      
      if (response && (response.success || response.data)) {
        const caballosData = response.data?.caballos || response.caballos || response.data || response;
        setCaballos(Array.isArray(caballosData) ? caballosData : []);
        setTotalPages(response.data?.totalPages || response.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading caballos:', error);
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
        console.error('Error deleting caballo:', error);
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando caballos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de crear */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Caballos</h2>
          <p className="text-gray-600">Administra el registro de caballos</p>
        </div>
        
        <Button onClick={handleCreateCaballo} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Registrar Caballo
        </Button>
      </div>

      {/* Barra de búsqueda */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nombre, raza o microchip..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={loading}>
              Buscar
            </Button>
          </form>
        </CardContent>
      </Card>

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
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEditCaballo(caballo)}
                    >
                      <PencilIcon className="h-3 w-3" />
                    </Button>
                    {user?.rol?.clave === 'admin' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDeleteCaballo(caballo)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-3 w-3" />
                      </Button>
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
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-4xl mb-4">🐎</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay caballos registrados</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'No se encontraron caballos que coincidan con tu búsqueda.' : 'Comienza registrando tu primer caballo.'}
            </p>
            {!searchTerm && (
              <Button onClick={handleCreateCaballo}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Registrar Primer Caballo
              </Button>
            )}
          </CardContent>
        </Card>
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