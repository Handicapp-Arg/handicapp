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
    if (!state) return;

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
    if (error) setError(null);
    if (Object.keys(fieldErrors).length) setFieldErrors({});
  }, [email, password]);

  return (
    <div className="flex flex-1 w-full flex-col md:grid md:grid-cols-[0.4fr_0.6fr] md:gap-8">
      {/* Columna izquierda: Panel de marca */}
      <div className="relative hidden md:flex items-center justify-center bg-background overflow-hidden rounded-4xl md:pl-6 my-6">
        <div className="relative flex h-[98%] w-full my-auto items-center justify-center overflow-hidden rounded-4xl">
          <div className="absolute inset-0 bg-gradient-to-b from-[#3C2013] via-[#3C2013] to-[#3C2013] opacity-100 rounded-4xl" />
          <div className="relative z-10 p-6">
            <Image
              src="/logos/logo-full-white.png"
              alt="Logo HandicApp"
              width={250}
              height={100}
              priority
              className="object-contain drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)]"
            />
          </div>
          <div className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        </div>
      </div>

      {/* Columna derecha: Formulario */}
      <div className="flex flex-1 items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-3xl font-semibold tracking-tight text-[#3C2013]">
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
              label="Contraseña"
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

            <Button type="submit" variant="brand" className="w-full" disabled={!isValid}>
              Entrar
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-between text-xs text-foreground/70">
            <Link
              className="border-b-2 border-[#A67C52] text-[#A67C52] font-bold pb-0.5 transition-colors hover:text-[#3C2013] hover:border-[#3C2013]"
              href="/"
            >
              Volver al inicio
            </Link>
            <span className="text-[#3C2013]">
              No tienes cuenta?{" "}
              <Link
                className="border-b-2 border-[#A67C52] text-[#A67C52] font-bold pb-0.5 transition-colors hover:text-[#3C2013] hover:border-[#3C2013]"
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
