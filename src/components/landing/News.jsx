import React, { useState } from 'react';
import { ChevronRight, Newspaper, Heart } from 'lucide-react';
import { DEFAULT_NEWS } from '../../utils/constants';
import NewsModal from '../../shared/NewsModal';

export default function News({ news }) {
  const [selectedNews, setSelectedNews] = useState(null);
  
  const sourceData = news.length > 0 ? news : DEFAULT_NEWS;
  const displayData = sourceData
    .filter(item => item.visible !== false)
    .slice(0, 3);

  return (
    <>
      <section className="py-20 bg-white dark:bg-zinc-950 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-zinc-900 dark:text-white mb-10 flex items-center justify-between">
            <span className="flex items-center">
              <Newspaper className="mr-3 text-red-600" /> Últimas Noticias
            </span>
            {sourceData.length > 3 && (
              <span className="text-xs font-normal text-zinc-500">
                Ver todas ({sourceData.length})
              </span>
            )}
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayData.map((item, i) => (
              <div 
                key={item.id || i} 
                className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-red-600 transition-all duration-300 flex flex-col group"
              >
                
                {/* Imagen SIEMPRE visible */}
                <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">

                  {item.img ? (
                    <img 
                      src={item.img} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper className="w-16 h-16 text-gray-400" />
                    </div>
                  )}

                  {/* Tag SOLO si existe */}
                  {item.tag && (
                    <div className="absolute top-4 left-4">
                      <span className="text-xs font-bold text-white uppercase bg-red-600 px-3 py-1.5 rounded-full shadow-lg">
                        {item.tag}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="mb-3 flex justify-between items-center">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      {item.createdAt?.seconds 
                        ? new Date(item.createdAt.seconds * 1000).toLocaleDateString(
                            'es-ES', { day: 'numeric', month: 'short' }
                          )
                        : 'Hoy'}
                    </span>

                    <div className="flex items-center gap-1.5 text-red-600">
                      <Heart className="h-4 w-4 fill-current" />
                      <span className="text-sm font-bold">{item.likes || 0}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-black mt-2 mb-3 text-zinc-900 dark:text-white line-clamp-2 group-hover:text-red-600 transition">
                    {item.title}
                  </h3>
                  
                  <p className="text-zinc-600 dark:text-zinc-400 text-sm mb-4 line-clamp-3 flex-1 leading-relaxed">
                    {item.desc}
                  </p>
                  
                  <button 
                    onClick={() => setSelectedNews(item)}
                    className="text-red-600 font-bold text-sm hover:gap-2 flex items-center mt-auto transition-all group-hover:underline"
                  >
                    Leer más 
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      <NewsModal 
        news={selectedNews} 
        isOpen={!!selectedNews} 
        onClose={() => setSelectedNews(null)} 
      />
    </>
  );
}
