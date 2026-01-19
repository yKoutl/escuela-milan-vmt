import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db, appId } from '../../firebase';

export default function Hero() {
  const [heroImage, setHeroImage] = useState('https://i.postimg.cc/J4R4Hyc0/imagen-milan-fondo-principal.png');

  useEffect(() => {
    loadHeroImage();
  }, []);

  const loadHeroImage = async () => {
    try {
      const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'siteConfig', 'images');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().heroImage) {
        setHeroImage(docSnap.data().heroImage);
      }
    } catch (error) {
      console.error('Error al cargar imagen del hero:', error);
    }
  };

  return (
    // 1. Fondo base: Gris muy claro en día, Oscuro en noche
    <div className="relative bg-zinc-50 dark:bg-zinc-900 h-[600px] flex items-center overflow-hidden transition-colors duration-300">
      
      {/* Imagen de fondo */}
<div className="absolute inset-0 opacity-120 dark:opacity-80 transition-opacity duration-300">        <img 
          src={heroImage} 
          className="w-full h-full object-cover" 
          alt="Soccer background"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1517466787929-bc90951d0974';
          }}
        />
      </div>

      {/* 2. Gradiente superpuesto: 
          - Día: Se difumina desde blanco/gris claro hacia transparente
          - Noche: Se difumina desde negro hacia transparente
      */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-50 via-zinc-5/30 to-transparent dark:from-black dark:via-black/70 dark:to-transparent transition-colors duration-300"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="max-w-2xl animate-fade-in-up">
          
          <span className="inline-block py-1 px-3 rounded-full bg-red-600 text-white text-sm font-bold tracking-wider mb-4 uppercase shadow-md">
            Liga Amateur 1.ª División SJM
          </span>
          
          {/* 3. Título: Texto oscuro en día, Blanco en noche */}
          <h1 className="text-5xl md:text-7xl font-black text-zinc-900 dark:text-white leading-tight mb-6 transition-colors duration-300">
            FORMANDO <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400">
              FUTUROS CAMPEONES
            </span>
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => document.getElementById('matricula')?.scrollIntoView({behavior: 'smooth'})} 
              className="bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition transform hover:scale-105 shadow-[0_0_20px_rgba(220,38,38,0.5)] flex justify-center items-center"
            >
              Inscríbete Ahora <ArrowRight className="ml-2" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}