"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ApiClient from '@/lib/services/apiClient';
import { LOGOS } from '@/lib/constants/logos';

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    
    // Validaciones
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }
    
    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      setError('El nombre y apellido deben tener al menos 2 caracteres');
      return;
    }
    
    if (!nameRegex.test(firstName.trim()) || !nameRegex.test(lastName.trim())) {
      setError('El nombre y apellido solo pueden contener letras y espacios');
      return;
    }
    
    if (!emailRegex.test(email.trim())) {
      setError('Por favor ingresa un email válido');
      return;
    }
    
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/.test(password)) {
      setError('La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 carácter especial');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);
      
      await ApiClient.register({
        nombre: firstName.trim(),
        apellido: lastName.trim(),
        email: email.trim(),
        password: password.trim(),
      });
      
      // Si llegamos aquí sin error, el registro fue exitoso
      // Redirigimos al login con un indicador para mostrar aviso
      setTimeout(() => {
        const emailParam = encodeURIComponent(email.trim());
        router.push(`/login?checkEmail=1&email=${emailParam}`);
      }, 1600);
      
    } catch (error) {
      const err = error as { message?: string; details?: string[] };
      const details = Array.isArray(err?.details) ? err.details : undefined;
      setError(details?.[0] || err.message || 'Error al registrar usuario');
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
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Crear Cuenta</h1>
            <p className="text-slate-600">Únete a HandicApp y gestiona tu establecimiento ecuestre</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  name="firstName"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#af936f] focus:border-transparent transition-all"
                  placeholder="Juan"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  name="lastName"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#af936f] focus:border-transparent transition-all"
                  placeholder="Pérez"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#af936f] focus:border-transparent transition-all"
                placeholder="tu@email.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-slate-700 text-sm font-medium mb-2">
                Contraseña
              </label>
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#af936f] focus:border-transparent transition-all"
                placeholder="Mínimo 8 caracteres"
                required
              />
              <p className="mt-1 text-xs text-slate-500">Debe incluir mayúsculas, minúsculas, números y símbolos</p>
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
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#af936f] focus:border-transparent transition-all"
                placeholder="Repite tu contraseña"
                required
              />
            </div>

            {/* Términos y condiciones */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                className="w-4 h-4 mt-1 rounded border-slate-300 text-[#1e293b] focus:ring-[#af936f] focus:ring-offset-0"
              />
              <label className="text-sm text-slate-600">
                Acepto los{' '}
                <button type="button" className="text-[#af936f] hover:text-[#8f7657] font-medium">
                  términos y condiciones
                </button>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1e293b] text-white font-semibold py-3.5 rounded-xl hover:bg-[#0f172a] hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-600 text-sm">
              ¿Ya tienes cuenta?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-[#af936f] hover:text-[#8f7657] font-semibold transition-colors"
              >
                Iniciar sesión
              </button>
            </p>
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
                src={LOGOS.ICON_WHITE}
                alt="HandicApp"
                className="h-32 w-32 object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = LOGOS.FULL_WHITE; }}
              />
            </div>
            
            {/* Main Message */}
            <h2 className="text-4xl font-bold text-white mb-4">
              Bienvenido a HandicApp
            </h2>
            <p className="text-white/70 text-lg max-w-md mb-12">
              Únete a cientos de profesionales que ya confían en nuestra plataforma para gestionar sus establecimientos ecuestres.
            </p>
            
            {/* Features */}
            <div className="space-y-4 max-w-md">
              <div className="flex items-start gap-3 text-white/90">
                <div className="w-6 h-6 rounded-lg bg-[#af936f]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[#af936f] text-sm font-bold">✓</span>
                </div>
                <span className="text-sm text-left">Gestión completa de caballos y establecimientos</span>
              </div>
              <div className="flex items-start gap-3 text-white/90">
                <div className="w-6 h-6 rounded-lg bg-[#af936f]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[#af936f] text-sm font-bold">✓</span>
                </div>
                <span className="text-sm text-left">Control de salud y eventos veterinarios</span>
              </div>
              <div className="flex items-start gap-3 text-white/90">
                <div className="w-6 h-6 rounded-lg bg-[#af936f]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[#af936f] text-sm font-bold">✓</span>
                </div>
                <span className="text-sm text-left">Reportes y estadísticas en tiempo real</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}