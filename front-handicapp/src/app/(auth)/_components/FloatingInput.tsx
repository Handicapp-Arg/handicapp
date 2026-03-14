"use client";

import { forwardRef, InputHTMLAttributes } from 'react';

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: boolean;
  success?: boolean;
  rightSlot?: React.ReactNode;
}

export const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ label, error, success, rightSlot, className, ...props }, ref) => {
    const stateClass = error ? 'input-error' : success ? 'input-success' : '';

    return (
      <div className="float-wrap">
        <input
          ref={ref}
          placeholder=" "
          className={`float-input ${stateClass} ${rightSlot ? 'has-right' : ''} ${className || ''}`}
          {...props}
        />
        <label className="float-label">{label}</label>
        {rightSlot && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10">
            {rightSlot}
          </div>
        )}
      </div>
    );
  }
);

FloatingInput.displayName = 'FloatingInput';
