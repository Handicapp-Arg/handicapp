'use client';
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QRCodeService } from '@/lib/services/qrCodeService';
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  LinkIcon,
  QrCodeIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface QRCodeDisplayProps {
  caballoId: number;
  caballoNombre: string;
  microchip?: string;
  onClose: () => void;
}

export default function QRCodeDisplay({
  caballoId,
  caballoNombre,
  microchip,
  onClose,
}: QRCodeDisplayProps) {
  const [qrData, setQrData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    cargarQR();
  }, [caballoId]);

  const cargarQR = async () => {
    setLoading(true);
    try {
      const data = await QRCodeService.getOrCreateQR(caballoId);
      setQrData(data);
    } catch (error: any) {      toast.error(error.message || 'Error al cargar QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargar = async () => {
    if (!qrData) return;
    try {
      await QRCodeService.downloadQR(qrData.token, caballoNombre);
      toast.success('QR descargado exitosamente');
    } catch (error: any) {
      toast.error(error.message || 'Error al descargar QR');
    }
  };

  const handleCopiarEnlace = async () => {
    if (!qrData) return;
    try {
      await QRCodeService.copyQRLink(qrData.token);
      setCopied(true);
      toast.success('Enlace copiado al portapapeles');
      setTimeout(() => setCopied(false), 3000);
    } catch (error: any) {
      toast.error(error.message || 'Error al copiar enlace');
    }
  };

  const qrValue = qrData ? QRCodeService.generateQRValue(qrData.token) : '';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full max-h-[95vh] overflow-hidden animate-slideUp">
        {/* Header Moderno */}
        <div className="relative bg-primary text-white px-6 py-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <QrCodeIcon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Código QR</h2>
              <p className="text-primary-100 text-sm mt-0.5">{caballoNombre}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary/30 border-t-primary"></div>
              <QrCodeIcon className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-gray-500 text-sm mt-4">Generando código QR...</p>
          </div>
        ) : qrData ? (
          <div className="p-6 overflow-y-auto max-h-[calc(95vh-140px)]">
            {/* QR Code Centrado con diseño limpio */}
            <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-2xl p-8 mb-6 flex justify-center items-center border border-gray-100 dark:border-gray-700">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-full"></div>
                <div className="relative bg-white p-5 rounded-2xl shadow-xl ring-1 ring-gray-200">
                  <QRCodeSVG
                    value={qrValue}
                    size={256}
                    level="H"
                    includeMargin={true}
                    fgColor="#0f172a"
                    bgColor="#ffffff"
                  />
                </div>
              </div>
            </div>

            {/* Información Compacta */}
            <div className="space-y-3 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block mb-1">Nombre</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {caballoNombre}
                    </span>
                  </div>
                  {microchip && (
                    <div>
                      <span className="text-gray-500 dark:text-gray-400 block mb-1">Microchip</span>
                      <span className="font-mono text-xs font-semibold text-gray-900 dark:text-white">
                        {microchip}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block mb-1">Estado</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${QRCodeService.getStatusColor(qrData.estado)}`}
                    >
                      {QRCodeService.getStatusName(qrData.estado)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block mb-1">Generado</span>
                    <span className="text-xs text-gray-900 dark:text-white font-medium">
                      {new Date(qrData.creado_el).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enlace de escaneo compacto */}
              <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-3 border border-primary/20">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-primary-700 dark:text-primary-300 block mb-1">
                      Enlace de escaneo
                    </span>
                    <code className="text-xs text-gray-600 dark:text-gray-300 truncate block">
                      {qrValue}
                    </code>
                  </div>
                  <button
                    onClick={handleCopiarEnlace}
                    className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                      copied
                        ? 'bg-green-500 text-white'
                        : 'bg-primary hover:bg-primary-600 text-white'
                    }`}
                    title="Copiar enlace"
                  >
                    {copied ? (
                      <CheckIcon className="w-4 h-4" />
                    ) : (
                      <LinkIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Instrucciones minimalistas */}
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
                <p className="text-xs font-medium text-amber-900 dark:text-amber-300 mb-2">
                  � Cómo usarlo
                </p>
                <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
                  <li>• Escanea con cualquier cámara de móvil</li>
                  <li>• Acceso público a información del caballo</li>
                  <li>• QR permanente y único</li>
                </ul>
              </div>
            </div>

            {/* Acciones modernas */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDescargar}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary-600 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span>Descargar</span>
              </button>
              <button
                onClick={handleCopiarEnlace}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ${
                  copied
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white'
                }`}
              >
                {copied ? (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-5 h-5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <QrCodeIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              No se pudo cargar el QR code
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
