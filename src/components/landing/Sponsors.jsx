import React, { useState, useEffect } from 'react';
import { Trophy, X, MessageCircle, Shield, Handshake } from 'lucide-react';
import { DEFAULT_SPONSORS } from '../../utils/constants';
import { doc, getDoc } from 'firebase/firestore';
import { db, appId } from '../../firebase';

// Solo configuración visual (Colores e Iconos) - SIN TEXTOS
const TIER_STYLES = {
  gold: {
    icon: Trophy,
    color: 'text-red-600',
    borderColor: 'border-red-600',
    bgBadge: 'bg-red-600/10',
    cardGradient: 'from-zinc-900 to-black',
    shadow: 'shadow-red-900/40'
  },
  silver: {
    icon: Shield,
    color: 'text-white',
    borderColor: 'border-white',
    bgBadge: 'bg-white/10',
    cardGradient: 'from-zinc-800 to-zinc-900',
    shadow: 'shadow-white/10'
  },
  bronze: {
    icon: Handshake,
    color: 'text-zinc-500',
    borderColor: 'border-zinc-700',
    bgBadge: 'bg-zinc-800',
    cardGradient: 'from-black to-zinc-950',
    shadow: 'shadow-zinc-900/50'
  }
};

export default function Sponsors({ sponsors }) {
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

  // Usamos los datos que vienen de Props, DB o Constants
  const displaySponsors = (sponsors && sponsors.length > 0) 
    ? sponsors.filter(s => s.visible !== false)
    : (configSponsors.length > 0 ? configSponsors.filter(s => s.visible !== false) : DEFAULT_SPONSORS);

  // Helper para estilos seguros
  const getStyle = (tier) => TIER_STYLES[tier] || TIER_STYLES.bronze;

  return (
    <>
      <section 
        id="auspiciadores" 
        className="py-20 bg-black relative overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(220, 38, 38, 0.15) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 flex items-center justify-center">
              <Trophy className="mr-3 text-red-600" />
              Nuestros Auspiciadores
            </h2>
            <div className="w-20 h-1 bg-red-600 mx-auto mb-4"></div>
            <p className="text-zinc-400 text-lg mb-8">
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
                  {/* Badge (Nombre del Tier tomado de la data) */}
                  <div className={`${style.bgBadge} ${style.color} px-4 py-2 rounded-full mb-6 flex items-center gap-2 border border-white/5`}>
                    <Icon className="h-4 w-4" />
                    <span className="font-bold text-sm tracking-wide uppercase">{sponsor.name}</span>
                  </div>

                  {/* Logo */}
                  <div className="w-40 h-40 bg-white rounded-full p-6 mb-6 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <img
                      src={sponsor.logo}
                      alt={sponsor.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/200x200/ef4444/white?text=' + sponsor.name.substring(0, 1);
                      }}
                    />
                  </div>

                  {/* Nombre del Sponsor */}
                  <h3 className="text-xl font-bold text-white text-center">
                    {sponsor.name}
                  </h3>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105 shadow-lg shadow-red-900/40 inline-flex items-center gap-3 border border-red-500"
            >
              <Trophy className="h-6 w-6" />
              Conviértete en Sponsor
            </button>
          </div>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 rounded-2xl border border-zinc-800 max-w-6xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            
            <div className="sticky top-0 bg-zinc-900/95 backdrop-blur border-b border-zinc-800 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-red-600" />
                <h3 className="text-xl md:text-2xl font-black text-white">Paquetes de Auspicio</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-white transition p-2 hover:bg-zinc-800 rounded-full"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              <div className="bg-zinc-800 rounded-xl p-6 text-center border border-zinc-700 shadow-lg relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-black/20 pointer-events-none"></div>
                <div className="relative z-10">
                    <MessageCircle className="h-10 w-10 text-white mx-auto mb-3" />
                    <h4 className="text-xl font-bold text-white mb-2">
                      ¿Interesado en potenciar tu marca con nosotros?
                    </h4>
                    <p className="text-zinc-300 mb-6 text-sm md:text-base">
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

              {/* Grid del Modal: Aquí mostramos la DESCRIPCIÓN que viene de la data */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displaySponsors.map((sponsor) => {
                  const style = getStyle(sponsor.tier);
                  const Icon = style.icon;

                  return (
                    <div key={sponsor.id} className={`relative bg-zinc-900 rounded-xl border-2 ${style.borderColor} p-6 flex flex-col h-full hover:bg-zinc-800/80 transition-colors shadow-xl ${style.shadow}`}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className={`p-3 rounded-lg ${style.bgBadge}`}>
                            <Icon className={`h-8 w-8 ${style.color}`} />
                        </div>
                        <h5 className={`text-xl font-black ${style.color} uppercase leading-tight`}>
                            {sponsor.name}
                        </h5>
                      </div>
                      
                      <div className="flex-1">
                        {/* Renderizamos la descripción respetando los saltos de línea */}
                        <div className="text-zinc-300 text-sm whitespace-pre-line leading-relaxed">
                            {sponsor.description || "Contáctanos para conocer los beneficios."}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-black/40 rounded-lg p-4 text-center border border-zinc-800">
                <p className="text-zinc-500 text-sm">
                  💼 <strong className="text-zinc-300">Inversión flexible</strong> ajustada a la categoría y duración del contrato publicitario.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}