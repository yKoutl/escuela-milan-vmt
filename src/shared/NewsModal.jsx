import React, { useState, useEffect } from 'react';
import { X, Heart, Calendar, Share2 } from 'lucide-react';
import { doc, updateDoc, increment } from 'firebase/firestore'; // Importamos increment
import { db, appId } from '../firebase';

export default function NewsModal({ news, isOpen, onClose }) {
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (news) {
      // 1. Sincronizar estado visual con la data de la noticia
      setLikes(news.likes || 0);

      // 2. Verificar si el usuario ya dio like (usando localStorage del navegador)
      const likedNews = JSON.parse(localStorage.getItem('likedNews') || '[]');
      setHasLiked(likedNews.includes(news.id));
    }
  }, [news]);

  const handleLike = async () => {
    if (!news?.id || isLiking) return;

    // Evitar errores con noticias de ejemplo (IDs '1', '2') que no existen en Firebase
    if (['1', '2'].includes(news.id) && !news.createdAt) {
      console.warn("No se pueden guardar likes en noticias de ejemplo.");
      return;
    }

    setIsLiking(true);
    try {
      // REFERENCIA CORREGIDA: Apunta al documento específico en la colección 'news'
      const newsRef = doc(db, 'artifacts', appId, 'public', 'data', 'news', news.id);

      if (hasLiked) {
        // --- QUITAR LIKE ---
        // 1. Actualizar Firebase (restar 1)
        await updateDoc(newsRef, { likes: increment(-1) });

        // 2. Actualizar estado local (visual)
        setLikes(prev => Math.max(0, prev - 1));
        setHasLiked(false);

        // 3. Actualizar localStorage
        const likedNews = JSON.parse(localStorage.getItem('likedNews') || '[]');
        localStorage.setItem('likedNews', JSON.stringify(likedNews.filter(id => id !== news.id)));

      } else {
        // --- DAR LIKE ---
        // 1. Actualizar Firebase (sumar 1)
        await updateDoc(newsRef, { likes: increment(1) });

        // 2. Actualizar estado local (visual)
        setLikes(prev => prev + 1);
        setHasLiked(true);

        // 3. Actualizar localStorage
        const likedNews = JSON.parse(localStorage.getItem('likedNews') || '[]');
        localStorage.setItem('likedNews', JSON.stringify([...likedNews, news.id]));
      }

    } catch (error) {
      console.error('Error al actualizar like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  // Función para compartir (Ahora soporta Imagen Real)
  const handleShare = async () => {
    if (!news || isSharing) return;
    setIsSharing(true);

    try {
      const shareData = {
        title: news.title,
        text: `${news.title}\n\n${news.desc || ''}`,
      };

      let fileShared = false;

      // Intentar obtener la imagen como archivo real (Blob)
      if (news.img) {
        try {
          const response = await fetch(news.img);
          const blob = await response.blob();

          // Crear archivo con nombre limpio y extensión correcta
          const file = new File([blob], 'milan_news.jpg', { type: blob.type });

          // Verificar soporte
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            shareData.files = [file];
            fileShared = true;
          }
        } catch (error) {
          // Fallo silencioso del fetch (CORS o error red), se usará link
        }
      }

      const SHARE_URL = 'https://escuela-milan-vmt.vercel.app/';
      const MORE_INFO_TEXT = `\n\n📢 Más información aquí: ${SHARE_URL}`;

      if (fileShared) {
        shareData.text += MORE_INFO_TEXT;
      } else {
        shareData.text += MORE_INFO_TEXT;
        shareData.url = SHARE_URL;
      }

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback Portapapeles
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}`);
        alert('Enlace copiado al portapapeles');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        // Solo alertar errores reales, no cancelaciones
      }
    } finally {
      setIsSharing(false);
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
              {/* Mostramos el estado 'likes' local que se actualiza al instante */}
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

          {/* Botones de acción */}
          <div className="flex gap-3">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex-1 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 ${hasLiked
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white'
                } disabled:opacity-50`}
            >
              <Heart className={`h-5 w-5 ${hasLiked ? 'fill-current' : ''}`} />
              {isLiking ? '...' : hasLiked ? 'Te gusta' : 'Me gusta'}
            </button>

            <button
              onClick={handleShare}
              disabled={isSharing}
              className="px-6 py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white disabled:opacity-50"
            >
              <Share2 className="h-5 w-5" />
              {isSharing ? '...' : 'Compartir'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}