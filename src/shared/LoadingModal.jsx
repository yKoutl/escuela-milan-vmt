import React from 'react';
import { Upload, Loader2 } from 'lucide-react';

export default function LoadingModal({ isOpen, message = "Subiendo imagen de alta calidad... Por favor no cierres ni te muevas de aquí." }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop oscuro con blur */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        style={{ 
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
      />
      
      {/* Contenedor del modal */}
      <div className="relative z-10 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border-4 border-red-600">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Spinner animado */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Upload className="h-8 w-8 text-red-600 animate-pulse" />
            </div>
            <Loader2 className="h-16 w-16 text-red-600 animate-spin" />
          </div>
          
          {/* Mensaje principal */}
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              Procesando imagen...
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {message}
            </p>
          </div>

          {/* Barra de progreso indeterminada */}
          <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-600 to-red-400 animate-progress-bar"></div>
          </div>

          {/* Advertencia */}
          <div className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <span className="text-yellow-600 dark:text-yellow-400 text-xs font-medium">
              ⚠️ No cierres esta ventana ni navegues a otra página
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
