import React from 'react';
import { DEFAULT_ACHIEVEMENTS } from '../../utils/constants';

export default function Achievements({ achievements }) {
  const sourceData = achievements.length > 0 ? achievements : DEFAULT_ACHIEVEMENTS;
  const displayData = sourceData
    .filter(item => item.visible !== false)
    .slice(0, 6);

  const getImageSrc = (item) => {
    return item.img || "https://placehold.co/600x400/red/white?text=Logro";
  };

  return (
    <section id="logros" className="py-20 bg-zinc-50 dark:bg-zinc-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white mb-4">Nuestros Logros</h2>
          <div className="w-20 h-1 bg-red-600 mx-auto"></div>
          <p className="mt-4 text-zinc-500 dark:text-zinc-400 text-sm">Mostrando los {displayData.length} más significativos de la Escuela Milan</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {displayData.map((item, idx) => (
            <div key={item.id || idx} className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg overflow-hidden group hover:shadow-2xl transition duration-300 border border-zinc-100 dark:border-zinc-700 flex flex-col">
              <div className="h-48 overflow-hidden bg-zinc-200 dark:bg-zinc-700 relative">
                <img 
                  src={getImageSrc(item)} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                  onError={(e) => {
                    e.target.src = "https://placehold.co/600x400/red/white?text=Logro";
                  }}
                />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-xl text-zinc-900 dark:text-white line-clamp-1">{item.title}</h3>
                  <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded">{item.year}</span>
                </div>
                <p className="text-zinc-600 dark:text-zinc-400 line-clamp-3">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
