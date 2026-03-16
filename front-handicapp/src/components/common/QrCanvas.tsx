"use client";

import React, { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface QrCanvasProps {
  value: string;
  size?: number;
  label?: string;
}

export const QrCanvas: React.FC<QrCanvasProps> = ({ value, size = 160, label }) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const onDownload = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current.querySelector('canvas');
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = (label ? label.replace(/\s+/g, '_') : 'qr') + '.png';
    link.click();
  };

  return (
    <div className="inline-flex flex-col items-center gap-2">
      <div ref={canvasRef} className="rounded border bg-white p-2">
        <QRCodeCanvas 
          value={value || 'https://handicapp.com'} 
          size={size}
          level="H"
          includeMargin={false}
        />
      </div>
      <button 
        type="button" 
        onClick={onDownload} 
        className="text-xs text-[#af936f] hover:text-[#0f172a] underline"
      >
        Descargar QR
      </button>
    </div>
  );
};

export default QrCanvas;
