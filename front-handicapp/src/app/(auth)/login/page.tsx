'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthNew } from '../../../lib/hooks/useAuthNew';
import { useSearchParams } from 'next/navigation';
import { useToaster } from '@/components/ui/toaster';
import { showSuccess } from '@/lib/utils/errorHandler';
import ApiClient from '@/lib/services/apiClient';
import AuthManager from '@/lib/auth/AuthManager';
import { Eye, EyeOff } from 'lucide-react';
import { loginSchema } from '@/lib/schemas/auth';
import Link from 'next/link';

type FieldErrors = {
  email?: string;
  password?: string;
  general?: string;
  verification?: string;
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const { login, isLoading: authLoading, error: authError } = useAuthNew();
  const params = useSearchParams();
  const checkEmail = useMemo(() => params.get('checkEmail') === '1', [params]);
  const emailParam = useMemo(() => params.get('email') || '', [params]);
  const redirectTo = useMemo(() => params.get('redirectTo') || '', [params]);
  const verified = useMemo(() => params.get('verified') === '1', [params]);
  const { toast } = useToaster();
  const [resending, setResending] = useState(false);
  const shownInfoRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (emailParam && mounted) setEmail(emailParam);
  }, [emailParam, mounted]);

  useEffect(() => {
    if (checkEmail && !shownInfoRef.current) {
      shownInfoRef.current = true;
      toast(`Te enviamos un correo a ${emailParam || 'tu casilla'} para verificar la cuenta.`, { type: 'info', duration: 5000 });
    }
  }, [checkEmail, emailParam, toast]);

  useEffect(() => {
    if (verified && !shownInfoRef.current && mounted) {
      shownInfoRef.current = true;
      toast('¡Cuenta verificada exitosamente! Ingresá tu contraseña para continuar.', { type: 'success', duration: 5000 });
    }
  }, [verified, mounted, toast]);

  useEffect(() => {
    const hasErrors = fieldErrors.general || fieldErrors.verification || fieldErrors.email || fieldErrors.password;
    if (hasErrors) {
      const timer = setTimeout(() => setFieldErrors({}), 5000);
      return () => clearTimeout(timer);
    }
  }, [fieldErrors.general, fieldErrors.verification, fieldErrors.email, fieldErrors.password]);

  const onResend = async () => {
    if (!emailParam) { toast('Ingresá tu email y reintentá', 'warning'); return; }
    try {
      setResending(true);
      await ApiClient.resendVerification(emailParam);
      toast('Si el email existe, reenviamos el enlace de verificación', 'success');
    } catch (e: any) {
      toast(e?.message || 'No se pudo reenviar', 'error');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const newFieldErrors: FieldErrors = {};
      validation.error.issues.forEach(issue => {
        const field = issue.path[0] as string;
        if (field === 'email') newFieldErrors.email = issue.message;
        if (field === 'password') newFieldErrors.password = issue.message;
      });
      setFieldErrors({ ...newFieldErrors, general: 'Revisá los datos ingresados antes de continuar' });
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      showSuccess('auth', 'login', 'Inicio de sesión exitoso');
      const state = AuthManager.getInstance().getState();
      const roleKey = state.user?.rol?.clave || 'user';

      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.push(roleKey === 'admin' ? '/admin' : '/');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al iniciar sesión';
      setFieldErrors(normalizeLoginError(errorMessage, email));
    } finally {
      setIsLoading(false);
    }
  };

  const submitting = mounted && (authLoading || isLoading);

  return (
    <div className="w-full max-w-sm bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Iniciar sesión</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
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
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email || fieldErrors.general) setFieldErrors(p => ({ ...p, email: undefined, general: undefined }));
              }}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 ${fieldErrors.email ? 'border-red-400' : 'border-gray-300'}`}
              placeholder="correo@ejemplo.com"
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password || fieldErrors.general) setFieldErrors(p => ({ ...p, password: undefined, general: undefined }));
                }}
                className={`w-full px-3 py-2 pr-10 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 ${fieldErrors.password ? 'border-red-400' : 'border-gray-300'}`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>}
          </div>

          {/* Remember + forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-gray-700 focus:ring-gray-400"
              />
              <span className="text-sm text-gray-600">Recordarme</span>
            </label>
            <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-gray-900 underline">
              ¿Olvidaste la clave?
            </Link>
          </div>

          {/* Errors */}
          {(fieldErrors.general || fieldErrors.verification) && (
            <div className={`rounded-md p-3 text-sm border ${fieldErrors.verification ? 'bg-gray-50 border-gray-200 text-gray-700' : 'bg-red-50 border-red-200 text-red-600'}`}>
              {fieldErrors.verification || fieldErrors.general}
              {fieldErrors.verification && (
                <button type="button" onClick={onResend} disabled={resending}
                  className="block mt-1 font-medium underline disabled:opacity-50">
                  {resending ? 'Reenviando…' : 'Reenviar verificación'}
                </button>
              )}
            </div>
          )}

          {checkEmail && (
            <div className="rounded-md p-3 bg-gray-50 border border-gray-200 text-sm text-gray-700">
              Revisá tu Spam si no llegó el correo.{' '}
              <button onClick={onResend} disabled={resending} className="font-medium underline disabled:opacity-50">
                {resending ? 'Reenviando…' : 'Reenviar'}
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-gray-900 text-white text-sm font-medium rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Entrando...' : 'Ingresar'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          ¿No tenés cuenta?{' '}
          <Link href="/register" className="text-gray-900 font-medium hover:underline">
            Registrarse
          </Link>
        </p>
    </div>
  );
}

function normalizeLoginError(message: string, email: string): FieldErrors {
  const normalized = message.toLowerCase();
  if (normalized.includes('credenciales') || normalized.includes('incorrecta') || normalized.includes('inválida') || normalized.includes('no coincide') || normalized.includes('unauthorized') || normalized.includes('401')) {
    return { general: 'Email o contraseña incorrectos.', email: 'Verificá el email', password: 'Verificá la contraseña' };
  }
  if (normalized.includes('no encontrado') || normalized.includes('not found') || normalized.includes('404')) {
    return { general: 'No existe una cuenta con este email.', email: 'Email no registrado' };
  }
  if (normalized.includes('no verificada') || normalized.includes('not verified') || normalized.includes('verificación')) {
    return { verification: `Tu cuenta no está verificada. Revisá tu correo (${email || 'ingresado'}) o reenviá el enlace.` };
  }
  if (normalized.includes('inactivo') || normalized.includes('deshabilitado') || normalized.includes('disabled') || normalized.includes('403')) {
    return { general: 'Tu cuenta está inactiva. Contactá al administrador.' };
  }
  if (normalized.includes('timeout') || normalized.includes('network') || normalized.includes('conexión') || normalized.includes('fetch')) {
    return { general: 'No se pudo conectar al servidor. Verificá tu conexión.' };
  }
  if (normalized.includes('too many') || normalized.includes('demasiados intentos') || normalized.includes('429')) {
    return { general: 'Demasiados intentos. Esperá unos minutos.' };
  }
  return { general: message || 'Error al iniciar sesión. Verificá tus credenciales.' };
}
