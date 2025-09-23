"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginAction } from "@/app/(auth)/actions";
import type { ActionResult } from "@/types/auth";
import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useToaster } from "@/components/ui/Toaster";

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
        window.location.href = "/";
      }, 600);
    }
  }, [state, show]);


  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
          <p className="text-sm text-foreground/70">Accede a tu cuenta</p>
        </div>
        <form action={formAction} onSubmit={(e) => { if (!isValid) { e.preventDefault(); setError("Completa correo y contraseña"); } }} className="space-y-4 w-full">
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
          {error ? (
            <div className="text-sm text-red-600" role="alert">
              {error}
            </div>
          ) : null}
          <Button type="submit" className="w-full" disabled={!isValid}>
            Entrar
          </Button>
        </form>
        <div className="flex items-center justify-between text-xs text-foreground/70">
          <Link className="underline underline-offset-2 hover:opacity-80" href="/">
            ← Volver al inicio
          </Link>
          <span>
            ¿No tienes cuenta?{" "}
            <Link className="underline underline-offset-2 hover:opacity-80" href="/register">
              Regístrate
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}


