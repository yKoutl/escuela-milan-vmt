import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db, appId } from '../firebase';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [announcementData, setAnnouncementData] = useState(null);
  const [hasSeenAnnouncement, setHasSeenAnnouncement] = useState(false);

  useEffect(() => {
    loadAnnouncementData();
  }, []);

  const loadAnnouncementData = async () => {
    try {
      // Verificar si ya vio el anuncio en esta sesión
      const seen = sessionStorage.getItem('hasSeenAnnouncement');
      if (seen) {
        setHasSeenAnnouncement(true);
        return;
      }

      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'siteConfig', 'images');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Verificar si el anuncio está habilitado y tiene imagen
        if (data.announcementEnabled && data.announcementImage) {
          setAnnouncementData({
            image: data.announcementImage,
            enabled: data.announcementEnabled
          });
          setIsOpen(true);
        }
      }
    } catch (error) {
      console.error('Error al cargar anuncio:', error);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenAnnouncement', 'true');
    setHasSeenAnnouncement(true);
  };

  if (!isOpen || !announcementData || hasSeenAnnouncement) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border-4 border-red-600">
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors backdrop-blur-sm"
          aria-label="Cerrar anuncio"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Imagen del anuncio */}
        <div className="relative">
          <img
            src={announcementData.image}
            alt="Anuncio importante"
            className="w-full h-auto max-h-[80vh] object-contain"
            onError={(e) => {
              e.target.src = 'https://placehold.co/800x600/dc2626/ffffff?text=Anuncio+Importante';
            }}
          />
        </div>

        {/* Footer opcional */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700">
          <button
            onClick={handleClose}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
