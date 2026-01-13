import React, { useState } from 'react';
import { Megaphone, X } from 'lucide-react';

export default function FloatingAnnouncementButton({ onClick }) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = (e) => {
    e.stopPropagation(); // Evitar que se active el onClick principal
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-6 z-[9998] bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 animate-bounce group"
      aria-label="Ver anuncio importante"
    >
      {/* Botón X para cerrar */}
      <button
        onClick={handleDismiss}
        className="absolute -top-2 -left-2 bg-zinc-900 hover:bg-black text-white rounded-full p-1 shadow-lg transition-all hover:scale-110 z-10"
        aria-label="Cerrar botón flotante"
      >
        <X className="h-3 w-3" />
      </button>

      <Megaphone className="h-6 w-6" />
      
      {/* Badge con "!" */}
      <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
        !
      </span>
      
      {/* Tooltip */}
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-red-600 px-3 py-2 rounded-lg shadow-lg font-bold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        Ver Anuncio
      </span>
    </button>
  );
}
