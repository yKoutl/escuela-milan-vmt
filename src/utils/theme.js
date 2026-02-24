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
  input: 'w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white dark:[color-scheme:dark] outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-sm',
  // Buttons
  button: {
    primary: 'bg-red-600 hover:bg-red-700 text-white',
    secondary: 'bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-900 dark:text-white',
  },
  // Badges / Etiquetas
  badge: {
    base: 'px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    error: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    info: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20',
    neutral: 'bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-500/10 dark:text-zinc-400 dark:border-zinc-500/20',
  }
};



export default THEME_CONFIG;

// --- LOGICA DE NEGOCIO DEL TEMA (REFACTOR clean code) ---

export const THEME_KEY = 'milan_app_theme_v4';

/**
 * Obtiene el estado inicial del tema.
 * Regla: 100% manual. Si no hay nada guardado, es Light (false).
 * Ignora window.matchMedia.
 */
export const getInitialTheme = () => {
  try {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme !== null) {
      return JSON.parse(savedTheme);
    }
    return false; // Default: Light Mode
  } catch (error) {
    console.warn('Error reading theme from localStorage:', error);
    return false;
  }
};

/**
 * Guarda la preferencia del usuario en localStorage.
 * @param {boolean} isDark 
 */
export const setThemeInStorage = (isDark) => {
  try {
    localStorage.setItem(THEME_KEY, JSON.stringify(isDark));
  } catch (error) {
    console.error('Error saving theme to localStorage:', error);
  }
};

/**
 * Aplica la clase 'dark' al elemento html (document.documentElement).
 * @param {boolean} isDark 
 */
export const applyThemeToDom = (isDark) => {
  const root = document.documentElement;
  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
};
