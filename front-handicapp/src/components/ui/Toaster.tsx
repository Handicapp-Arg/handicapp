"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface ToasterContextType {
  toast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToasterContext = createContext<ToasterContextType | undefined>(undefined);

export function ToasterProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: string }>>([]);

  const toast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  return (
    <ToasterContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(({ id, message, type }) => (
          <div
            key={id}
            className={`p-4 rounded-md shadow-lg ${
              type === 'success' ? 'bg-green-500 text-white' :
              type === 'error' ? 'bg-red-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            {message}
          </div>
        ))}
      </div>
    </ToasterContext.Provider>
  );
}

export function useToaster() {
  const context = useContext(ToasterContext);
  if (!context) {
    throw new Error('useToaster must be used within ToasterProvider');
  }
  return context;
}
