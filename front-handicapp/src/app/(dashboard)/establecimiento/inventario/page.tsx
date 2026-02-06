'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Package, TrendingDown, AlertTriangle, DollarSign, Search, Plus, Eye, TrendingUp, Edit, Trash2 } from 'lucide-react';
import { inventarioService, type Producto } from '@/lib/inventarioService';
import { toast } from 'react-hot-toast';
import { Loader } from '@/components/ui/loader';

export default function EstablecimientoInventarioPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroStockBajo, setFiltroStockBajo] = useState(false);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [modalConfirm, setModalConfirm] = useState(false);
  const [productoActual, setProductoActual] = useState<Producto | null>(null);
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    descripcion: '',
    precio_unitario: '' as number | '',
    stock_actual: '' as number | '',
    stock_minimo: '' as number | '',
    stock_maximo: '' as number | '',
    unidad_medida: 'kg' as 'kg' | 'litro' | 'unidad',
    categoria_id: 3,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const prodData = await inventarioService.getProductos();
      setProductos(prodData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoProducto = () => {
    setFormData({
      nombre: '',
      codigo: '',
      descripcion: '',
      precio_unitario: '',
      stock_actual: '',
      stock_minimo: '',
      stock_maximo: '',
      unidad_medida: 'kg',
      categoria_id: 3,
    });
    setProductoActual(null);
    setModalNuevo(true);
  };

  const handleEditarProducto = (producto: Producto) => {
    setFormData({
      nombre: producto.nombre,
      codigo: producto.codigo,
      descripcion: producto.descripcion || '',
      precio_unitario: producto.precio_unitario,
      stock_actual: producto.stock_actual,
      stock_minimo: producto.stock_minimo,
      stock_maximo: producto.stock_maximo || 0,
      unidad_medida: producto.unidad_medida as 'kg' | 'litro' | 'unidad',
      categoria_id: producto.categoria_id,
    });
    setProductoActual(producto);
    setModalEditar(true);
  };

  const handleGuardarProducto = async () => {
    try {
      const dataToSend = {
        ...formData,
        precio_unitario: Number(formData.precio_unitario) || 0,
        stock_actual: Number(formData.stock_actual) || 0,
        stock_minimo: Number(formData.stock_minimo) || 0,
        stock_maximo: Number(formData.stock_maximo) || 0,
      };

      if (productoActual) {
        const success = await inventarioService.actualizarProducto(productoActual.id, dataToSend);
        if (success) {
          toast.success('Producto actualizado correctamente');
          setModalEditar(false);
          loadData();
        } else {
          toast.error('Error al actualizar producto');
        }
      } else {
        const nuevo = await inventarioService.crearProducto(dataToSend);
        if (nuevo) {
          toast.success('Producto creado correctamente');
          setModalNuevo(false);
          loadData();
        } else {
          toast.error('Error al crear producto');
        }
      }
    } catch (error) {
      console.error('Error guardando producto:', error);
      toast.error('Error al guardar producto');
    }
  };

  const handleEliminarProducto = (producto: Producto) => {
    setProductoAEliminar(producto);
    setModalConfirm(true);
  };

  const confirmarEliminar = async () => {
    if (!productoAEliminar) return;

    const success = await inventarioService.eliminarProducto(productoAEliminar.id);
    if (success) {
      toast.success('Producto eliminado correctamente');
      loadData();
    } else {
      toast.error('Error al eliminar producto');
    }
    
    setModalConfirm(false);
    setProductoAEliminar(null);
  };

  const stats = useMemo(() => {
    // Calcular desde los productos reales
    const total = productos.length;
    const stockBajo = productos.filter(p => p.stock_actual < p.stock_minimo).length;
    
    // Contar categor�as �nicas
    const categoriasUnicas = new Set(productos.map(p => p.categoria_id));
    const categorias = categoriasUnicas.size;
    
    // Calcular valor total del inventario
    const valorTotal = productos.reduce((sum, p) => {
      return sum + (p.stock_actual * p.precio_unitario);
    }, 0);

    return {
      total,
      stockBajo,
      categorias,
      valorTotal: Math.round(valorTotal), // Redondear a entero
    };
  }, [productos]);

  const productosFiltrados = productos.filter(prod => {
    const matchesBusqueda = 
      prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      prod.codigo.toLowerCase().includes(busqueda.toLowerCase());
    const matchesStockBajo = !filtroStockBajo || prod.stock_actual < prod.stock_minimo;
    return matchesBusqueda && matchesStockBajo;
  });

  // Paginación
  const totalItems = productosFiltrados.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const productosPaginados = productosFiltrados.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Productos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                En cat�logo
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Stock Bajo</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.stockBajo}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="bg-orange-50 text-orange-700 border-orange-200">
                Requieren reposici�n
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Categor�as</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.categorias}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                Tipos de producto
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Valor Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">${stats.valorTotal.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                Inventario valorizado
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Card */}
      <Card className="rounded-lg border border-gray-200 shadow-sm">
        <CardHeader className="px-4 sm:px-6 space-y-4">
          {/* T�tulo */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Gesti�n de Inventario</h2>
              <p className="text-sm text-gray-600 mt-1">Lista completa de productos en inventario</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/establecimiento/inventario/movimientos"
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Movimientos</span>
              </Link>
              <button
                onClick={handleNuevoProducto}
                className="px-3 sm:px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Producto</span>
              </button>
            </div>
          </div>

          {/* Buscador */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre o c�digo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-4 md:px-6">
          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Mostrar X registros a la izquierda */}
            <div className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
              <span>Mostrar</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>registros</span>
            </div>

            {/* Filtro solo stock bajo a la derecha */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg cursor-pointer whitespace-nowrap hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={filtroStockBajo}
                  onChange={(e) => setFiltroStockBajo(e.target.checked)}
                  className="rounded"
                />
                <span className="text-xs sm:text-sm">Solo stock bajo</span>
              </label>
            </div>
          </div>

          {/* Desktop Table - Hidden on mobile */}
          <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <div className="min-w-full inline-block align-middle">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">C�digo</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Producto</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">M�nimo</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Precio</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Estado</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {productosPaginados.map((prod) => (
                      <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{prod.codigo}</td>
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-gray-900">{prod.nombre}</div>
                          <div className="text-xs text-gray-500">{prod.descripcion}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{prod.stock_actual} {prod.unidad_medida}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{prod.stock_minimo}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${prod.precio_unitario.toLocaleString()}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center rounded-md border text-xs px-2 py-0.5 font-medium pointer-events-none ${
                            prod.stock_actual < prod.stock_minimo 
                              ? 'bg-red-100 text-red-800 border-red-300' 
                              : 'bg-green-100 text-green-800 border-green-300'
                          }`}>
                            {prod.stock_actual < prod.stock_minimo ? 'Stock Bajo' : 'OK'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/establecimiento/inventario/${prod.id}`}
                              className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                              title="Ver detalle"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/establecimiento/inventario/movimientos?producto_id=${prod.id}`}
                              className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                              title="Ver movimientos"
                            >
                              <TrendingUp className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleEditarProducto(prod)}
                              type="button"
                              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEliminarProducto(prod)}
                              type="button"
                              className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Mobile Cards - Hidden on desktop */}
          <div className="md:hidden space-y-3">
            {productosPaginados.map((prod) => (
              <div 
                key={prod.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm">{prod.nombre}</h3>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">{prod.codigo}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-md border text-xs px-2 py-0.5 font-medium ml-2 flex-shrink-0 ${
                    prod.stock_actual < prod.stock_minimo 
                      ? 'bg-red-100 text-red-800 border-red-300' 
                      : 'bg-green-100 text-green-800 border-green-300'
                  }`}>
                    {prod.stock_actual < prod.stock_minimo ? 'Bajo' : 'OK'}
                  </span>
                </div>

                {/* Description */}
                {prod.descripcion && (
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">{prod.descripcion}</p>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-[10px] text-gray-500 uppercase">Stock</p>
                    <p className="text-sm font-semibold text-gray-900">{prod.stock_actual} {prod.unidad_medida}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-[10px] text-gray-500 uppercase">M�nimo</p>
                    <p className="text-sm font-semibold text-gray-900">{prod.stock_minimo}</p>
                  </div>
                  <div className="bg-emerald-50 rounded-lg p-2">
                    <p className="text-[10px] text-emerald-600 uppercase">Precio</p>
                    <p className="text-sm font-semibold text-emerald-700">${prod.precio_unitario}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-2">
                    <p className="text-[10px] text-blue-600 uppercase">Total</p>
                    <p className="text-sm font-semibold text-blue-700">${(prod.stock_actual * prod.precio_unitario).toLocaleString()}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <Link
                    href={`/establecimiento/inventario/${prod.id}`}
                    className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </Link>
                  <Link
                    href={`/establecimiento/inventario/movimientos?producto_id=${prod.id}`}
                    className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Mov
                  </Link>
                  <button
                    onClick={() => handleEditarProducto(prod)}
                    className="flex-1 py-2 px-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleEliminarProducto(prod)}
                    className="py-2 px-3 bg-gray-50 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {productosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm sm:text-base">No se encontraron productos</p>
            </div>
          )}

          {/* Paginación */}
          {productosFiltrados.length > 0 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                <span className="font-medium">{Math.min(endIndex, totalItems)}</span> de{' '}
                <span className="font-medium">{totalItems}</span> productos
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Mostrar primera p�gina, �ltima p�gina, p�gina actual y p�ginas adyacentes
                      return page === 1 || 
                             page === totalPages || 
                             Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, index, array) => {
                      // Agregar puntos suspensivos si hay salto
                      const prevPage = array[index - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;
                      
                      return (
                        <div key={page} className="flex items-center gap-1">
                          {showEllipsis && <span className="px-2 text-gray-500">...</span>}
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      );
                    })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Nuevo Producto */}
      <Dialog open={modalNuevo} onOpenChange={setModalNuevo}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Plus className="w-6 h-6 text-blue-600" />
              Nuevo Producto
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">C�digo</label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                  placeholder="ALI-001"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Unidad de medida</label>
                <select
                  value={formData.unidad_medida}
                  onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value as 'kg' | 'litro' | 'unidad' })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                >
                  <option value="kg">Kilogramos</option>
                  <option value="litro">Litros</option>
                  <option value="unidad">Unidades</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Nombre del producto</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                placeholder="Avena Premium"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descripci�n</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Descripci�n del producto..."
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Precio unitario</label>
                <input
                  type="number"
                  value={formData.precio_unitario}
                  onChange={(e) => setFormData({ ...formData, precio_unitario: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stock actual</label>
                <input
                  type="number"
                  value={formData.stock_actual}
                  onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stock m�nimo</label>
                <input
                  type="number"
                  value={formData.stock_minimo}
                  onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stock m�ximo</label>
                <input
                  type="number"
                  value={formData.stock_maximo}
                  onChange={(e) => setFormData({ ...formData, stock_maximo: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                  placeholder="0"
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
              onClick={handleGuardarProducto}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Guardar Producto
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Producto */}
      <Dialog open={modalEditar} onOpenChange={setModalEditar}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              Editar Producto
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">C�digo</label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                  placeholder="ALI-001"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Unidad de medida</label>
                <select
                  value={formData.unidad_medida}
                  onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value as 'kg' | 'litro' | 'unidad' })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                >
                  <option value="kg">Kilogramos</option>
                  <option value="litro">Litros</option>
                  <option value="unidad">Unidades</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Nombre del producto</label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                placeholder="Avena Premium"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Descripci�n</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                rows={3}
                placeholder="Descripci�n del producto..."
              />
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Precio unitario</label>
                <input
                  type="number"
                  value={formData.precio_unitario}
                  onChange={(e) => setFormData({ ...formData, precio_unitario: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stock actual</label>
                <input
                  type="number"
                  value={formData.stock_actual}
                  onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stock m�nimo</label>
                <input
                  type="number"
                  value={formData.stock_minimo}
                  onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Stock m�ximo</label>
                <input
                  type="number"
                  value={formData.stock_maximo}
                  onChange={(e) => setFormData({ ...formData, stock_maximo: e.target.value === '' ? '' : parseFloat(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-lg"
                  placeholder="0"
                />
              </div>
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
              onClick={handleGuardarProducto}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Guardar Cambios
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmaci�n para Eliminar */}
      <Dialog open={modalConfirm} onOpenChange={setModalConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-600">
              <Trash2 className="w-6 h-6" />
              Confirmar Eliminaci�n
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700">
              �Est�s seguro de eliminar el producto{' '}
              <span className="font-bold">{productoAEliminar?.nombre}</span>?
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Esta acci�n no se puede deshacer. Se perder� toda la informaci�n del producto y su historial.
            </p>
          </div>
          <DialogFooter>
            <button
              onClick={() => {
                setModalConfirm(false);
                setProductoAEliminar(null);
              }}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={confirmarEliminar}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Eliminar Producto
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

