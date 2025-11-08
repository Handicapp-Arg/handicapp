'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw, Package, Calendar, User, Filter } from 'lucide-react';
import { inventarioService, type Movimiento } from '@/lib/inventarioService';
import { toast } from 'react-hot-toast';

export default function MovimientosGeneralesPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');

  useEffect(() => {
    loadMovimientos();
  }, []);

  const loadMovimientos = async () => {
    try {
      setLoading(true);
      const data = await inventarioService.getMovimientos();
      setMovimientos(data || []);
    } catch (error) {
      console.error('Error cargando movimientos:', error);
      toast.error('Error al cargar movimientos');
    } finally {
      setLoading(false);
    }
  };

  const movimientosFiltrados = movimientos.filter(mov => {
    const matchesBusqueda = 
      mov.producto_nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      mov.producto_codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      mov.motivo.toLowerCase().includes(busqueda.toLowerCase());
    
    const matchesTipo = filtroTipo === 'todos' || mov.tipo === filtroTipo;
    
    // Filtro por fecha
    let matchesFecha = true;
    if (fechaDesde || fechaHasta) {
      const fechaMovimiento = new Date(mov.fecha);
      fechaMovimiento.setHours(0, 0, 0, 0);
      
      if (fechaDesde) {
        const desde = new Date(fechaDesde);
        desde.setHours(0, 0, 0, 0);
        matchesFecha = matchesFecha && fechaMovimiento >= desde;
      }
      
      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
        hasta.setHours(23, 59, 59, 999);
        matchesFecha = matchesFecha && fechaMovimiento <= hasta;
      }
    }
    
    return matchesBusqueda && matchesTipo && matchesFecha;
  });

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'salida':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'ajuste':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  const getBadgeTipo = (tipo: string) => {
    const variants: Record<string, { className: string; label: string }> = {
      entrada: { className: 'bg-green-100 text-green-800 border-green-300', label: 'Entrada' },
      salida: { className: 'bg-red-100 text-red-800 border-red-300', label: 'Salida' },
      ajuste: { className: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Ajuste' },
      devolucion: { className: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Devolución' },
      merma: { className: 'bg-orange-100 text-orange-800 border-orange-300', label: 'Merma' },
    };
    
    const variant = variants[tipo] || variants.ajuste;
    return (
      <Badge className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  const stats = {
    total: movimientos.length,
    entradas: movimientos.filter(m => m.tipo === 'entrada').length,
    salidas: movimientos.filter(m => m.tipo === 'salida').length,
    ajustes: movimientos.filter(m => m.tipo === 'ajuste').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-900 via-amber-800 to-orange-900 p-8">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
        
        <div className="relative">
          <Link
            href="/establecimiento/inventario"
            className="inline-flex items-center gap-2 text-amber-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al inventario
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-amber-400" />
            <h1 className="text-3xl font-bold text-white">Movimientos de Inventario</h1>
          </div>
          <p className="text-amber-200 text-lg">
            Historial completo de todos los movimientos del inventario
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Movimientos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-gray-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="bg-gray-50 text-gray-700 border-gray-200">
                Registrados
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Entradas</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.entradas}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                Stock añadido
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Salidas</p>
                <p className="text-3xl font-bold text-red-600 mt-1">{stats.salidas}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-200">
                Stock reducido
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Ajustes</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">{stats.ajustes}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                Correcciones
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-amber-600" />
            Filtrar Movimientos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Primera fila: Búsqueda y Tipo */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Buscar por producto, código o motivo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <Package className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              </div>
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="todos">Todos los tipos</option>
                <option value="entrada">Entradas</option>
                <option value="salida">Salidas</option>
                <option value="ajuste">Ajustes</option>
                <option value="devolucion">Devoluciones</option>
                <option value="merma">Mermas</option>
              </select>
            </div>

            {/* Segunda fila: Rango de fechas */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Desde
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hasta
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                    className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              {(fechaDesde || fechaHasta) && (
                <button
                  onClick={() => {
                    setFechaDesde('');
                    setFechaHasta('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Limpiar fechas
                </button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Movimientos */}
      <Card className="rounded-2xl shadow-xl">
        <CardHeader>
          <CardTitle>Historial Completo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {movimientosFiltrados.map((mov) => (
                  <tr key={mov.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {new Date(mov.fecha).toLocaleDateString('es-AR')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{mov.producto_nombre}</div>
                      <div className="text-sm text-gray-500">{mov.producto_codigo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getIconoTipo(mov.tipo)}
                        {getBadgeTipo(mov.tipo)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${
                        mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {mov.tipo === 'entrada' ? '+' : '-'}{mov.cantidad}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {mov.stock_anterior} → <span className="font-medium text-gray-900">{mov.stock_nuevo}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">{mov.motivo}</div>
                      {mov.observaciones && (
                        <div className="text-xs text-gray-500 mt-1">{mov.observaciones}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <User className="w-4 h-4 text-gray-400" />
                        {mov.usuario_nombre}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {movimientosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No se encontraron movimientos</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
