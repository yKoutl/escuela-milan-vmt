import React, { useState, useEffect } from 'react';
import { Users, Star, Trophy } from 'lucide-react';
import { DEFAULT_SPONSORS } from '../../utils/constants';
import { doc, getDoc } from 'firebase/firestore';
import { db, appId } from '../../firebase';

export default function Sponsors({ sponsors }) {
  const [configSponsors, setConfigSponsors] = useState([]);

  useEffect(() => {
    const loadSponsors = async () => {
      try {
        const docRef = doc(db, `artifacts/${appId}/public/data/config`, 'sponsors');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.sponsors && Array.isArray(data.sponsors)) {
            setConfigSponsors(data.sponsors);
          }
        }
      } catch (error) {
        console.error('Error loading sponsors:', error);
      }
    };
    loadSponsors();
  }, []);

  const displaySponsors = (sponsors && sponsors.length > 0) 
    ? sponsors.filter(s => s.visible !== false).slice(0, 3)
    : (configSponsors.length > 0 ? configSponsors.filter(s => s.visible !== false) : DEFAULT_SPONSORS);

  const getTierIcon = (tier) => {
    switch(tier) {
      case 'gold': return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'silver': return <Star className="h-5 w-5 text-zinc-400" />;
      case 'bronze': return <Star className="h-5 w-5 text-orange-600" />;
      default: return <Users className="h-5 w-5 text-red-600" />;
    }
  };

  const getTierBg = (tier) => {
    switch(tier) {
      case 'gold': return 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-300 dark:border-yellow-700';
      case 'silver': return 'from-zinc-50 to-zinc-100 dark:from-zinc-800/50 dark:to-zinc-700/50 border-zinc-300 dark:border-zinc-600';
      case 'bronze': return 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-300 dark:border-orange-700';
      default: return 'from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 border-zinc-300 dark:border-zinc-700';
    }
  };

  return (
    <section id="auspiciadores" className="py-20 bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white mb-4 flex items-center justify-center">
            <Trophy className="mr-3 text-red-600" />
            Nuestros Auspiciadores
          </h2>
          <div className="w-20 h-1 bg-red-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">
            Empresas que confían y apoyan nuestra misión deportiva
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {displaySponsors.map((sponsor) => (
            <div
              key={sponsor.id}
              className={`bg-gradient-to-br ${getTierBg(sponsor.tier)} rounded-2xl p-8 border-2 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group`}
            >
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-white dark:bg-zinc-900 rounded-full p-4 mb-4 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/200x200/red/white?text=' + sponsor.name.substring(0, 1);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {getTierIcon(sponsor.tier)}
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white text-center">
                    {sponsor.name}
                  </h3>
                </div>
                {sponsor.description && (
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
                    {sponsor.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
