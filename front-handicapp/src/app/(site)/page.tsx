"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToaster } from "@/components/ui/Toaster";

// Mantengo tu action y tipos
import { loginAction } from "@/app/(auth)/actions";
import type { ActionResult } from "@/lib/types/api";

export default function LoginPage() {
  const [state, formAction] = useActionState<ActionResult | null, FormData>(
    loginAction,
    null
  );

  const params = useSearchParams();
  const { show } = useToaster();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isValid = email.trim().length > 0 && password.trim().length > 0;

  useEffect(() => {
    const success = params.get("success");
    if (success === "registered") {
      show("Registro exitoso, ahora inicia sesion", "success", "Listo");
    }
  }, [params, show]);

  useEffect(() => {
    if (!state) {
      return;
    }

    if (!state.ok && state.message) {
      show(state.message, "error", "Error");
      setFieldErrors(state.fieldErrors || {});
    }

    if (state.ok) {
      show("Bienvenido", "success", "Login exitoso");
      setTimeout(() => {
        window.location.href = "/";
      }, 600);
    }
  }, [state, show]);

  useEffect(() => {
    if (error) {
      setError(null);
    }
    if (Object.keys(fieldErrors).length) {
      setFieldErrors({});
    }
  }, [email, password]);

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-2">
      {/* Columna izquierda: Imagen + capa estatica */}
      <div className="relative hidden md:block">
        {/* Imagen de fondo */}
        <Image
          src="/login-side.jpg"
          alt="Gestion ecuestre"
          fill
          priority
          className="object-cover"
        />
        {/* Degradado superpuesto */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/30 via-black/10 to-transparent" />
        {/* Branding overlay */}
        <div className="absolute inset-x-0 bottom-0 p-10">
          <div className="max-w-md rounded-2xl backdrop-blur-md bg-white/20 dark:bg-black/20 border border-white/30 shadow-lg p-6">
            <div className="flex items-center gap-3">
              {/* Logo opcional */}
              <Image
                src="/logo.svg"
                alt="HandicApp"
                width={36}
                height={36}
                className="opacity-90"
              />
              <h1 className="text-white text-2xl font-semibold drop-shadow">
                HandicApp
              </h1>
            </div>
            <p className="mt-3 text-white/90">
              Potencia tu gestion ecuestre con seguimiento integral,
              comunicacion en equipo y reportes en tiempo real.
            </p>
          </div>
        </div>
        {/* Detalle decorativo */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/20 blur-3xl" />
      </div>

      {/* Columna derecha: Formulario */}
      <div className="flex items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold tracking-tight">
              Iniciar sesion
            </h2>
            <p className="mt-2 text-sm text-foreground/70">
              Accede a tu cuenta para continuar.
            </p>
          </div>

          <form
            action={formAction}
            onSubmit={(e) => {
              if (!isValid) {
                e.preventDefault();
                setError("Completa correo y contrasena");
              }
            }}
            className="space-y-4"
          >
            <Input
              type="email"
              name="email"
              label="Correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              error={fieldErrors.email}
            />

            <Input
              type="password"
              name="password"
              label="Contrasena"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              error={fieldErrors.password}
            />

            {error && (
              <div className="text-sm text-red-600" role="alert">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={!isValid}>
              Entrar
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-between text-xs text-foreground/70">
            <Link
              className="underline underline-offset-2 hover:opacity-80"
              href="/"
            >
              Volver al inicio
            </Link>
            <span>
              No tienes cuenta?{" "}
              <Link
                className="underline underline-offset-2 hover:opacity-80"
                href="/register"
              >
                Registrate
              </Link>
            </span>
          </div>

          {/* Pie sutil */}
          <p className="mt-8 text-[11px] text-foreground/50 text-center">
            {new Date().getFullYear()} HandicApp - Todos los derechos reservados
          </p>
        </div>
      </div>
    </div>
  );
}