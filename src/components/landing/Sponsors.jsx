import React, { useState, useEffect } from 'react';
import { Trophy, X, MessageCircle, Shield, Handshake } from 'lucide-react';
import { DEFAULT_SPONSORS } from '../../utils/constants';
import { doc, getDoc } from 'firebase/firestore';
import { db, appId } from '../../firebase';

// ELIMINADO: import { useTheme } ... no hace falta.

// Configuración visual adaptada para Light (Día) y Dark (Noche)
const TIER_STYLES = {
  gold: {
    icon: Trophy,
    color: 'text-red-700 dark:text-red-500', 
    borderColor: 'border-red-200 dark:border-red-900',
    bgBadge: 'bg-red-100 dark:bg-red-900/20',
    cardGradient: 'from-orange-50 to-white dark:from-zinc-900 dark:to-black',
    shadow: 'shadow-red-200/50 dark:shadow-red-900/40'
  },
  silver: {
    icon: Shield,
    color: 'text-zinc-700 dark:text-white',
    borderColor: 'border-zinc-200 dark:border-zinc-700',
    bgBadge: 'bg-zinc-100 dark:bg-white/10',
    cardGradient: 'from-zinc-50 to-white dark:from-zinc-800 dark:to-zinc-900',
    shadow: 'shadow-zinc-200/50 dark:shadow-white/10'
  },
  bronze: {
    icon: Handshake,
    color: 'text-zinc-600 dark:text-zinc-400',
    borderColor: 'border-zinc-200 dark:border-zinc-800',
    bgBadge: 'bg-zinc-100 dark:bg-zinc-800',
    cardGradient: 'from-zinc-100 to-zinc-50 dark:from-black dark:to-zinc-950',
    shadow: 'shadow-zinc-300/50 dark:shadow-zinc-900/50'
  }
};

export default function Sponsors({ sponsors }) {
  // ELIMINADO: const { isDarkMode } = useTheme(); 
  
  const [configSponsors, setConfigSponsors] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadSponsors = async () => {
      try {
        const docRef = doc(db, `artifacts/${appId}/public/data/config`, 'sponsors');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const items = data.items || data.sponsors;
          if (items && Array.isArray(items)) {
            setConfigSponsors(items);
          }
        }
      } catch (error) {
        console.error('Error loading sponsors:', error);
      }
    };
    loadSponsors();
  }, []);

  const displaySponsors = (sponsors && sponsors.length > 0) 
    ? sponsors.filter(s => s.visible !== false)
    : (configSponsors.length > 0 ? configSponsors.filter(s => s.visible !== false) : DEFAULT_SPONSORS);

  const getStyle = (tier) => TIER_STYLES[tier] || TIER_STYLES.bronze;

  return (
    <>
      <section 
        id="auspiciadores" 
        className="py-20 bg-zinc-50 dark:bg-black relative overflow-hidden transition-colors duration-300"
      >
        {/* Patrón de fondo (puntos rojos) */}
        <div 
          className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, #dc2626 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white mb-4 flex items-center justify-center transition-colors">
              <Trophy className="mr-3 text-red-600" />
              Nuestros Auspiciadores
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-4"></div>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-8 transition-colors">
              Empresas que confían y apoyan nuestra misión deportiva
            </p>
          </div>

          {/* Grid Principal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {displaySponsors.slice(0, 3).map((sponsor) => {
              const style = getStyle(sponsor.tier);
              const Icon = style.icon;

              return (
                <div
                  key={sponsor.id}
                  className={`relative rounded-2xl p-8 border-2 ${style.borderColor} bg-gradient-to-b ${style.cardGradient} hover:scale-105 transition-all duration-300 group shadow-2xl ${style.shadow} flex flex-col items-center justify-center`}
                >
                  {/* Badge de Nivel */}
                  <div className={`${style.bgBadge} ${style.color} px-4 py-2 rounded-full mb-6 flex items-center gap-2 border border-black/5 dark:border-white/5`}>
                    <Icon className="h-4 w-4" />
                    <span className="font-bold text-sm tracking-wide uppercase">{sponsor.name}</span>
                  </div>

                  {/* --- LOGO CIRCULAR --- */}
                  <div className="relative mb-6">
                    <div className="relative group w-40 h-40 mx-auto">
                        <img
                            src={sponsor.logo}
                            alt={sponsor.name}
                            className="w-full h-full object-cover rounded-full shadow-md border-4 border-white dark:border-zinc-700 cursor-pointer transition-transform group-hover:scale-105 bg-white"
                            onError={(e) => {
                                e.target.src = 'https://placehold.co/200x200/ef4444/white?text=' + sponsor.name.substring(0, 1);
                            }}
                        />
                    </div>
                  </div>

                  {/* Nombre del Sponsor */}
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white text-center transition-colors">
                    {sponsor.name}
                  </h3>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg shadow-red-600/30 dark:shadow-red-900/40 inline-flex items-center gap-3 border border-red-500"
            >
              <Trophy className="h-6 w-6" />
              Conviértete en Sponsor
            </button>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 dark:bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl transition-colors duration-300">
            
            {/* Cabecera del Modal */}
            <div className="sticky top-0 bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-red-600" />
                <h3 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white">Paquetes de Auspicio</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-white transition p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {/* Banner de Contacto */}
              <div className="bg-gradient-to-br from-zinc-100 to-white dark:from-zinc-800 dark:to-zinc-900 rounded-xl p-6 text-center border border-zinc-200 dark:border-zinc-700 shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-100/50 to-transparent dark:from-red-900/20 dark:to-black/20 pointer-events-none"></div>
                <div className="relative z-10">
                    <MessageCircle className="h-10 w-10 text-red-600 dark:text-white mx-auto mb-3" />
                    <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                      ¿Interesado en potenciar tu marca con nosotros?
                    </h4>
                    <p className="text-zinc-600 dark:text-zinc-300 mb-6 text-sm md:text-base">
                      Contáctanos directamente y te enviaremos una propuesta personalizada.
                    </p>
                    <a
                      href="https://wa.me/51989281819?text=Hola,%20estoy%20interesado%20en%20ser%20sponsor%20de%20la%20Escuela%20Milan"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-red-600 text-white font-bold px-6 py-3 rounded-full hover:bg-red-700 transition transform hover:-translate-y-1 shadow-md"
                    >
                      <MessageCircle className="h-5 w-5" />
                      Contactar por WhatsApp
                    </a>
                </div>
              </div>

              {/* Grid del Modal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displaySponsors.map((sponsor) => {
                  const style = getStyle(sponsor.tier);
                  const Icon = style.icon;

                  return (
                    <div key={sponsor.id} className={`relative bg-white dark:bg-zinc-900 rounded-xl border-2 ${style.borderColor} p-6 flex flex-col h-full hover:shadow-xl transition-all shadow-sm`}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className={`p-3 rounded-lg ${style.bgBadge}`}>
                            <Icon className={`h-8 w-8 ${style.color}`} />
                        </div>
                        <h5 className={`text-xl font-black uppercase leading-tight ${style.color.split(' ')[0]}`}>
                            {sponsor.name}
                        </h5>
                      </div>
                      
                      <div className="flex-1">
                        <div className="text-zinc-600 dark:text-zinc-300 text-sm whitespace-pre-line leading-relaxed">
                            {sponsor.description || "Contáctanos para conocer los beneficios."}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-zinc-50 dark:bg-black/40 rounded-lg p-4 text-center border border-zinc-200 dark:border-zinc-800">
                <p className="text-zinc-500 text-sm">
                  💼 <strong className="text-zinc-700 dark:text-zinc-300">Inversión flexible</strong> ajustada a la categoría y duración del contrato publicitario.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}