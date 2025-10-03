// Design System Constants for HandicApp
// Maintain consistency across all dashboards

export const THEME_COLORS = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    hover: 'hover:bg-blue-50'
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    hover: 'hover:bg-green-50'
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
    hover: 'hover:bg-purple-50'
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
    hover: 'hover:bg-orange-50'
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    hover: 'hover:bg-red-50'
  },
  indigo: {
    bg: 'bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-200',
    hover: 'hover:bg-indigo-50'
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    hover: 'hover:bg-yellow-50'
  },
  pink: {
    bg: 'bg-pink-100',
    text: 'text-pink-800',
    border: 'border-pink-200',
    hover: 'hover:bg-pink-50'
  },
  gray: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    hover: 'hover:bg-gray-50'
  }
} as const;

export const ROLE_ICONS = {
  admin: '👑',
  establecimiento: '🏢',
  veterinario: '🩺',
  capataz: '👷',
  empleado: '👨‍💼',
  propietario: '🤝'
} as const;

export const FEATURE_ICONS = {
  users: '👥',
  horses: '🐎',
  events: '📅',
  tasks: '📋',
  establishments: '🏢',
  reports: '📊',
  config: '⚙️',
  security: '🔐',
  audit: '🔍',
  notifications: '🔔',
  calendar: '📆',
  medical: '🩺',
  training: '🏋️',
  feeding: '🌾',
  maintenance: '🔧'
} as const;

export const STATUS_COLORS = {
  active: 'green',
  inactive: 'red',
  pending: 'yellow',
  warning: 'orange',
  info: 'blue'
} as const;

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const;