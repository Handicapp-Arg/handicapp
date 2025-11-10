/**
 * Configuración de SEO y Meta Tags
 * Mejora el posicionamiento en buscadores y compartir en redes sociales
 */

import { Metadata } from 'next';

// Información base del sitio
export const siteConfig = {
  name: 'Handicapp',
  title: 'Handicapp - Gestión Integral de Caballos',
  description: 'Sistema profesional de gestión para caballos de competición. Registros sanitarios, eventos deportivos, establecimientos hípicos y más.',
  url: 'https://handicapp.com',
  ogImage: 'https://handicapp.com/og-image.jpg',
  creator: '@handicapp',
  keywords: [
    'gestión de caballos',
    'caballos de competición',
    'registros sanitarios',
    'eventos ecuestres',
    'establecimientos hípicos',
    'veterinaria equina',
    'deportes ecuestres',
    'polo',
    'salto',
    'doma',
    'haras',
  ],
};

/**
 * Metadata por defecto para todas las páginas
 */
export const defaultMetadata: Metadata = {
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [
    {
      name: siteConfig.name,
      url: siteConfig.url,
    },
  ],
  creator: siteConfig.creator,
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.creator,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logos/favicon.png',
    shortcut: '/logos/favicon.png',
    apple: '/logos/logo-mobile.png',
  },
  manifest: '/manifest.json',
};

/**
 * Metadata para páginas específicas
 */
export const pageMetadata = {
  // Dashboard
  dashboard: {
    propietario: {
      title: 'Dashboard Propietario',
      description: 'Panel de control para propietarios de caballos. Gestiona tus caballos, eventos, gastos y más.',
    },
    veterinario: {
      title: 'Dashboard Veterinario',
      description: 'Panel de control para veterinarios. Gestiona tratamientos, pacientes y consultas.',
    },
    cuidador: {
      title: 'Dashboard Cuidador',
      description: 'Panel de control para cuidadores. Gestiona tareas, alimentación y cuidados diarios.',
    },
  },
  
  // Caballos
  caballos: {
    list: {
      title: 'Mis Caballos',
      description: 'Listado completo de tus caballos con información detallada de cada ejemplar.',
    },
    detail: {
      title: 'Detalle del Caballo',
      description: 'Información completa del caballo: historial médico, eventos, gastos y estadísticas.',
    },
    create: {
      title: 'Registrar Nuevo Caballo',
      description: 'Añade un nuevo caballo a tu gestión con toda su información.',
    },
  },
  
  // Establecimientos
  establecimientos: {
    list: {
      title: 'Establecimientos Hípicos',
      description: 'Explora establecimientos hípicos: haras, clubes de polo, escuelas de salto y más.',
    },
    detail: {
      title: 'Detalle del Establecimiento',
      description: 'Información completa del establecimiento: servicios, ubicación, reseñas y contacto.',
    },
    map: {
      title: 'Mapa de Establecimientos',
      description: 'Encuentra establecimientos hípicos cerca de ti en el mapa interactivo.',
    },
  },
  
  // Eventos
  eventos: {
    list: {
      title: 'Eventos Deportivos',
      description: 'Registra y gestiona competencias, entrenamientos y presentaciones de tus caballos.',
    },
    detail: {
      title: 'Detalle del Evento',
      description: 'Información completa del evento: resultados, clasificación y estadísticas.',
    },
  },
  
  // Tratamientos
  tratamientos: {
    list: {
      title: 'Tratamientos Veterinarios',
      description: 'Historial médico completo: tratamientos, consultas, vacunaciones y controles.',
    },
    detail: {
      title: 'Detalle del Tratamiento',
      description: 'Información detallada del tratamiento veterinario.',
    },
  },
  
  // Inventario
  inventario: {
    list: {
      title: 'Inventario de Productos',
      description: 'Gestiona el inventario de alimentos, medicamentos y equipamiento.',
    },
  },
  
  // Reportes
  reportes: {
    gastos: {
      title: 'Reportes de Gastos',
      description: 'Análisis detallado de gastos: alimentación, veterinaria, eventos y más.',
    },
    eventos: {
      title: 'Reportes de Eventos',
      description: 'Estadísticas y análisis de performance en competencias.',
    },
    caballos: {
      title: 'Reportes de Caballos',
      description: 'Estadísticas generales de tu establo.',
    },
  },
  
  // Auth
  auth: {
    login: {
      title: 'Iniciar Sesión',
      description: 'Accede a tu cuenta de Handicapp.',
    },
    register: {
      title: 'Registro',
      description: 'Crea tu cuenta y comienza a gestionar tus caballos.',
    },
    forgotPassword: {
      title: 'Recuperar Contraseña',
      description: 'Recupera el acceso a tu cuenta.',
    },
  },
};

/**
 * Genera metadata para una página específica
 */
export function generatePageMetadata(
  page: keyof typeof pageMetadata,
  subPage?: string,
  customData?: Partial<Metadata>
): Metadata {
  const pageData = subPage 
    ? (pageMetadata[page] as any)[subPage]
    : pageMetadata[page];
  
  return {
    title: pageData?.title || siteConfig.title,
    description: pageData?.description || siteConfig.description,
    ...customData,
  };
}

/**
 * JSON-LD Structured Data para SEO
 */
export function generateStructuredData(type: 'Organization' | 'WebSite' | 'BreadcrumbList', data?: any) {
  const structuredDataMap = {
    Organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
      logo: `${siteConfig.url}/logos/logo-desktop.png`,
      description: siteConfig.description,
      sameAs: [
        // Agregar redes sociales aquí
      ],
    },
    WebSite: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteConfig.url}/buscar?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    BreadcrumbList: {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: data?.items || [],
    },
  };
  
  return structuredDataMap[type];
}
