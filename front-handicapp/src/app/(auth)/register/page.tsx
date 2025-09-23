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
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Crear cuenta</h1>
          <p className="text-sm text-foreground/70">Regístrate para continuar</p>
        </div>
        <form action={formAction} onSubmit={handleSubmit} className="space-y-4 w-full">
          <div className="grid grid-cols-2 gap-3">
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
          />
          
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
            placeholder="Mínimo 8 caracteres con mayúscula, minúscula, número y símbolo"
          />
          
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
          />
          
          {error ? (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200" role="alert">
              {error}
            </div>
          ) : null}
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? "Registrando..." : "Crear cuenta"}
          </Button>
        </form>
        <div className="flex items-center justify-between text-xs text-foreground/70">
          <Link className="underline underline-offset-2 hover:opacity-80" href="/">
            ← Volver al inicio
          </Link>
          <span>
            ¿Ya tienes cuenta?{" "}
            <Link className="underline underline-offset-2 hover:opacity-80" href="/login">
              Inicia sesión
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}



