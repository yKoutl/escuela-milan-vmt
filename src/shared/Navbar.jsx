import React from 'react';
import { ArrowRight, Lock, Menu, Moon, Sun } from 'lucide-react';
import { LOGO_URL } from '../utils/constants';
import { useTheme } from '../contexts/ThemeContext';

export default function Navbar({ 
  setView, 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}) {
  const { isDarkMode, toggleTheme } = useTheme();
  
  // Función auxiliar para navegar y cerrar el menú
  const handleNavClick = (sectionId) => {
    setView('landing');
    setIsMobileMenuOpen(false);
    if (sectionId) {
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <nav className="bg-white dark:bg-black sticky top-0 z-50 shadow-md border-b-4 border-red-600 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* LOGO */}
          <div className="flex items-center cursor-pointer group" onClick={() => setView('landing')}>
            <div className="bg-white dark:bg-black rounded-full p-1 mr-3 border-2 border-red-600 overflow-hidden transition-colors">
              <img src={LOGO_URL} alt="Milan Logo" className="h-12 w-12 object-contain" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tighter uppercase block leading-none text-zinc-900 dark:text-white transition-colors">
                Escuela Deportiva
              </span>
              <span className="font-black text-2xl text-red-600 tracking-widest block leading-none transition-colors">
                MILAN
              </span>
            </div>
          </div>
          
          {/* MENÚ DE ESCRITORIO (PC) */}
          <div className="hidden md:flex space-x-6 items-center">
            {['Historia', 'Logros', 'Horarios', 'Mensualidad', 'Hazte Socio', 'Auspiciadores'].map((item) => (
              <button
                key={item}
                onClick={() => handleNavClick(item.toLowerCase().replace(' ', '-'))}
                className="text-zinc-600 dark:text-zinc-300 hover:text-red-600 font-medium transition text-sm"
              >
                {item}
              </button>
            ))}
            
            <button
              onClick={() => handleNavClick('matricula')}
              className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-full font-bold transition transform hover:scale-105 shadow-md flex items-center"
            >
              Matrícula 2026 <ArrowRight className="ml-2 h-4 w-4" />
            </button>
            
            <div className="flex items-center space-x-2 border-l border-zinc-200 dark:border-zinc-700 pl-4 ml-2 transition-colors">
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              <button onClick={() => setView('admin-login')} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition">
                <Lock className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* MENÚ MÓVIL (ICONOS SUPERIORES) */}
          <div className="md:hidden flex items-center gap-4">
             <button onClick={toggleTheme} className="text-zinc-500 dark:text-zinc-400 hover:text-red-600 transition">
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
             </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-zinc-900 dark:text-white hover:text-red-600 transition-colors">
              <Menu className="h-8 w-8" />
            </button>
          </div>
        </div>
      </div>

      {/* DESPLEGABLE MÓVIL (RESPONSIVE) */}
      {isMobileMenuOpen && (
        // CAMBIO AQUÍ: Usamos 'max-h-[calc...]' en vez de 'h-[calc...]'
        <div className="md:hidden bg-white dark:bg-zinc-900 pb-4 px-4 pt-2 border-t border-zinc-200 dark:border-zinc-800 shadow-xl transition-colors max-h-[calc(100vh-80px)] overflow-y-auto">
          
          <button onClick={() => handleNavClick(null)} className="block py-4 w-full text-left font-medium text-zinc-800 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-800 hover:text-red-600">
            Inicio
          </button>
          
          {['Historia', 'Logros', 'Horarios', 'Mensualidad', 'Hazte Socio', 'Auspiciadores'].map((item) => (
            <button 
              key={item}
              onClick={() => handleNavClick(item.toLowerCase().replace(' ', '-'))} 
              className="block py-4 w-full text-left font-medium text-zinc-800 dark:text-zinc-200 border-b border-zinc-100 dark:border-zinc-800 hover:text-red-600"
            >
              {item}
            </button>
          ))}

          {/* BOTÓN MATRÍCULA MÓVIL (Llamativo) */}
          <div className="py-4 border-b border-zinc-100 dark:border-zinc-800">
            <button 
              onClick={() => handleNavClick('matricula')} 
              className="w-full bg-red-600 text-white py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center"
            >
              ¡Matrícula 2026! <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>

          <button onClick={() => { setView('admin-login'); setIsMobileMenuOpen(false); }} className="block py-4 w-full text-left font-bold text-zinc-500 dark:text-zinc-400 uppercase flex items-center hover:text-red-600">
            <Lock className="h-4 w-4 mr-2"/> Acceso Admin
          </button>
        </div>
      )}
    </nav>
  );
}