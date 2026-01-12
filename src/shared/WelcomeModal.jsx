import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db, appId } from '../firebase';
import FloatingAnnouncementButton from './FloatingAnnouncementButton';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [announcementData, setAnnouncementData] = useState(null);
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  const loadAnnouncementData = async () => {
    try {
      // Verificar si ya vio el anuncio en esta sesión
      const seen = sessionStorage.getItem('hasSeenAnnouncement');
      
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
          
          if (!seen) {
            setIsOpen(true);
          } else {
            setHasSeenAnnouncement(true);
            setShowFloatingButton(true); // Mostrar botón flotante si ya vio el modal
          }
        } else if (data.announcementEnabled && !data.announcementImage) {
          // Si está habilitado pero no hay imagen, usar imagen por defecto
          setAnnouncementData({
            image: 'https://i.postimg.cc/RFvr2M9p/aviso-miln.jpg',
            enabled: true
          });
          
          if (!seen) {
            setIsOpen(true);
          } else {
            setHasSeenAnnouncement(true);
            setShowFloatingButton(true);
          }
        }
      } else {
        // Si no existe el documento, usar imagen por defecto
        const seen = sessionStorage.getItem('hasSeenAnnouncement');
        setAnnouncementData({
          image: 'https://i.postimg.cc/RFvr2M9p/aviso-miln.jpg',
          enabled: true
        });
        
        if (!seen) {
          setIsOpen(true);
        } else {
          setShowFloatingButton(true);
        }
      }
    } catch (error) {
      console.error('Error al cargar anuncio:', error);
      // En caso de error, mostrar imagen por defecto
      const seen = sessionStorage.getItem('hasSeenAnnouncement');
      setAnnouncementData({
        image: 'https://i.postimg.cc/RFvr2M9p/aviso-miln.jpg',
        enabled: true
      });
      
      if (!seen) {
        setIsOpen(true);
      } else {
        setShowFloatingButton(true);
      }
    }
  };

  useEffect(() => {
    loadAnnouncementData();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenAnnouncement', 'true');
    setShowFloatingButton(true);
  };

  const handleOpenFromButton = () => {
    setIsOpen(true);
    setShowFloatingButton(false);
  };

  if (!announcementData) {
    return null;
  }

  return (
    <>
      {/* Modal principal */}
      {isOpen && (
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
                  e.target.src = 'https://i.postimg.cc/RFvr2M9p/aviso-miln.jpg';
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
      )}

      {/* Botón flotante */}
      {showFloatingButton && announcementData && (
        <FloatingAnnouncementButton onClick={handleOpenFromButton} />
      )}
    </>
  );
}
