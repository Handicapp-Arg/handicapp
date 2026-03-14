'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthNew } from '../../../lib/hooks/useAuthNew';
import { useSearchParams } from 'next/navigation';
import { useToaster } from '@/components/ui/toaster';
import { showSuccess } from '@/lib/utils/errorHandler';
import ApiClient from '@/lib/services/apiClient';
import AuthManager from '@/lib/auth/AuthManager';
import { LOGOS } from '@/lib/constants/logos';
import { Eye, EyeOff } from 'lucide-react';
import { AuthBrandingPanel } from '../_components/AuthBrandingPanel';
import { FloatingInput } from '../_components/FloatingInput';
import { loginSchema } from '@/lib/schemas/auth';

type FieldErrors = {
  email?: string;
  password?: string;
  general?: string;
  verification?: string;
};

const FORM_BG = {
  backgroundColor: '#ffffff',
  backgroundImage:
    'radial-gradient(ellipse at 0% 60%, rgba(175,147,111,0.05) 0%, transparent 55%), radial-gradient(circle, rgba(30,41,59,0.045) 1px, transparent 1px)',
  backgroundSize: 'auto, 22px 22px',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [shaking, setShaking] = useState(false);

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
      setShaking(true);
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
      setShaking(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex">
      {/* Left — Form */}
      <div className="flex-1 flex flex-col min-h-screen relative" style={FORM_BG}>

        {/* Top bar */}
        <div className="flex items-center justify-between px-7 pt-7">
          <div className="flex items-center gap-2.5">
            <img src={LOGOS.ICON_BROWN} alt="HandicApp" className="h-8 w-8 object-contain"
              style={{ filter: 'brightness(0)' }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = LOGOS.FULL_BROWN; }} />
            <span className="text-[12px] font-bold tracking-[0.3em] uppercase text-[#1e293b]/70 hidden sm:block">HandicApp</span>
          </div>
          <button onClick={() => router.push('/register')} className="text-[13px] text-slate-500 hover:text-[#1e293b] transition-colors">
            Crear cuenta →
          </button>
        </div>

        {/* Mobile tagline */}
        <div className="lg:hidden px-7 pt-3">
          <p className="text-[10px] tracking-[0.35em] uppercase text-[#af936f]/70 font-semibold">Gestión Ecuestre</p>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8 lg:px-14">
          <div className="w-full max-w-[380px]">

            <div className="auth-fade-up auth-fade-up-1 w-7 h-[3px] rounded-full bg-[#af936f] mb-5" />
            <h1
              className="auth-fade-up auth-fade-up-1 font-bold text-[#1e293b] leading-[1.1] mb-8"
              style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(1.9rem, 4vw, 2.4rem)' }}
            >
              Hola de nuevo.
            </h1>

            <form onSubmit={handleSubmit} className={`space-y-3.5 ${shaking ? 'auth-shake' : ''}`} onAnimationEnd={() => setShaking(false)}>
              <div className="auth-fade-up auth-fade-up-2">
                <FloatingInput
                  type="email" name="email" autoComplete="email"
                  label="Correo electrónico"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email || fieldErrors.general) setFieldErrors(p => ({ ...p, email: undefined, general: undefined })); }}
                  error={!!fieldErrors.email}
                  required
                />
                {fieldErrors.email && <p className="mt-1.5 text-xs text-red-500 pl-1">{fieldErrors.email}</p>}
              </div>

              <div className="auth-fade-up auth-fade-up-3">
                <FloatingInput
                  type={showPassword ? 'text' : 'password'} name="password" autoComplete="current-password"
                  label="Contraseña"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password || fieldErrors.general) setFieldErrors(p => ({ ...p, password: undefined, general: undefined })); }}
                  error={!!fieldErrors.password}
                  required
                  rightSlot={
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
                {fieldErrors.password && <p className="mt-1.5 text-xs text-red-500 pl-1">{fieldErrors.password}</p>}
              </div>

              {/* Remember + forgot */}
              <div className="auth-fade-up auth-fade-up-4 flex items-center justify-between pt-0.5">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setRememberMe(!rememberMe)}
                    className="w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all duration-150 focus:outline-none"
                    style={{ borderColor: rememberMe ? '#af936f' : '#cbd5e1', backgroundColor: rememberMe ? '#af936f' : 'transparent' }}
                  >
                    {rememberMe && (
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span className="text-[13px] text-slate-500 select-none">Recordarme</span>
                </label>
                <button type="button" onClick={() => router.push('/forgot-password')}
                  className="text-[13px] text-[#af936f] hover:text-[#8f7657] font-medium transition-colors">
                  ¿Olvidaste la clave?
                </button>
              </div>

              {(fieldErrors.general || fieldErrors.verification) && (
                <div className={`rounded-xl p-3.5 text-xs leading-relaxed border ${fieldErrors.verification ? 'bg-blue-50/70 border-blue-200 text-blue-700' : 'bg-red-50/70 border-red-200 text-red-600'}`}>
                  {fieldErrors.verification || fieldErrors.general}
                  {fieldErrors.verification && (
                    <button type="button" onClick={onResend} disabled={resending}
                      className="block mt-1.5 font-semibold underline underline-offset-2 disabled:opacity-50">
                      {resending ? 'Reenviando…' : 'Reenviar verificación'}
                    </button>
                  )}
                </div>
              )}

              <div className="auth-fade-up auth-fade-up-5 pt-1">
                {(() => {
                  const submitting = mounted && (authLoading || isLoading);
                  return (
                    <button type="submit" disabled={submitting}
                      className="relative w-full overflow-hidden text-white font-semibold py-3.5 rounded-xl text-sm tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                      style={{ background: 'linear-gradient(135deg, #1e293b 0%, #1a2535 100%)' }}
                    >
                      <span className="relative z-10">{submitting ? 'Entrando...' : 'Ingresar'}</span>
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-[#af936f]/12 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    </button>
                  );
                })()}
              </div>
            </form>

            {checkEmail && (
              <div className="mt-4 p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl text-xs text-sky-700">
                Revisá tu Spam si no llegó el correo.{' '}
                <button onClick={onResend} disabled={resending} className="font-semibold underline underline-offset-2 disabled:opacity-50">
                  {resending ? 'Reenviando…' : 'Reenviar'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right — Branding */}
      <AuthBrandingPanel />
    </div>
  );
}

function normalizeLoginError(message: string, email: string): FieldErrors {
  const normalized = message.toLowerCase();

  if (normalized.includes('credenciales') || normalized.includes('incorrecta') || normalized.includes('inválida') || normalized.includes('no coincide') || normalized.includes('unauthorized') || normalized.includes('401')) {
    return { general: 'Email o contraseña incorrectos. Verificá los datos e intentá nuevamente.', email: 'Verificá que el email sea correcto', password: 'Verificá que la contraseña sea correcta' };
  }
  if (normalized.includes('no encontrado') || normalized.includes('not found') || normalized.includes('404')) {
    return { general: 'No existe una cuenta con este email. ¿Querés crear una cuenta nueva?', email: 'Este email no está registrado en el sistema' };
  }
  if (normalized.includes('no verificada') || normalized.includes('not verified') || normalized.includes('verificación')) {
    return { verification: `Tu cuenta todavía no está verificada. Revisá tu correo (${email || 'ingresado'}) o reenviá el enlace de verificación.` };
  }
  if (normalized.includes('inactivo') || normalized.includes('deshabilitado') || normalized.includes('disabled') || normalized.includes('403')) {
    return { general: 'Tu cuenta está inactiva. Contactá al administrador para reactivarla.' };
  }
  if (normalized.includes('timeout') || normalized.includes('network') || normalized.includes('conexión') || normalized.includes('fetch')) {
    return { general: 'No pudimos conectarnos con el servidor. Verificá tu conexión a internet e intentá nuevamente.' };
  }
  if (normalized.includes('requeridos') || normalized.includes('required') || normalized.includes('vacío')) {
    return { general: 'Por favor, ingresá tu correo electrónico y contraseña.' };
  }
  if (normalized.includes('500') || normalized.includes('server error') || normalized.includes('error del servidor')) {
    return { general: 'Ocurrió un error en el servidor. Por favor, intentá nuevamente en unos momentos.' };
  }
  if (normalized.includes('too many') || normalized.includes('demasiados intentos') || normalized.includes('429')) {
    return { general: 'Demasiados intentos de inicio de sesión. Por favor, esperá unos minutos e intentá nuevamente.' };
  }
  return { general: message || 'Ocurrió un error al iniciar sesión. Por favor, verificá tus credenciales e intentá nuevamente.' };
}
