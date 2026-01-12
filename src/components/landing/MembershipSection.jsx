import React, { useState, useEffect } from 'react';
import { UserPlus, CreditCard, Users, CheckCircle } from 'lucide-react';
import { MEMBERSHIP_OPTIONS } from '../../utils/constants';
import { doc, getDoc } from 'firebase/firestore';
import { db, appId } from '../../firebase';

const MEMBERSHIP_ICONS = {
  '1': UserPlus,
  '2': CreditCard,
  '3': Users
};

export default function MembershipSection() {
  const [memberships, setMemberships] = useState(MEMBERSHIP_OPTIONS);

  useEffect(() => {
    const loadMemberships = async () => {
      try {
        const docRef = doc(db, `artifacts/${appId}/public/data/config`, 'memberships');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.memberships && Array.isArray(data.memberships)) {
            setMemberships(data.memberships);
          }
        }
      } catch (error) {
        console.error('Error loading memberships:', error);
      }
    };
    loadMemberships();
  }, []);

  return (
    <section id="hazte-socio" className="py-20 bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white mb-4 flex items-center justify-center">
            <Users className="mr-3 text-red-600" />
            Hazte Socio Milan
          </h2>
          <div className="w-20 h-1 bg-red-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg max-w-2xl mx-auto">
            Únete a nuestra familia y disfruta de beneficios exclusivos mientras apoyas el desarrollo deportivo
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {memberships.map((option) => {
            const IconComponent = MEMBERSHIP_ICONS[option.id] || Users;
            const colorClasses = {
              blue: {
                bg: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
                border: 'border-blue-300 dark:border-blue-700',
                icon: 'text-blue-600',
                button: 'bg-blue-600 hover:bg-blue-700'
              },
              red: {
                bg: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
                border: 'border-red-300 dark:border-red-700',
                icon: 'text-red-600',
                button: 'bg-red-600 hover:bg-red-700'
              },
              green: {
                bg: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
                border: 'border-green-300 dark:border-green-700',
                icon: 'text-green-600',
                button: 'bg-green-600 hover:bg-green-700'
              }
            };

            const colors = colorClasses[option.color];

            return (
              <div
                key={option.id}
                className={`relative bg-gradient-to-br ${colors.bg} rounded-2xl p-8 border-2 ${colors.border} ${
                  option.featured ? 'shadow-2xl scale-105 border-4' : 'shadow-lg'
                } hover:shadow-2xl transition-all duration-300 hover:-translate-y-2`}
              >
                {option.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    Más Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`inline-flex p-4 rounded-full bg-white dark:bg-zinc-900 mb-4`}>
                    <IconComponent className={`h-8 w-8 ${colors.icon}`} />
                  </div>
                  <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">
                    {option.title}
                  </h3>
                  <div className="mb-2">
                    {typeof option.price === 'number' || !isNaN(option.price) ? (
                      <>
                        <span className="text-4xl font-black text-zinc-900 dark:text-white">
                          S/ {option.price}
                        </span>
                        <span className="text-zinc-600 dark:text-zinc-400 text-sm">
                          {option.period && ` / ${option.period}`}
                        </span>
                      </>
                    ) : (
                      <span className="text-2xl font-black text-zinc-900 dark:text-white">
                        {option.price}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {option.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-zinc-700 dark:text-zinc-300">
                      <CheckCircle className={`h-5 w-5 ${colors.icon} flex-shrink-0 mt-0.5`} />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full ${colors.button} text-white font-bold py-3 rounded-lg transition transform hover:scale-105 shadow-lg`}
                  onClick={() => {
                    const message = `Hola, estoy interesado en la membresía ${option.title}`;
                    window.open(`https://wa.me/51989281819?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                >
                  {option.id === '3' ? 'Contactar' : 'Inscribirme'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
