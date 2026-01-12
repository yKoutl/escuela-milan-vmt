import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { DEFAULT_SCHEDULE, FIELD_LOCATION, WHATSAPP_NUMBER } from '../../utils/constants';

export default function Schedule({ schedules = [] }) {
  const sourceData = schedules.length > 0 ? schedules : DEFAULT_SCHEDULE;
  const displayData = sourceData.filter(item => item.visible !== false);
  
  return (
    <section id="horarios" className="py-20 bg-zinc-50 dark:bg-zinc-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white mb-4 flex items-center justify-center">
            <Calendar className="mr-3 text-red-600" />
            Horarios de Entrenamiento
          </h2>
          <div className="w-20 h-1 bg-red-600 mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">
            Entrenamientos diferenciados por edad para garantizar el correcto desarrollo
          </p>
        </div>

        {/* Horarios Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
          {displayData.map((sch) => (
            <div 
              key={sch.id}
              className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex">
                {/* Hora destacada a la izquierda */}
                <div className="w-32 bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center p-4">
                  <div className="text-center">
                    <div className="text-2xl font-black leading-tight">
                      {sch.time}
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div className="flex-1 p-6">
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-3">
                    {sch.cat}
                  </h3>
                  <div className="flex items-center text-zinc-600 dark:text-zinc-400">
                    <Calendar className="h-4 w-4 mr-2 text-red-600" />
                    <span className="font-semibold">{sch.days}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ubicación y contacto */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Tarjeta de ubicación */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg p-8 border-2 border-zinc-200 dark:border-zinc-700">
            <div className="flex items-start mb-4">
              <MapPin className="h-8 w-8 text-red-600 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">
                  Ubicación
                </h3>
                <p className="text-lg font-bold text-red-600 dark:text-red-400">
                  {FIELD_LOCATION.name}
                </p>
                <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                  {FIELD_LOCATION.address}
                </p>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {FIELD_LOCATION.district}
                </p>
              </div>
            </div>
          </div>

          {/* Tarjeta de contacto con WhatsApp */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-8 text-white">
            <div className="text-center">
              <img 
                src="https://i.postimg.cc/gk4vhpgm/wsp.png" 
                alt="WhatsApp"
                className="h-16 w-16 mx-auto mb-4"
              />
              <h3 className="text-2xl font-black mb-2">
                ¿Tienes preguntas?
              </h3>
              <p className="text-white/90 mb-6">
                Contáctanos por WhatsApp
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola, quiero más información sobre los horarios de entrenamiento')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-white text-green-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-green-50 transition-all transform hover:scale-105 shadow-lg"
              >
                <span className="text-2xl mr-2">📱</span>
                {WHATSAPP_NUMBER}
              </a>
            </div>
          </div>
        </div>

        {/* Banner promocional */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-yellow-400 text-zinc-900 px-8 py-4 rounded-full font-black text-lg shadow-lg border-4 border-yellow-500">
            🎉 ¡Residentes de Virgen de Lourdes - Primera clase GRATIS! 🎉
          </div>
        </div>
      </div>
    </section>
  );
}
