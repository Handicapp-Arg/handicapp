'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir inmediatamente a la página principal donde está el login integrado
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#3C2013] via-[#2A1709] to-[#1A0F06]">
      <div className="text-center space-y-4">
        <div className="w-8 h-8 border-2 border-[#D2B48C] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-white/70 text-sm">Redirigiendo a la página principal...</p>
      </div>
    </div>
  );
}