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
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-md max-w-lg w-full max-h-[95vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="relative bg-gray-900 text-white px-6 py-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-md"
            aria-label="Cerrar"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-md">
              <QrCodeIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Código QR</h2>
              <p className="text-gray-300 text-sm mt-0.5">{caballoNombre}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-gray-900"></div>
            <p className="text-gray-500 text-sm mt-4">Generando código QR...</p>
          </div>
        ) : qrData ? (
          <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
            {/* QR Code */}
            <div className="bg-gray-50 rounded-md p-8 mb-6 flex justify-center items-center border border-gray-200">
              <div className="bg-white p-5 rounded-md border border-gray-200">
                <QRCodeSVG
                  value={qrValue}
                  size={256}
                  level="H"
                  includeMargin={true}
                  fgColor="#111827"
                  bgColor="#ffffff"
                />
              </div>
            </div>

            {/* Info */}
            <div className="space-y-3 mb-6">
              <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 block mb-1">Nombre</span>
                    <span className="font-semibold text-gray-900">
                      {caballoNombre}
                    </span>
                  </div>
                  {microchip && (
                    <div>
                      <span className="text-gray-500 block mb-1">Microchip</span>
                      <span className="font-mono text-xs font-semibold text-gray-900">
                        {microchip}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-500 block mb-1">Estado</span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${QRCodeService.getStatusColor(qrData.estado)}`}
                    >
                      {QRCodeService.getStatusName(qrData.estado)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">Generado</span>
                    <span className="text-xs text-gray-900 font-medium">
                      {new Date(qrData.creado_el).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Scan link */}
              <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-gray-700 block mb-1">
                      Enlace de escaneo
                    </span>
                    <code className="text-xs text-gray-600 truncate block">
                      {qrValue}
                    </code>
                  </div>
                  <button
                    onClick={handleCopiarEnlace}
                    className={`flex-shrink-0 p-2 rounded-md ${
                      copied
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-900 hover:bg-gray-700 text-white'
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

              {/* Instructions */}
              <div className="bg-amber-50 rounded-md p-3 border border-amber-200">
                <p className="text-xs font-medium text-amber-900 mb-2">
                  Cómo usarlo
                </p>
                <ul className="text-xs text-amber-800 space-y-1">
                  <li>• Escanea con cualquier cámara de móvil</li>
                  <li>• Acceso público a información del caballo</li>
                  <li>• QR permanente y único</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDescargar}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-700 text-white rounded-md font-medium"
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span>Descargar</span>
              </button>
              <button
                onClick={handleCopiarEnlace}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-md font-medium ${
                  copied
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
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
            <QrCodeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              No se pudo cargar el QR code
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
