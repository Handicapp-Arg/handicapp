"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ApiClient from '@/lib/services/apiClient';
import { useToaster } from '@/components/ui/toaster';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToaster();
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const normalized = email.trim().toLowerCase();
    if (!normalized) { setError('Ingresá tu email'); return; }
    try {
      setLoading(true);
      await ApiClient.sendPasswordReset(normalized);
      toast('Si el email existe, te enviamos instrucciones', 'success');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err: any) {
      setError(err?.message || 'No se pudo enviar el email');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left Side - Formulario */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white lg:px-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Recuperar Contraseña</h1>
            <p className="text-slate-600">Te enviaremos un enlace para restablecerla</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                autoFocus
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#af936f] focus:border-transparent transition-all"
                placeholder="tu@email.com"
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
              {loading ? 'Enviando...' : 'Enviar Enlace'}
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
              Recupera tu Acceso
            </h2>
            <p className="text-white/70 text-lg max-w-md">
              No te preocupes, te ayudaremos a recuperar el acceso a tu cuenta de forma segura y rápida.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
