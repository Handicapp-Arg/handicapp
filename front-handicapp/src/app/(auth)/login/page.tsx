"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToaster } from '@/components/ui/toaster';
import ApiClient from '@/lib/services/apiClient';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
    const { toast } = useToaster();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    if (!emailRegex.test(email.trim())) {
      setError('Por favor ingresa un email válido');
      return;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      
      // Usar ApiClient directamente para login
      const response = await ApiClient.login(email.trim(), password.trim());
      
      if (response) {
        const data = (response as any).data; // Acceder al data dentro de la respuesta
        
        // Validar que la respuesta tenga la estructura esperada
        if (!data || !data.user || !data.token) {
          setError('Respuesta del servidor inválida');
          return;
        }
        
        // Validar que el usuario tenga rol_id
        if (!data.user.rol_id) {
          setError('Usuario sin rol asignado. Contacta al administrador.');
          return;
        }
        
        // Guardar token en cookies seguras
        document.cookie = `auth-token=${data.token}; path=/; max-age=7200; SameSite=Strict; Secure=${window.location.protocol === 'https:' ? 'true' : 'false'}`;
        document.cookie = `role=${data.user.rol_id}; path=/; max-age=7200; SameSite=Strict; Secure=${window.location.protocol === 'https:' ? 'true' : 'false'}`;
        document.cookie = `nombre=${encodeURIComponent(data.user.nombre)}; path=/; max-age=7200; SameSite=Strict; Secure=${window.location.protocol === 'https:' ? 'true' : 'false'}`;
        document.cookie = `apellido=${encodeURIComponent(data.user.apellido)}; path=/; max-age=7200; SameSite=Strict; Secure=${window.location.protocol === 'https:' ? 'true' : 'false'}`;
        
        toast('¡Login exitoso!', 'success');
        
        // Redirección basada en rol
        const roleRoutes: Record<number, string> = {
          1: '/admin',
          2: '/establecimiento', 
          3: '/capataz',
          4: '/veterinario',
          5: '/empleado',
          6: '/propietario'
        };
        
        const dashboardRoute = roleRoutes[data.user.rol_id] || '/admin';
        
        setTimeout(() => {
          router.push(dashboardRoute);
        }, 500);
        
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#3C2013] via-[#2A1609] to-[#1A0E06] flex items-center justify-center px-4 py-8">
      {/* Contenedor Principal */}
      <div className="w-full max-w-md mx-auto">
        {/* Logo y Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-xl rounded-2xl mb-6">
            <img 
              src="/logos/logo-icon-white.png" 
              alt="HandicApp" 
              className="w-20 h-20"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Bienvenido</h1>
          <p className="text-[#D2B48C]/80 text-sm">Accede a tu cuenta HandicApp</p>
        </div>

        {/* Formulario */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent transition-all"
                placeholder="tu@email.com"
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#D2B48C] focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#D2B48C] to-[#F5DEB3] text-[#3C2013] font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-[#D2B48C]/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => router.push('/register')}
                className="text-[#D2B48C] hover:text-[#F5DEB3] font-medium transition-colors"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/40 text-xs">
            © 2025 HandicApp. Sistema de Gestión Equina.
          </p>
        </div>
      </div>
    </div>
  );
}