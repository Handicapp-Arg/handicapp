'use client';

import React, { useMemo, useState } from 'react';
import { SimpleRoleGuard } from '@/components/common/SimplePermissionGuard';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  CreditCard, 
  Check, 
  AlertCircle, 
  Download, 
  Calendar,
  DollarSign,
  FileText,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';

interface Factura {
  id: number;
  fecha: string;
  monto: number;
  estado: 'pagada' | 'pendiente' | 'vencida';
  numero: string;
  periodo: string;
  metodoPago: string;
}

interface MetodoPago {
  id: number;
  tipo: 'tarjeta' | 'transferencia' | 'mercadopago';
  ultimos4: string;
  vencimiento?: string;
  titular: string;
  principal: boolean;
}

export default function PropietarioSuscripcionesPage() {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);

  const stats = useMemo(() => ({
    plan: 'Premium',
    estado: 'Activa',
    caballos: 50,
    usuarios: 10,
    montoPlan: 15000,
    proximaFacturacion: '2025-11-30'
  }), []);

  const facturas = useMemo<Factura[]>(() => [
    {
      id: 1,
      fecha: '2025-10-01',
      monto: 15000,
      estado: 'pagada',
      numero: 'FAC-2025-10-001',
      periodo: 'Octubre 2025',
      metodoPago: 'Visa •••• 4532'
    },
    {
      id: 2,
      fecha: '2025-09-01',
      monto: 15000,
      estado: 'pagada',
      numero: 'FAC-2025-09-001',
      periodo: 'Septiembre 2025',
      metodoPago: 'Visa •••• 4532'
    },
    {
      id: 3,
      fecha: '2025-08-01',
      monto: 15000,
      estado: 'pagada',
      numero: 'FAC-2025-08-001',
      periodo: 'Agosto 2025',
      metodoPago: 'Visa •••• 4532'
    },
    {
      id: 4,
      fecha: '2025-07-01',
      monto: 12000,
      estado: 'pagada',
      numero: 'FAC-2025-07-001',
      periodo: 'Julio 2025',
      metodoPago: 'Mastercard •••• 8765'
    }
  ], []);

  const metodosPago = useMemo<MetodoPago[]>(() => [
    {
      id: 1,
      tipo: 'tarjeta',
      ultimos4: '4532',
      vencimiento: '12/26',
      titular: 'Juan Pérez',
      principal: true
    },
    {
      id: 2,
      tipo: 'tarjeta',
      ultimos4: '8765',
      vencimiento: '08/25',
      titular: 'Juan Pérez',
      principal: false
    }
  ], []);

  const handleDescargarFactura = (factura: Factura) => {
    // Simular descarga de PDF
    console.log('Descargando factura:', factura.numero);
    alert(`Descargando factura ${factura.numero}`);
  };

  const getEstadoBadge = (estado: Factura['estado']) => {
    const configs = {
      pagada: { className: 'bg-green-100 text-green-800 border-green-200', label: 'Pagada' },
      pendiente: { className: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Pendiente' },
      vencida: { className: 'bg-red-100 text-red-800 border-red-200', label: 'Vencida' }
    };
    return configs[estado];
  };

  const getCardBrand = (numero: string) => {
    // Detectar marca de tarjeta basado en los primeros dígitos
    const firstDigit = numero[0];
    if (firstDigit === '4') return 'visa';
    if (firstDigit === '5') return 'mastercard';
    return 'generic';
  };

  const CardBrandLogo = () => {
    // Siempre mostrar logo genérico gris
    return (
      <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center">
        <CreditCard className="w-4 h-4 text-gray-500" />
      </div>
    );
  };

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(monto);
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <SimpleRoleGuard roles={['propietario']}>
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
          <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">Suscripciones y Facturación</h1>
            </div>
            <p className="text-slate-300 text-lg">
              Gestiona tu plan, métodos de pago y facturas
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Plan Actual</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stats.plan}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  Suscripción
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Estado</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.estado}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                  Pagada
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Monto Mensual</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatMonto(stats.montoPlan)}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  Por mes
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Próxima Facturación</p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    {new Date(stats.proximaFacturacion).getDate()}/{new Date(stats.proximaFacturacion).getMonth() + 1}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4">
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                  {formatFecha(stats.proximaFacturacion)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plan Info & Métodos de Pago - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plan Info */}
          <Card className="rounded-2xl shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Plan Premium</h3>
                  <CardDescription>Detalles de tu suscripción actual</CardDescription>
                </div>
                <button 
                  onClick={() => setShowPlanDialog(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all text-sm font-medium shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  Cambiar
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-xl hover:shadow-sm transition-shadow">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">Hasta {stats.caballos} caballos</p>
                  <p className="text-xs text-gray-600 mt-0.5">Gestión completa de tu haras</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200/50 rounded-xl hover:shadow-sm transition-shadow">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">{stats.usuarios} usuarios permitidos</p>
                  <p className="text-xs text-gray-600 mt-0.5">Empleados y colaboradores</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-xl hover:shadow-sm transition-shadow">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">Soporte prioritario</p>
                  <p className="text-xs text-gray-600 mt-0.5">Atención preferencial 24/7</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200/50 rounded-xl hover:shadow-sm transition-shadow">
                <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm">Reportes avanzados</p>
                  <p className="text-xs text-gray-600 mt-0.5">Analytics y exportación de datos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métodos de Pago */}
          <Card className="rounded-2xl shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-gray-700" />
                    Métodos de Pago
                  </h3>
                  <CardDescription className="mt-0.5 text-xs">Administra tus tarjetas guardadas</CardDescription>
                </div>
                <button 
                  onClick={() => setShowPaymentDialog(true)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Agregar
                </button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              {/* Grid de tarjetas - Horizontal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metodosPago.map((metodo) => {
                  const cardBrand = getCardBrand(metodo.ultimos4);
                  const isPrincipal = metodo.principal;
                  
                  return (
                    <div key={metodo.id} className="group">
                      {/* Tarjeta de Crédito Visual - Compacta */}
                      <div 
                        className={`relative overflow-hidden rounded-xl p-5 w-full transition-all duration-300 ${
                          isPrincipal 
                            ? 'shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5' 
                            : 'shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                        }`}
                        style={{
                          backgroundImage: isPrincipal 
                            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                            : 'linear-gradient(135deg, #434343 0%, #262626 100%)'
                        }}
                      >
                        {/* Pattern de fondo decorativo */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-0 right-0 w-28 h-28 bg-white rounded-full blur-3xl" />
                          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl" />
                        </div>

                        {/* Contenido de la tarjeta */}
                        <div className="relative z-10">
                          {/* Header con chip y logo */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2.5">
                              {/* Chip de tarjeta */}
                              <div className="w-10 h-7 rounded bg-gradient-to-br from-yellow-300 via-yellow-400 to-yellow-500 shadow-md">
                                <svg viewBox="0 0 40 28" className="w-full h-full p-0.5">
                                  <rect x="3" y="3" width="34" height="22" rx="2.5" fill="none" stroke="#8B7355" strokeWidth="0.7"/>
                                  <line x1="10" y1="10" x2="30" y2="10" stroke="#8B7355" strokeWidth="0.7"/>
                                  <line x1="10" y1="18" x2="30" y2="18" stroke="#8B7355" strokeWidth="0.7"/>
                                  <line x1="10" y1="10" x2="10" y2="18" stroke="#8B7355" strokeWidth="0.7"/>
                                  <line x1="30" y1="10" x2="30" y2="18" stroke="#8B7355" strokeWidth="0.7"/>
                                  <line x1="20" y1="10" x2="20" y2="18" stroke="#8B7355" strokeWidth="0.7"/>
                                </svg>
                              </div>
                              {/* Badge Principal */}
                              {isPrincipal && (
                                <Badge className="bg-white/25 text-white border-white/40 backdrop-blur-sm text-xs px-2.5 py-0.5 shadow-sm">
                                  ⭐ Principal
                                </Badge>
                              )}
                            </div>
                            {/* Logo de la tarjeta */}
                            <CardBrandLogo />
                          </div>

                          {/* Número de tarjeta */}
                          <div className="mb-3.5">
                            <p className="text-white text-lg font-mono tracking-[0.15em] drop-shadow-md">
                              •••• •••• •••• {metodo.ultimos4}
                            </p>
                          </div>

                          {/* Info inferior */}
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-white/70 text-[10px] mb-0.5 uppercase tracking-wider font-medium">Titular</p>
                              <p className="text-white font-semibold text-sm">{metodo.titular}</p>
                            </div>
                            {metodo.vencimiento && (
                              <div className="text-right">
                                <p className="text-white/70 text-[10px] mb-0.5 uppercase tracking-wider font-medium">Vence</p>
                                <p className="text-white font-semibold text-sm font-mono">{metodo.vencimiento}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Efecto de brillo hover */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-transparent group-hover:via-white/10 transition-all duration-500" />
                      </div>

                      {/* Acciones debajo de la tarjeta */}
                      <div className="flex items-center gap-2 mt-3">
                        {!isPrincipal ? (
                          <>
                            <button className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow-md text-sm font-medium">
                              Establecer como principal
                            </button>
                            <button 
                              className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button 
                            className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tarjetas aceptadas */}
              <div className="mt-6 pt-5 border-t border-gray-200">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-xl p-4">
                  <p className="text-xs font-medium text-gray-700 mb-3 text-center">Aceptamos las siguientes formas de pago:</p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200">
                      <CardBrandLogo />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm border border-gray-200">
                      <CardBrandLogo />
                    </div>
                    <Badge variant="secondary" className="text-xs px-3 py-1.5 bg-white border-gray-200 shadow-sm">American Express</Badge>
                    <Badge variant="secondary" className="text-xs px-3 py-1.5 bg-white border-gray-200 shadow-sm">Mercado Pago</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Historial de Facturación */}
        <Card className="rounded-2xl shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Historial de Facturación</h3>
                <CardDescription>Facturas emitidas y pendientes</CardDescription>
              </div>
              <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                {facturas.length} facturas
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Número
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Período
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Método de Pago
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {facturas.map((factura) => {
                    const estadoBadge = getEstadoBadge(factura.estado);
                    return (
                      <tr key={factura.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">{factura.numero}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{factura.periodo}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{formatFecha(factura.fecha)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{factura.metodoPago}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900">{formatMonto(factura.monto)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant="secondary" className={estadoBadge.className}>
                            {estadoBadge.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleDescargarFactura(factura)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                          >
                            <Download className="w-4 h-4" />
                            Descargar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {facturas.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No hay facturas disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert Info */}
        <Card className="rounded-2xl shadow-xl border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Información importante</h4>
                <p className="text-sm text-gray-700">
                  Tu suscripción se renovará automáticamente el <strong>{formatFecha(stats.proximaFacturacion)}</strong> usando 
                  tu método de pago principal. Podés cancelar o modificar tu plan en cualquier momento sin cargos adicionales.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SimpleRoleGuard>
  );
}
