import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 animate-slide-up">
        <div className="bg-zinc-50 dark:bg-zinc-800 px-6 py-4 flex justify-between items-center border-b border-zinc-200 dark:border-zinc-700">
          <h3 className="font-bold text-lg text-zinc-900 dark:text-white">{title}</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-zinc-500 hover:text-red-500" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
