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

        {/* Layout principal */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Columna izquierda - Cards de horarios */}
          <div className="space-y-6">
            {displayData.map((sch) => (
              <div 
                key={sch.id}
                className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex">
                  {/* Hora destacada a la izquierda */}
                  <div className="w-28 bg-gradient-to-br from-red-600 to-red-700 text-white flex items-center justify-center p-3">
                    <div className="text-center">
                      <div className="text-lg font-black leading-tight">
                        {sch.time}
                      </div>
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 p-5">
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-2">
                      {sch.cat}
                    </h3>
                    <div className="flex items-center text-zinc-600 dark:text-zinc-400 text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-red-600" />
                      <span className="font-semibold">{sch.days}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Columna derecha - Imagen del campo con información */}
          <div className="relative h-full min-h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-zinc-800">
            <img 
              src="https://i.postimg.cc/q7BCRrMw/CAMPO-DEPORTIVO-VIRGEN-DE-LOURDES-PARADERO-11.jpg" 
              alt="Campo Deportivo Virgen de Lourdes" 
              className="absolute inset-0 w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-t from-black/90 to-transparent">
              <div className="text-center text-white">
                <MapPin className="h-12 w-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">{FIELD_LOCATION.name}</h3>
                <p className="text-white/90 text-lg mb-1">{FIELD_LOCATION.address}</p>
                <p className="text-white/80">{FIELD_LOCATION.district}</p>
              </div>
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
