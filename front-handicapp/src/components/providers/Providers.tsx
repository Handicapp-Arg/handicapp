"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/components/AuthProvider";
import { ToasterProvider } from "@/components/ui/toaster";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <ToasterProvider>{children}</ToasterProvider>
    </AuthProvider>
  );
}
