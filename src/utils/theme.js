// Configuración del tema del sistema
export const THEME_CONFIG = {
  light: {
    primary: '#dc2626', // red-600
    secondary: '#18181b', // zinc-900
    background: '#ffffff',
    surface: '#f4f4f5', // zinc-100
    text: {
      primary: '#18181b', // zinc-900
      secondary: '#52525b', // zinc-600
      tertiary: '#a1a1aa', // zinc-400
    },
    border: '#e4e4e7', // zinc-200
  },
  dark: {
    primary: '#dc2626', // red-600
    secondary: '#ffffff',
    background: '#09090b', // zinc-950
    surface: '#18181b', // zinc-900
    text: {
      primary: '#ffffff',
      secondary: '#a1a1aa', // zinc-400
      tertiary: '#71717a', // zinc-500
    },
    border: '#27272a', // zinc-800
  }
};

// Clases de Tailwind para modo claro/oscuro
export const THEME_CLASSES = {
  // Backgrounds
  bg: {
    primary: 'bg-white dark:bg-zinc-950',
    secondary: 'bg-zinc-50 dark:bg-zinc-900',
    surface: 'bg-white dark:bg-zinc-800',
    card: 'bg-zinc-50 dark:bg-zinc-900',
  },
  // Textos
  text: {
    primary: 'text-zinc-900 dark:text-white',
    secondary: 'text-zinc-600 dark:text-zinc-400',
    tertiary: 'text-zinc-500 dark:text-zinc-500',
  },
  // Bordes
  border: {
    primary: 'border-zinc-200 dark:border-zinc-800',
    secondary: 'border-zinc-300 dark:border-zinc-700',
  },
  // Inputs
  input: 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white',
  // Buttons
  button: {
    primary: 'bg-red-600 hover:bg-red-700 text-white',
    secondary: 'bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white',
  }
};

// Horarios de entrenamiento predeterminados
export const DEFAULT_SCHEDULE = [
  { day: 'Lunes', time: '16:00 - 18:00', category: 'Sub-10', color: 'bg-blue-500' },
  { day: 'Lunes', time: '18:00 - 20:00', category: 'Sub-14', color: 'bg-green-500' },
  { day: 'Miércoles', time: '16:00 - 18:00', category: 'Sub-12', color: 'bg-purple-500' },
  { day: 'Miércoles', time: '18:00 - 20:00', category: 'Sub-16', color: 'bg-orange-500' },
  { day: 'Viernes', time: '16:00 - 18:00', category: 'Sub-10', color: 'bg-blue-500' },
  { day: 'Viernes', time: '18:00 - 20:00', category: 'Sub-14', color: 'bg-green-500' },
];

export default THEME_CONFIG;
