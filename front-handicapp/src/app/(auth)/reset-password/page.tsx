"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo } from 'react';
import ApiClient from '@/lib/services/apiClient';
import { useToaster } from '@/components/ui/toaster';

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const token = useMemo(() => params.get('token') || '', [params]);
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToaster();
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!token) { 
      setError('Token inválido o expirado'); 
      return; 
    }
    
    if (!p1 || p1.length < 8) { 
      setError('La contraseña debe tener al menos 8 caracteres'); 
      return; 
    }
    
    if (p1 !== p2) { 
      setError('Las contraseñas no coinciden'); 
      return; 
    }
    
    try {
      setLoading(true);
      await ApiClient.performPasswordReset(token, p1);
      toast('Contraseña actualizada correctamente', 'success');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err: any) {
      setError(err?.message || 'No se pudo actualizar la contraseña');
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Formulario */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white lg:px-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Nueva Contraseña</h1>
            <p className="text-slate-600">Ingresá tu nueva contraseña para continuar</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">
                Nueva contraseña
              </label>
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                value={p1}
                onChange={(e) => setP1(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#af936f] focus:border-transparent transition-all"
                placeholder="Mínimo 8 caracteres"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">
                Confirmar contraseña
              </label>
              <input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                value={p2}
                onChange={(e) => setP2(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#af936f] focus:border-transparent transition-all"
                placeholder="Repite tu contraseña"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e293b] text-white font-semibold py-3.5 rounded-xl hover:bg-[#0f172a] hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-[#af936f] hover:text-[#8f7657] font-semibold transition-colors"
            >
              Volver al login
            </button>
          </div>
        </div>
      </div>

      {/* Right Side - Visual/Branding */}
      <div className="hidden lg:flex lg:flex-1 items-center justify-center p-8">
        <div className="relative bg-[#0f172a] overflow-hidden rounded-3xl h-full w-full shadow-2xl">
          {/* Pattern Background */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-60"></div>
          
          {/* Gradient Orbs */}
          <div className="absolute top-20 right-20 w-72 h-72 bg-[#0e445d]/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-[#af936f]/20 rounded-full blur-3xl"></div>
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full px-12 text-center">
            {/* Logo Icon */}
            <div className="mb-8">
              <img
                src="/logos/logo-icon-white.png"
                alt="HandicApp"
                className="h-32 w-32 object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logos/logo-full-white.png'; }}
              />
            </div>
            
            {/* Main Message */}
            <h2 className="text-4xl font-bold text-white mb-4">
              Restablecer Contraseña
            </h2>
            <p className="text-white/70 text-lg max-w-md">
              Crea una nueva contraseña segura para proteger tu cuenta y continuar gestionando tu pasión ecuestre.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
