'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, ArrowLeft, DollarSign, TrendingUp, MapPin, Info } from 'lucide-react';
import { inventarioService, Producto } from '@/lib/inventarioService';
import { toast } from 'react-hot-toast';

export default function DetalleProductoPage() {
  const params = useParams();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const loadProducto = async () => {
    try {
      setLoading(true);
      const data = await inventarioService.getProducto(Number(params.id));
      
      if (data) {
        setProducto(data);
      } else {
        toast.error('Producto no encontrado');
        window.location.href = '/establecimiento/inventario';
      }
    } catch {
      toast.error('Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SimpleRoleGuard roles={['establecimiento']}>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
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
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 p-8">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
          
          <div className="relative">
            <Link
              href="/establecimiento/inventario"
              className="inline-flex items-center gap-2 text-purple-200 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al inventario
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">{producto.nombre}</h1>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-purple-200">Código: {producto.codigo}</p>
              <Badge variant={producto.stock_actual < producto.stock_minimo ? 'destructive' : 'default'}>
                {producto.stock_actual < producto.stock_minimo ? '⚠️ Stock Bajo' : '✅ Stock Normal'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Stock Actual</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {producto.stock_actual}
                  </p>
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
                  <p className="text-gray-600 text-sm font-medium">Stock Mínimo</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {producto.stock_minimo}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{producto.unidad_medida}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Precio Unitario</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    ${Number(producto.precio_unitario || 0).toFixed(0)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">por {producto.unidad_medida}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Valor Total</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    ${(Number(producto.precio_unitario || 0) * Number(producto.stock_actual || 0)).toFixed(0)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">en stock</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información Básica */}
          <Card className="rounded-2xl shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-purple-600" />
                Información del Producto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {producto.descripcion && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Descripción</p>
                  <p className="text-base text-gray-700">{producto.descripcion}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Categoría</p>
                  <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                    {producto.categoria_nombre || 'Sin categoría'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Unidad</p>
                  <Badge variant="outline">{producto.unidad_medida}</Badge>
                </div>
              </div>
              {producto.proveedor_nombre && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Proveedor</p>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    <MapPin className="w-3 h-3 mr-1" />
                    {producto.proveedor_nombre}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Control de Stock */}
          <Card className="rounded-2xl shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                Control de Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Stock Actual</span>
                  <span className="font-bold text-gray-900">{producto.stock_actual} {producto.unidad_medida}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <span className="text-sm text-gray-600">Stock Mínimo</span>
                  <span className="font-bold text-amber-700">{producto.stock_minimo} {producto.unidad_medida}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-600">Stock Máximo</span>
                  <span className="font-bold text-blue-700">{producto.stock_maximo} {producto.unidad_medida}</span>
                </div>
              </div>
              
              {/* Barra de progreso */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Nivel de stock</span>
                  <span className="text-sm font-medium">
                    {Math.round((producto.stock_actual / producto.stock_maximo) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      producto.stock_actual < producto.stock_minimo
                        ? 'bg-red-500'
                        : producto.stock_actual < producto.stock_maximo * 0.5
                        ? 'bg-amber-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((producto.stock_actual / producto.stock_maximo) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botón para ver movimientos */}
        <div className="flex justify-center">
          <Link
            href={`/establecimiento/inventario/${producto.id}/movimientos`}
            className="px-8 py-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-3 text-lg font-medium"
          >
            <Package className="w-6 h-6" />
            Ver Historial de Movimientos
          </Link>
        </div>
      </div>
    </SimpleRoleGuard>
  );
}
