import React from 'react';
import { X } from 'lucide-react';

export default function ImagePreviewModal({ isOpen, imageUrl, onClose }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 z-[10000] p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors"
        aria-label="Cerrar vista previa"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Imagen */}
      <div 
        className="relative max-w-[90vw] max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt="Vista previa"
          className="max-w-full max-h-[80vh] rounded-lg shadow-2xl object-contain"
          onError={(e) => {
            e.target.src = 'https://placehold.co/600x400/red/white?text=Error+al+cargar';
          }}
        />
      </div>
    </div>
  );
}
