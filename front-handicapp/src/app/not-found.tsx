'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-[#af936f] mb-4 tracking-tight">404</p>
        <h1 className="text-2xl font-bold text-[#1e293b] mb-2">
          Página no encontrada
        </h1>
        <p className="text-slate-500 text-sm mb-8">
          La página que buscás no existe o fue movida.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#af936f] text-white text-sm font-medium rounded-lg hover:bg-[#9a7d5a] transition-colors"
          >
            <Home className="w-4 h-4" />
            Ir al inicio
          </Link>
          <button
            onClick={() => history.back()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-[#1e293b] text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>
      </div>
    </div>
  );
}
