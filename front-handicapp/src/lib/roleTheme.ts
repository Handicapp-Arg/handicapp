/**
 * @deprecated ARCHIVO MUERTO — ningún componente lo importa.
 * Los colores por rol están definidos inline en cada componente via Tailwind.
 * Puede eliminarse de forma segura, o adoptarse como fuente única de verdad
 * si se decide centralizar los colores por rol.
 *
 * Sistema de colores por rol para HandicApp.
 * Usar estas constantes en lugar de clases hardcodeadas por rol.
 *
 * Color de acento compartido (dorado HandicApp): amber-700 / [#af936f]
 * Se representa con clases Tailwind estándar para cada rol.
 */
export const ROLE_THEME = {
  admin: {
    accent: 'blue-600',
    accentHover: 'blue-700',
    bg: 'blue-50',
    text: 'blue-700',
    border: 'blue-200',
  },
  establecimiento: {
    accent: 'green-600',
    accentHover: 'green-700',
    bg: 'green-50',
    text: 'green-700',
    border: 'green-200',
  },
  veterinario: {
    accent: 'purple-600',
    accentHover: 'purple-700',
    bg: 'purple-50',
    text: 'purple-700',
    border: 'purple-200',
  },
  empleado: {
    accent: 'blue-500',
    accentHover: 'blue-600',
    bg: 'blue-50',
    text: 'blue-600',
    border: 'blue-200',
  },
  propietario: {
    accent: 'amber-600',
    accentHover: 'amber-700',
    bg: 'amber-50',
    text: 'amber-700',
    border: 'amber-200',
  },
} as const;

export type RoleKey = keyof typeof ROLE_THEME;

/**
 * Retorna el tema de colores para un rol dado.
 * Si el rol no existe, retorna el tema de admin como fallback.
 */
export function getRoleTheme(role: string | null | undefined) {
  if (!role || !(role in ROLE_THEME)) return ROLE_THEME.admin;
  return ROLE_THEME[role as RoleKey];
}
