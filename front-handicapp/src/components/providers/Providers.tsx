"use client";

import { ReactNode } from "react";
import { AuthProvider } from "@/lib/components/AuthProvider";
import { ToasterProvider } from "@/components/ui/toaster";
import { ReactQueryProvider } from "./ReactQueryProvider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ReactQueryProvider>
      <AuthProvider>
        <ToasterProvider>{children}</ToasterProvider>
      </AuthProvider>
    </ReactQueryProvider>
  );
}
