import React, { createContext, useContext, useState, useEffect } from 'react';
import { getInitialTheme, setThemeInStorage, applyThemeToDom } from '../utils/theme';
import { Loader2 } from 'lucide-react';

const ThemeContext = createContext();

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);
  const [isChangingTheme, setIsChangingTheme] = useState(false);

  useEffect(() => {
    applyThemeToDom(isDarkMode);
    setThemeInStorage(isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsChangingTheme(true);
    // 1. Mostrar loading y esperar un poco
    setTimeout(() => {
      // 2. Cambiar el estado del tema
      setIsDarkMode((prev) => !prev);

      // 3. Dar tiempo a que el DOM se actualice antes de quitar el blur
      setTimeout(() => {
        setIsChangingTheme(false);
      }, 500);
    }, 600);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
      {isChangingTheme && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center backdrop-blur-xl bg-white/30 dark:bg-black/30 transition-all duration-500 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center gap-4 scale-110 animate-fade-in-up">
            <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-800 dark:text-white">
              {isDarkMode ? 'Encendiendo luces...' : 'Preparando modo noche...'}
            </p>
          </div>
        </div>
      )}
    </ThemeContext.Provider>
  );
}
