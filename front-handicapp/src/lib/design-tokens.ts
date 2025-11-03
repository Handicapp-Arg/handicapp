/**
 * Design Tokens - Sistema de diseño centralizado
 * Basado en Design System best practices (Material Design, Fluent UI, Tailwind)
 */

export type RoleClave = 'admin' | 'propietario' | 'establecimiento' | 'capataz' | 'empleado' | 'veterinario';

/**
 * Color schemes por rol
 * Cada rol tiene su identidad visual pero sigue el mismo patrón
 */
export const colorSchemes = {
  admin: {
    primary: 'slate',
    gradient: 'from-slate-500 to-gray-600',
    accentGradient: 'from-slate-400 to-gray-500',
    icon: 'text-slate-600',
    iconBg: 'bg-slate-100',
    badge: 'bg-slate-100 text-slate-700',
    hover: 'hover:bg-slate-50',
    border: 'border-slate-200',
  },
  propietario: {
    primary: 'blue',
    gradient: 'from-blue-400 to-cyan-500',
    accentGradient: 'from-blue-300 to-cyan-400',
    icon: 'text-blue-600',
    iconBg: 'bg-blue-100',
    badge: 'bg-blue-100 text-blue-700',
    hover: 'hover:bg-blue-50',
    border: 'border-blue-200',
  },
  establecimiento: {
    primary: 'green',
    gradient: 'from-green-400 to-emerald-500',
    accentGradient: 'from-green-300 to-emerald-400',
    icon: 'text-green-600',
    iconBg: 'bg-green-100',
    badge: 'bg-green-100 text-green-700',
    hover: 'hover:bg-green-50',
    border: 'border-green-200',
  },
  capataz: {
    primary: 'orange',
    gradient: 'from-orange-400 to-amber-500',
    accentGradient: 'from-orange-300 to-amber-400',
    icon: 'text-orange-600',
    iconBg: 'bg-orange-100',
    badge: 'bg-orange-100 text-orange-700',
    hover: 'hover:bg-orange-50',
    border: 'border-orange-200',
  },
  empleado: {
    primary: 'teal',
    gradient: 'from-teal-400 to-cyan-500',
    accentGradient: 'from-teal-300 to-cyan-400',
    icon: 'text-teal-600',
    iconBg: 'bg-teal-100',
    badge: 'bg-teal-100 text-teal-700',
    hover: 'hover:bg-teal-50',
    border: 'border-teal-200',
  },
  veterinario: {
    primary: 'purple',
    gradient: 'from-violet-400 to-purple-500',
    accentGradient: 'from-violet-300 to-purple-400',
    icon: 'text-purple-600',
    iconBg: 'bg-purple-100',
    badge: 'bg-purple-100 text-purple-700',
    hover: 'hover:bg-purple-50',
    border: 'border-purple-200',
  },
} as const;

/**
 * Emojis/iconos representativos por rol
 */
export const roleEmojis = {
  admin: '⚙️',
  propietario: '👨‍💼',
  establecimiento: '🏢',
  capataz: '👷',
  empleado: '👨‍🌾',
  veterinario: '🩺',
} as const;

/**
 * Títulos y descripciones por rol
 */
export const roleTitles = {
  admin: {
    title: 'Panel de Administración',
    description: 'Gestión global del sistema HandicApp',
  },
  propietario: {
    title: 'Gestiona tu Pasión Ecuestre',
    description: 'Administra el cuidado, salud y rendimiento de tus caballos',
  },
  establecimiento: {
    title: 'Gestión de Establecimiento',
    description: 'Administra tu haras y optimiza operaciones',
  },
  capataz: {
    title: 'Panel de Capataz',
    description: 'Coordina equipos y supervisa operaciones diarias',
  },
  empleado: {
    title: 'Panel de Empleado',
    description: 'Gestión de tareas y actividades diarias',
  },
  veterinario: {
    title: 'Panel Veterinario',
    description: 'Gestión de salud y cuidado animal',
  },
} as const;

/**
 * Spacing tokens (Tailwind standard)
 */
export const spacing = {
  section: 'space-y-8',
  cardPadding: 'p-6 sm:p-8',
  cardGap: 'gap-6 sm:gap-8',
  gridGap: 'gap-6',
  containerPadding: 'px-4 sm:px-6 lg:px-8',
} as const;

/**
 * Elevation (sombras y bordes)
 */
export const elevation = {
  card: 'shadow-lg border border-gray-200',
  cardHover: 'hover:shadow-xl transition-shadow duration-200',
  hero: 'shadow-2xl',
  subtle: 'shadow-md',
} as const;

/**
 * Border radius
 */
export const radius = {
  card: 'rounded-2xl',
  button: 'rounded-xl',
  badge: 'rounded-lg',
  input: 'rounded-lg',
  full: 'rounded-full',
} as const;

/**
 * Typography
 */
export const typography = {
  h1: 'text-3xl sm:text-4xl font-bold',
  h2: 'text-2xl font-bold',
  h3: 'text-xl font-bold',
  h4: 'text-lg font-semibold',
  body: 'text-base',
  small: 'text-sm',
  tiny: 'text-xs',
} as const;

/**
 * Layout breakpoints (grid columns)
 */
export const layout = {
  statsGrid: {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  },
  actionsGrid: {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  },
  mainSidebar: 'grid grid-cols-1 lg:grid-cols-3 gap-8',
} as const;

/**
 * Helper function para obtener el color scheme del rol
 */
export function getRoleColorScheme(role: RoleClave) {
  return colorSchemes[role] || colorSchemes.empleado;
}

/**
 * Helper function para obtener info del rol
 */
export function getRoleInfo(role: RoleClave) {
  return {
    ...roleTitles[role],
    emoji: roleEmojis[role],
    colorScheme: getRoleColorScheme(role),
  };
}
