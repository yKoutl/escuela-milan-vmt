import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db, appId } from '../firebase';
import FloatingAnnouncementButton from './FloatingAnnouncementButton';

const FALLBACK_IMAGE = 'https://i.postimg.cc/RFvr2M9p/aviso-miln.jpg';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(true); // SIEMPRE ABIERTO AL INICIO
  const [announcementImage, setAnnouncementImage] = useState(FALLBACK_IMAGE);
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  console.log('🎯 [WelcomeModal] RENDERIZANDO - isOpen:', isOpen, 'showFloatingButton:', showFloatingButton);

  useEffect(() => {
    console.log('🔍 [WelcomeModal] INICIANDO - Modal ABIERTO por defecto');
    
    // Cargar imagen en segundo plano
    const loadImage = async () => {
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'siteConfig', 'images');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.announcementImage) {
            console.log('✅ [WelcomeModal] Imagen cargada:', data.announcementImage);
            setAnnouncementImage(data.announcementImage);
          }
        }
      } catch (error) {
        console.error('❌ [WelcomeModal] Error:', error);
      }
    };
    
    loadImage();
  }, []);

  const handleClose = () => {
    console.log('🔒 [WelcomeModal] Cerrando modal');
    setIsOpen(false);
    setShowFloatingButton(true);
  };

  const handleOpenFromButton = () => {
    console.log('🔓 [WelcomeModal] Abriendo modal desde botón flotante');
    setIsOpen(true);
    setShowFloatingButton(false);
  };

  return (
    <>
      {/* Modal */}
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
                src={announcementImage}
                alt="Anuncio importante"
                className="w-full h-auto max-h-[80vh] object-contain"
                onError={(e) => {
                  console.warn('⚠️ [WelcomeModal] Error al cargar imagen, usando fallback');
                  e.target.src = FALLBACK_IMAGE;
                }}
              />
            </div>

            {/* Footer con botón */}
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
      {showFloatingButton && (
        <FloatingAnnouncementButton onClick={handleOpenFromButton} />
      )}
    </>
  );
}
