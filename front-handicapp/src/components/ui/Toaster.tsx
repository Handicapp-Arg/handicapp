"use client";

import { createContext, useContext, useState, useCallback } from "react";

type ToastType = "success" | "error" | "info";
type Toast = { id: number; title?: string; message: string; type?: ToastType };

const ToasterContext = createContext<{
  toasts: Toast[];
  show: (message: string, type?: ToastType, title?: string) => void;
  remove: (id: number) => void;
} | null>(null);

export function useToaster() {
  const ctx = useContext(ToasterContext);
  if (!ctx) throw new Error("useToaster debe usarse dentro de <ToasterProvider>");
  return ctx;
}

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback((message: string, type: ToastType = "info", title?: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((t) => [...t, { id, message, type, title }]);
    // Autocerrar rápido para no bloquear: 2.5s
    setTimeout(() => remove(id), 2500);
  }, [remove]);

  return (
    <ToasterContext.Provider value={{ toasts, show, remove }}>
      {children}
      {/* Overlay ligero (no bloquea clics) */}
      {toasts.length > 0 ? <div className="toast-overlay" aria-hidden /> : null}
      {/* Solo mostramos el primer toast como modal emergente centrado */}
      <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center p-4 sm:p-6">
        {toasts[0] ? (
          <div
            key={toasts[0].id}
            role="dialog"
            aria-labelledby={`toast-title-${toasts[0].id}`}
            aria-describedby={`toast-desc-${toasts[0].id}`}
            className={`toast-modal pointer-events-auto animate-toast-in rounded-xl border shadow-xl bg-background/95 backdrop-blur px-4 py-3 sm:px-5 sm:py-4 max-w-md w-full ${
              toasts[0].type === "success"
                ? "border-green-500"
                : toasts[0].type === "error"
                ? "border-red-500"
                : "border-foreground/20"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                toasts[0].type === "success" ? "bg-green-500" : toasts[0].type === "error" ? "bg-red-500" : "bg-foreground/40"
              }`} aria-hidden />
              <div className="flex-1">
                {toasts[0].title ? (
                  <div id={`toast-title-${toasts[0].id}`} className="text-sm font-semibold">
                    {toasts[0].title}
                  </div>
                ) : null}
                <div id={`toast-desc-${toasts[0].id}`} className="text-sm text-foreground/80">
                  {toasts[0].message}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </ToasterContext.Provider>
  );
}


