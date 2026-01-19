import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white py-8 md:py-12 border-t border-zinc-200 dark:border-zinc-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Título: Tamaño responsive (más pequeño en móvil) y color adaptable */}
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter mb-2">
          Escuela Deportiva Milan
        </h2>
        
        {/* Texto de derechos: Color gris suave adaptable */}
        <p className="text-zinc-600 dark:text-zinc-500 text-sm">
          © 2026. Todos los derechos reservados.
        </p>
        
      </div>
    </footer>
  );
}