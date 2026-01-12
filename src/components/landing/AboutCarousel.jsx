import React, { useState } from 'react';
import { CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { CAROUSEL_IMAGES } from '../../utils/constants';

export default function AboutCarousel() {
  const [idx, setIdx] = useState(0);

  const next = () => setIdx((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
  const prev = () => setIdx((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);

  return (
    <section id="historia" className="py-20 bg-white dark:bg-zinc-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative group">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full z-0"></div>
            <div className="relative z-10 rounded-2xl shadow-2xl overflow-hidden h-[400px]">
              <img
                src={CAROUSEL_IMAGES[idx]}
                alt={`Coach talking to kids ${idx + 1}`}
                className="w-full h-full object-cover transition duration-500"
              />
              <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={prev} className="bg-black/50 text-white p-2 rounded-full hover:bg-black/80"><ChevronLeft className="h-6 w-6"/></button>
                <button onClick={next} className="bg-black/50 text-white p-2 rounded-full hover:bg-black/80"><ChevronRight className="h-6 w-6"/></button>
              </div>
              <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                {CAROUSEL_IMAGES.map((_, i) => (
                  <div key={i} className={`h-2 w-2 rounded-full ${i === idx ? 'bg-red-600' : 'bg-white/50'}`}></div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-red-600 font-bold tracking-widest uppercase mb-2">Sobre Nosotros</h2>
            <h3 className="text-4xl font-black text-zinc-900 dark:text-white mb-6">Más que una escuela,<br/>una familia deportiva.</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg mb-6 leading-relaxed">
              La <strong className="text-zinc-900 dark:text-white">Escuela Deportiva Milan</strong> es un espacio formativo en San Juan de Miraflores donde niños y niñas aprenden, crecen y desarrollan su talento futbolístico.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
                <span className="text-zinc-700 dark:text-zinc-300">Participación activa en torneos oficiales FPF y Liga Amateur.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-6 w-6 text-red-600 mt-1 mr-3 flex-shrink-0" />
                <span className="text-zinc-700 dark:text-zinc-300">Formación basada en valores: disciplina, respeto y trabajo en equipo.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
