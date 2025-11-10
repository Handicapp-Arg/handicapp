import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://handicapp.com';
  
  // Fecha actual para lastModified
  const now = new Date();
  
  return [
    // Páginas públicas
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    
    // Dashboards (requieren auth, pero indexables)
    {
      url: `${baseUrl}/propietario`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/veterinario`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cuidador`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    
    // Secciones principales - Propietario
    {
      url: `${baseUrl}/propietario/establecimientos`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/propietario/caballos`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/propietario/eventos`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/propietario/gastos`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/propietario/tareas`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/propietario/salud`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/propietario/reportes`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    
    // Secciones - Veterinario
    {
      url: `${baseUrl}/veterinario/tratamientos`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/veterinario/validacion`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    
    // Secciones - Cuidador
    {
      url: `${baseUrl}/cuidador/tareas`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/cuidador/inventario`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];
}
