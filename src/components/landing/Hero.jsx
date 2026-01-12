import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative bg-zinc-900 h-[600px] flex items-center overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <img src="https://images.unsplash.com/photo-1517466787929-bc90951d0974" className="w-full h-full object-cover" alt="Soccer background"/>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="max-w-2xl animate-fade-in-up">
          <span className="inline-block py-1 px-3 rounded-full bg-red-600 text-white text-sm font-bold tracking-wider mb-4 uppercase">Liga Amateur 1.ª División SJM</span>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">FORMANDO <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">FUTUROS CAMPEONES</span></h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => document.getElementById('matricula')?.scrollIntoView({behavior: 'smooth'})} className="bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition shadow-[0_0_20px_rgba(220,38,38,0.5)] flex justify-center items-center">Inscríbete Ahora <ArrowRight className="ml-2" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
