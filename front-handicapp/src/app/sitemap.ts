import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://handicapp.com';
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

    // Propietario
    {
      url: `${baseUrl}/propietario`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/propietario/stables`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/propietario/horses`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/propietario/events`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },

    // Establecimiento
    {
      url: `${baseUrl}/establecimiento`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },

    // Admin
    {
      url: `${baseUrl}/admin`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];
}
