"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", isLoading = false, disabled, children, ...rest }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
    const byVariant: Record<ButtonVariant, string> = {
      primary: "bg-foreground text-background hover:opacity-90 focus-visible:ring-foreground",
      secondary:
        "bg-transparent border border-foreground text-foreground hover:bg-foreground/10 focus-visible:ring-foreground",
      ghost: "bg-transparent text-foreground hover:bg-foreground/10 focus-visible:ring-foreground",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${byVariant[variant]} ${className}`}
        disabled={disabled || isLoading}
        {...rest}
      >
        {isLoading ? "Cargando…" : children}
      </button>
    );
  }
);

Button.displayName = "Button";


