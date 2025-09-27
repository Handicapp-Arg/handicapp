"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "brand";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", isLoading = false, disabled, children, ...rest }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-md px-4 py-3 sm:py-2 text-base sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed touch-manipulation min-h-[44px] sm:min-h-[36px]";
    const byVariant: Record<ButtonVariant, string> = {
      primary: "bg-foreground text-background hover:opacity-90 focus-visible:ring-foreground disabled:opacity-60",
      secondary:
        "bg-transparent border border-foreground text-foreground hover:bg-foreground/10 focus-visible:ring-foreground disabled:opacity-60",
      ghost: "bg-transparent text-foreground hover:bg-foreground/10 focus-visible:ring-foreground disabled:opacity-60",
      brand:
        "bg-[#3C2013] text-white hover:bg-[#5A3420] focus-visible:ring-[#3C2013]/80 disabled:bg-[#3C2013]/50 disabled:text-white",
    };

    return (
      <button
        ref={ref}
        className={`${base} ${byVariant[variant]} ${className}`}
        disabled={disabled || isLoading}
        {...rest}
      >
        {isLoading ? "Cargando" : children}
      </button>
    );
  }
);

Button.displayName = "Button";
