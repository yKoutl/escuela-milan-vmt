import React, { useState, useEffect } from 'react';
import { Banknote, Sparkles } from 'lucide-react';
import { PACKAGES } from '../../utils/constants';
import { doc, getDoc } from 'firebase/firestore';
import { db, appId } from '../../firebase';

export default function PricingSection() {
  const [pricing, setPricing] = useState({
    inscriptionPrice: 30,
    monthlyPrice: 150,
    packages: PACKAGES
  });

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const docRef = doc(db, `artifacts/${appId}/public/data/config`, 'pricing');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPricing({
            inscriptionPrice: data.inscriptionPrice || 30,
            monthlyPrice: data.monthlyPrice || 150,
            packages: data.packages || PACKAGES
          });
        }
      } catch (error) {
        console.error('Error loading pricing:', error);
      }
    };
    loadPricing();
  }, []);

  return (
    <section id="mensualidad" className="py-20 bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white mb-4 flex items-center justify-center">
            <Banknote className="mr-3 text-red-600" />
            Costos e Inscripción
          </h2>
          <div className="w-20 h-1 bg-red-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">
            Planes flexibles para que tu hijo forme parte de la familia Milan
          </p>
        </div>

        {/* Costos básicos */}
        <div className="grid md:grid-cols-2 gap-6 mb-12 max-w-3xl mx-auto">
          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-8 text-center shadow-lg">
            <div className="text-red-600 text-sm font-bold uppercase mb-2">Único pago</div>
            <h3 className="text-4xl font-black text-zinc-900 dark:text-white mb-2">S/ {pricing.inscriptionPrice}</h3>
            <p className="text-zinc-700 dark:text-zinc-300 font-medium">Inscripción</p>
          </div>
          
          <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 border-2 border-zinc-200 dark:border-zinc-700 rounded-xl p-8 text-center shadow-lg">
            <div className="text-zinc-600 dark:text-zinc-400 text-sm font-bold uppercase mb-2">Mensual</div>
            <h3 className="text-4xl font-black text-zinc-900 dark:text-white mb-2">S/ {pricing.monthlyPrice}</h3>
            <p className="text-zinc-700 dark:text-zinc-300 font-medium">Mensualidad</p>
          </div>
        </div>

        {/* Paquetes promocionales */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 px-4 py-2 rounded-full font-bold text-sm border-2 border-yellow-400 dark:border-yellow-600">
            <Sparkles className="h-4 w-4 mr-2" />
            PROMOCIONES ESPECIALES
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {pricing.packages.map((pkg, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl p-8 transition-all duration-300 hover:scale-105 ${
                pkg.featured
                  ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-2xl shadow-red-600/50 border-4 border-yellow-400'
                  : 'bg-white dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 shadow-lg'
              }`}
            >
              {pkg.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-red-900 px-4 py-1 rounded-full text-xs font-black uppercase shadow-lg">
                  Más Popular
                </div>
              )}
              
              {pkg.discount && !pkg.featured && (
                <div className="absolute -top-3 -right-3 bg-green-500 text-white rounded-full w-16 h-16 flex items-center justify-center text-xs font-bold shadow-lg rotate-12">
                  AHORRO
                </div>
              )}

              <div className="text-center">
                <h3 className={`text-2xl font-black mb-4 ${pkg.featured ? 'text-white' : 'text-zinc-900 dark:text-white'}`}>
                  {pkg.months}
                </h3>
                <div className="mb-6">
                  <span className={`text-sm ${pkg.featured ? 'text-white/80' : 'text-zinc-500'}`}>S/</span>
                  <span className={`text-5xl font-black ${pkg.featured ? 'text-white' : 'text-red-600'}`}>
                    {pkg.price}
                  </span>
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className={`flex items-center justify-center gap-2 ${pkg.featured ? 'text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>
                    <span className={`w-2 h-2 rounded-full ${pkg.featured ? 'bg-white' : 'bg-red-600'}`}></span>
                    5 días de entrenamiento
                  </li>
                  <li className={`flex items-center justify-center gap-2 ${pkg.featured ? 'text-white' : 'text-zinc-700 dark:text-zinc-300'}`}>
                    <span className={`w-2 h-2 rounded-full ${pkg.featured ? 'bg-white' : 'bg-red-600'}`}></span>
                    Material deportivo incluido
                  </li>
                  {pkg.discount && (
                    <li className={`flex items-center justify-center gap-2 font-bold ${pkg.featured ? 'text-yellow-300' : 'text-green-600 dark:text-green-400'}`}>
                      <Sparkles className="h-4 w-4" />
                      Precio promocional
                    </li>
                  )}
                </ul>

                <button
                  onClick={() => document.getElementById('matricula')?.scrollIntoView({behavior: 'smooth'})}
                  className={`w-full py-3 rounded-lg font-bold transition transform hover:scale-105 ${
                    pkg.featured
                      ? 'bg-white text-red-600 hover:bg-zinc-100 shadow-lg'
                      : 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800'
                  }`}
                >
                  Inscribirme Ahora
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Nota adicional */}
        <div className="mt-12 text-center">
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            💳 Aceptamos pagos en efectivo, transferencia bancaria y Yape
          </p>
          <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-2">
            * Los precios incluyen entrenamiento de lunes a viernes según categoría
          </p>
        </div>
      </div>
    </section>
  );
}
