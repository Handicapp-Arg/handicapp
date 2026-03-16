'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ApiClient from '@/lib/services/apiClient';
import { useToaster } from '@/components/ui/toaster';
import { ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import Link from 'next/link';

const forgotPasswordSchema = z.object({
  email: z.string().email('Ingresá un email válido').min(1, 'Ingresá tu email'),
});

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
    const validation = forgotPasswordSchema.safeParse({ email: normalized });
    if (!validation.success) { setError(validation.error.issues[0].message); return; }
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
    <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
        <Link href="/login" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio de sesión
        </Link>

        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Recuperar contraseña</h1>
          <p className="text-sm text-gray-500 mt-1">Ingresá tu email y te enviamos un enlace para restablecer tu clave.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              placeholder="correo@ejemplo.com"
            />
          </div>

          {error && (
            <div className="rounded-md p-3 bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>
    </div>
  );
}
