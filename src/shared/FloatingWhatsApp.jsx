import React from 'react';
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGE } from '../utils/constants';

export default function FloatingWhatsApp() {
  const handleClick = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 p-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group"
      aria-label="Contactar por WhatsApp"
    >
      <img 
        src="https://i.postimg.cc/gk4vhpgm/wsp.png" 
        alt="WhatsApp"
        className="h-12 w-12"
      />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
        ¿Necesitas ayuda?
      </span>
    </button>
  );
}
