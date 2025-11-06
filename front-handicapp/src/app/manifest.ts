import { MetadataRoute } from 'next';
import { ICON_BROWN } from '@/lib/constants/logos';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Handicapp - Gestión de Establecimientos',
    short_name: 'Handicapp',
    description: 'Sistema de gestión integral para establecimientos',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#8B4513',
    orientation: 'portrait-primary',
    icons: [
      {
        src: ICON_BROWN,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: ICON_BROWN,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: ICON_BROWN,
        sizes: '384x384',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: ICON_BROWN,
        sizes: '256x256',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    shortcuts: [
      {
        name: 'Inicio',
        short_name: 'Inicio',
        description: 'Ir al inicio',
        url: '/',
        icons: [{ src: ICON_BROWN, sizes: '192x192' }]
      },
      {
        name: 'Inventario',
        short_name: 'Inventario',
        description: 'Gestionar inventario',
        url: '/establecimiento/inventario',
        icons: [{ src: ICON_BROWN, sizes: '192x192' }]
      },
      {
        name: 'Eventos',
        short_name: 'Eventos',
        description: 'Ver eventos',
        url: '/establecimiento/eventos',
        icons: [{ src: ICON_BROWN, sizes: '192x192' }]
      }
    ]
  };
}
