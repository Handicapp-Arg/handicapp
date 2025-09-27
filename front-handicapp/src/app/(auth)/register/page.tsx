"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { registerAction } from "@/app/(auth)/actions";
import type { ActionResult } from "@/lib/types/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useActionState } from "react";
import { useToaster } from "@/components/ui/Toaster";

export default function RegisterPage() {
  const params = useSearchParams();
  const { show } = useToaster();
  const [state, formAction] = useActionState<ActionResult | null, FormData>(registerAction, null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid =
    firstName.trim().length >= 2 && 
    lastName.trim().length >= 2 && 
    email.trim().length > 0 && 
    password.trim().length >= 8 && 
    confirmPassword.trim().length >= 8 &&
    password === confirmPassword;

  useEffect(() => {
    const error = params.get("error");
    if (error) show(error, "error", "Error");
  }, [params, show]);

  function handleInvalidSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (!isValid) {
      e.preventDefault();
      const fe: Record<string, string> = {};
      if (!firstName.trim()) fe.firstName = "Ingresa tu nombre";
      if (!lastName.trim()) fe.lastName = "Ingresa tu apellido";
      if (!email.trim()) fe.email = "Ingresa tu correo";
      if (!password.trim()) fe.password = "Ingresa tu contraseña";
      if (!confirmPassword.trim()) fe.confirmPassword = "Confirma tu contraseña";
      if (password !== confirmPassword) fe.confirmPassword = "Las contraseñas no coinciden";
      setFieldErrors(fe);
      setError("Completa todos los campos correctamente");
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});
  }

  useEffect(() => {
    if (state) {
      setIsSubmitting(false);
      
      if (!state.ok && state.message) {
        show(state.message, "error", "Error de registro");
        setFieldErrors(state.fieldErrors || {});
        setError(state.message);
      }
      
      if (state.ok) {
        show(state.message || "¡Registro exitoso! Ya puedes iniciar sesión.", "success", "¡Listo!");
        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      }
    }
  }, [state, show]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl space-y-8 transition-all duration-300 hover:shadow-2xl">
        <div className="space-y-2 text-center">
          <img src="/logos/logo-full-brown.png" alt="HandicApp Logo" className="h-12 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="text-gray-600">Únete a HandicApp</p>
        </div>
        
        <form action={formAction} onSubmit={handleSubmit} className="space-y-6 w-full">
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              name="firstName"
              label="Nombre"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
              required
              error={fieldErrors.firstName}
              disabled={isSubmitting}
              className="transition-all duration-200 focus:ring-2 focus:ring-amber-500"
            />
            <Input
              type="text"
              name="lastName"
              label="Apellido"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
              required
              error={fieldErrors.lastName}
              disabled={isSubmitting}
              className="transition-all duration-200 focus:ring-2 focus:ring-amber-500"
            />
          </div>
          
          <Input
            type="email"
            name="email"
            label="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            error={fieldErrors.email}
            disabled={isSubmitting}
            className="transition-all duration-200 focus:ring-2 focus:ring-amber-500"
          />
          
          <div className="space-y-4">
            <Input
              type="password"
              name="password"
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              error={fieldErrors.password}
              disabled={isSubmitting}
              className="transition-all duration-200 focus:ring-2 focus:ring-amber-500"
            />
            <div className="text-xs text-gray-500">
              La contraseña debe tener al menos 8 caracteres e incluir mayúsculas, minúsculas, números y símbolos
            </div>
          </div>
          
          <Input
            type="password"
            name="confirmPassword"
            label="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
            error={fieldErrors.confirmPassword}
            disabled={isSubmitting}
            className="transition-all duration-200 focus:ring-2 focus:ring-amber-500"
          />
          
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
            variant="brand"
            className="w-full" 
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registrando...
              </div>
            ) : "Crear cuenta"}
          </Button>
        </form>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
            <Link 
              className="flex items-center gap-2 hover:text-amber-700 transition-colors duration-200" 
              href="/"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Volver al inicio
            </Link>
            <span className="flex items-center gap-2">
              ¿Ya tienes cuenta?{" "}
              <Link 
                className="text-amber-600 hover:text-amber-800 font-medium transition-colors duration-200" 
                href="/login"
              >
                Inicia sesión
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}



