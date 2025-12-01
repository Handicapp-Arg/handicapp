'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EstablecimientoPerfilPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/establecimiento/configuracion');
  }, [router]);

  return null;
}

