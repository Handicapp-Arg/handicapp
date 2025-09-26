"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginAction } from "@/app/(auth)/actions";
import type { ActionResult } from "@/lib/types/api";
import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useToaster } from "@/components/ui/Toaster";
import { getDashboardRoute } from "@/lib/utils/roleUtils";

export default function LoginPage() {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(loginAction, null);
  const params = useSearchParams();
  const { show } = useToaster();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isValid = email.trim().length > 0 && password.trim().length > 0;

  useEffect(() => {
    const success = params.get("success");
    if (success === "registered") show("Registro exitoso, ahora inicia sesión", "success", "¡Listo!");
  }, [params, show]);

  useEffect(() => {
    if (state && !state.ok && state.message) {
      show(state.message, "error", "Error");
      setFieldErrors(state.fieldErrors || {});
    }
    if (state && state.ok) {
      show("Bienvenido", "success", "Login exitoso");
      setTimeout(() => {
        // Redirección basada en rol
        if (state.data?.user?.rol_id) {
          const dashboardRoute = getDashboardRoute(state.data.user.rol_id);
          window.location.href = dashboardRoute;
        } else {
          // Fallback a página principal si no hay rol
          window.location.href = "/";
        }
      }, 600);
    }
  }, [state, show]);


  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl space-y-8 transition-all duration-300 hover:shadow-2xl">
        <div className="space-y-2 text-center">
          <img src="/logos/logo-full-brown.png" alt="HandicApp Logo" className="h-12 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900">Bienvenido</h1>
          <p className="text-gray-600">Accede a tu cuenta para continuar</p>
        </div>
        
        <form 
          action={formAction} 
          onSubmit={(e) => { if (!isValid) { e.preventDefault(); setError("Completa correo y contraseña"); } }} 
          className="space-y-6 w-full"
        >
          <div className="space-y-4">
            <Input
              type="email"
              name="email"
              label="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              error={fieldErrors.email}
              className="transition-all duration-200 focus:ring-2 focus:ring-brown-500"
            />
            <Input
              type="password"
              name="password"
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              error={fieldErrors.password}
              className="transition-all duration-200 focus:ring-2 focus:ring-brown-500"
            />
          </div>

          {error ? (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm" role="alert">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          ) : null}

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-brown-600 to-brown-700 hover:from-brown-700 hover:to-brown-800 text-white py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-[1.02]" 
            disabled={!isValid}
          >
            Iniciar sesión
          </Button>
        </form>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <Link 
              className="flex items-center gap-2 hover:text-brown-700 transition-colors duration-200" 
              href="/"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Volver al inicio
            </Link>
            <span className="flex items-center gap-2">
              ¿No tienes cuenta?{" "}
              <Link 
                className="text-brown-600 hover:text-brown-800 font-medium transition-colors duration-200" 
                href="/register"
              >
                Regístrate aquí
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


