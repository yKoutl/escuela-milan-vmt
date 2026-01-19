import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe ser usado dentro de ThemeProvider');
  }
  return context;
}

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // 1. PRIMERO: Miramos si el usuario ya eligió algo antes (Memoria)
    const saved = localStorage.getItem('darkMode');
    
    // Si existe una elección guardada, la respetamos.
    if (saved !== null) {
      return JSON.parse(saved);
    }
    
    // 2. SEGUNDO: Si es un usuario nuevo (o borró caché), 
    // FORZAMOS que empiece en 'false' (Modo Día).
    // IMPORTANTE: Aquí eliminamos la línea de "window.matchMedia", 
    // así que ya no le importa la configuración de tu PC.
    return false; 
  });

  useEffect(() => {
    // Guardamos la decisión cada vez que cambia
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    
    // Aplicamos visualmente el cambio
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}