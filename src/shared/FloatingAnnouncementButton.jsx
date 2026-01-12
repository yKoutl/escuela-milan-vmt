import React, { useState } from 'react';
import { Megaphone, X } from 'lucide-react';

export default function FloatingAnnouncementButton({ onClick }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <button
      onClick={() => {
        onClick();
        setIsVisible(false);
      }}
      className="fixed bottom-24 right-4 z-[9998] bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 animate-bounce group"
      aria-label="Ver anuncio importante"
    >
      <Megaphone className="h-6 w-6" />
      <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-900 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
        !
      </span>
      <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-white text-red-600 px-3 py-2 rounded-lg shadow-lg font-bold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        Ver Anuncio
      </span>
    </button>
  );
}
