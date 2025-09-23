"use client";

import { forwardRef, InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...rest }, ref) => {
    const inputId = id || rest.name || undefined;
    return (
      <div className="flex flex-col gap-1">
        {label ? (
          <label htmlFor={inputId} className="text-sm text-foreground/80">
            {label}
          </label>
        ) : null}
        <input
          id={inputId}
          ref={ref}
          className={`rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground ${className}`}
          {...rest}
        />
        {error ? <span className="text-xs text-red-600">{error}</span> : null}
      </div>
    );
  }
);

Input.displayName = "Input";


