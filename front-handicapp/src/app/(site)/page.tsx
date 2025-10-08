"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToaster } from '@/components/ui/toaster';
import ApiClient from '@/lib/services/apiClient';

export default function HomePage() {
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
      
      console.log('Login response:', response);
      
      // Verificar si la respuesta tiene éxito
      const responseData = (response as any);
      if (responseData && responseData.success && responseData.data) {
        const data = responseData.data;
        
        console.log('User data:', data.user);
        
        // El backend ya setea las cookies httpOnly automáticamente
        const rolId = data.user.rol?.id || data.user.rol_id || 1;
        
        console.log('Rol ID detectado:', rolId);
        
        // Guardar rol para acceso rápido (opcional)
        document.cookie = `role=${rolId}; path=/; max-age=7200; SameSite=Lax`;
        
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
        
        const dashboardRoute = roleRoutes[rolId] || '/admin';
        
        console.log('Redirigiendo a:', dashboardRoute);
        
        // Redirigir inmediatamente
        router.push(dashboardRoute);
        
      } else {
        console.error('Respuesta no válida:', response);
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
    <div className="h-full w-full relative overflow-hidden">
      {/* Fondo limpio sin efectos */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#3C2013] via-[#2A1709] to-[#1A0F06]" />
      
      {/* Hero Section Principal */}
      <div className="relative w-full min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-12 py-8 lg:py-0 z-10">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            
            {/* Contenido Principal */}
            <div className="flex-1 text-center lg:text-left space-y-8">
              

              
              {/* Título Principal Ultra Moderno */}
              <div className="space-y-4 lg:space-y-6">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-tight">
                  <span className="block text-white font-light tracking-tight">
                    HANDICAPP
                  </span>
                  <span className="block bg-gradient-to-r from-[#D2B48C] via-[#F5DEB3] to-[#D2B48C] bg-clip-text text-transparent font-black tracking-tighter">
                    Professional
                  </span>
                </h1>
                
                <div className="relative">
                  <p className="text-lg sm:text-xl lg:text-2xl text-white/80 leading-relaxed max-w-2xl font-light">
                    Sistema integral para establecimientos ecuestres, handicaps y competencias con
                    <span className="text-transparent bg-gradient-to-r from-[#D2B48C] to-[#F5DEB3] bg-clip-text font-semibold"> tecnología avanzada</span>
                  </p>
                </div>
              </div>
              
              {/* Botón CTA Minimalista */}
              <div className="flex justify-center lg:justify-start pt-8">
                <button 
                  onClick={() => router.push('/register')}
                  className="group relative px-8 py-4 bg-[#D2B48C]/10 backdrop-blur-xl border border-[#D2B48C]/30 rounded-2xl text-[#D2B48C] font-semibold text-lg hover:bg-[#D2B48C]/20 transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <div className="flex items-center justify-center gap-3">
                    <span>Regístrate</span>
                  </div>
                </button>
              </div>
              
              {/* Stats Futuristas */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pt-8 lg:pt-12 max-w-lg mx-auto lg:mx-0">
                <div className="text-center lg:text-left group">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-br from-[#D2B48C] to-[#F5DEB3] bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                    2.5K+
                  </div>
                  <div className="text-white/60 text-xs sm:text-sm font-medium mt-1">Caballos Registrados</div>
                </div>
                <div className="text-center lg:text-left group">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-br from-[#D2B48C] to-[#F5DEB3] bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                    150+
                  </div>
                  <div className="text-white/60 text-xs sm:text-sm font-medium mt-1">Establecimientos</div>
                </div>
                <div className="text-center lg:text-left group">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-br from-[#D2B48C] to-[#F5DEB3] bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                    15K+
                  </div>
                  <div className="text-white/60 text-xs sm:text-sm font-medium mt-1">Competencias</div>
                </div>
              </div>
            </div>
            
            {/* Formulario de Login Integrado */}
            <div className="flex-shrink-0 w-full lg:w-auto">
              <div className="w-full max-w-sm sm:max-w-md lg:w-[450px] xl:w-[500px] mx-auto">
                
                {/* Container del formulario con glassmorphism */}
                <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl lg:rounded-3xl shadow-2xl p-6 sm:p-8 xl:p-10 space-y-6 lg:space-y-8">
                  
                  {/* Header del formulario */}
                  <div className="text-center space-y-4 lg:space-y-6">
                    <div className="w-48 sm:w-56 lg:w-64 mx-auto">
                      <Image
                        src="/logos/logo-full-white.png"
                        alt="HandicApp Logo"
                        width={240}
                        height={120}
                        className="w-full h-auto drop-shadow-2xl filter brightness-110"
                      />
                    </div>
                    
                    {/* Línea elegante */}
                    <div className="w-24 sm:w-32 h-0.5 bg-gradient-to-r from-transparent via-[#D2B48C] to-transparent mx-auto"></div>
                    
                    <div className="space-y-1 lg:space-y-2">
                      <h2 className="text-xl sm:text-2xl xl:text-3xl font-black text-white tracking-tight">
                        Acceder
                      </h2>
                      <p className="text-[#D2B48C]/90 text-xs sm:text-sm font-light">
                        Sistema Ecuestre Profesional
                      </p>
                    </div>
                  </div>
                  
                  {/* Formulario de Login */}
                  <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
                    <div className="space-y-4 lg:space-y-5">
                      <div className="relative">
                        <label className="text-xs sm:text-sm text-white/80 mb-2 block">Correo electrónico</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="w-full bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-white/60 focus:border-[#D2B48C]/50 focus:ring-2 focus:ring-[#D2B48C]/30 rounded-xl lg:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base transition-all duration-300 focus:outline-none"
                          placeholder="tu@email.com"
                        />
                      </div>
                      
                      <div className="relative">
                        <label className="text-xs sm:text-sm text-white/80 mb-2 block">Contraseña</label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-white/60 focus:border-[#D2B48C]/50 focus:ring-2 focus:ring-[#D2B48C]/30 rounded-xl lg:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base transition-all duration-300 focus:outline-none"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                    
                    {error && (
                      <div className="relative p-3 sm:p-4 rounded-xl lg:rounded-2xl bg-red-500/10 backdrop-blur-xl border border-red-400/30 text-red-300 text-xs sm:text-sm animate-pulse" role="alert">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 rounded-xl lg:rounded-2xl"></div>
                        <div className="relative flex items-start gap-2 sm:gap-3">
                          <div className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5">
                            <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <span className="font-medium">{error}</span>
                        </div>
                      </div>
                    )}
                    
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#3C2013] to-[#2A1709] rounded-xl lg:rounded-2xl text-white font-semibold text-base sm:text-lg shadow-2xl hover:shadow-[#3C2013]/25 transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 touch-manipulation"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#4A2A1A] to-[#3C2013] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                        <span>{loading ? "Accediendo..." : "Acceder Ahora"}</span>
                        {!loading && (
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        )}
                        {loading && (
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        )}
                      </div>
                    </button>
                  </form>
                  
                  {/* Enlaces adicionales */}
                  <div className="pt-3 lg:pt-4 border-t border-white/10 text-center">
                    <p className="text-white/60 text-xs sm:text-sm">
                      ¿No tienes cuenta?{" "}
                      <button 
                        onClick={() => router.push('/register')}
                        className="text-transparent bg-gradient-to-r from-[#D2B48C] to-[#F5DEB3] bg-clip-text font-semibold hover:from-[#F5DEB3] hover:to-[#D2B48C] transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 touch-manipulation"
                      >
                        Regístrate aquí
                      </button>
                    </p>
                  </div>
                  
                  {/* Esquinas decorativas */}
                  <div className="absolute top-6 left-6 w-6 h-6 border-l-2 border-t-2 border-[#D2B48C]/30 rounded-tl-lg"></div>
                  <div className="absolute top-6 right-6 w-6 h-6 border-r-2 border-t-2 border-[#D2B48C]/30 rounded-tr-lg"></div>
                  <div className="absolute bottom-6 left-6 w-6 h-6 border-l-2 border-b-2 border-[#D2B48C]/30 rounded-bl-lg"></div>
                  <div className="absolute bottom-6 right-6 w-6 h-6 border-r-2 border-b-2 border-[#D2B48C]/30 rounded-br-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

