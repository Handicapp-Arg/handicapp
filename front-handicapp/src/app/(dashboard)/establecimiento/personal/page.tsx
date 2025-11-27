'use client';

import { useState, useEffect, useMemo } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Users, Shield, Trash2, UserX, UserPlus } from 'lucide-react';
import {
  gestionPersonalService,
  Empleado,
  EstadisticasPersonal,
} from '@/lib/gestionPersonalService';
import { toast } from 'react-hot-toast';
import { LoadingSpinnerFullPage } from '@/components/ui/loading-spinner';
import { CreateEmpleadoModal, EditEmpleadoModal } from '@/components/common/EmpleadoModal';
import { 
  UserManagementTable, 
  UserStatsCards, 
  UserFilters,
  UserManagementHeader,
  type BaseUser,
  type FilterConfig,
  type ActionConfig 
} from '@/components/common/UserManagement';

export default function EstablecimientoPersonalPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasPersonal | null>(null);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroPuesto, setFiltroPuesto] = useState<string>('todos');
  const [filtroDepartamento, setFiltroDepartamento] = useState<string>('todos');
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalConfirm, setModalConfirm] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [empleadoActual, setEmpleadoActual] = useState<Empleado | null>(null);
  const [empleadoAToggle, setEmpleadoAToggle] = useState<Empleado | null>(null);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState<Empleado | null>(null);

  const roles = [
    { id: 3, nombre: 'Capataz' },
    { id: 4, nombre: 'Veterinario' },
    { id: 5, nombre: 'Empleado' },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const [empData, estData] = await Promise.all([
        gestionPersonalService.getEmpleados(),
        gestionPersonalService.getEstadisticasPersonal(),
      ]);
      console.log('Empleados obtenidos:', empData);
      console.log('Estadísticas obtenidas:', estData);
      setEmpleados(empData || []);
      setEstadisticas(estData || null);
    } catch (error) {
      console.error('Error loading data:', error);
      // No mostrar error, el servicio maneja fallback a mock
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers para botones (solo acciones que no navegan)
  const handleNuevoEmpleado = () => {
    setEmpleadoActual(null);
    setModalNuevo(true);
  };

  const handleEmpleadoCreated = () => {
    setModalNuevo(false);
    loadData();
  };

  const handleEmpleadoUpdated = () => {
    setModalEditar(false);
    setEmpleadoActual(null);
    loadData();
  };

  const handleEditarEmpleado = (empleado: Empleado) => {
    setEmpleadoActual(empleado);
    setModalEditar(true);
  };

  const updateEmpleadoWrapper = async (empleadoId: number, data: Partial<Empleado>) => {
    const result = await gestionPersonalService.actualizarEmpleado(empleadoId, data);
    return result !== null;
  };

  const handleToggleEstado = (empleado: Empleado) => {
    setEmpleadoAToggle(empleado);
    setModalConfirm(true);
  };

  const handleViewEmpleado = (empleadoId: number) => {
    // Navegar al perfil del empleado
    window.location.href = `/establecimiento/personal/${empleadoId}`;
  };

  const handleToggleWrapper = (empleadoId: number) => {
    const empleado = empleados.find(e => e.id === empleadoId);
    if (empleado) {
      handleToggleEstado(empleado);
    }
  };

  const handleDeleteWrapper = (empleadoId: number) => {
    const empleado = empleados.find(e => e.id === empleadoId);
    if (empleado) {
      handleEliminarEmpleado(empleado);
    }
  };

  const confirmarToggleEstado = async () => {
    if (!empleadoAToggle) return;

    const nuevoEstado = empleadoAToggle.estado === 'activo' ? 'inactivo' : 'activo';
    const accion = nuevoEstado === 'activo' ? 'activar' : 'desactivar';
    
    const success = await gestionPersonalService.cambiarEstadoEmpleado(empleadoAToggle.id, nuevoEstado);
    if (success) {
      toast.success(`Empleado ${accion === 'activar' ? 'activado' : 'desactivado'} correctamente`);
      loadData();
    } else {
      toast.error(`Error al ${accion} empleado`);
    }
    
    setModalConfirm(false);
    setEmpleadoAToggle(null);
  };

  const handleEliminarEmpleado = (empleado: Empleado) => {
    setEmpleadoAEliminar(empleado);
    setModalEliminar(true);
  };

  const confirmarEliminarEmpleado = async () => {
    if (!empleadoAEliminar) return;

    const success = await gestionPersonalService.eliminarEmpleado(empleadoAEliminar.id);
    if (success) {
      toast.success('Empleado eliminado correctamente');
      loadData();
    } else {
      toast.error('Error al eliminar empleado');
    }
    
    setModalEliminar(false);
    setEmpleadoAEliminar(null);
  };

  const stats = useMemo(() => {
    // Calcular departamentos únicos de los empleados
    const departamentosUnicos = new Set(
      empleados
        .map(emp => emp.departamento)
        .filter(Boolean) // Eliminar nulls/undefined
    );
    
    return {
      total: estadisticas?.total_empleados || 0,
      activos: estadisticas?.empleados_activos || 0,
      departamentos: departamentosUnicos.size, // Número de departamentos/áreas únicas
      nuevos: estadisticas?.nuevos_mes || 0,
    };
  }, [estadisticas, empleados]);

  // Obtener listas únicas de puestos y departamentos
  const puestosUnicos = useMemo(() => {
    const puestos = empleados.map(emp => emp.puesto).filter((p): p is string => !!p);
    return Array.from(new Set(puestos)).sort();
  }, [empleados]);

  const departamentosUnicos = useMemo(() => {
    const departamentos = empleados.map(emp => emp.departamento).filter((d): d is string => !!d);
    return Array.from(new Set(departamentos)).sort();
  }, [empleados]);

  const empleadosFiltrados = useMemo(() => {
    let filtered = empleados;
    
    // Filtro por búsqueda
    if (busqueda) {
      filtered = filtered.filter(emp => 
        emp.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        emp.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
        emp.email.toLowerCase().includes(busqueda.toLowerCase())
      );
    }
    
    // Filtro por estado
    if (filtroEstado !== 'todos') {
      filtered = filtered.filter(emp => emp.estado === filtroEstado);
    }
    
    // Filtro por puesto
    if (filtroPuesto !== 'todos') {
      filtered = filtered.filter(emp => emp.puesto === filtroPuesto);
    }
    
    // Filtro por departamento
    if (filtroDepartamento !== 'todos') {
      filtered = filtered.filter(emp => emp.departamento === filtroDepartamento);
    }
    
    return filtered;
  }, [empleados, busqueda, filtroEstado, filtroPuesto, filtroDepartamento]);

  // Transform empleados to BaseUser format for UserTable
  const empleadosAsBaseUsers: BaseUser[] = useMemo(() => {
    return empleadosFiltrados.map(emp => ({
      id: emp.id,
      nombre: emp.nombre,
      apellido: emp.apellido,
      email: emp.email,
      telefono: emp.telefono,
      estado: emp.estado === 'activo' ? 'activo' : 'inactivo',
      rol: emp.rol_nombre,
      puesto: emp.puesto,
      departamento: emp.departamento,
    }));
  }, [empleadosFiltrados]);

  // Configuración de filtros para establecimiento
  const filterConfig: FilterConfig = {
    showEstadoFilter: true,
    showPuestoFilter: true,
    showDepartamentoFilter: true,
    puestos: puestosUnicos,
    departamentos: departamentosUnicos,
  };

  // Handler para limpiar filtros
  const handleClearFilters = () => {
    setFiltroEstado('todos');
    setFiltroPuesto('todos');
    setFiltroDepartamento('todos');
  };

  // Configuración de acciones para establecimiento (con view/navegación)
  const actionConfig: ActionConfig = {
    showView: true,
    showEdit: true,
    showToggleStatus: true,
    showDelete: true,
    viewLabel: 'Ver perfil',
    editLabel: 'Editar',
    toggleLabel: 'Desactivar',
    deleteLabel: 'Eliminar',
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinnerFullPage label="Cargando..." variant="success" />
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['establecimiento']}>
      <div className="space-y-4 sm:space-y-6">
        {/* Stats Grid */}
        <UserStatsCards
          total={stats.total}
          activos={stats.activos}
          metric3={stats.departamentos}
          nuevos={stats.nuevos}
          metric3Label="Áreas / Departamentos"
          metric3Icon={Shield}
          metric3Badge={stats.departamentos === 0 ? 'Sin áreas asignadas' : stats.departamentos === 1 ? '1 Área activa' : `${stats.departamentos} Áreas activas`}
          primaryColor="#059669"
        />

        {/* Content Card */}
        <Card className="rounded-xl sm:rounded-2xl shadow-xl">
          <CardHeader className="px-4 sm:px-6">
            {/* Header con Buscador y Botón */}
            <UserManagementHeader
              searchTerm={busqueda}
              onSearchChange={setBusqueda}
              onCreateClick={handleNuevoEmpleado}
              createButtonLabel="Nuevo Empleado"
              searchPlaceholder="Buscar por nombre, apellido o email..."
              primaryColor="#059669"
            />
          </CardHeader>
          <CardContent className="px-3 sm:px-4 md:px-6">
            {/* Filters */}
            <UserFilters
              config={filterConfig}
              filtroEstado={filtroEstado}
              setFiltroEstado={setFiltroEstado}
              filtroPuesto={filtroPuesto}
              setFiltroPuesto={setFiltroPuesto}
              filtroDepartamento={filtroDepartamento}
              setFiltroDepartamento={setFiltroDepartamento}
              onClearFilters={handleClearFilters}
            />

            {/* Table */}
            <UserManagementTable
              users={empleadosAsBaseUsers}
              loading={loading}
              emptyMessage="No se encontraron empleados"
              actions={actionConfig}
              onView={handleViewEmpleado}
              onEdit={(user) => {
                const empleado = empleados.find(e => e.id === user.id);
                if (empleado) handleEditarEmpleado(empleado);
              }}
              onToggleStatus={handleToggleWrapper}
              onDelete={handleDeleteWrapper}
              primaryColor="#059669"
            />
          </CardContent>
        </Card>

        {/* Modals */}
        <CreateEmpleadoModal
          isOpen={modalNuevo}
          onClose={() => setModalNuevo(false)}
          onEmpleadoCreated={handleEmpleadoCreated}
          roles={roles}
          createEmpleadoFn={gestionPersonalService.crearEmpleado}
          primaryColor="#059669"
        />

        <EditEmpleadoModal
          isOpen={modalEditar && empleadoActual !== null}
          onClose={() => {
            setModalEditar(false);
            setEmpleadoActual(null);
          }}
          onEmpleadoUpdated={handleEmpleadoUpdated}
          empleado={empleadoActual}
          roles={roles}
          updateEmpleadoFn={updateEmpleadoWrapper}
          primaryColor="#2563eb"
        />

        {/* Modal de Confirmación para Activar/Desactivar */}
        <Dialog open={modalConfirm} onOpenChange={setModalConfirm}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                {empleadoAToggle?.estado === 'activo' ? (
                  <UserX className="w-6 h-6 text-red-600" />
                ) : (
                  <UserPlus className="w-6 h-6 text-green-600" />
                )}
                Confirmar Acción
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-700">
                ¿Estás seguro de {empleadoAToggle?.estado === 'activo' ? 'desactivar' : 'activar'} a{' '}
                <span className="font-bold">
                  {empleadoAToggle?.nombre} {empleadoAToggle?.apellido}
                </span>
                ?
              </p>
              {empleadoAToggle?.estado === 'activo' ? (
                <p className="text-sm text-gray-500 mt-2">
                  Al desactivar, el empleado no podrá acceder al sistema hasta que sea reactivado.
                </p>
              ) : (
                <p className="text-sm text-gray-500 mt-2">
                  Al activar, el empleado podrá acceder nuevamente al sistema.
                </p>
              )}
            </div>
            <DialogFooter>
              <button
                onClick={() => {
                  setModalConfirm(false);
                  setEmpleadoAToggle(null);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarToggleEstado}
                className={`px-4 py-2 rounded-lg text-white ${
                  empleadoAToggle?.estado === 'activo'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {empleadoAToggle?.estado === 'activo' ? 'Desactivar' : 'Activar'}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Confirmación para Eliminar */}
        <Dialog open={modalEliminar} onOpenChange={setModalEliminar}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-600">
                <Trash2 className="w-6 h-6" />
                Confirmar Eliminación
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-700 font-medium">
                ¿Estás seguro de eliminar a{' '}
                <span className="font-bold text-red-600">
                  {empleadoAEliminar?.nombre} {empleadoAEliminar?.apellido}
                </span>
                ?
              </p>
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <span>
                    Esta acción es permanente y no se puede deshacer. Se eliminarán todos los datos asociados al empleado.
                  </span>
                </p>
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={() => {
                  setModalEliminar(false);
                  setEmpleadoAEliminar(null);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminarEmpleado}
                className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700"
              >
                Eliminar Permanentemente
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SimpleRoleGuard>
  );
}
