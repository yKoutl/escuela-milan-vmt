import React from 'react';
import { ChevronRight, Newspaper } from 'lucide-react';
import { DEFAULT_NEWS } from '../../utils/constants';

export default function News({ news }) {
  const sourceData = news.length > 0 ? news : DEFAULT_NEWS;
  const displayData = sourceData
    .filter(item => item.visible !== false)
    .slice(0, 3);

  return (
    <section className="py-20 bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-10 flex items-center justify-between">
          <span className="flex items-center"><Newspaper className="mr-3 text-red-600" /> Últimas Noticias</span>
          {sourceData.length > 3 && <span className="text-xs font-normal text-zinc-500">Ver todas ({sourceData.length})</span>}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayData.map((item, i) => (
            <div key={i} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 hover:shadow-lg transition flex flex-col">
              <div className="mb-3 flex justify-between items-start">
                <span className="text-xs font-bold text-red-600 uppercase bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">{item.tag}</span>
                <span className="text-xs text-zinc-400">{item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : 'Hoy'}</span>
              </div>
              <h3 className="text-xl font-bold mt-2 mb-3 text-zinc-900 dark:text-white line-clamp-2">{item.title}</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4 line-clamp-3 flex-1">{item.desc}</p>
              <button className="text-red-600 font-bold text-sm hover:underline flex items-center mt-auto">Leer más <ChevronRight className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
