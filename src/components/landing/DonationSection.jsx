import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { DONATION_METHODS } from '../../utils/constants';
import { doc, getDoc } from 'firebase/firestore';
import { db, appId } from '../../firebase';

export default function DonationSection() {
  const [methods, setMethods] = useState(DONATION_METHODS);

  useEffect(() => {
    const loadDonationConfig = async () => {
      try {
        const docRef = doc(db, `artifacts/${appId}/public/data/config`, 'donations');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          if (data.methods && Array.isArray(data.methods)) {
            setMethods(data.methods);
          }
        }
      } catch (error) {
        console.error('Error loading donation config:', error);
      }
    };

    loadDonationConfig();
  }, []);

  return (
    <section id="donaciones" className="py-20 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white flex justify-center items-center">
            <Heart className="mr-3 text-red-600" />
            Apoya Nuestra Misión
          </h2>
          <div className="w-20 h-1 bg-red-600 mx-auto my-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
            Tu donación ayuda a formar futuros campeones. Escanea el código QR.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {methods.map((method) => (
            <div
              key={method.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-8 border-2 border-red-200 dark:border-red-900 hover:border-red-400 dark:hover:border-red-600 transition-all duration-300 hover:scale-105"
            >
              <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 mb-6 flex justify-center">
                <img
                  src={method.logo}
                  alt={method.name}
                  className="h-16 object-contain"
                />
              </div>

              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-xl shadow-lg">
                  <img
                    src={method.qrImage}
                    alt={`QR ${method.name}`}
                    className="w-48 h-48 object-contain"
                    onError={(e) => {
                      e.target.src =
                        method.id === 'yape'
                          ? 'https://i.postimg.cc/MpqQnPkM/QRYAPE.png'
                          : 'https://i.postimg.cc/MpqQnPkx/QRPLIN.png';
                    }}
                  />
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
                <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Número de teléfono</p>
                <p className="text-xl font-black text-red-600 dark:text-red-500">{method.phone}</p>
              </div>

              <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 mt-4">
                Escanea el código o busca el número en {method.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
