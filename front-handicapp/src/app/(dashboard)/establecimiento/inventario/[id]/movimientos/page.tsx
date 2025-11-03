'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, History, TrendingUp, TrendingDown, Package, Calendar, User, RefreshCw, Filter } from 'lucide-react';
import { inventarioService, Producto, Movimiento } from '@/lib/inventarioService';
import { toast } from 'react-hot-toast';

export default function MovimientosProductoPage() {
  const params = useParams();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('todos');

  // Calcular estadísticas
  const stats = useMemo(() => {
    if (!movimientos.length) return { total: 0, entradas: 0, salidas: 0, ajustes: 0 };
    
    return {
      total: movimientos.length,
      entradas: movimientos.filter(m => m.tipo === 'entrada').length,
      salidas: movimientos.filter(m => m.tipo === 'salida').length,
      ajustes: movimientos.filter(m => m.tipo === 'ajuste').length
    };
  }, [movimientos]);

  // Filtrar movimientos
  const movimientosFiltrados = useMemo(() => {
    if (filtroTipo === 'todos') return movimientos;
    return movimientos.filter(m => m.tipo === filtroTipo);
  }, [movimientos, filtroTipo]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadData = async () => {
    try {
      console.log('🔵 CARGANDO MOVIMIENTOS - ID:', params.id);
      setLoading(true);
      
      // Cargar producto
      const producto = await inventarioService.getProducto(Number(params.id));
      console.log('🔵 PRODUCTO RECIBIDO:', producto);
      
      if (!producto) {
        toast.error('Producto no encontrado');
        window.location.href = '/establecimiento/inventario';
        return;
      }
      
      setProducto(producto);
      
      // Cargar movimientos
      const movs = await inventarioService.getMovimientos({ producto_id: Number(params.id) });
      console.log('🔵 MOVIMIENTOS RECIBIDOS:', movs);
      setMovimientos(movs || []);
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const getTipoMovimientoColor = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return 'bg-green-100 text-green-800';
      case 'salida':
        return 'bg-red-100 text-red-800';
      case 'ajuste':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTipoMovimientoIcon = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return <TrendingUp className="w-4 h-4" />;
      case 'salida':
        return <TrendingDown className="w-4 h-4" />;
      case 'ajuste':
        return <RefreshCw className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <SimpleRoleGuard roles={['establecimiento']}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </SimpleRoleGuard>
    );
  }

  if (!producto) {
    return null;
  }

  return (
    <SimpleRoleGuard roles={['establecimiento']}>
      <div className="p-6 space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 p-8">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          
          <div className="relative">
            <Link
              href={`/establecimiento/inventario/${params.id}`}
              className="inline-flex items-center gap-2 text-indigo-200 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver a detalles del producto
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <History className="w-8 h-8 text-indigo-400" />
              <h1 className="text-3xl font-bold text-white">Historial de Movimientos</h1>
            </div>
            <p className="text-indigo-200 text-lg">
              {producto.nombre} - {producto.codigo}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Stock Actual</p>
                  <p className="text-3xl font-bold text-purple-600 mt-1">{producto.stock_actual}</p>
                  <p className="text-sm text-gray-500 mt-1">{producto.unidad_medida}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Package className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Entradas</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{stats.entradas}</p>
                  <p className="text-sm text-gray-500 mt-1">Movimientos</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Salidas</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">{stats.salidas}</p>
                  <p className="text-sm text-gray-500 mt-1">Movimientos</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Ajustes</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{stats.ajustes}</p>
                  <p className="text-sm text-gray-500 mt-1">Movimientos</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-600" />
              Filtrar Movimientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="todos">Todos los tipos</option>
              <option value="entrada">Entradas</option>
              <option value="salida">Salidas</option>
              <option value="ajuste">Ajustes</option>
              <option value="devolucion">Devoluciones</option>
              <option value="merma">Mermas</option>
            </select>
          </CardContent>
        </Card>

        {/* Lista de Movimientos */}
        <Card className="rounded-2xl shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Movimientos ({movimientosFiltrados.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {movimientosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No hay movimientos registrados</p>
                <p className="text-gray-400 text-sm mt-2">
                  {filtroTipo === 'todos' 
                    ? 'Los movimientos de entrada, salida y ajuste aparecerán aquí'
                    : `No hay movimientos de tipo "${filtroTipo}"`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {movimientosFiltrados.map((mov) => (
                  <div
                    key={mov.id}
                    className="border rounded-xl p-5 hover:bg-gray-50 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${getTipoMovimientoColor(mov.tipo)}`}>
                          {getTipoMovimientoIcon(mov.tipo)}
                        </div>
                        <div>
                          <Badge className={`${getTipoMovimientoColor(mov.tipo)} mb-2`}>
                            {mov.tipo.toUpperCase()}
                          </Badge>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(mov.fecha).toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${
                          mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {mov.tipo === 'entrada' ? '+' : '-'}
                          {mov.cantidad}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{producto.unidad_medida}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{mov.usuario_nombre || 'Sistema'}</span>
                      </div>
                      {mov.stock_anterior !== undefined && mov.stock_nuevo !== undefined && (
                        <div className="text-gray-500">
                          Stock: <span className="text-gray-400">{mov.stock_anterior}</span> → <span className="font-medium text-gray-900">{mov.stock_nuevo}</span>
                        </div>
                      )}
                      {mov.motivo && (
                        <div className="text-gray-600">
                          Motivo: <span className="font-medium">{mov.motivo}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SimpleRoleGuard>
  );
}
