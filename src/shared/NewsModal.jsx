import React, { useState, useEffect } from 'react';
import { X, Heart, Calendar } from 'lucide-react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, appId } from '../firebase';

export default function NewsModal({ news, isOpen, onClose }) {
  const [likes, setLikes] = useState(news?.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    if (news?.id) {
      // Verificar si el usuario ya dio like (usando localStorage)
      const likedNews = JSON.parse(localStorage.getItem('likedNews') || '[]');
      setHasLiked(likedNews.includes(news.id));
      setLikes(news.likes || 0);
    }
  }, [news]);

  const handleLike = async () => {
    if (!news?.id || isLiking) return;
    
    setIsLiking(true);
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'news');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const allNews = Array.isArray(data) ? data : (data.items || []);
        const newsIndex = allNews.findIndex(n => n.id === news.id);
        
        if (newsIndex !== -1) {
          const updatedNews = [...allNews];
          const currentLikes = updatedNews[newsIndex].likes || 0;
          
          if (hasLiked) {
            // Quitar like
            updatedNews[newsIndex].likes = Math.max(0, currentLikes - 1);
            setLikes(updatedNews[newsIndex].likes);
            setHasLiked(false);
            
            // Actualizar localStorage
            const likedNews = JSON.parse(localStorage.getItem('likedNews') || '[]');
            localStorage.setItem('likedNews', JSON.stringify(likedNews.filter(id => id !== news.id)));
          } else {
            // Dar like
            updatedNews[newsIndex].likes = currentLikes + 1;
            setLikes(updatedNews[newsIndex].likes);
            setHasLiked(true);
            
            // Actualizar localStorage
            const likedNews = JSON.parse(localStorage.getItem('likedNews') || '[]');
            localStorage.setItem('likedNews', JSON.stringify([...likedNews, news.id]));
          }
          
          // Guardar en formato correcto
          await updateDoc(docRef, Array.isArray(data) ? updatedNews : { items: updatedNews });
        }
      }
    } catch (error) {
      console.error('Error al dar like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  if (!isOpen || !news) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors backdrop-blur-sm"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Imagen de la noticia */}
        {news.img && (
          <div className="relative h-64 md:h-80 overflow-hidden rounded-t-2xl">
            <img
              src={news.img}
              alt={news.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <span className="text-xs font-bold text-white uppercase bg-red-600 px-3 py-1 rounded-full">
                {news.tag}
              </span>
            </div>
          </div>
        )}

        {/* Contenido */}
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white">
              {news.title}
            </h2>
          </div>

          <div className="flex items-center gap-4 mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {news.createdAt?.seconds 
                  ? new Date(news.createdAt.seconds * 1000).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : 'Hoy'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className={`h-4 w-4 ${hasLiked ? 'fill-red-600 text-red-600' : ''}`} />
              <span>{likes} me gusta</span>
            </div>
          </div>

          <div className="prose prose-zinc dark:prose-invert max-w-none mb-6">
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-base">
              {news.desc}
            </p>
            {news.fullContent && (
              <div className="mt-4 text-zinc-600 dark:text-zinc-400">
                {news.fullContent}
              </div>
            )}
          </div>

          {/* Botón de me gusta */}
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`w-full py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
              hasLiked
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white'
            } disabled:opacity-50`}
          >
            <Heart className={`h-5 w-5 ${hasLiked ? 'fill-current' : ''}`} />
            {isLiking ? 'Cargando...' : hasLiked ? 'Te gusta' : 'Me gusta'}
          </button>
        </div>
      </div>
    </div>
  );
}
