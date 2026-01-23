import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { DEFAULT_SCHEDULE, FIELD_LOCATION } from '../../utils/constants';

export default function Schedule({ schedules = [] }) {
  // 1. Normalización y Agrupación Avanzada
  const processedData = React.useMemo(() => {
    const rawData = schedules.length > 0 ? schedules : DEFAULT_SCHEDULE;

    // Paso A: Unificar registros fragmentados (mismo horario + misma categoría) -> Recolectar días
    const mergedByCat = {};

    rawData.forEach(item => {
      // Clave única: Tiempo + Categoría
      const key = `${item.time}-${item.cat || item.category}`; // Soporte para ambos nombres de campo

      if (!mergedByCat[key]) {
        mergedByCat[key] = {
          ...item,
          cat: item.cat || item.category, // Normalizar nombre cat
          daysSet: new Set()
        };
      }

      // Manejar días: Si viene 'day' (DB) lo agregamos. Si viene 'days' (Static) lo usaremos directo luego si es necesario
      if (item.day) mergedByCat[key].daysSet.add(item.day);
      if (item.days) mergedByCat[key].daysString = item.days; // Preservar string original si existe
    });

    // Paso B: Formatear días y Agrupar por HORA
    const groupedByTime = {};

    Object.values(mergedByCat).forEach(item => {
      // Calcular etiqueta de días
      let daysLabel = item.daysString;

      if (item.daysSet.size > 0) {
        const daysArr = Array.from(item.daysSet);
        const allDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
        // Si tiene los 5 días laborales
        const hasAllWeek = allDays.every(d => daysArr.includes(d));

        if (hasAllWeek) {
          daysLabel = "Lunes a Viernes";
        } else {
          // Ordenar días según orden lógico no alfabético
          const order = { 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Domingo': 7 };
          daysArr.sort((a, b) => (order[a] || 99) - (order[b] || 99));
          daysLabel = daysArr.join(', ');
        }
      }

      const timeKey = item.time;
      if (!groupedByTime[timeKey]) {
        groupedByTime[timeKey] = [];
      }

      groupedByTime[timeKey].push({
        ...item,
        finalDays: daysLabel || "Por definir"
      });
    });

    // Ordenar las horas (simple sort string funciona para formato HH:MM)
    return Object.entries(groupedByTime).sort((a, b) => a[0].localeCompare(b[0]));
  }, [schedules]);

  // ✅ URL ACTUALIZADA: Mapas restaurados
  const mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1560.036721834213!2d-76.92058307824934!3d-12.16652644691537!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105b90061c263ef%3A0xe3f82450a7eabc19!2sLa%20Once!5e0!3m2!1ses-419!2spe!4v1768415942975!5m2!1ses-419!2spe";
  const externalMapLink = "https://www.google.com/maps/place/Asode+Proliga+de+Deportes+Virgen+de+Lourdes/@-12.1627992,-76.9275069,17z";

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

        {/* Layout principal (Grid) */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Columna izquierda - Lista Agrupada por Horas */}
          <div className="space-y-4">
            {processedData.map(([time, items]) => (
              <div
                key={time}
                className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 flex flex-col sm:flex-row"
              >
                {/* Columna Hora (Unificada) */}
                <div className="sm:w-32 bg-gradient-to-br from-red-600 to-red-700 text-white flex flex-col items-center justify-center p-4 border-b sm:border-b-0 sm:border-r border-red-800 shrink-0">
                  <Calendar className="h-6 w-6 mb-2 opacity-80" />
                  <span className="text-lg font-black text-center leading-tight">{time}</span>
                </div>

                {/* Lista de Categorías en esa hora */}
                <div className="flex-1 p-4 divide-y divide-zinc-100 dark:divide-zinc-700">
                  {items.map((catItem, idx) => (
                    <div key={idx} className={`${idx === 0 ? 'pb-3' : idx === items.length - 1 ? 'pt-3' : 'py-3'}`}>
                      <h4 className="font-bold text-zinc-900 dark:text-white text-lg">{catItem.cat}</h4>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                        {catItem.finalDays}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Columna derecha - Imagen del campo */}
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

        {/* Banner Promocional */}
        <div className="mb-16 text-center">
          <div className="inline-block bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-zinc-900 px-8 py-5 rounded-2xl font-black text-lg md:text-xl shadow-2xl border-4 border-yellow-500 animate-pulse hover:animate-none hover:scale-110 transition-transform duration-300">
            <div className="relative">
              <span className="animate-bounce inline-block">🎉</span>
              <span className="mx-2">¡Residentes de Virgen de Lourdes - Primera clase GRATIS!</span>
              <span className="animate-bounce inline-block">🎉</span>
              <div className="absolute -top-6 -right-6 bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold rotate-12 shadow-lg">
                ¡NUEVO!
              </div>
            </div>
          </div>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400 text-sm font-medium">
            Presenta tu DNI con dirección en Virgen de Lourdes
          </p>
        </div>

        {/* --- SECCIÓN DEL MAPA (Aquí implementé tu iframe) --- */}
        <div className="w-full">
          <div className="flex items-center justify-center mb-6">
            <MapPin className="text-red-600 mr-2 h-6 w-6" />
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white">
              Ubicación Exacta
            </h3>
          </div>

          {/* Contenedor del Mapa */}
          <div className="w-full h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl border-4 border-zinc-200 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800 group relative">
            <iframe
              src={mapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación Asode Proliga"
              className="w-full h-full grayscale-[0.2] hover:grayscale-0 transition-all duration-500"
            ></iframe>
          </div>

          {/* Botón para abrir en app externa */}
          <div className="mt-6 text-center">
            <a
              href={externalMapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-bold rounded-full text-white bg-red-600 hover:bg-red-700 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
            >
              <MapPin className="mr-2 h-5 w-5" />
              Abrir en Google Maps
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}