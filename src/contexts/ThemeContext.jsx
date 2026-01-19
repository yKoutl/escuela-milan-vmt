import React, { createContext, useContext, useState, useEffect } from 'react';
import { getInitialTheme, setThemeInStorage, applyThemeToDom } from '../utils/theme';

const ThemeContext = createContext();

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }) {
  // Inicializamos el estado leyendo desde nuestra utilidad (leerá localStorage o default false)
  const [isDarkMode, setIsDarkMode] = useState(getInitialTheme);

  useEffect(() => {
    // 1. Aplicar cambios al DOM
    applyThemeToDom(isDarkMode);
    // 2. Persistir en localStorage
    setThemeInStorage(isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
