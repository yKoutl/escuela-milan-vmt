import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { DEFAULT_SCHEDULE } from '../../utils/constants';

export default function Schedule({ schedules }) {
  const sourceData = schedules.length > 0 ? schedules : DEFAULT_SCHEDULE;
  const displayData = sourceData.filter(item => item.visible !== false);
  
  return (
    <section id="horarios" className="py-20 bg-zinc-900 text-white border-t border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-black mb-6 flex items-center">
              <Calendar className="mr-3 text-red-600" /> Horarios de Entrenamiento
            </h2>
            <p className="text-zinc-400 mb-8">
              Entrenamientos diferenciados por edad para garantizar el correcto aprendizaje técnico y táctico.
            </p>
            <div className="space-y-4">
              {displayData.map((sch, i) => (
                <div key={i} className="bg-zinc-800 p-4 rounded-lg border-l-4 border-red-600 hover:bg-zinc-700 transition">
                  <h4 className="font-bold text-lg">{sch.cat}</h4>
                  <p className="text-zinc-400 text-sm mt-1">{sch.time}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative h-full min-h-[400px] rounded-2xl overflow-hidden shadow-2xl border-4 border-zinc-800">
              <img src="https://images.unsplash.com/photo-1551958219-acbc608c6377?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Soccer field" className="absolute inset-0 w-full h-full object-cover opacity-60"/>
              <div className="absolute inset-0 flex items-center justify-center p-8 bg-gradient-to-t from-black/80 to-transparent">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold">Campo Deportivo "Héroes del Cenepa"</h3>
                  <p className="text-zinc-300 mt-2">Av. Los Héroes 123, San Juan de Miraflores</p>
                </div>
              </div>
          </div>
        </div>
      </div>
    </section>
  );
}
