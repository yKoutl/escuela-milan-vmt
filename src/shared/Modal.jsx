import React from 'react';
import { X } from 'lucide-react';
import { THEME_CLASSES } from '../utils/theme';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className={`${THEME_CLASSES.bg.surface} rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border ${THEME_CLASSES.border.primary} animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 shadow-zinc-950/20`}
      >
        {/* Header con estilo Glassmorphism suave */}
        <div className="relative px-6 md:px-8 py-5 md:py-6 flex justify-between items-center group flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-50" />

          <div className="relative">
            <h3 className={`font-black text-lg md:text-xl uppercase tracking-tighter ${THEME_CLASSES.text.primary}`}>
              {title}
            </h3>
            <div className="h-1 w-8 bg-red-600 rounded-full mt-1" />
          </div>

          <button
            onClick={onClose}
            className="relative p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content con padding generoso y scroll si es necesario */}
        <div className="px-6 md:px-8 pb-8 pt-2 overflow-y-auto flex-1 custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
