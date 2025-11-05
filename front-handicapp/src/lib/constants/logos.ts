/**
 * URLs de logos desde Cloudinary
 * Centraliza todas las rutas de los logos de la aplicación
 */

export const LOGOS = {
  // Logo completo (ícono + texto)
  FULL_BROWN: 'https://res.cloudinary.com/dh2m9ychv/image/upload/v1762370534/logo-full-brown_i21og1.png',
  FULL_WHITE: 'https://res.cloudinary.com/dh2m9ychv/image/upload/v1762370534/logo-full-white_suu2qt.png',
  
  // Solo ícono
  ICON_BROWN: 'https://res.cloudinary.com/dh2m9ychv/image/upload/v1762370535/logo-icon-brown_aeujmb.png',
  ICON_WHITE: 'https://res.cloudinary.com/dh2m9ychv/image/upload/v1762370535/logo-icon-white_fbeduu.png',
  
  // Solo texto
  TEXT_BROWN: 'https://res.cloudinary.com/dh2m9ychv/image/upload/v1762370535/logo-text-brown_xryt4c.png',
} as const;

// Export individual para fácil acceso
export const {
  FULL_BROWN,
  FULL_WHITE,
  ICON_BROWN,
  ICON_WHITE,
  TEXT_BROWN,
} = LOGOS;

// Export por defecto para uso común
export default LOGOS;
