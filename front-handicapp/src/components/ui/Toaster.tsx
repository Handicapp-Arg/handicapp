"use client";

import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

type ToastType = 'success' | 'error' | 'info' | 'warning';

type ToastOptions = {
  type?: ToastType;
  title?: string;
  duration?: number; // ms
};

type InternalToast = Required<ToastOptions> & { id: string; message: string };

interface ToasterContextType {
  toast: (message: string, type?: ToastType | ToastOptions) => void;
}

const ToasterContext = createContext<ToasterContextType | undefined>(undefined);

export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<InternalToast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback<ToasterContextType['toast']>((message, typeOrOptions) => {
    const opts: ToastOptions = typeof typeOrOptions === 'string' ? { type: typeOrOptions } : (typeOrOptions || {});
    const id = Math.random().toString(36).slice(2);
    const newToast: InternalToast = {
      id,
      message,
      type: opts.type ?? 'info',
      title: opts.title ?? defaultTitleByType[opts.type ?? 'info'],
      duration: Math.max(1500, Math.min(opts.duration ?? 3500, 10000)),
    };
    setToasts(prev => [...prev, newToast]);
    const timeout = setTimeout(() => remove(id), newToast.duration);
    return () => clearTimeout(timeout);
  }, [remove]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToasterContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[60] flex w-full max-w-md flex-col gap-2">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToasterContext.Provider>
  );
}

export function useToaster() {
  const ctx = useContext(ToasterContext);
  if (!ctx) throw new Error('useToaster must be used within ToasterProvider');
  return ctx;
}

const defaultTitleByType: Record<ToastType, string> = {
  success: 'Éxito',
  error: 'Error',
  info: 'Información',
  warning: 'Atención',
};

const iconByType: Record<ToastType, React.ReactNode> = {
  success: <CheckCircleIcon className="h-5 w-5 text-emerald-600" />,
  error: <ExclamationCircleIcon className="h-5 w-5 text-red-600" />,
  info: <InformationCircleIcon className="h-5 w-5 text-blue-600" />,
  warning: <ExclamationCircleIcon className="h-5 w-5 text-amber-600" />,
};

const bgByType: Record<ToastType, string> = {
  success: 'bg-emerald-50 border-emerald-200',
  error: 'bg-red-50 border-red-200',
  info: 'bg-blue-50 border-blue-200',
  warning: 'bg-amber-50 border-amber-200',
};

const ToastItem: React.FC<{ toast: InternalToast; onClose: () => void }> = ({ toast, onClose }) => {
  return (
    <div className={`rounded-lg border ${bgByType[toast.type]} shadow-sm ring-1 ring-black/5`}> 
      <div className="flex items-start gap-3 p-3">
        <div className="shrink-0 mt-0.5">{iconByType[toast.type]}</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{toast.title}</p>
          <p className="text-sm text-gray-700">{toast.message}</p>
        </div>
        <button onClick={onClose} className="rounded p-1 text-gray-500 hover:bg-black/5">
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
