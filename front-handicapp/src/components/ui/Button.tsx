import { forwardRef, ButtonHTMLAttributes } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'brand';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = '', variant = 'primary', size = 'md', disabled, isLoading, ...rest }, ref) => {
    const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed touch-manipulation";

    const byVariant: Record<ButtonVariant, string> = {
      primary: "bg-foreground text-background hover:opacity-90 focus-visible:ring-foreground disabled:opacity-60",
      secondary: "bg-transparent border border-foreground text-foreground hover:bg-foreground/10 focus-visible:ring-foreground disabled:opacity-60",
      ghost: "bg-transparent text-foreground hover:bg-foreground/10 focus-visible:ring-foreground disabled:opacity-60",
      brand: "bg-[#3C2013] text-white hover:bg-[#5A3420] focus-visible:ring-[#3C2013]/80 disabled:bg-[#3C2013]/50 disabled:text-white",
    };

    const sizeClasses: Record<ButtonSize, string> = {
      sm: "px-3 py-1.5 text-sm min-h-[32px]",
      md: "px-4 py-3 sm:py-2 text-base sm:text-sm min-h-[44px] sm:min-h-[36px]",
      lg: "px-6 py-4 text-lg min-h-[52px]"
    };

    return (
      <button
        ref={ref}
        className={`${base} ${byVariant[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled || isLoading}
        {...rest}
      >
        {isLoading ? "Cargando..." : children}
      </button>
    );
  }
);

Button.displayName = "Button";
