'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Users, UserCheck, Shield, UserCog, Search, Eye, Edit, UserX, UserPlus, Plus } from 'lucide-react';
import {
  gestionPersonalService,
  Empleado,
  EstadisticasPersonal,
  CrearEmpleadoDTO,
} from '@/lib/gestionPersonalService';
import { toast } from 'react-hot-toast';

export default function EstablecimientoPersonalPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasPersonal | null>(null);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalConfirm, setModalConfirm] = useState(false);
  const [empleadoActual, setEmpleadoActual] = useState<Empleado | null>(null);
  const [empleadoAToggle, setEmpleadoAToggle] = useState<Empleado | null>(null);

  const [formData, setFormData] = useState<CrearEmpleadoDTO>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    documento: '',
    rol_id: 5, // Empleado por defecto
    fecha_ingreso: new Date().toISOString().split('T')[0],
    departamento: 'Operaciones',
    puesto: 'Auxiliar',
  });

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
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      documento: '',
      rol_id: 5,
      fecha_ingreso: new Date().toISOString().split('T')[0],
      departamento: 'Operaciones',
      puesto: 'Auxiliar',
    });
    setEmpleadoActual(null);
    setModalNuevo(true);
  };

  const handleGuardarEmpleado = async () => {
    try {
      if (empleadoActual) {
        // Editar
        const success = await gestionPersonalService.actualizarEmpleado(empleadoActual.id, formData);
        if (success) {
          toast.success('Empleado actualizado correctamente');
          setModalEditar(false);
          loadData();
        } else {
          toast.error('Error al actualizar empleado');
        }
      } else {
        // Crear nuevo
        const result = await gestionPersonalService.crearEmpleado(formData);
        if (result) {
          toast.success(`Empleado creado. Contraseña temporal: ${result.passwordTemporal}`);
          setModalNuevo(false);
          loadData();
        } else {
          toast.error('Error al crear empleado');
        }
      }
    } catch (error) {
      console.error('Error guardando empleado:', error);
      toast.error('Error al guardar empleado');
    }
  };

  const handleEditarEmpleado = (empleado: Empleado) => {
    setFormData({
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      email: empleado.email,
      telefono: empleado.telefono || '',
      documento: empleado.documento || '',
      rol_id: empleado.rol_id,
      fecha_ingreso: empleado.fecha_ingreso,
      departamento: empleado.departamento || 'Operaciones',
      puesto: empleado.puesto || 'Auxiliar',
    });
    setEmpleadoActual(empleado);
    setModalEditar(true);
  };

  const handleToggleEstado = (empleado: Empleado) => {
    setEmpleadoAToggle(empleado);
    setModalConfirm(true);
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

  const stats = useMemo(() => {
    return {
      total: estadisticas?.total_empleados || 0,
      activos: estadisticas?.empleados_activos || 0,
      departamentos: 4, // Valor calculado de los empleados únicos por departamento
      nuevos: estadisticas?.nuevos_mes || 0,
    };
  }, [estadisticas]);

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
    
    return filtered;
  }, [empleados, busqueda, filtroEstado]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <SimpleRoleGuard roles={['establecimiento']}>
      <div className="space-y-4 sm:space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 md:p-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
          
          {/* Gradient Orbs */}
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-green-500/20 rounded-full blur-3xl" />
          
          {/* Content */}
          <div className="relative">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0 text-emerald-400" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">Gestión de Personal</h1>
            </div>
            <p className="text-slate-300 text-sm sm:text-base md:text-lg">
              Administra tu equipo y personal del establecimiento
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {/* Total */}
          <Card className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm font-medium truncate">Total Personal</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1">{stats.total}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0 ml-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-600" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 md:mt-4">
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] sm:text-xs px-1.5 sm:px-2">
                  Registrados
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Activos */}
          <Card className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm font-medium truncate">Activos</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1">{stats.activos}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 ml-2">
                  <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 md:mt-4">
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 text-[10px] sm:text-xs px-1.5 sm:px-2 truncate">
                  {Math.round((stats.activos / (stats.total || 1)) * 100)}% del total
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Departamentos */}
          <Card className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm font-medium truncate">Departamentos</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1">{stats.departamentos}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0 ml-2">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 md:mt-4">
                <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px] sm:text-xs px-1.5 sm:px-2">
                  Áreas activas
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Nuevos */}
          <Card className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-gray-600 text-[10px] sm:text-xs md:text-sm font-medium truncate">Nuevos Este Mes</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-0.5 sm:mt-1">{stats.nuevos}</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 ml-2">
                  <UserCog className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2 sm:mt-3 md:mt-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] sm:text-xs px-1.5 sm:px-2">
                  <span className="hidden sm:inline">Últimos 30 días</span>
                  <span className="sm:hidden">30 días</span>
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Card */}
        <Card className="rounded-xl sm:rounded-2xl shadow-xl">
          <CardHeader className="px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardDescription className="text-xs sm:text-sm">
                Lista completa del personal del establecimiento
              </CardDescription>
              <button
                onClick={handleNuevoEmpleado}
                className="px-3 sm:px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 active:bg-emerald-800 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
              >
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Nuevo Empleado</span>
                <span className="xs:hidden">Nuevo</span>
              </button>
            </div>
          </CardHeader>
          <CardContent className="px-3 sm:px-4 md:px-6">
            {/* Filters */}
            <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Buscar por nombre, apellido o email..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pl-9 sm:pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs sm:text-sm"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-xs sm:text-sm"
              >
                <option value="todos">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
                <option value="ausente">Ausentes</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg sm:rounded-xl border border-gray-100 -mx-3 sm:mx-0">
              <table className="w-full text-xs sm:text-sm min-w-[640px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Puesto</th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Departamento</th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {empleadosFiltrados.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50 active:bg-gray-100 transition-colors">
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">{emp.nombre} {emp.apellido}</div>
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[120px] sm:max-w-[180px] md:max-w-none">{emp.email}</div>
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[80px] sm:max-w-none">{emp.puesto}</div>
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[80px] sm:max-w-none">{emp.departamento}</div>
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                        <Badge 
                          className={`text-[10px] sm:text-xs px-1.5 sm:px-2 ${emp.estado === 'activo' 
                            ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200'
                          }`}
                        >
                          {emp.estado === 'activo' ? '● Activo' : '● Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <Link
                            href={`/establecimiento/personal/${emp.id}`}
                            className="p-1.5 sm:p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-purple-600 hover:text-white active:bg-purple-700 transition-all duration-200 hover:scale-110 inline-flex items-center justify-center"
                            title="Ver perfil"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Link>
                          <button
                            onClick={() => handleEditarEmpleado(emp)}
                            type="button"
                            className="p-1.5 sm:p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white active:bg-blue-700 transition-all duration-200 hover:scale-110"
                            title="Editar"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <button
                            onClick={() => handleToggleEstado(emp)}
                            type="button"
                            className={`p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                              emp.estado === 'activo' 
                                ? 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 active:bg-red-200' 
                                : 'bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 active:bg-green-200'
                            }`}
                            title={emp.estado === 'activo' ? 'Desactivar' : 'Activar'}
                          >
                            {emp.estado === 'activo' ? <UserX className="h-3 w-3 sm:h-4 sm:w-4" /> : <UserPlus className="h-3 w-3 sm:h-4 sm:w-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {empleadosFiltrados.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No se encontraron empleados</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal Nuevo Empleado */}
        <Dialog open={modalNuevo} onOpenChange={setModalNuevo}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Plus className="w-6 h-6 text-emerald-600" />
                Nuevo Empleado
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nombre</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                    placeholder="Juan"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Apellido</label>
                  <input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                    placeholder="Pérez"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                  placeholder="juan.perez@email.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                    placeholder="+54 9 11 1234-5678"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Documento</label>
                  <input
                    type="text"
                    value={formData.documento}
                    onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                    placeholder="12345678"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Rol</label>
                  <select
                    value={formData.rol_id}
                    onChange={(e) => setFormData({ ...formData, rol_id: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                  >
                    <option value={3}>Capataz</option>
                    <option value={4}>Veterinario</option>
                    <option value={5}>Empleado</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Fecha de ingreso</label>
                  <input
                    type="date"
                    value={formData.fecha_ingreso}
                    onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Departamento</label>
                  <input
                    type="text"
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                    placeholder="Operaciones"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Puesto</label>
                  <input
                    type="text"
                    value={formData.puesto}
                    onChange={(e) => setFormData({ ...formData, puesto: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                    placeholder="Auxiliar"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={() => setModalNuevo(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarEmpleado}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Crear Empleado
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Editar Empleado */}
        <Dialog open={modalEditar} onOpenChange={setModalEditar}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Edit className="w-6 h-6 text-blue-600" />
                Editar Empleado
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nombre</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Apellido</label>
                  <input
                    type="text"
                    value={formData.apellido}
                    onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Teléfono</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Documento</label>
                  <input
                    type="text"
                    value={formData.documento}
                    onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Departamento</label>
                  <input
                    type="text"
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Puesto</label>
                  <input
                    type="text"
                    value={formData.puesto}
                    onChange={(e) => setFormData({ ...formData, puesto: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Rol</label>
                <select
                  value={formData.rol_id}
                  onChange={(e) => setFormData({ ...formData, rol_id: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                >
                  <option value={3}>Capataz</option>
                  <option value={4}>Veterinario</option>
                  <option value={5}>Empleado</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <button
                onClick={() => setModalEditar(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleGuardarEmpleado}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Guardar Cambios
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
      </div>
    </SimpleRoleGuard>
  );
}
